import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { PUBLIC_DIR, DATA_DIR } from './server/paths.js';
import { listSubjects, findSubject, findKp } from './server/curriculum.js';
import * as store from './server/db.js';
import { judge } from './server/grade.js';
import { publicConfig, saveConfig, testConnection, generateQuestions, analyzeWeakness, readConfig } from './server/llm.js';
import { priceTable } from './server/pricing.js';
import { generateLocal } from './server/localgen.js';
import { trustSystemCertificates } from './server/tls.js';

const PORT = Number(process.env.PORT || 3000);
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 2 * 1024 * 1024) {
        reject(new Error('请求内容过大'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('请求格式不是合法 JSON'));
      }
    });
    req.on('error', reject);
  });
}

function resolveKps(kpIds) {
  const items = [];
  for (const id of kpIds) {
    const found = findKp(id);
    if (found) {
      items.push({
        ...found.kp,
        unitId: found.unit.id,
        unitName: found.unit.name,
        semesterId: found.semester.id,
        semesterName: found.semester.name,
        subjectId: found.subject.id,
        subjectName: found.subject.name
      });
    }
  }
  return items;
}

function weakKpList(subjectId) {
  return store
    .accuracyByKp(subjectId)
    .map((row) => ({
      kpId: row.kpId,
      kpName: row.kpName,
      accuracy: row.attempts ? Math.round((row.correct / row.attempts) * 100) : 0,
      attempts: Number(row.attempts)
    }))
    .filter((row) => row.attempts >= 2 && row.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy);
}

async function handleGenerate(body) {
  const requested = Array.isArray(body.kpIds) ? body.kpIds.filter(Boolean) : [];
  const count = Math.min(15, Math.max(1, Number(body.count) || 5));
  const mode = body.mode === 'reinforce' ? 'reinforce' : 'new';
  const subject =
    findSubject(String(body.subjectId || '')) ||
    (requested.length ? findSubject(findKp(requested[0])?.subject?.id) : null) ||
    findSubject('math');

  let kps = resolveKps(requested).filter((k) => k.subjectId === subject.id);
  if (!kps.length) {
    const semester = subject.semesters.find((s) => s.id === body.semesterId) || subject.semesters[0];
    const weak = weakKpList(subject.id);
    const fallbackIds = weak.length ? weak.slice(0, 4).map((w) => w.kpId) : [semester.units[0].kps[0].id];
    kps = resolveKps(fallbackIds).filter((k) => k.subjectId === subject.id);
  }
  if (!kps.length) throw new Error('请先选择要练习的知识点');

  const semesterName = kps[0].semesterName;
  const unitMap = new Map();
  for (const kp of kps) {
    if (!unitMap.has(kp.unitId)) unitMap.set(kp.unitId, { id: kp.unitId, name: kp.unitName, kps: [] });
    unitMap.get(kp.unitId).kps.push(kp);
  }
  const units = [...unitMap.values()];

  let questions;
  let usage = null;
  let warning = '';
  let source = 'llm';

  const weak = weakKpList(subject.id);
  const weakForPrompt = weak.filter((w) => requested.length === 0 || requested.includes(w.kpId));
  const wrongIds = store.recentWrongQuestionIds(6, subject.id);
  const wrongStems = store.getQuestionsByIds(wrongIds).map((q) => q.stem);

  const cfg = readConfig();
  if (cfg.apiKey) {
    try {
      const result = await generateQuestions({
        subject,
        semesterName,
        units,
        kps,
        count,
        mode,
        weakKps: mode === 'reinforce' ? (weakForPrompt.length ? weakForPrompt : weak) : [],
        wrongStems: mode === 'reinforce' ? wrongStems : []
      });
      questions = result.questions;
      usage = result.usage;
    } catch (err) {
      if (err.usage) store.recordUsage({ subject: subject.id, kind: 'generate', ...err.usage });
      if (subject.id !== 'math') throw new Error(`大模型出题失败：${err.message}。请检查「设置」中的模型配置后重试`);
      source = 'local';
      warning = `大模型出题失败：${err.message}。已改用内置示例题库，请检查「设置」中的模型配置。`;
      questions = generateLocal(kps, count);
    }
  } else {
    if (subject.id !== 'math') throw new Error(`${subject.name}题目由大模型生成，请先在「设置」中配置 API Key`);
    source = 'local';
    warning = '尚未配置大模型 API Key，本次使用内置示例题库。到「设置」填写 Key 后即可获得自动生成的新题。';
    questions = generateLocal(kps, count);
  }

  const sessionId = store.createSession(mode, kps.map((k) => k.id), subject.id);
  const saved = questions.map((q, i) => {
    const id = store.saveQuestion(q, sessionId, i + 1, subject.id);
    return { id, seq: i + 1, type: q.type, stem: q.stem, options: q.options, difficulty: q.difficulty, kpId: q.kpId, kpName: q.kpName };
  });
  if (usage) store.recordUsage({ sessionId, subject: subject.id, kind: 'generate', ...usage });

  return {
    sessionId,
    subject: { id: subject.id, name: subject.name, textbook: subject.textbook },
    questions: saved,
    source,
    warning,
    usage
  };
}

async function handleGrade(body) {
  const sessionId = Number(body.sessionId);
  if (!Number.isFinite(sessionId)) throw new Error('缺少练习编号');
  const questions = store.listSessionQuestions(sessionId);
  if (!questions.length) throw new Error('找不到这次练习的题目');
  const answers = Array.isArray(body.answers) ? body.answers : [];
  const answerMap = new Map(answers.map((a) => [Number(a.questionId), a.answer ?? '']));

  const items = [];
  let correctCount = 0;
  for (const q of questions) {
    const userAnswer = answerMap.get(Number(q.id)) ?? '';
    const verdict = judge(q, userAnswer);
    if (verdict.correct) correctCount++;
    store.recordAttempt(q.id, sessionId, userAnswer, verdict.correct);
    if (!verdict.correct) {
      store.markWrong(q.id, sessionId, userAnswer, q.error_prone);
    }
    items.push({
      questionId: q.id,
      seq: q.seq,
      type: q.type,
      stem: q.stem,
      options: q.options,
      kpId: q.kp_id,
      kpName: q.kp_name,
      difficulty: q.difficulty,
      userAnswer: String(userAnswer ?? ''),
      answer: q.answer,
      correct: verdict.correct,
      note: verdict.note,
      solution: q.solution,
      errorProne: q.error_prone
    });
  }
  store.finishSession(sessionId, questions.length, correctCount);

  return {
    sessionId,
    total: questions.length,
    correctCount,
    score: Math.round((correctCount / questions.length) * 100),
    items
  };
}

function localAnalysis(stats, wrongList, overview, subjectName = '数学') {
  const ranked = [...stats].sort((a, b) => a.accuracy - b.accuracy);
  const candidates = ranked.filter((s) => s.accuracy < 80);
  const picked = (candidates.length ? candidates : ranked).slice(0, 5);
  const weakPoints = picked.map((s) => ({
    kpId: s.kpId,
    kpName: s.kpName,
    level: s.accuracy < 50 ? '薄弱' : s.accuracy < 80 ? '待巩固' : '良好',
    accuracy: s.accuracy,
    reason:
      s.accuracy < 80
        ? `该知识点作答 ${s.attempts} 次，正确率仅 ${s.accuracy}%，说明方法还没有掌握牢固`
        : `该知识点作答 ${s.attempts} 次，正确率 ${s.accuracy}%，属于已经掌握的内容`,
    advice:
      s.accuracy < 80
        ? '先回顾课本例题，把解析中的每一步说清楚，再连续做 5 道同类题，直到能独立讲出思路。'
        : '保持每周一次回顾即可，把精力优先放在正确率较低的知识点上。'
  }));
  const summary =
    overview.attempts === 0
      ? `还没有${subjectName}练习记录。先做一组基础题，系统会自动积累你的薄弱点画像。`
      : `累计作答 ${overview.attempts} 次，总体正确率 ${Math.round((overview.correct / overview.attempts) * 100)}%，当前有 ${overview.wrongOpen} 道错题待消化。`;
  const plan = [
    { title: '重做错题', detail: '先把错题本里的题重新做一遍，重点看解析里的第一步。', kpId: 'general' },
    { title: '薄弱点专项', detail: '点击「针对薄弱点巩固」，系统会围绕正确率最低的知识点生成变式题。', kpId: 'general' },
    { title: '回顾课本', detail: '每天挑 3 个知识点，结合课本例题把关键方法或词句复述一遍。', kpId: 'general' }
  ];
  return { summary, weakPoints, plan, source: 'local' };
}

async function handleAnalyze(body) {
  const subject = findSubject(String(body?.subjectId || '')) || findSubject('math');
  const rawStats = store.accuracyByKp(subject.id);
  const stats = rawStats.map((s) => ({
    kpId: s.kpId,
    kpName: s.kpName,
    attempts: Number(s.attempts),
    correct: Number(s.correct),
    accuracy: s.attempts ? Math.round((s.correct / s.attempts) * 100) : 0
  }));
  const overview = store.overview(subject.id);
  const wrongList = store.listWrongItems('all', subject.id).slice(0, 12);

  if (!readConfig().apiKey || !stats.length) {
    return localAnalysis(stats, wrongList, overview, subject.name);
  }
  try {
    const { analysis, usage } = await analyzeWeakness({ subjectName: subject.name, stats, wrongList, overview });
    if (usage) store.recordUsage({ subject: subject.id, kind: 'analyze', ...usage });
    return { ...analysis, source: 'llm', usage };
  } catch (err) {
    if (err.usage) store.recordUsage({ subject: subject.id, kind: 'analyze', ...err.usage });
    const local = localAnalysis(stats, wrongList, overview, subject.name);
    return { ...local, warning: `大模型分析失败：${err.message}，已改用本地统计结果。` };
  }
}

async function route(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (pathname.startsWith('/api/')) {
    try {
      if (req.method === 'GET' && pathname === '/api/curriculum') {
        return sendJson(res, 200, { subjects: listSubjects() });
      }
      if (req.method === 'GET' && pathname === '/api/config') {
        return sendJson(res, 200, { ...publicConfig(), presets: PRESETS, pricing: priceTable() });
      }
      if (req.method === 'POST' && pathname === '/api/config') {
        const body = await readBody(req);
        saveConfig(body);
        return sendJson(res, 200, { ok: true, ...publicConfig() });
      }
      if (req.method === 'POST' && pathname === '/api/config/test') {
        const result = await testConnection();
        return sendJson(res, 200, result);
      }
      if (req.method === 'POST' && pathname === '/api/generate') {
        return sendJson(res, 200, await handleGenerate(await readBody(req)));
      }
      if (req.method === 'POST' && pathname === '/api/grade') {
        return sendJson(res, 200, await handleGrade(await readBody(req)));
      }
      if (req.method === 'GET' && pathname === '/api/wrongbook') {
        const status = url.searchParams.get('status') || 'all';
        const subject = findSubject(url.searchParams.get('subject') || '') ? url.searchParams.get('subject') : '';
        const items = store.listWrongItems(status, subject || undefined).map((w) => ({
          questionId: w.question_id,
          subject: w.subject,
          type: w.type,
          stem: w.stem,
          options: w.options,
          answer: w.answer,
          solution: w.solution,
          kpId: w.kp_id,
          kpName: w.kp_name,
          wrongCount: w.wrong_count,
          lastAnswer: w.last_answer,
          status: w.status,
          errorProne: w.error_prone,
          updatedAt: w.updated_at
        }));
        return sendJson(res, 200, { items, byKp: store.wrongStatsByKp(subject || undefined) });
      }
      if (req.method === 'POST' && pathname === '/api/wrongbook/status') {
        const body = await readBody(req);
        store.setWrongStatus(Number(body.questionId), body.status === 'mastered' ? 'mastered' : 'new');
        return sendJson(res, 200, { ok: true });
      }
      if (req.method === 'GET' && pathname === '/api/overview') {
        const subject = findSubject(url.searchParams.get('subject') || '') ? url.searchParams.get('subject') : '';
        return sendJson(res, 200, {
          ...store.overview(subject || undefined),
          stats: store.accuracyByKp(subject || undefined).map((s) => ({
            kpId: s.kpId,
            kpName: s.kpName,
            attempts: Number(s.attempts),
            correct: Number(s.correct),
            accuracy: s.attempts ? Math.round((s.correct / s.attempts) * 100) : 0
          }))
        });
      }
      if (req.method === 'GET' && pathname === '/api/usage') {
        const subject = findSubject(url.searchParams.get('subject') || '') ? url.searchParams.get('subject') : '';
        return sendJson(res, 200, {
          total: store.usageSummary(subject || undefined),
          bySubject: store.usageBySubject()
        });
      }
      if (req.method === 'POST' && pathname === '/api/analyze') {
        return sendJson(res, 200, await handleAnalyze(await readBody(req)));
      }
      return sendJson(res, 404, { error: '接口不存在' });
    } catch (err) {
      return sendJson(res, 400, { error: err.message || '请求处理失败' });
    }
  }

  // 静态资源
  const rel = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(PUBLIC_DIR, path.normalize(rel).replace(/^([/\\])+/, ''));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('页面不存在');
  }
}

const PRESETS = [
  { id: 'deepseek', name: 'DeepSeek', baseUrl: 'https://api.deepseek.com', model: 'deepseek-v4-flash' },
  { id: 'qwen', name: '通义千问', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus' },
  { id: 'zhipu', name: '智谱 GLM', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash' },
  { id: 'moonshot', name: 'Kimi', baseUrl: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k' },
  { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' }
];

const server = http.createServer((req, res) => {
  route(req, res).catch((err) => {
    if (!res.headersSent) sendJson(res, 500, { error: err.message || '服务器内部错误' });
    else res.end();
  });
});

fs.mkdirSync(DATA_DIR, { recursive: true });
trustSystemCertificates();

server.listen(PORT, () => {
  console.log(`五年级闯关已启动：http://localhost:${PORT}`);
});

export { server };
