import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './paths.js';

fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new DatabaseSync(path.join(DATA_DIR, 'app.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode TEXT NOT NULL,
    subject TEXT NOT NULL DEFAULT 'math',
    kp_ids TEXT NOT NULL,
    total INTEGER NOT NULL DEFAULT 0,
    correct INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'doing',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    seq INTEGER NOT NULL,
    subject TEXT NOT NULL DEFAULT 'math',
    type TEXT NOT NULL,
    stem TEXT NOT NULL,
    options TEXT,
    answer TEXT NOT NULL,
    solution TEXT,
    kp_id TEXT NOT NULL,
    kp_name TEXT NOT NULL,
    difficulty INTEGER NOT NULL DEFAULT 2,
    error_prone TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    session_id INTEGER NOT NULL,
    user_answer TEXT NOT NULL,
    is_correct INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS wrong_items (
    question_id INTEGER PRIMARY KEY,
    session_id INTEGER,
    wrong_count INTEGER NOT NULL DEFAULT 1,
    last_answer TEXT,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS llm_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    subject TEXT NOT NULL DEFAULT 'math',
    kind TEXT NOT NULL,
    model TEXT,
    period TEXT,
    prompt_tokens INTEGER NOT NULL DEFAULT 0,
    completion_tokens INTEGER NOT NULL DEFAULT 0,
    cache_hit_tokens INTEGER NOT NULL DEFAULT 0,
    cache_miss_tokens INTEGER NOT NULL DEFAULT 0,
    cost REAL NOT NULL DEFAULT 0,
    priced INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_attempts_session ON attempts(session_id);
  CREATE INDEX IF NOT EXISTS idx_questions_session ON questions(session_id);
  CREATE INDEX IF NOT EXISTS idx_usage_subject ON llm_usage(subject);
`);

// 兼容旧库：为已有表补充新增列
function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
  if (!columns.includes(column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
}
ensureColumn('sessions', 'subject', "subject TEXT NOT NULL DEFAULT 'math'");
ensureColumn('questions', 'subject', "subject TEXT NOT NULL DEFAULT 'math'");

export function now() {
  return Date.now();
}

export function createSession(mode, kpIds, subject = 'math') {
  const info = db
    .prepare('INSERT INTO sessions (mode, subject, kp_ids, created_at) VALUES (?, ?, ?, ?)')
    .run(mode, subject, JSON.stringify(kpIds), now());
  return Number(info.lastInsertRowid);
}

export function saveQuestion(q, sessionId, seq, subject = 'math') {
  const info = db
    .prepare(
      `INSERT INTO questions
       (session_id, seq, subject, type, stem, options, answer, solution, kp_id, kp_name, difficulty, error_prone, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      sessionId,
      seq,
      subject,
      q.type,
      q.stem,
      q.options ? JSON.stringify(q.options) : null,
      String(q.answer),
      q.solution || '',
      q.kpId,
      q.kpName,
      q.difficulty || 2,
      q.errorProne || '',
      now()
    );
  return Number(info.lastInsertRowid);
}

export function listSessionQuestions(sessionId) {
  return db
    .prepare('SELECT * FROM questions WHERE session_id = ? ORDER BY seq ASC')
    .all(sessionId)
    .map((row) => ({ ...row, options: row.options ? JSON.parse(row.options) : null }));
}

export function getSession(sessionId) {
  return db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
}

export function finishSession(sessionId, total, correct) {
  db.prepare("UPDATE sessions SET total = ?, correct = ?, status = 'done' WHERE id = ?").run(total, correct, sessionId);
}

export function recordAttempt(questionId, sessionId, userAnswer, isCorrect) {
  db.prepare('INSERT INTO attempts (question_id, session_id, user_answer, is_correct, created_at) VALUES (?, ?, ?, ?, ?)').run(
    questionId,
    sessionId,
    String(userAnswer ?? ''),
    isCorrect ? 1 : 0,
    now()
  );
}

export function markWrong(questionId, sessionId, userAnswer, note) {
  const existing = db.prepare('SELECT * FROM wrong_items WHERE question_id = ?').get(questionId);
  if (existing) {
    db.prepare('UPDATE wrong_items SET wrong_count = wrong_count + 1, last_answer = ?, note = ?, status = ?, updated_at = ? WHERE question_id = ?').run(
      String(userAnswer),
      note || existing.note,
      existing.status === 'mastered' ? 'reviewing' : existing.status,
      now(),
      questionId
    );
  } else {
    db.prepare('INSERT INTO wrong_items (question_id, session_id, wrong_count, last_answer, note, status, updated_at) VALUES (?, ?, 1, ?, ?, ?, ?)').run(
      questionId,
      sessionId,
      String(userAnswer),
      note || '',
      'new',
      now()
    );
  }
}

export function setWrongStatus(questionId, status) {
  db.prepare('UPDATE wrong_items SET status = ?, updated_at = ? WHERE question_id = ?').run(status, now(), questionId);
}

export function listWrongItems(status, subject) {
  const base = `
    SELECT w.*, q.subject, q.type, q.stem, q.options, q.answer, q.solution, q.kp_id, q.kp_name, q.difficulty, q.error_prone, q.created_at AS asked_at
    FROM wrong_items w JOIN questions q ON q.id = w.question_id`;
  const where = [];
  const args = [];
  if (subject) {
    where.push('q.subject = ?');
    args.push(subject);
  }
  if (status === 'mastered') where.push("w.status = 'mastered'");
  else if (status && status !== 'all') where.push("w.status != 'mastered'");
  const sql = `${base}${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY w.updated_at DESC`;
  return db
    .prepare(sql)
    .all(...args)
    .map((row) => ({ ...row, options: row.options ? JSON.parse(row.options) : null }));
}

export function wrongStatsByKp(subject) {
  const filter = subject ? 'WHERE q.subject = ?' : '';
  return db
    .prepare(`
      SELECT q.kp_id AS kpId, q.kp_name AS kpName, COUNT(*) AS total,
             SUM(w.status = 'mastered') AS mastered
      FROM wrong_items w JOIN questions q ON q.id = w.question_id
      ${filter}
      GROUP BY q.kp_id, q.kp_name`)
    .all(...(subject ? [subject] : []));
}

export function accuracyByKp(subject) {
  const filter = subject ? 'WHERE q.subject = ?' : '';
  return db
    .prepare(`
      SELECT q.kp_id AS kpId, q.kp_name AS kpName,
             COUNT(*) AS attempts,
             SUM(a.is_correct) AS correct,
             MIN(a.created_at) AS first_at,
             MAX(a.created_at) AS last_at
      FROM attempts a JOIN questions q ON q.id = a.question_id
      ${filter}
      GROUP BY q.kp_id, q.kp_name`)
    .all(...(subject ? [subject] : []));
}

export function recentWrongQuestionIds(limit = 10, subject) {
  const filter = subject ? 'AND q.subject = ?' : '';
  return db
    .prepare(`SELECT w.question_id FROM wrong_items w JOIN questions q ON q.id = w.question_id WHERE w.status != 'mastered' ${filter} ORDER BY w.updated_at DESC LIMIT ?`)
    .all(...(subject ? [subject, limit] : [limit]))
    .map((r) => Number(r.question_id));
}

export function getQuestionsByIds(ids) {
  if (!ids.length) return [];
  const rows = db
    .prepare(`SELECT * FROM questions WHERE id IN (${ids.map(() => '?').join(',')})`)
    .all(...ids);
  return rows.map((row) => ({ ...row, options: row.options ? JSON.parse(row.options) : null }));
}

export function overview(subject) {
  if (subject) {
    const total = db.prepare('SELECT COUNT(*) AS c FROM attempts a JOIN questions q ON q.id = a.question_id WHERE q.subject = ?').get(subject).c;
    const correct = db.prepare('SELECT COALESCE(SUM(a.is_correct), 0) AS c FROM attempts a JOIN questions q ON q.id = a.question_id WHERE q.subject = ?').get(subject).c;
    const sessions = db.prepare("SELECT COUNT(*) AS c FROM sessions WHERE status = 'done' AND subject = ?").get(subject).c;
    const wrongOpen = db.prepare("SELECT COUNT(*) AS c FROM wrong_items w JOIN questions q ON q.id = w.question_id WHERE w.status != 'mastered' AND q.subject = ?").get(subject).c;
    const mastered = db.prepare("SELECT COUNT(*) AS c FROM wrong_items w JOIN questions q ON q.id = w.question_id WHERE w.status = 'mastered' AND q.subject = ?").get(subject).c;
    return { attempts: total, correct, sessions, wrongOpen, mastered };
  }
  const total = db.prepare('SELECT COUNT(*) AS c FROM attempts').get().c;
  const correct = db.prepare('SELECT COALESCE(SUM(is_correct), 0) AS c FROM attempts').get().c;
  const sessions = db.prepare("SELECT COUNT(*) AS c FROM sessions WHERE status = 'done'").get().c;
  const wrongOpen = db.prepare("SELECT COUNT(*) AS c FROM wrong_items WHERE status != 'mastered'").get().c;
  const mastered = db.prepare("SELECT COUNT(*) AS c FROM wrong_items WHERE status = 'mastered'").get().c;
  return { attempts: total, correct, sessions, wrongOpen, mastered };
}

export function recordUsage(entry) {
  db.prepare(
    `INSERT INTO llm_usage
     (session_id, subject, kind, model, period, prompt_tokens, completion_tokens, cache_hit_tokens, cache_miss_tokens, cost, priced, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    entry.sessionId ?? null,
    entry.subject || 'math',
    entry.kind || 'generate',
    entry.model || '',
    entry.period || '',
    Number(entry.promptTokens) || 0,
    Number(entry.completionTokens) || 0,
    Number(entry.cacheHitTokens) || 0,
    Number(entry.cacheMissTokens) || 0,
    Number(entry.cost) || 0,
    entry.priced ? 1 : 0,
    now()
  );
}

function toUsageSummary(row) {
  return {
    calls: Number(row.calls) || 0,
    promptTokens: Number(row.promptTokens) || 0,
    completionTokens: Number(row.completionTokens) || 0,
    totalTokens: (Number(row.promptTokens) || 0) + (Number(row.completionTokens) || 0),
    cacheHitTokens: Number(row.cacheHitTokens) || 0,
    cost: Number(row.cost) || 0
  };
}

export function usageSummary(subject) {
  const filter = subject ? 'WHERE subject = ?' : '';
  const row = db
    .prepare(`
      SELECT COUNT(*) AS calls,
             COALESCE(SUM(prompt_tokens), 0) AS promptTokens,
             COALESCE(SUM(completion_tokens), 0) AS completionTokens,
             COALESCE(SUM(cache_hit_tokens), 0) AS cacheHitTokens,
             COALESCE(SUM(cost), 0) AS cost
      FROM llm_usage ${filter}`)
    .get(...(subject ? [subject] : []));
  return toUsageSummary(row);
}

export function usageBySubject() {
  const rows = db
    .prepare(`
      SELECT subject, COUNT(*) AS calls,
             COALESCE(SUM(prompt_tokens), 0) AS promptTokens,
             COALESCE(SUM(completion_tokens), 0) AS completionTokens,
             COALESCE(SUM(cache_hit_tokens), 0) AS cacheHitTokens,
             COALESCE(SUM(cost), 0) AS cost
      FROM llm_usage GROUP BY subject ORDER BY subject`)
    .all();
  return rows.map((row) => ({ subject: row.subject, ...toUsageSummary(row) }));
}
