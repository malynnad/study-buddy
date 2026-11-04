// 本地判分：不依赖大模型，保证判分稳定、即时
import { judgeDraw } from './geometry.js';

const FULL_WIDTH = { '０': '0', '１': '1', '２': '2', '３': '3', '４': '4', '５': '5', '６': '6', '７': '7', '８': '8', '９': '9', '．': '.', '／': '/', '（': '(', '）': ')', '＋': '+', '－': '-', '＝': '=', '％': '%', '　': ' ' };

export function normalize(raw) {
  let s = String(raw ?? '');
  s = s.replace(/[０-９．／（）＋－＝％　]/g, (ch) => FULL_WIDTH[ch] ?? ch);
  s = s
    .replace(/[×✕✖]/g, '*')
    .replace(/[÷➗]/g, '/')
    .replace(/[，,]/g, ',')
    .replace(/[。；;]/g, '')
    .replace(/度/g, '°')
    .replace(/[∶]/g, ':')
    .replace(/[’‘]/g, "'")
    .trim();
  return s.replace(/\s+/g, ' ');
}

export function parseNumber(raw) {
  const s = normalize(raw).replace(/\s+/g, (m) => (m === ' ' ? ' ' : ''));
  if (!s) return null;
  const percent = s.match(/^([-+]?\d+(?:\.\d+)?)%$/);
  if (percent) return parseFloat(percent[1]) / 100;
  const mul = s.match(/^([-+]?\d+(?:\.\d+)?)\s*个?$/);
  if (mul) return parseFloat(mul[1]);
  let m = s.match(/^([-+]?\d+)\s*(?:又|有)\s*(\d+)\s*\/\s*(\d+)$/);
  if (m) return mixedValue(m[1], m[2], m[3]);
  m = s.match(/^([-+]?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (m) return mixedValue(m[1], m[2], m[3]);
  m = s.match(/^([-+]?\d+)\s*\/\s*(\d+)$/);
  if (m) {
    const d = Number(m[2]);
    if (!d) return null;
    return Number(m[1]) / d;
  }
  m = s.match(/^([-+]?(?:\d+(?:\.\d*)?|\.\d+))$/);
  if (m) return Number(m[1]);
  return null;
}

function mixedValue(intPart, numPart, denPart) {
  const d = Number(denPart);
  if (!d) return null;
  const sign = String(intPart).startsWith('-') ? -1 : 1;
  return sign * (Math.abs(Number(intPart)) + Number(numPart) / d);
}

function closeEnough(a, b) {
  const diff = Math.abs(a - b);
  return diff <= 0.005 + 0.002 * Math.abs(b);
}

function stripOptionPrefix(text) {
  return normalize(text).replace(/^[A-Da-d][.、)．]\s*/, '').replace(/\s+/g, '').replace(/[。.]$/, '');
}

function sameText(a, b) {
  const na = normalize(a).toLowerCase().replace(/\s+/g, '').replace(/[。.]$/, '');
  const nb = normalize(b).toLowerCase().replace(/\s+/g, '').replace(/[。.]$/, '');
  return na === nb;
}

function optionLetter(text) {
  const s = normalize(text).toUpperCase();
  const direct = s.match(/^[A-D]$/);
  if (direct) return direct[0];
  const prefixed = s.match(/^[A-D][.、)．]/);
  return prefixed ? prefixed[0][0] : null;
}

export function judge(question, userAnswer) {
  const raw = userAnswer == null ? '' : String(userAnswer).trim();
  if (!raw) return { correct: false, note: '未作答' };

  if (question.type === 'draw') return judgeDraw(question, raw);

  if (question.type === 'choice') {
    const answerLetter = optionLetter(question.answer) || String(question.answer || '').trim().toUpperCase().slice(0, 1);
    const userLetter = optionLetter(raw);
    if (userLetter && answerLetter && userLetter === answerLetter) return { correct: true, note: '' };
    const answerText = stripOptionPrefix(question.answer);
    for (const opt of question.options || []) {
      if (stripOptionPrefix(opt) === answerText && sameText(raw, stripOptionPrefix(opt))) return { correct: true, note: '' };
    }
    return { correct: false, note: '' };
  }

  const target = parseNumber(question.answer);
  const mine = parseNumber(raw);
  if (target != null && mine != null) {
    if (closeEnough(mine, target)) {
      return { correct: true, note: Math.abs(mine - target) > 1e-9 ? '近似值，判为正确' : '' };
    }
    return { correct: false, note: '' };
  }

  if (sameText(raw, question.answer)) return { correct: true, note: '' };
  return { correct: false, note: '' };
}

// 从作答中提取学生可能写出的数值，用于错题归因文案（可选）
export function describeAnswer(question, userAnswer) {
  if (!userAnswer) return '未作答';
  return String(userAnswer).trim();
}
