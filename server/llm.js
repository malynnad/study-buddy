import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './paths.js';
import { findKp } from './curriculum.js';
import { calcCost } from './pricing.js';
import { validateFigure } from './geometry.js';

const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const DEFAULTS = {
  provider: 'deepseek',
  baseUrl: 'https://api.deepseek.com',
  model: 'deepseek-flash',
  apiKey: ''
};

export function readConfig() {
  try {
    const raw = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    return { ...DEFAULTS, ...raw };
  } catch {
    return { ...DEFAULTS };
  }
}

// 用户常把文档里的整行命令一起复制进来，这里只取 sk- 开头的 Key 本体
function cleanApiKey(raw) {
  const text = String(raw ?? '').trim();
  const match = text.match(/sk-[A-Za-z0-9_-]{16,}/);
  return match ? match[0] : text;
}

export function saveConfig(input) {
  const current = readConfig();
  const incomingKey = input.apiKey === undefined ? undefined : String(input.apiKey);
  const next = {
    provider: String(input.provider ?? current.provider),
    baseUrl: String(input.baseUrl || current.baseUrl).replace(/\/+$/, ''),
    model: String(input.model || current.model),
    apiKey: incomingKey && incomingKey.trim() ? cleanApiKey(incomingKey) : current.apiKey
  };
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(next, null, 2), { mode: 0o600 });
  return next;
}

export function publicConfig() {
  const c = readConfig();
  return {
    provider: c.provider,
    baseUrl: c.baseUrl,
    model: c.model,
    configured: Boolean(c.apiKey),
    apiKeyMask: c.apiKey ? `${c.apiKey.slice(0, 4)}••••${c.apiKey.slice(-4)}` : ''
  };
}

function parseError(message) {
  const err = new Error(message);
  err.code = 'PARSE';
  return err;
}

// 模型生成长 JSON 时常见两类小瑕疵：数组元素之间漏写逗号、多余的尾逗号
function repairJsonLoose(body) {
  let t = body.replace(/[\uFEFF\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  t = t.replace(/}(\s*)\{/g, '},$1{');
  t = t.replace(/\](\s*)\{/g, '],$1{');
  t = t.replace(/"(\s+)"/g, '",$1"');
  t = t.replace(/,\s*([}\]])/g, '$1');
  return t;
}

// 响应被 max_tokens 截断时，回退到最后一个完整的题目对象并补全括号
function salvageArrayObjects(body) {
  const arrStart = body.indexOf('[');
  if (arrStart === -1) return null;
  let braceDepth = 0;
  let base = -1;
  let lastClose = -1;
  let inStr = false;
  let esc = false;
  for (let i = arrStart; i < body.length; i += 1) {
    const ch = body[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') {
      inStr = true;
    } else if (ch === '{') {
      braceDepth += 1;
      if (base === -1) base = braceDepth;
    } else if (ch === '}') {
      braceDepth -= 1;
      if (base !== -1 && braceDepth === base - 1) lastClose = i;
    }
  }
  if (lastClose === -1) return null;
  try {
    return JSON.parse(repairJsonLoose(`${body.slice(0, lastClose + 1)}]}`));
  } catch {
    return null;
  }
}

function extractJson(text) {
  if (!text) throw parseError('模型返回内容为空');
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.indexOf('{');
  if (start === -1) throw parseError('模型未按要求返回 JSON');
  const end = t.lastIndexOf('}');
  const body = end > start ? t.slice(start, end + 1) : t.slice(start);
  for (const candidate of [body, repairJsonLoose(body)]) {
    try {
      return JSON.parse(candidate);
    } catch { /* 试下一种修复 */ }
  }
  const salvaged = salvageArrayObjects(body);
  if (salvaged) return salvaged;
  throw parseError('模型返回的 JSON 格式有误，已无法解析');
}

async function chat(messages, { temperature = 0.7, maxTokens = 4096, timeout = 120000 } = {}) {
  const cfg = readConfig();
  if (!cfg.apiKey) throw new Error('尚未配置大模型 API Key');
  const url = `${cfg.baseUrl}/chat/completions`;
  const requestedAt = Date.now();

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey}` },
      body: JSON.stringify({
        model: cfg.model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false,
        ...(cfg.provider === 'deepseek' ? { response_format: { type: 'json_object' } } : {})
      }),
      signal: AbortSignal.timeout(timeout)
    });
  } catch (err) {
    if (err?.name === 'TimeoutError') throw new Error('模型响应超时，请稍后重试');
    const cause = err?.cause?.message ? `（${err.cause.message}）` : '';
    throw new Error(`无法连接模型服务：${err.message}${cause}。请检查网络、代理或证书设置`);
  }

  const text = await res.text();
  if (!res.ok) {
    let detail = text.slice(0, 200);
    try {
      detail = JSON.parse(text)?.error?.message || detail;
    } catch { /* 保留原文 */ }
    if (res.status === 401) throw new Error('API Key 无效或已过期（401），请确认只粘贴 sk- 开头的 Key 本体，不要带上后面的安装命令或网址');
    if (res.status === 402 || res.status === 429) throw new Error(`模型服务额度或频率受限（${res.status}）：${detail}`);
    throw new Error(`模型服务返回错误（${res.status}）：${detail}`);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('模型服务返回内容无法解析');
  }
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) throw new Error('模型没有返回有效内容');
  const usage = { model: cfg.model, ...calcCost(cfg.model, data?.usage, requestedAt) };
  return { content, usage };
}

export async function testConnection() {
  const { content, usage } = await chat(
    [
      { role: 'system', content: '你是连通性测试助手，只回复 JSON。' },
      { role: 'user', content: '请只输出 {"ok":true}' }
    ],
    { temperature: 0, maxTokens: 64, timeout: 30000 }
  );
  return { ok: true, sample: content.trim().slice(0, 80), usage };
}

const QUESTION_SCHEMA = `严格返回如下合法 JSON（数组元素之间必须用英文逗号分隔；字符串内部不要出现英文双引号，需要引用时改用「」；不要输出注释）：
{
  "questions": [
    {
      "type": "choice | fill | calc | word | draw",
      "stem": "题干文本（必填）",
      "options": ["A. xxx", "B. xxx", "C. xxx", "D. xxx"],
      "figure": {
        "kind": "grid",
        "grid": { "w": 12, "h": 9 },
        "bg": { "type": "symmetry | translate | target | none" },
        "tolerance": 0.5
      },
      "answer": "标准答案（选择题只写选项字母，如 B；填空/计算题只写答案本身；作图题写顶点坐标 JSON，如 [[2,3],[5,3],[5,7]]）",
      "solution": "分步解析，2-4 句",
      "kpId": "必须原样使用给定知识点列表中的 id",
      "difficulty": 1,
      "errorProne": "本题最容易出错的地方，一句话"
    }
  ]
}`;

// 作图题的 figure 细则：只允许服务端可校验的三种结构
const FIGURE_RULE = `作图题（type 为 "draw"）的 figure 必须符合下列结构之一，且 answer 必须是顶点坐标数组 JSON：
1) 补全轴对称图形：
   figure = {"kind":"grid","grid":{"w":12,"h":9},"bg":{"type":"symmetry","axis":{"dir":"v","at":6},"points":[[2,3],[5,3],[5,7]]},"tolerance":0.5}
   要求 answer 恰好是 points 关于对称轴的镜像点集。
2) 平移后的图形：
   figure = {"kind":"grid","grid":{"w":12,"h":9},"bg":{"type":"translate","points":[[2,3],[5,3],[5,7]],"delta":[3,0]},"tolerance":0.5}
   要求 answer 恰好是 points 平移 delta 后的点集。
3) 画指定面积的多边形：
   figure = {"kind":"grid","grid":{"w":12,"h":9},"bg":{"type":"target","area":12},"tolerance":0.5}
   要求 answer 顶点围成的面积等于 area。
顶点坐标用整数格点，x 向右、y 向上，范围 0..w / 0..h；不要输出像素坐标、不要输出 SVG。`;

const SUBJECT_PROFILES = {
  math: {
    system: `你是一位资深的深圳小学数学教师，熟练掌握北京师范大学出版社（北师大版）五年级教材。
你负责根据指定的知识点编写练习题，要求：
1. 题目必须严格对应给定知识点的描述范围（如"小数点移动与单位换算"就考小数点左右移动和单位换算，"积的大小关系与近似值"就考乘数大于/小于1时积的变化和四舍五入），不超纲，不使用超出五年级上册/下册教材范围的知识（例如不出现负数运算、六年级的圆和百分数应用等）。
2. 语言符合五年级学生的阅读习惯，情境贴近生活（购物、校园、运动、劳动等）。
3. 数据要合理，计算量适中，避免过大的数字和繁琐的运算。
4. 应用题必须给出完整题干，问句明确，答案可以是数值（不含单位）。
5. 每道题只考查一个知识点，解析要分步写清楚，末尾必须附一句"易错点：……"点明学生最容易犯的错误（如"忘记小数点对齐""把 a² 写成 2a""三角形面积忘记除以 2"等），便于学生自查。
6. 数学符号直接使用 Unicode：°、²、cm²、m²、∠、∥、⊥、π、√、≈、×、÷；分数写成 3/4，带分数写成 2又1/3；禁止使用 LaTeX（\\frac、$...$）和 HTML 标签。
7. 作图题只在知识点涉及图形与位置、面积、三角形时出现，且必须按 figure 细则返回结构化图形数据，坐标用整数格点；题干必须要求学生“画出图形”，不要要求“写出/填写坐标”，答案里的坐标数组只供系统判分。
8. 题干中不得出现“见图、如图、下图、图中、方格纸”等依赖配图的表述；只有 type 为 draw 且提供了 figure 时才允许提到方格纸。
9. 考查"用字母表示规律"时，必须给出前 2-3 个具体项（如前 3 个图形所用小棒数 5、9、13），要求学生写出含 n 的通项式；考查"等式的性质"时，要让学生判断或应用等式两边同时加、减、乘同一个数（或除以同一个不为 0 的数）后等式仍成立的性质。
10. 只输出 JSON，不要输出任何解释性文字、Markdown 代码块或注释。`,
    typePlan: '选择题 1 题、填空题 1 题、计算题 1 题，其余为应用题；若知识点适合作图，可把其中 1 题改为作图题（draw）',
    allowedTypes: ['choice', 'fill', 'calc', 'word', 'draw'],
    answerRule: '数值题 answer 只写数值，不带单位（如 12.5、3/4，分数写最简分数）；作图题 answer 写顶点坐标 JSON，如 [[2,3],[5,3],[5,7]]',
    extraRule: '选择题的 options 必须以 "A. "、"B. " 开头，answer 只写字母；题干中不要标注知识点编号，不要把答案写进题干；作图题必须同时给出 figure，且 answer 的点集必须与 figure 的约束自洽'
  },
  chinese: {
    system: `你是一位资深的深圳小学语文教师，熟悉人民教育出版社（统编版）五年级上下册教材。
你负责根据指定的知识点编写语文练习题，要求：
1. 题目必须严格对应给定的知识点，内容不超出统编版五年级教材范围，不考课外未学篇目。
2. 出题类型要贴合教材"每课重点知识"的几大板块：①生字注音组词（多音字、易读错字、形近字辨析）；②词语盘点（听写词语、四字词语、AABB/ABAB 等叠词、近义词、反义词）；③重点句子的理解与仿写；④课文主题与写作手法（借物喻人、借景抒情、动静结合、说明方法、人物描写等）；⑤古诗默写、诗意与情感。
3. 题目必须能精确判分，避免"谈谈你的看法"这类开放题；阅读题用选择题形式考查理解。
4. 解析要说清楚依据（如原文词句、诗句上下句、说明方法的作用），末尾必须附一句"易错点：……"点明学生最容易犯的错误（如"多音字读错""形近字混淆""古诗默写写错别字""说明方法判断错误"等），便于学生自查。
5. 数学符号直接使用 Unicode：°、²；禁止使用 LaTeX 和 HTML 标签。
6. 只输出 JSON，不要输出任何解释性文字、Markdown 代码块或注释。`,
    typePlan: '选择题 2 题、填空题 2 题，其余为选择题形式的阅读理解题',
    allowedTypes: ['choice', 'fill'],
    answerRule: '选择题 options 必须 4 个且以 "A. " 开头，answer 只写字母；填空题答案必须唯一、简短（一个词或不超过 15 字的短句），古诗默写题答案为诗句原文且不能有错别字，answer 只写标准答案，不要写"略"或开放答案',
    extraRule: '古诗默写题要给出上下句；阅读题附上 100 字以内的短文或语段并在题干中说明要求；题干用中文'
  },
  english: {
    system: `你是一位资深的深圳小学英语教师，熟悉上海教育出版社（沪教牛津版·深圳）五年级上下册教材。
你负责根据指定的知识点编写英语练习题，要求：
1. 题目必须对应给定的知识点，语法和词汇不超出五年级教材范围。
2. 题干用英文，可在括号里加简短中文提示；情境贴近小学生的校园与日常生活。
3. 题目必须能精确判分，填空题答案为一个单词或短语，阅读题用选择题形式考查理解。
4. 解析用中文说明语法规则或词义，便于学生自查。
5. 只输出 JSON，不要输出任何解释性文字、Markdown 代码块或注释。`,
    typePlan: '选择题 2 题、填空题 2 题，其余为选择题形式的阅读或情景交际题',
    allowedTypes: ['choice', 'fill'],
    answerRule: '选择题 options 必须以 "A. " 开头，answer 只写字母；填空题 answer 为一个单词或短语（如 goes、on Monday），不带句号，英文不区分大小写',
    extraRule: '考查语法时要在题干中给出足够语境；阅读题附 60 词以内的英文短文；题干中不要标注知识点编号'
  },
  science: {
    system: `你是一位资深的深圳小学科学教师，熟悉教育科学出版社（教科版）五年级上册教材。
你负责根据指定的知识点编写科学练习题，要求：
1. 题目必须严格对应给定的知识点，只考教科版五年级教材范围内的内容，不超纲，不引入初中阶段的物理、化学、生物概念。
2. 覆盖多样的考点：概念辨析、实验现象与结论、实验器材与操作要点、测量工具读数、图表与数据解读；情境可结合放大镜与显微镜、独轮车与斜面滑轮、小车运动与弹簧测力计、地形地貌与岩石。
3. 题目必须能精确判分：用选择题和填空题，答案唯一、简短；不要出“设计实验”“谈谈你的想法”这类开放题。
4. 解析要写清科学道理或证据（实验现象、原理、结论），便于学生自查。
5. 只输出 JSON，不要输出任何解释性文字、Markdown 代码块或注释。`,
    typePlan: '选择题 2 题、填空题 2 题，其余为选择题形式的概念辨析或实验分析题',
    allowedTypes: ['choice', 'fill'],
    answerRule: '选择题 options 必须 4 个且以 "A. " 开头，answer 只写字母；填空题答案必须唯一、简短（一个词或不超过 15 字的短语，如“凸透镜”“牛顿”“侵蚀”），answer 只写标准答案',
    extraRule: '实验题要交代实验材料与操作要点；数据题要给出具体数值或用文字描述表格数据；题干中不要标注知识点编号，不要出现“见图、下图、图中、如图”这类依赖配图的表述；填空答案不要带括号或提示语'
  }
};

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizeQuestions(raw, allowedKps, count, allowedTypes = ['choice', 'fill', 'calc', 'word']) {
  const list = Array.isArray(raw?.questions) ? raw.questions : [];
  if (!list.length) throw new Error('模型没有生成题目');
  const byId = new Map(allowedKps.map((k) => [k.id, k]));
  const byName = new Map(allowedKps.map((k) => [k.name, k]));

  const cleaned = [];
  for (const item of list) {
    if (!item || typeof item.stem !== 'string' || !item.stem.trim()) continue;
    let answer = item.answer;
    if (Array.isArray(answer)) {
      const isPoints = answer.length > 0 && Array.isArray(answer[0]);
      answer = isPoints ? JSON.stringify(answer) : answer.join('，');
    }
    if (answer == null || String(answer).trim() === '') continue;

    let type = String(item.type || 'fill').toLowerCase();
    if (!allowedTypes.includes(type)) type = allowedTypes.includes('fill') ? 'fill' : allowedTypes[0];
    const options = Array.isArray(item.options) ? item.options.map((o) => String(o)).filter(Boolean).slice(0, 4) : [];
    if (type === 'choice' && options.length < 2) type = 'fill';

    // 作图题：必须带结构化 figure，且标准答案要能通过几何校验，否则降级为普通题
    let figure = null;
    if (type === 'draw') {
      const raw = typeof item.figure === 'string' ? safeJson(item.figure) : item.figure;
      if (raw && typeof raw === 'object' && !validateFigure(raw, answer)) {
        figure = raw;
      } else {
        type = 'fill';
      }
    }

    // 题干提到“见图/方格纸”但没带图形数据的题，学生无法作答，直接丢弃
    if (!figure && /见图|如下图|下图|上图|如图|图中|方格纸/.test(item.stem)) continue;
    // 作图题必须让学生“画”，不能要求“写出坐标”（作答区只有方格纸，没有输入框）
    if (figure && /写出.*坐标|填写.*坐标|坐标是/.test(item.stem)) continue;

    let kp = byId.get(String(item.kpId ?? '')) || byName.get(String(item.kpName ?? '')) || null;
    if (!kp) {
      const found = findKp(String(item.kpId ?? ''));
      if (found) kp = found.kp;
    }
    if (!kp) kp = allowedKps[cleaned.length % allowedKps.length] || allowedKps[0];

    const difficulty = Number(item.difficulty);
    cleaned.push({
      type,
      stem: item.stem.trim(),
      options: type === 'choice' ? options : null,
      figure,
      answer: String(answer).trim(),
      solution: String(item.solution || '').trim(),
      kpId: kp.id,
      kpName: kp.name,
      difficulty: Number.isFinite(difficulty) ? Math.min(3, Math.max(1, Math.round(difficulty))) : 2,
      errorProne: String(item.errorProne || '').trim()
    });
  }
  if (!cleaned.length) throw new Error('模型生成的题目格式无效');
  return cleaned.slice(0, count);
}

async function generateBatch(params) {
  const { subject, semesterName, units, kps, count, mode, weakKps = [], wrongStems = [], difficultyHint } = params;
  const profile = SUBJECT_PROFILES[subject?.id] || SUBJECT_PROFILES.math;

  const kpLines = kps
    .map((k) => `- id: ${k.id}｜${k.name}（${k.unitName}）：${k.desc}`)
    .join('\n');

  const modeLine =
    mode === 'reinforce'
      ? `这是一次「薄弱点巩固练习」。请重点围绕学生掌握较差的知识点出题：优先保证与下列薄弱知识点相关的题目占全部题目的 70% 以上，题目应是同类知识的新情境变式（内容、素材都要变化，不要照抄原题），难度略低于或持平原题，帮助学生重新建立正确的解题思路。`
      : `这是一次「新知识点练习」。请覆盖给定的知识点范围，题目难度由浅入深。`;

  const batchNote =
    params.batchTotal > 1
      ? `\n这是第 ${params.batchIndex}/${params.batchTotal} 组题目，请使用与其他组不同的情境、数据和问法，避免与其它组重复。`
      : '';

  const weakLine = weakKps.length
    ? `\n学生薄弱知识点：\n${weakKps.map((k) => `- ${k.name}（正确率 ${k.accuracy}%）`).join('\n')}`
    : '';

  const wrongLine = wrongStems.length
    ? `\n学生最近做错的原题（请据此设计变式题，不要直接重复）：\n${wrongStems.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
    : '';

  const prompt = `请为「${subject?.name || '数学'}·${semesterName}」的以下知识点编写 ${count} 道练习题。
教材版本：${subject?.textbook || '北师大版'}
知识点范围（${units.map((u) => u.name).join('、')}）：
${kpLines}

${modeLine}
${batchNote}
${weakLine}
${wrongLine}

要求：
- 题型分布：${profile.typePlan}（只能使用 ${profile.allowedTypes.join(' / ')} 这几种题型）
- 难度分布：${difficultyHint || '简单 2 题、中等 2 题、稍难 1 题（按题目总数等比调整）'}
- ${profile.answerRule}
- ${profile.extraRule}
- 每题 kpId 必须从上面列表中精确复制
${profile.allowedTypes.includes('draw') ? `\n${FIGURE_RULE}\n` : ''}
${QUESTION_SCHEMA}`;

  const { content, usage } = await chat(
    [
      { role: 'system', content: profile.system },
      { role: 'user', content: prompt }
    ],
    { temperature: 0.8, maxTokens: 8192, timeout: 180000 }
  );

  try {
    return { questions: normalizeQuestions(extractJson(content), kps, count, profile.allowedTypes), usage };
  } catch (err) {
    err.usage = usage;
    throw err;
  }
}

const MAX_BATCH_SIZE = 10;

function mergeUsage(usages) {
  const merged = {
    model: usages.find(Boolean)?.model || '',
    promptTokens: 0,
    completionTokens: 0,
    cacheHitTokens: 0,
    cacheMissTokens: 0,
    totalTokens: 0,
    cost: 0,
    priced: true,
    currency: 'CNY'
  };
  for (const usage of usages) {
    if (!usage) continue;
    merged.promptTokens += usage.promptTokens || 0;
    merged.completionTokens += usage.completionTokens || 0;
    merged.cacheHitTokens += usage.cacheHitTokens || 0;
    merged.cacheMissTokens += usage.cacheMissTokens || 0;
    merged.cost += usage.cost || 0;
    if (!usage.priced) merged.priced = false;
  }
  merged.totalTokens = merged.promptTokens + merged.completionTokens;
  merged.cost = Math.round(merged.cost * 1e6) / 1e6;
  const periods = new Set(usages.filter(Boolean).map((usage) => usage.period).filter(Boolean));
  merged.period = periods.size === 1 ? [...periods][0] : 'mixed';
  return merged;
}

// 单批出题；若只是 JSON 解析失败，自动重试一次（网络/鉴权等错误不重试）
async function runBatch(params) {
  try {
    return await generateBatch(params);
  } catch (err) {
    if (err.code !== 'PARSE') throw err;
    const retried = await generateBatch(params);
    if (err.usage) retried.usage = mergeUsage([err.usage, retried.usage]);
    return retried;
  }
}

export async function generateQuestions(params) {
  const total = Math.min(50, Math.max(1, Number(params.count) || 5));
  const sizes = [];
  for (let remaining = total; remaining > 0; remaining -= MAX_BATCH_SIZE) {
    sizes.push(Math.min(MAX_BATCH_SIZE, remaining));
  }

  let questions;
  let usage;
  if (sizes.length === 1) {
    const result = await runBatch({ ...params, count: total, batchIndex: 1, batchTotal: 1 });
    questions = result.questions;
    usage = result.usage;
  } else {
    const results = await Promise.all(
      sizes.map((size, i) =>
        runBatch({ ...params, count: size, batchIndex: i + 1, batchTotal: sizes.length })
      )
    );
    questions = results.flatMap((result) => result.questions).slice(0, total);
    usage = mergeUsage(results.map((result) => result.usage));
  }

  // 部分题目因缺少图形/无效答案被丢弃时，补齐一次，避免题量少于所选数量
  const missing = total - questions.length;
  if (missing > 0) {
    try {
      const extra = await runBatch({ ...params, count: Math.min(missing, MAX_BATCH_SIZE), batchIndex: 1, batchTotal: 1 });
      questions = questions.concat(extra.questions).slice(0, total);
      usage = mergeUsage([usage, extra.usage]);
    } catch {
      /* 补齐失败时按现有题量返回 */
    }
  }

  return { questions, usage };
}

export async function analyzeWeakness(payload) {
  const { subjectName = '数学', stats, wrongList, overview } = payload;
  const statLines = stats
    .map((s) => `- ${s.kpName}（${s.kpId}）：作答 ${s.attempts} 次，正确 ${s.correct} 次，正确率 ${s.accuracy}%`)
    .join('\n');

  const wrongLines = wrongList
    .map((w, i) => `${i + 1}. [${w.kp_name}] ${w.stem}｜学生答案：${w.last_answer}｜标准答案：${w.answer}｜错因提示：${w.error_prone || '无'}`)
    .join('\n');

  const prompt = `你是${subjectName}学习分析师，请根据下面的练习数据，分析学生的知识薄弱点并给出可执行的改进建议。

总体数据：累计作答 ${overview.attempts} 次，正确 ${overview.correct} 次，未掌握错题 ${overview.wrongOpen} 道。

各知识点正确率：
${statLines || '（暂无作答数据）'}

最近错题明细：
${wrongLines || '（暂无错题）'}

请只输出如下 JSON（不要输出任何其它文字）：
{
  "summary": "一段 60 字以内的整体学习情况诊断",
  "weakPoints": [
    {
      "kpId": "知识点 id，必须是上面出现过的 id；若无法确定可写 general",
      "kpName": "知识点名称",
      "level": "薄弱 | 待巩固 | 良好",
      "accuracy": 数字（该知识点正确率，没有数据填 null）,
      "reason": "结合错题分析的具体错因，40 字以内",
      "advice": "针对该知识点的具体练习方法，60 字以内"
    }
  ],
  "plan": [
    { "title": "巩固动作标题，15 字以内", "detail": "具体做法，50 字以内", "kpId": "对应知识点 id 或 general" }
  ]
}
要求：weakPoints 按薄弱程度从高到低排列，最多 5 条；plan 给出 3 条今天就能做的动作。`;

  const { content, usage } = await chat(
    [
      { role: 'system', content: `你是一位资深的深圳小学${subjectName}教师，擅长根据练习数据诊断学生的薄弱点。只输出 JSON。` },
      { role: 'user', content: prompt }
    ],
    { temperature: 0.4, maxTokens: 2000 }
  );
  let parsed;
  try {
    parsed = extractJson(content);
  } catch (err) {
    err.usage = usage;
    throw err;
  }
  if (typeof parsed?.summary !== 'string' || !Array.isArray(parsed?.weakPoints)) {
    const err = new Error('模型返回的分析结果格式不正确');
    err.usage = usage;
    throw err;
  }
  return { analysis: parsed, usage };
}
