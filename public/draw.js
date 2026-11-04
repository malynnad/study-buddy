// 作图题渲染：SVG 方格纸 + 格点点击 + 只读回放
const PAD = 16;
const CELL = 34;

function mapPoint(figure, [x, y]) {
  const { w, h } = figure.grid;
  return [PAD + x * CELL, PAD + (h - y) * CELL];
}

function shape(points) {
  return points.map((p) => p.join(',')).join(' ');
}

function bgShape(bg) {
  if (!bg || !Array.isArray(bg.points) || bg.points.length < 2) return '';
  return shape(bg.points);
}

export function figureSVG(figure, points = [], options = {}) {
  if (!figure || figure.kind !== 'grid') return '';
  const grid = figure.grid || { w: 12, h: 8 };
  const w = Number(grid.w) || 12;
  const h = Number(grid.h) || 8;
  const width = w * CELL + PAD * 2;
  const height = h * CELL + PAD * 2;
  const readonly = !!options.readonly;

  const gridLines = [];
  for (let i = 0; i <= w; i++) {
    const x = PAD + i * CELL;
    gridLines.push(`<line class="grid-line" x1="${x}" y1="${PAD}" x2="${x}" y2="${PAD + h * CELL}" />`);
  }
  for (let j = 0; j <= h; j++) {
    const y = PAD + j * CELL;
    gridLines.push(`<line class="grid-line" x1="${PAD}" y1="${y}" x2="${PAD + w * CELL}" y2="${y}" />`);
  }

  const bg = figure.bg || {};
  const bgPoints = (bg.points || []).map((p) => mapPoint(figure, p));
  const bgPoly = bg.type === 'symmetry' || bg.type === 'translate'
    ? `<polygon class="figure-given" points="${shape(bgPoints)}" />`
    : '';

  const axis = bg.type === 'symmetry' && bg.axis
    ? bg.axis.dir === 'v'
      ? `<line class="figure-axis" x1="${PAD + bg.axis.at * CELL}" y1="${PAD}" x2="${PAD + bg.axis.at * CELL}" y2="${PAD + h * CELL}" />`
      : `<line class="figure-axis" x1="${PAD}" y1="${PAD + (h - bg.axis.at) * CELL}" x2="${PAD + w * CELL}" y2="${PAD + (h - bg.axis.at) * CELL}" />`
    : '';

  const studentPoints = (points || []).map((p) => mapPoint(figure, p));
  const studentShape = studentPoints.length >= 2
    ? `<polygon class="figure-student" points="${shape(studentPoints)}" />`
    : '';

  const answerPoints = (options.answerPoints || []).map((p) => mapPoint(figure, p));
  const answerShape = answerPoints.length >= 2
    ? `<polygon class="figure-answer" points="${shape(answerPoints)}" />`
    : '';

  const dots = readonly
    ? ''
    : Array.from({ length: h + 1 }, (_, j) =>
        Array.from({ length: w + 1 }, (_, i) => {
          const [cx, cy] = mapPoint(figure, [i, j]);
          return `<circle class="grid-hit" data-action="grid-point" data-x="${i}" data-y="${j}" cx="${cx}" cy="${cy}" r="9" />`;
        })
      );

  const vertices = studentPoints
    .map(([cx, cy]) => `<circle class="figure-dot" cx="${cx}" cy="${cy}" r="3" />`)
    .join('');

  return `<div class="figure-wrap">
    <svg class="figure-svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="方格纸作图区">
      ${gridLines.join('')}
      ${axis}
      ${bgPoly}
      ${answerShape}
      ${studentShape}
      ${vertices}
      ${dots}
    </svg>
    ${readonly ? '' : `<div class="figure-actions">
      <span class="figure-count">已选 ${points.length} 个顶点</span>
      <button class="btn ghost sm" data-action="figure-undo">撤销</button>
      <button class="btn ghost sm" data-action="figure-clear">清空</button>
    </div>`}
  </div>`;
}

export function parseFigurePoints(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
