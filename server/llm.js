import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './paths.js';
import { findKp } from './curriculum.js';
import { calcCost } from './pricing.js';

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

function extractJson(text) {
  if (!text) throw new Error('模型返回内容为空');
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) throw new Error('模型未按要求返回 JSON');
  const body = t.slice(start, end + 1);
  try {
    return JSON.parse(body);
  } catch {
    const repaired = body.replace(/,\s*([}\]])/g, '$1');
    return JSON.parse(repaired);
  }
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

const QUESTION_SCHEMA = `严格返回如下 JSON：
{
  "questions": [
    {
      "type": "choice | fill | calc | word",
      "stem": "题干文本（必填）",
      "options": ["A. xxx", "B. xxx", "C. xxx", "D. xxx"],
      "answer": "标准答案（选择题只写选项字母，如 B；填空/计算题只写答案本身）",
      "solution": "分步解析，2-4 句",
      "kpId": "必须原样使用给定知识点列表中的 id",
      "difficulty": 1,
      "errorProne": "本题最容易出错的地方，一句话"
    }
  ]
}`;

const SUBJECT_PROFILES = {
  math: {
    system: `你是一位资深的深圳小学数学教师，熟练掌握北京师范大学出版社（北师大版）五年级教材。
你负责根据指定的知识点编写练习题，要求：
1. 题目必须严格对应给定的知识点，不超纲，不使用超出五年级上册/下册教材范围的知识（例如不出现负数运算、六年级的圆和百分数应用等）。
2. 语言符合五年级学生的阅读习惯，情境贴近生活（购物、校园、运动、劳动等）。
3. 数据要合理，计算量适中，避免过大的数字和繁琐的运算。
4. 应用题必须给出完整题干，问句明确，答案可以是数值（不含单位）。
5. 每道题只考查一个知识点，解析要分步写清楚，便于学生自查。
6. 只输出 JSON，不要输出任何解释性文字、Markdown 代码块或注释。`,
    typePlan: '选择题 1 题、填空题 1 题、计算题 1 题，其余为应用题',
    allowedTypes: ['choice', 'fill', 'calc', 'word'],
    answerRule: '数值题 answer 只写数值，不带单位（如 12.5、3/4，分数写最简分数）',
    extraRule: '选择题的 options 必须以 "A. "、"B. " 开头，answer 只写字母；题干中不要标注知识点编号，不要把答案写进题干'
  },
  chinese: {
    system: `你是一位资深的深圳小学语文教师，熟悉人民教育出版社（统编版）五年级上下册教材。
你负责根据指定的知识点编写语文练习题，要求：
1. 题目必须严格对应给定的知识点，内容不超出统编版五年级教材范围，不考课外未学篇目。
2. 字音字形、词语运用、古诗默写、课文理解、说明方法、阅读方法等都可以出题，情境贴近小学生的语文学习。
3. 题目必须能精确判分，避免"谈谈你的看法"这类开放题；阅读题用选择题形式考查理解。
4. 解析要说清楚依据（如原文词句、诗句上下句、说明方法的作用），便于学生自查。
5. 只输出 JSON，不要输出任何解释性文字、Markdown 代码块或注释。`,
    typePlan: '选择题 2 题、填空题 2 题，其余为选择题形式的阅读理解题',
    allowedTypes: ['choice', 'fill'],
    answerRule: '选择题 options 必须 4 个且以 "A. " 开头，answer 只写字母；填空题答案必须唯一、简短（一个词或不超过 15 字的短句），answer 只写标准答案，不要写"略"或开放答案',
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
  }
};

function normalizeQuestions(raw, allowedKps, count, allowedTypes = ['choice', 'fill', 'calc', 'word']) {
  const list = Array.isArray(raw?.questions) ? raw.questions : [];
  if (!list.length) throw new Error('模型没有生成题目');
  const byId = new Map(allowedKps.map((k) => [k.id, k]));
  const byName = new Map(allowedKps.map((k) => [k.name, k]));

  const cleaned = [];
  for (const item of list) {
    if (!item || typeof item.stem !== 'string' || !item.stem.trim()) continue;
    let answer = item.answer;
    if (Array.isArray(answer)) answer = answer.join('，');
    if (answer == null || String(answer).trim() === '') continue;

    let type = String(item.type || 'fill').toLowerCase();
    if (!allowedTypes.includes(type)) type = allowedTypes.includes('fill') ? 'fill' : allowedTypes[0];
    const options = Array.isArray(item.options) ? item.options.map((o) => String(o)).filter(Boolean).slice(0, 4) : [];
    if (type === 'choice' && options.length < 2) type = 'fill';

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

export async function generateQuestions(params) {
  const total = Math.min(50, Math.max(1, Number(params.count) || 5));
  const sizes = [];
  for (let remaining = total; remaining > 0; remaining -= MAX_BATCH_SIZE) {
    sizes.push(Math.min(MAX_BATCH_SIZE, remaining));
  }
  if (sizes.length === 1) {
    return generateBatch({ ...params, count: total, batchIndex: 1, batchTotal: 1 });
  }
  const results = await Promise.all(
    sizes.map((size, i) =>
      generateBatch({ ...params, count: size, batchIndex: i + 1, batchTotal: sizes.length })
    )
  );
  return {
    questions: results.flatMap((result) => result.questions).slice(0, total),
    usage: mergeUsage(results.map((result) => result.usage))
  };
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
