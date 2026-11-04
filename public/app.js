const app = document.getElementById('app');

const state = {
  view: 'practice',
  stage: 'setup',
  curriculum: null,
  subjectId: 'math',
  semesterId: 'g5a',
  selectedKps: [],
  count: 5,
  mode: 'new',
  session: null,
  index: 0,
  answers: {},
  result: null,
  overview: null,
  wrong: { status: 'new', items: [], byKp: [] },
  analysis: null,
  config: null,
  usage: null,
  settingsDraft: null
};

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const TYPE_LABEL = { choice: '选择题', fill: '填空题', calc: '计算题', word: '简答题' };

const subjects = () => state.curriculum?.subjects || [];
const currentSubject = () => subjects().find((s) => s.id === state.subjectId) || subjects()[0] || null;
const currentSemester = () => {
  const sub = currentSubject();
  if (!sub) return null;
  return sub.semesters.find((s) => s.id === state.semesterId) || sub.semesters[0];
};
const typeLabel = (type) => (type === 'word' && state.subjectId === 'math' ? '应用题' : TYPE_LABEL[type] || '题目');

const fmtInt = (n) => Number(n || 0).toLocaleString('zh-CN');
function fmtCost(n) {
  const v = Number(n) || 0;
  if (!v) return '¥0';
  if (v < 0.0001) return `¥${v.toFixed(6)}`;
  if (v < 0.01) return `¥${v.toFixed(5)}`;
  return `¥${v.toFixed(4)}`;
}
function usageNoteHTML(usage, title = '本次出题消耗') {
  if (!usage) return '';
  const cost = usage.priced
    ? `，约 <b>${fmtCost(usage.cost)}</b>${usage.period === 'offPeak' ? '（谷时价）' : usage.period === 'peak' ? '（峰时价）' : ''}`
    : '（该模型未内置价格，仅统计 tokens）';
  return `<div class="usage-note"><span class="usage-tag">AI 用量</span><span>${title} <b>${fmtInt(usage.totalTokens)}</b> tokens（输入 ${fmtInt(
    usage.promptTokens
  )} · 输出 ${fmtInt(usage.completionTokens)}）${cost}</span></div>`;
}

function subjectSwitchHTML(action = 'subject') {
  return `<div class="segmented subject-switch">
    ${subjects()
      .map((s) => `<button class="${s.id === state.subjectId ? 'on' : ''}" data-action="${action}" data-id="${s.id}">${esc(s.name)}</button>`)
      .join('')}
  </div>`;
}

const ICONS = {
  logo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.2A2.2 2.2 0 0 1 6.2 3H19a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6.2A2.2 2.2 0 0 1 4 18.8v-13.6Z"/><path d="M4 18.8A2.2 2.2 0 0 1 6.2 16.6H20"/><path d="M9.6 10.2l1.7 1.7 3.2-3.4"/></svg>`,
  practice: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 18.5v-13Z"/><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20"/><path d="M8 8h8M8 11.5h5"/></svg>`,
  wrong: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.6"/><path d="M12 7.8v4.8"/><path d="M12 16.1h.01"/></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4v16h16"/><path d="M7.5 16v-4.5"/><path d="M12 16V8"/><path d="M16.5 16v-6.5"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h9"/><path d="M17 7h3"/><circle cx="15" cy="7" r="2.2"/><path d="M4 17h3"/><path d="M11 17h9"/><circle cx="9" cy="17" r="2.2"/></svg>`,
  check: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M3 8.4l3.2 3.2L13 4.8"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>`,
  alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5"/><path d="M12 16h.01"/></svg>`,
  empty: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H19a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 17.5V6.5Z"/><path d="M8 9h8M8 13h5"/></svg>`
};

/* ---------------- 基础工具 ---------------- */
async function api(path, options = {}) {
  const res = await fetch(path, {
    method: options.method || 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error('服务返回了无法解析的内容');
  }
  if (!res.ok || data.error) throw new Error(data.error || `请求失败（${res.status}）`);
  return data;
}

let toastTimer = null;
function showToast(message, type = 'info', duration = 3600) {
  document.querySelectorAll('.toast').forEach((el) => el.remove());
  const el = document.createElement('div');
  el.className = `toast ${type === 'error' ? 'error' : ''}`;
  el.textContent = message;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, duration);
}

let maskEl = null;
function showLoading(text) {
  if (maskEl) return;
  maskEl = document.createElement('div');
  maskEl.className = 'loading-mask';
  maskEl.innerHTML = `<div class="loading-box"><div class="spinner"></div><p>${esc(text)}</p></div>`;
  document.body.appendChild(maskEl);
}
function hideLoading() {
  if (maskEl) {
    maskEl.remove();
    maskEl = null;
  }
}

const stars = (n) => '●'.repeat(n) + '○'.repeat(Math.max(0, 3 - n));

/* ---------------- 渲染 ---------------- */
function renderApp() {
  app.innerHTML = headerHTML() + mainHTML();
  afterRender();
}

function headerHTML() {
  const wrongOpen = state.overview?.wrongOpen ?? 0;
  const tab = (view, icon, label, badge = '') =>
    `<button class="tab ${state.view === view ? 'active' : ''}" data-action="nav" data-view="${view}">${icon}<span>${label}</span>${badge}</button>`;
  return `<header class="topbar"><div class="bar-inner">
    <div class="brand">
      <div class="logo">${ICONS.logo}</div>
      <div class="brand-text"><strong>五年级闯关</strong><span>深圳 · 语文 / 数学 / 英语</span></div>
    </div>
    <nav class="tabs">
      ${tab('practice', ICONS.practice, '练习')}
      ${tab('wrongbook', ICONS.wrong, '错题本', wrongOpen ? `<span class="dot">${wrongOpen}</span>` : '')}
      ${tab('analysis', ICONS.chart, '学情')}
      ${tab('settings', ICONS.settings, '设置')}
    </nav>
  </div></header>`;
}

function mainHTML() {
  if (!state.curriculum) return `<section class="page"><div class="empty"><h3>正在加载课程数据…</h3></div></section>`;
  if (state.view === 'practice') {
    if (state.stage === 'exam') return examHTML();
    if (state.stage === 'result') return resultHTML();
    return setupHTML();
  }
  if (state.view === 'wrongbook') return wrongbookHTML();
  if (state.view === 'analysis') return analysisHTML();
  return settingsHTML();
}

/* ---------- 练习：组卷 ---------- */
function setupHTML() {
  const subject = currentSubject();
  const sem = currentSemester();
  if (!subject || !sem) return `<section class="page"><div class="empty"><h3>正在加载课程数据…</h3></div></section>`;
  const selected = new Set(state.selectedKps);
  const totalKps = sem.units.reduce((n, u) => n + u.kps.length, 0);
  const needsKey = state.subjectId !== 'math' && !state.config?.configured;
  const unitsHTML = sem.units
    .map(
      (unit) => `<div class="unit">
        <div class="unit-name">${esc(unit.name)}<em>${unit.kps.length} 个知识点</em></div>
        <div class="chips">
          ${unit.kps
            .map(
              (kp) =>
                `<button class="chip ${selected.has(kp.id) ? 'on' : ''}" data-action="kp" data-id="${kp.id}">${ICONS.check}${esc(kp.name)}</button>`
            )
            .join('')}
        </div>
      </div>`
    )
    .join('');

  return `<section class="page">
    <div class="page-head">
      <h1>组一套练习</h1>
      <p>选择学科与知识点，AI 出题、自动批改，错题自动进入错题本；每次出题会显示消耗的 tokens 与费用。</p>
    </div>

    <div class="card">
      <div class="card-head"><h2>学科</h2><span class="hint">${esc(subject.textbook)}</span></div>
      ${subjectSwitchHTML()}
      ${
        needsKey
          ? `<div class="notice" style="margin-top:12px">${ICONS.alert}<span>${esc(subject.name)}题目由大模型生成，请先到「设置」配置 API Key。</span></div>`
          : ''
      }
    </div>

    <div class="card">
      <div class="card-head"><h2>学期</h2><span class="hint">共 ${totalKps} 个知识点</span></div>
      <div class="segmented">
        ${subject.semesters
          .map((s) => `<button class="${s.id === sem.id ? 'on' : ''}" data-action="semester" data-id="${s.id}">${esc(s.name)}</button>`)
          .join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <h2>知识点</h2>
        <span class="hint">已选 ${state.selectedKps.length} 个</span>
        <span class="spacer"></span>
        <button class="link" data-action="select-all">全选本学期</button>
        <button class="link" data-action="clear-kps">清空</button>
      </div>
      ${unitsHTML}
    </div>

    <div class="card">
      <div class="option-row">
        <span class="option-label">题量</span>
        <div class="segmented">
          ${[3, 5, 8, 10]
            .map((n) => `<button class="${state.count === n ? 'on' : ''}" data-action="count" data-count="${n}">${n} 题</button>`)
            .join('')}
        </div>
      </div>
      <div class="option-row">
        <span class="option-label">模式</span>
        <div class="segmented">
          <button class="${state.mode === 'new' ? 'on' : ''}" data-action="mode" data-mode="new">新题练习</button>
          <button class="${state.mode === 'reinforce' ? 'on' : ''}" data-action="mode" data-mode="reinforce">薄弱点巩固</button>
        </div>
      </div>
      <div class="option-row">
        <span class="option-label"></span>
        <span class="hint" style="font-size:12.5px;color:var(--ink-3)">
          ${state.mode === 'reinforce' ? '会围绕正确率最低的知识点生成变式题' : '不选知识点时，系统会自动挑选需要加强的内容'}
        </span>
      </div>
    </div>

    <button class="btn primary big" data-action="start">
      ${state.mode === 'reinforce' ? '针对薄弱点开始练习' : '开始练习'}${ICONS.arrow}
    </button>
  </section>`;
}

/* ---------- 练习：答题 ---------- */
function examHTML() {
  const s = state.session;
  if (!s) return setupHTML();
  const q = s.questions[state.index];
  const total = s.questions.length;
  const value = state.answers[q.id] ?? '';
  const letters = ['A', 'B', 'C', 'D'];

  const answerArea =
    q.type === 'choice'
      ? `<div class="choices">${(q.options || [])
          .map((opt, i) => {
            const letter = letters[i];
            const text = String(opt).replace(/^[A-Da-d][.、)．]\s*/, '');
            return `<button class="choice ${value === letter ? 'on' : ''}" data-action="option" data-letter="${letter}">
              <span class="key">${letter}</span><span>${esc(text)}</span>
            </button>`;
          })
          .join('')}</div>`
      : `<div class="answer-area">
          <input id="answer-input" class="answer-input" autocomplete="off" inputmode="text" placeholder="在这里填写答案" value="${esc(value)}" />
          <div class="answer-tip">${esc(
            state.subjectId === 'math'
              ? '可以直接写数值或分数，如 12.5、3/4、2又1/3；按回车进入下一题'
              : state.subjectId === 'english'
                ? '英文答案不区分大小写；按回车进入下一题'
                : '填写简洁的答案；按回车进入下一题'
          )}</div>
        </div>`;

  return `<section class="page">
    <div class="exam-top">
      <button class="btn ghost sm" data-action="exit">退出</button>
      <div class="progress"><i style="width:${((state.index + 1) / total) * 100}%"></i></div>
      <span class="exam-count">${state.index + 1} / ${total}</span>
    </div>
    ${usageNoteHTML(s.usage)}

    <div class="card q-card">
      <div class="q-meta">
        <span class="pill">${esc(q.kpName)}</span>
        <span class="pill ghost">${typeLabel(q.type)}</span>
        <span class="pill ghost">难度 ${stars(q.difficulty || 2)}</span>
      </div>
      <div class="q-stem">${esc(q.stem)}</div>
      ${answerArea}
    </div>

    <div class="exam-actions">
      <button class="btn ghost" data-action="prev" ${state.index === 0 ? 'disabled' : ''}>上一题</button>
      <button class="btn primary grow" data-action="next">${state.index === total - 1 ? '提交批改' : '下一题'}</button>
    </div>
  </section>`;
}

/* ---------- 练习：结果 ---------- */
function resultHTML() {
  const r = state.result;
  if (!r) return setupHTML();
  const ringClass = r.score < 60 ? 'low' : r.score < 85 ? 'mid' : '';

  const itemsHTML = r.items
    .map((item) => {
      const opts =
        item.type === 'choice' && item.options
          ? `<div class="ri-options">${item.options
              .map((opt) => {
                const text = String(opt).replace(/^[A-Da-d][.、)．]\s*/, '');
                const letter = String(opt).trim().charAt(0).toUpperCase();
                const right = letter === String(item.answer).trim().charAt(0).toUpperCase();
                return `<span class="ri-option ${right ? 'right' : ''}">${letter}. ${esc(text)}</span>`;
              })
              .join('')}</div>`
          : '';

      const solution = item.solution
        ? item.correct
          ? `<details class="solution"><summary>查看解析</summary><div class="ri-solution">${esc(item.solution)}</div></details>`
          : `<div class="ri-solution">${esc(item.solution)}</div>`
        : '';

      return `<div class="result-item ${item.correct ? '' : 'bad'}">
        <div class="ri-head">
          <div class="ri-index">${item.seq}</div>
          <div class="ri-main">
            <div class="ri-stem">${esc(item.stem)}</div>
            ${opts}
            <div class="ri-answer">
              <span>你的答案：<b>${esc(item.userAnswer || '未作答')}</b></span>
              ${item.correct ? '' : `<span>正确答案：<b>${esc(item.answer)}</b></span>`}
              ${item.note ? `<span class="pill amber">${esc(item.note)}</span>` : ''}
            </div>
          </div>
          <span class="ri-tag pill ${item.correct ? 'green' : 'red'}">${item.correct ? '正确' : '错题'}</span>
        </div>
        ${solution}
      </div>`;
    })
    .join('');

  const wrongKps = [...new Set(r.items.filter((i) => !i.correct).map((i) => i.kpId))];

  return `<section class="page">
    <div class="card result-hero">
      <div class="score-ring ${ringClass}" style="--pct:${r.score}">
        <div class="ring-inner"><strong>${r.score}</strong><span>分</span></div>
      </div>
      <div class="result-copy">
        <h2>${r.score >= 85 ? '掌握得不错，继续保持' : r.score >= 60 ? '基础还可以，错题要消化' : '这一组需要重新梳理'}</h2>
        <p>答对 ${r.correctCount} / ${r.total} 题，错题已自动加入错题本。</p>
        <div class="hero-actions">
          ${wrongKps.length ? `<button class="btn primary" data-action="retry-wrong">针对错题再练一组</button>` : ''}
          <button class="btn" data-action="new-round">再练一组新题</button>
          <button class="btn ghost" data-action="nav" data-view="analysis">查看薄弱点</button>
        </div>
      </div>
    </div>
    ${usageNoteHTML(state.session?.usage)}

    <div class="card">
      <div class="card-head"><h2>逐题回顾</h2><span class="hint">${r.total} 题</span></div>
      <div class="result-list">${itemsHTML}</div>
    </div>
  </section>`;
}

/* ---------- 错题本 ---------- */
function wrongbookHTML() {
  const { items, status } = state.wrong;
  const filters = [
    { id: 'new', label: '待复习' },
    { id: 'mastered', label: '已掌握' },
    { id: 'all', label: '全部' }
  ];

  const body = items.length
    ? items
        .map(
          (w) => `<div class="card wrong-item">
            <div class="wrong-top">
              <span class="pill">${esc(w.kpName)}</span>
              <span class="pill ghost">${typeLabel(w.type)}</span>
              ${w.status === 'mastered' ? '<span class="pill green">已掌握</span>' : `<span class="pill red">错了 ${w.wrongCount} 次</span>`}
            </div>
            <div class="wrong-stem">${esc(w.stem)}</div>
            <div class="wrong-meta">
              <span>上次作答：<b>${esc(w.lastAnswer || '未作答')}</b></span>
              ${w.errorProne ? `<span>易错点：<b>${esc(w.errorProne)}</b></span>` : ''}
            </div>
            <details class="solution">
              <summary>查看正确答案与解析</summary>
              <div class="ri-solution">正确答案：${esc(w.answer)}\n${esc(w.solution || '暂无解析')}</div>
            </details>
            <div class="wrong-actions">
              <button class="btn sm" data-action="toggle-mastered" data-id="${w.questionId}" data-status="${w.status}">
                ${w.status === 'mastered' ? '标记为待复习' : '我已掌握'}
              </button>
            </div>
          </div>`
        )
        .join('')
    : `<div class="card empty">
        ${ICONS.empty}
        <h3>${status === 'mastered' ? '还没有标记掌握的错题' : '这里还没有错题'}</h3>
        <p>做练习时答错的题会自动收进这里，当前显示${esc(currentSubject()?.name || '本学科')}的错题。</p>
        <button class="btn primary" data-action="go-practice">去做一组练习</button>
      </div>`;

  return `<section class="page">
    <div class="page-head">
      <h1>错题本</h1>
      <p>${esc(currentSubject()?.name || '')} · 共 ${state.overview?.wrongOpen ?? 0} 道待复习，已掌握 ${state.overview?.mastered ?? 0} 道。消化错题比刷新题更重要。</p>
    </div>
    ${subjectSwitchHTML()}
    <div class="filters">
      ${filters
        .map((f) => `<button class="filter ${state.wrong.status === f.id ? 'on' : ''}" data-action="wrong-filter" data-status="${f.id}">${f.label}</button>`)
        .join('')}
      ${items.length ? `<span class="spacer" style="margin-left:auto"></span><button class="btn sm primary" data-action="review-from-wrong">把这些错题再练一次</button>` : ''}
    </div>
    ${body}
  </section>`;
}

/* ---------- 学情分析 ---------- */
function analysisHTML() {
  const ov = state.overview || { attempts: 0, correct: 0, sessions: 0, wrongOpen: 0, mastered: 0 };
  const stats = (ov.stats || []).slice().sort((a, b) => a.accuracy - b.accuracy);
  const rate = ov.attempts ? Math.round((ov.correct / ov.attempts) * 100) : 0;

  const barsHTML = stats.length
    ? stats
        .map((s) => {
          const level = s.accuracy < 60 ? 'low' : s.accuracy < 80 ? 'mid' : 'good';
          return `<div class="kp-row">
            <div class="kp-row-head"><b>${esc(s.kpName)}</b><span class="num">${s.accuracy}%　<span style="color:var(--ink-3)">${s.correct}/${s.attempts}</span></span></div>
            <div class="bar"><i class="${level}" style="width:${Math.max(3, s.accuracy)}%"></i></div>
          </div>`;
        })
        .join('')
    : `<div class="empty" style="padding:24px 0">${ICONS.empty}<p>做完一组练习后，这里会出现各知识点的正确率。</p></div>`;

  const analysis = state.analysis;
  const weakHTML = analysis
    ? `<div class="weak-list">${(analysis.weakPoints || [])
        .map(
          (w) => `<div class="weak-item">
            <span class="weak-badge ${w.level === '薄弱' ? 'lv-weak' : w.level === '待巩固' ? 'lv-mid' : 'lv-good'}">${esc(w.level)}</span>
            <div class="weak-main">
              <h3>${esc(w.kpName)}${w.accuracy != null ? `<span class="pill ghost">正确率 ${w.accuracy}%</span>` : ''}</h3>
              <p>${esc(w.reason || '')}</p>
              ${w.advice ? `<div class="advice">${esc(w.advice)}</div>` : ''}
            </div>
          </div>`
        )
        .join('')}</div>`
    : `<div class="empty" style="padding:22px 0"><p>${state.busy ? '正在分析…' : '还没有分析结果'}</p></div>`;

  const planHTML = analysis?.plan?.length
    ? analysis.plan
        .map(
          (p, i) => `<div class="plan-item">
            <span class="plan-num">${i + 1}</span>
            <div><h3>${esc(p.title)}</h3><p>${esc(p.detail)}</p></div>
          </div>`
        )
        .join('')
    : '';

  const weakIds = (analysis?.weakPoints || []).map((w) => w.kpId).filter((id) => id && id !== 'general');

  return `<section class="page">
    <div class="page-head">
      <h1>学情分析</h1>
      <p>${analysis ? esc(analysis.summary || '') : '根据练习记录分析知识点掌握情况。'}</p>
    </div>
    ${subjectSwitchHTML()}
    ${usageNoteHTML(analysis?.usage, '本次分析消耗')}

    <div class="overview-grid">
      <div class="stat-card"><span>累计作答</span><strong>${ov.attempts}<em>题</em></strong></div>
      <div class="stat-card"><span>总体正确率</span><strong>${rate}<em>%</em></strong></div>
      <div class="stat-card"><span>待复习错题</span><strong>${ov.wrongOpen}<em>道</em></strong></div>
      <div class="stat-card"><span>已掌握错题</span><strong>${ov.mastered}<em>道</em></strong></div>
    </div>

    <div class="card">
      <div class="card-head">
        <h2>知识点掌握度</h2>
        <span class="spacer"></span>
        <span class="hint">正确率由低到高</span>
      </div>
      ${barsHTML}
    </div>

    <div class="card">
      <div class="card-head">
        <h2>薄弱点诊断</h2>
        <span class="spacer"></span>
        <button class="link" data-action="run-analysis">${state.analysis ? '重新分析' : '开始分析'}</button>
      </div>
      ${weakHTML}
      ${planHTML ? `<div style="margin-top:16px;padding-top:10px;border-top:1px solid var(--line-soft)">
        <div class="card-head" style="margin:14px 0 4px"><h2>今天可以这样做</h2></div>${planHTML}</div>` : ''}
      ${analysis?.warning ? `<div class="notice" style="margin-top:14px">${ICONS.alert}<span>${esc(analysis.warning)}</span></div>` : ''}
      ${
        weakIds.length
          ? `<button class="btn primary" style="margin-top:18px;width:100%" data-action="reinforce-weak" data-ids="${weakIds.join(',')}">针对这些薄弱点出题巩固</button>`
          : ''
      }
    </div>
  </section>`;
}

/* ---------- 设置 ---------- */
function usagePanelHTML() {
  const u = state.usage?.total;
  if (!u || !u.calls) {
    return `<div class="empty" style="padding:18px 0"><p>还没有调用记录。生成一组题目后，这里会显示累计 token 与估算费用。</p></div>`;
  }
  const nameOf = (id) => subjects().find((s) => s.id === id)?.name || id;
  const rows = [
    ['累计调用', `${u.calls} 次`],
    ['输入 tokens', fmtInt(u.promptTokens)],
    ['输出 tokens', fmtInt(u.completionTokens)],
    ['合计 tokens', fmtInt(u.totalTokens)],
    ['估算费用', fmtCost(u.cost)]
  ];
  const bySubject = (state.usage.bySubject || []).filter((r) => r.calls > 0);
  return `<div class="usage-grid">
      ${rows.map(([k, v]) => `<div class="usage-cell"><span>${k}</span><strong>${v}</strong></div>`).join('')}
    </div>
    ${
      bySubject.length
        ? `<div class="usage-sub-list">${bySubject
            .map(
              (r) => `<div class="usage-row"><b>${esc(nameOf(r.subject))}</b><span>${fmtInt(r.totalTokens)} tokens · ${fmtCost(r.cost)}</span></div>`
            )
            .join('')}</div>`
        : ''
    }`;
}

function settingsHTML() {
  const cfg = state.config;
  if (!cfg) return `<section class="page"><div class="empty"><h3>正在加载配置…</h3></div></section>`;
  const draft = state.settingsDraft || { baseUrl: cfg.baseUrl, model: cfg.model, apiKey: '' };
  const presets = cfg.presets || [];
  const activePreset = presets.find((p) => p.baseUrl === draft.baseUrl && p.model === draft.model)?.id || '';

  return `<section class="page">
    <div class="page-head">
      <h1>模型设置</h1>
      <p>出题、错因分析由大模型完成，推荐使用 DeepSeek 等 OpenAI 兼容接口。</p>
    </div>

    <div class="card">
      <div class="card-head"><h2>服务商</h2><span class="hint">选择后会自动填入地址与模型，可再手动修改</span></div>
      <div class="preset-row">
        ${presets
          .map((p) => `<button class="preset ${activePreset === p.id ? 'on' : ''}" data-action="preset" data-id="${p.id}">${esc(p.name)}</button>`)
          .join('')}
      </div>

      <div class="field">
        <label for="cfg-baseurl">接口地址</label>
        <input id="cfg-baseurl" class="input" value="${esc(draft.baseUrl)}" placeholder="https://api.deepseek.com" />
        <div class="desc">OpenAI 兼容的 Chat Completions 地址，DeepSeek 填 https://api.deepseek.com 即可。</div>
      </div>
      <div class="field">
        <label for="cfg-model">模型名称</label>
        <input id="cfg-model" class="input" value="${esc(draft.model)}" placeholder="deepseek-flash" />
      </div>
      <div class="field">
        <label for="cfg-apikey">API Key</label>
        <input id="cfg-apikey" class="input" type="password" value="${esc(draft.apiKey)}" placeholder="${cfg.configured ? `已保存 ${esc(cfg.apiKeyMask)}，留空则不修改` : '粘贴你的 API Key'}" />
        <div class="desc">Key 只保存在本机 data/config.json，不会写入数据库或上传。</div>
      </div>

      <div class="settings-actions">
        <button class="btn primary" data-action="save-config">保存设置</button>
        <button class="btn" data-action="test-config">测试连接</button>
      </div>
    </div>

    <div class="notice ${cfg.configured ? 'info' : ''}">
      ${ICONS.alert}
      <span>${
        cfg.configured
          ? '已配置模型，出题会调用大模型生成新题；数学调用失败时会切到内置示例题库，语文/英语会提示错误后重试。'
          : '当前尚未配置 API Key，数学可用内置示例题库兜底；语文、英语题目必须由大模型生成，请先填入 Key。'
      }</span>
    </div>

    <div class="card" style="margin-top:14px">
      <div class="card-head">
        <h2>模型用量与费用</h2>
        <span class="hint">按调用时段的官方价估算</span>
        <span class="spacer"></span>
        <button class="link" data-action="refresh-usage">刷新</button>
      </div>
      ${usagePanelHTML()}
      <p class="price-note">
        DeepSeek 分峰谷两档价格：峰时 08:30–00:30，谷时 00:30–08:30（北京时间，约 5 折）。deepseek-flash 峰时输入 1 元/百万
        tokens、缓存命中 0.02 元、输出 2 元；deepseek-v4-pro 峰时输入 3 元、缓存命中 0.025 元、输出 6 元。其他模型只统计
        tokens，不折算金额。
      </p>
    </div>

    <div class="card" style="margin-top:14px">
      <div class="card-head"><h2>关于教材</h2></div>
      <p style="font-size:13px;color:var(--ink-2);line-height:1.7">
        知识点按深圳小学常用教材整理：${subjects()
          .map((s) => `${s.name}（${s.textbook.replace(/（.*?）/g, '')}）`)
          .join('、')}，共 ${subjects().reduce(
          (n, s) => n + s.semesters.reduce((m, sem) => m + sem.units.reduce((k, u) => k + u.kps.length, 0), 0),
          0
        )} 个知识点。
      </p>
    </div>
  </section>`;
}

/* ---------------- 交互 ---------------- */
function afterRender() {
  if (state.view === 'practice' && state.stage === 'exam' && state.session) {
    const q = state.session.questions[state.index];
    if (q && q.type !== 'choice') {
      const input = document.getElementById('answer-input');
      if (input) input.focus({ preventScroll: true });
    }
  }
}

async function loadOverview() {
  try {
    state.overview = await api(`/api/overview?subject=${state.subjectId}`);
  } catch {
    /* 忽略统计加载失败 */
  }
}

async function loadUsage() {
  try {
    state.usage = await api('/api/usage');
  } catch {
    /* 忽略用量加载失败 */
  }
}

async function startPractice(kpIds, mode) {
  if (!kpIds.length && state.mode !== 'reinforce') {
    showToast('请至少选择一个知识点', 'error');
    return;
  }
  state.mode = mode || state.mode;
  const subject = currentSubject();
  showLoading(state.mode === 'reinforce' ? '正在围绕薄弱点生成变式题…' : `AI 正在按${subject?.name || ''}五年级教材出题…`);
  try {
    const data = await api('/api/generate', {
      method: 'POST',
      body: { subjectId: state.subjectId, semesterId: state.semesterId, kpIds, count: state.count, mode: state.mode }
    });
    state.session = data;
    state.index = 0;
    state.answers = {};
    state.result = null;
    state.stage = 'exam';
    state.view = 'practice';
    if (data.warning) setTimeout(() => showToast(data.warning, 'error', 8000), 300);
    loadUsage();
  } catch (err) {
    showToast(err.message, 'error', 5000);
  } finally {
    hideLoading();
    renderApp();
  }
}

async function submitExam() {
  if (!state.session) return;
  const answers = state.session.questions.map((q) => ({ questionId: q.id, answer: state.answers[q.id] ?? '' }));
  showLoading('正在批改…');
  try {
    state.result = await api('/api/grade', { method: 'POST', body: { sessionId: state.session.sessionId, answers } });
    state.stage = 'result';
    await loadOverview();
  } catch (err) {
    showToast(err.message, 'error', 5000);
  } finally {
    hideLoading();
    renderApp();
  }
}

async function loadWrongbook() {
  try {
    const data = await api(`/api/wrongbook?status=${state.wrong.status}&subject=${state.subjectId}`);
    state.wrong.items = data.items;
    state.wrong.byKp = data.byKp || [];
  } catch (err) {
    showToast(err.message, 'error');
  }
  renderApp();
}

async function runAnalysis() {
  showLoading('正在分析练习数据…');
  try {
    state.analysis = await api('/api/analyze', { method: 'POST', body: { subjectId: state.subjectId } });
    await Promise.all([loadOverview(), loadUsage()]);
  } catch (err) {
    showToast(err.message, 'error', 5000);
  } finally {
    hideLoading();
    renderApp();
  }
}

app.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;

  if (action === 'nav') {
    const view = el.dataset.view;
    state.view = view;
    if (view === 'practice' && state.stage !== 'exam') state.stage = 'setup';
    if (view === 'settings') await loadUsage();
    renderApp();
    if (view === 'wrongbook') loadWrongbook();
    if (view === 'analysis') {
      await loadOverview();
      renderApp();
      if (!state.analysis) runAnalysis();
    }
    return;
  }

  if (action === 'subject') {
    const id = el.dataset.id;
    if (id === state.subjectId) return;
    state.subjectId = id;
    const sub = currentSubject();
    state.semesterId = sub?.semesters?.[0]?.id || state.semesterId;
    state.selectedKps = [];
    state.analysis = null;
    if (state.view === 'practice') {
      state.stage = 'setup';
      state.session = null;
      state.result = null;
      state.answers = {};
    }
    await loadOverview();
    renderApp();
    if (state.view === 'wrongbook') loadWrongbook();
    if (state.view === 'analysis') runAnalysis();
    return;
  }

  if (action === 'refresh-usage') {
    await loadUsage();
    renderApp();
    showToast('用量已刷新');
    return;
  }

  if (action === 'semester') {
    state.semesterId = el.dataset.id;
    state.selectedKps = [];
    renderApp();
    return;
  }

  if (action === 'kp') {
    const id = el.dataset.id;
    const set = new Set(state.selectedKps);
    set.has(id) ? set.delete(id) : set.add(id);
    state.selectedKps = [...set];
    renderApp();
    return;
  }

  if (action === 'select-all') {
    const sem = currentSemester();
    if (!sem) return;
    state.selectedKps = sem.units.flatMap((u) => u.kps.map((k) => k.id));
    renderApp();
    return;
  }

  if (action === 'clear-kps') {
    state.selectedKps = [];
    renderApp();
    return;
  }

  if (action === 'count') {
    state.count = Number(el.dataset.count);
    renderApp();
    return;
  }

  if (action === 'mode') {
    state.mode = el.dataset.mode;
    renderApp();
    return;
  }

  if (action === 'start') {
    startPractice(state.selectedKps, state.mode);
    return;
  }

  if (action === 'option') {
    const q = state.session.questions[state.index];
    state.answers[q.id] = el.dataset.letter;
    renderApp();
    return;
  }

  if (action === 'prev') {
    if (state.index > 0) {
      state.index--;
      renderApp();
    }
    return;
  }

  if (action === 'next') {
    const q = state.session.questions[state.index];
    if (q.type !== 'choice' && !state.answers[q.id]?.trim()) {
      state.answers[q.id] = '';
    }
    if (state.index < state.session.questions.length - 1) {
      state.index++;
      renderApp();
    } else {
      submitExam();
    }
    return;
  }

  if (action === 'exit') {
    if (!window.confirm('退出后本次作答不会保存，确定退出吗？')) return;
    state.session = null;
    state.stage = 'setup';
    state.answers = {};
    renderApp();
    return;
  }

  if (action === 'retry-wrong') {
    const ids = [...new Set(state.result.items.filter((i) => !i.correct).map((i) => i.kpId))];
    startPractice(ids, 'reinforce');
    return;
  }

  if (action === 'new-round') {
    state.stage = 'setup';
    state.session = null;
    renderApp();
    return;
  }

  if (action === 'go-practice') {
    state.view = 'practice';
    state.stage = 'setup';
    renderApp();
    return;
  }

  if (action === 'wrong-filter') {
    state.wrong.status = el.dataset.status;
    await loadWrongbook();
    return;
  }

  if (action === 'toggle-mastered') {
    const id = Number(el.dataset.id);
    const next = el.dataset.status === 'mastered' ? 'new' : 'mastered';
    try {
      await api('/api/wrongbook/status', { method: 'POST', body: { questionId: id, status: next } });
      await Promise.all([loadOverview(), loadWrongbookById(currentFilterAfterChange())]);
      showToast(next === 'mastered' ? '已标记为掌握' : '已移回待复习');
    } catch (err) {
      showToast(err.message, 'error');
    }
    renderApp();
    return;
  }

  if (action === 'review-from-wrong') {
    const ids = [...new Set(state.wrong.items.map((w) => w.kpId))];
    startPractice(ids, 'reinforce');
    return;
  }

  if (action === 'run-analysis') {
    runAnalysis();
    return;
  }

  if (action === 'reinforce-weak') {
    const ids = (el.dataset.ids || '').split(',').filter(Boolean);
    startPractice(ids, 'reinforce');
    return;
  }

  if (action === 'preset') {
    const preset = state.config.presets.find((p) => p.id === el.dataset.id);
    if (!preset) return;
    const base = document.getElementById('cfg-baseurl');
    const model = document.getElementById('cfg-model');
    if (base) base.value = preset.baseUrl;
    if (model) model.value = preset.model;
    state.settingsDraft = {
      baseUrl: preset.baseUrl,
      model: preset.model,
      apiKey: state.settingsDraft?.apiKey || ''
    };
    document.querySelectorAll('.preset').forEach((p) => p.classList.toggle('on', p === el));
    return;
  }

  if (action === 'save-config') {
    const draft = {
      baseUrl: document.getElementById('cfg-baseurl').value.trim(),
      model: document.getElementById('cfg-model').value.trim(),
      apiKey: document.getElementById('cfg-apikey').value.trim()
    };
    state.settingsDraft = { ...draft, apiKey: '' };
    try {
      state.config = { ...(await api('/api/config', { method: 'POST', body: draft })), presets: state.config.presets };
      showToast('设置已保存');
      renderApp();
    } catch (err) {
      showToast(err.message, 'error');
    }
    return;
  }

  if (action === 'test-config') {
    showLoading('正在连接模型服务…');
    try {
      const result = await api('/api/config/test', { method: 'POST', body: {} });
      showToast(result.ok ? '连接成功，可以开始智能出题了' : '连接失败');
    } catch (err) {
      showToast(`连接失败：${err.message}`, 'error', 6000);
    } finally {
      hideLoading();
    }
    return;
  }
});

function currentFilterAfterChange() {
  return state.wrong.status;
}

async function loadWrongbookById(status) {
  try {
    const data = await api(`/api/wrongbook?status=${status}`);
    state.wrong.items = data.items;
    state.wrong.byKp = data.byKp || [];
  } catch { /* 忽略 */ }
}

app.addEventListener('input', (e) => {
  if (e.target.id === 'answer-input' && state.session) {
    const q = state.session.questions[state.index];
    state.answers[q.id] = e.target.value;
  }
});

app.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' || e.target.id !== 'answer-input') return;
  if (state.view !== 'practice' || state.stage !== 'exam') return;
  e.preventDefault();
  const btn = document.querySelector('[data-action="next"]');
  if (btn) btn.click();
});

/* ---------------- 启动 ---------------- */
async function init() {
  try {
    const [curriculum, config, usage] = await Promise.all([api('/api/curriculum'), api('/api/config'), api('/api/usage')]);
    state.curriculum = curriculum;
    state.config = config;
    state.usage = usage;
    state.subjectId = curriculum.subjects[0].id;
    state.semesterId = curriculum.subjects[0].semesters[0].id;
    await loadOverview();
  } catch (err) {
    app.innerHTML = `<section class="page"><div class="card empty"><h3>加载失败</h3><p>${esc(err.message)}</p><button class="btn primary" onclick="location.reload()">重新加载</button></div></section>`;
    return;
  }
  renderApp();
}

init();
