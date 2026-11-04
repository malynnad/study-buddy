// 作图题几何判定：只比对几何不变量（点集、面积、对称、平移），不做像素比对
const EPS = 1e-6;

function parsePoints(raw) {
  let data = raw;
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(data) || data.length < 1) return null;
  const points = [];
  for (const item of data) {
    if (!Array.isArray(item) || item.length !== 2) return null;
    const x = Number(item[0]);
    const y = Number(item[1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    points.push([x, y]);
  }
  return points;
}

function pointsEqual(a, b, tol) {
  return Math.abs(a[0] - b[0]) <= tol + EPS && Math.abs(a[1] - b[1]) <= tol + EPS;
}

function samePointSet(a, b, tol = 0.5) {
  if (!a || !b || a.length !== b.length) return false;
  const used = new Array(b.length).fill(false);
  for (const p of a) {
    let hit = -1;
    for (let i = 0; i < b.length; i++) {
      if (!used[i] && pointsEqual(p, b[i], tol)) {
        hit = i;
        break;
      }
    }
    if (hit === -1) return false;
    used[hit] = true;
  }
  return true;
}

function polygonArea(points) {
  if (!points || points.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
}

function mirrorPoints(points, axis) {
  return points.map(([x, y]) => (axis.dir === 'v' ? [2 * axis.at - x, y] : [x, 2 * axis.at - y]));
}

function translatePoints(points, delta) {
  return points.map(([x, y]) => [x + delta[0], y + delta[1]]);
}

function inGrid(point, grid, tol = 0.5) {
  return point[0] >= -tol && point[1] >= -tol && point[0] <= grid.w + tol && point[1] <= grid.h + tol;
}

// 校验题目自带的图形与标准答案是否自洽（出题阶段用，防止模型给出错误答案）
export function validateFigure(figure, answerPoints) {
  if (!figure || figure.kind !== 'grid' || !figure.grid) return '图形规格缺失';
  const answer = parsePoints(answerPoints);
  if (!answer || answer.length < 3) return '标准答案顶点不足';
  const tol = Number(figure.tolerance) > 0 ? Number(figure.tolerance) : 0.5;
  const grid = { w: Number(figure.grid.w) || 0, h: Number(figure.grid.h) || 0 };
  if (grid.w < 4 || grid.h < 4) return '网格尺寸过小';
  for (const p of answer) if (!inGrid(p, grid, tol)) return '标准答案超出网格';

  const bg = figure.bg || { type: 'none' };
  if (bg.type === 'symmetry') {
    const base = parsePoints(bg.points);
    if (!base || !bg.axis) return '对称题缺少已知图形或对称轴';
    if (!samePointSet(mirrorPoints(base, bg.axis), answer, tol)) return '标准答案与已知图形不对称';
  }
  if (bg.type === 'translate') {
    const base = parsePoints(bg.points);
    if (!base || !Array.isArray(bg.delta)) return '平移题缺少原图或平移量';
    if (!samePointSet(translatePoints(base, bg.delta), answer, tol)) return '标准答案与平移量不符';
  }
  if (bg.type === 'target') {
    const want = Number(bg.area);
    if (!want) return '面积题缺少目标面积';
    if (Math.abs(polygonArea(answer) - want) > 0.05) return '标准答案面积与题目要求不符';
  }
  return '';
}

// 判分：返回 { correct, note }
export function judgeDraw(question, userAnswer) {
  const figure = question.figure || question.figure_spec;
  if (!figure || figure.kind !== 'grid') return { correct: false, note: '题目图形数据缺失' };
  const points = parsePoints(userAnswer);
  if (!points) return { correct: false, note: '作答格式无效' };
  if (points.length < 3) return { correct: false, note: '请至少画出 3 个顶点' };

  const tol = Number(figure.tolerance) > 0 ? Number(figure.tolerance) : 0.5;
  const grid = { w: Number(figure.grid?.w) || 0, h: Number(figure.grid?.h) || 0 };
  for (const p of points) if (!inGrid(p, grid, tol)) return { correct: false, note: '图形超出了方格纸范围' };

  const bg = figure.bg || { type: 'none' };
  if (bg.type === 'symmetry') {
    const base = parsePoints(bg.points) || [];
    if (samePointSet(mirrorPoints(points, bg.axis), base, tol)) return { correct: true, note: '' };
    return { correct: false, note: '补全后的图形与已知部分不对称' };
  }
  if (bg.type === 'translate') {
    const base = parsePoints(bg.points) || [];
    if (samePointSet(points, translatePoints(base, bg.delta), tol)) return { correct: true, note: '' };
    return { correct: false, note: '平移后的图形位置或形状不正确' };
  }
  if (bg.type === 'target') {
    const want = Number(bg.area);
    const got = polygonArea(points);
    if (Math.abs(got - want) <= 0.05) return { correct: true, note: '' };
    return { correct: false, note: `你画的图形面积是 ${got}，题目要求是 ${want}` };
  }

  const answerPoints = parsePoints(question.answer);
  if (!answerPoints) return { correct: false, note: '标准答案缺失' };
  return samePointSet(points, answerPoints, tol)
    ? { correct: true, note: '' }
    : { correct: false, note: '图形位置或形状与答案不一致' };
}

export { parsePoints, polygonArea, mirrorPoints, translatePoints, samePointSet };
