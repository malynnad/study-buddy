// 离线兜底题库：未配置大模型时，用参数化模板生成结构稳定的题目
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (arr) => arr[rnd(0, arr.length - 1)];
const num = (x) => {
  const r = Math.round(x * 1e6) / 1e6;
  return String(r);
};

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}
function frac(n, d) {
  const g = gcd(n, d);
  const nn = n / g;
  const dd = d / g;
  return dd === 1 ? String(nn) : `${nn}/${dd}`;
}

function mk(kp, q) {
  return {
    type: q.type || 'fill',
    stem: q.stem,
    options: q.options || null,
    answer: String(q.answer),
    solution: q.solution,
    figure: q.figure || null,
    kpId: kp.id,
    kpName: kp.name,
    difficulty: q.difficulty || 2,
    errorProne: q.errorProne || ''
  };
}

// —— 各单元题型模板 ——
const GENERATORS = {
  '5a-u1': (kp) => {
    const kind = kp.id.slice(-1);
    if (kind === '2') {
      const d = rnd(2, 9) / 10;
      const q = rnd(3, 12);
      const a = Math.round(d * q * 100) / 100;
      return mk(kp, {
        type: 'calc',
        stem: `计算：${num(a)} ÷ ${num(d)} =`,
        answer: num(q),
        solution: `把被除数和除数同时扩大到原来的 10 倍，变成 ${num(a * 10)} ÷ ${d * 10}，结果是 ${num(q)}。`,
        errorProne: '忘记把被除数和除数同时扩大相同的倍数'
      });
    }
    if (kind === '3') {
      const a = rnd(3, 9);
      const b = rnd(3, 9);
      return mk(kp, {
        type: 'word',
        stem: `一根 ${a} 米长的绳子平均分成 ${b} 段，每段长多少米？（结果保留两位小数）`,
        answer: num(parseFloat((a / b).toFixed(2))),
        solution: `${a} ÷ ${b} ≈ ${num(parseFloat((a / b).toFixed(3)))}（米），保留两位小数是 ${num(parseFloat((a / b).toFixed(2)))}。`,
        errorProne: '保留两位小数时要看第三位小数四舍五入'
      });
    }
    if (kind === '4') {
      const a = rnd(2, 8);
      const b = rnd(2, 9) / 10;
      const c = rnd(2, 6);
      const ans = a + b * c;
      return mk(kp, {
        type: 'calc',
        stem: `计算：${a} + ${num(b)} × ${c} =`,
        answer: num(ans),
        solution: `先算乘法 ${num(b)} × ${c} = ${num(b * c)}，再算加法 ${a} + ${num(b * c)} = ${num(ans)}。`,
        errorProne: '运算顺序错误，先算了加法'
      });
    }
    const b = rnd(2, 9);
    const q = rnd(12, 99) / 10;
    const a = num(b * q);
    return mk(kp, {
      type: 'calc',
      stem: `计算：${a} ÷ ${b} =`,
      answer: num(q),
      solution: `按整数除法计算：${num(b * q * 10)} + 0 除以 ${b}，商 ${num(q)}，商的小数点与被除数的小数点对齐。`,
      errorProne: '商的小数点位置写错'
    });
  },

  '5a-u2': (kp) => {
    if (kp.id.endsWith('1')) {
      const shape = pick(['长方形', '正方形', '等边三角形']);
      const axes = shape === '长方形' ? 2 : shape === '正方形' ? 4 : 3;
      return mk(kp, {
        type: 'fill',
        stem: `${shape}有几条对称轴？`,
        answer: String(axes),
        solution: `${shape}的对称轴把图形对折后两部分完全重合，一共可以找到 ${axes} 条。`,
        errorProne: '容易漏数斜方向的对称轴'
      });
    }
    const n = rnd(3, 7);
    return mk(kp, {
      type: 'fill',
      stem: `把一个图形向右平移 ${n} 格，图形的形状和大小（改变/不变），位置（改变/不变）。请在横线上依次填写。`,
      answer: '不变，改变',
      solution: '平移只改变图形的位置，不改变图形的形状和大小。',
      errorProne: '误以为平移会让图形变大'
    });
  },

  '5a-u3': (kp) => {
    if (kp.id.endsWith('1')) {
      const n = rnd(12, 48);
      let c = 0;
      for (let i = 1; i <= n; i++) if (n % i === 0) c++;
      return mk(kp, {
        type: 'fill',
        stem: `${n} 一共有多少个因数？`,
        answer: String(c),
        solution: `把因数成对列举出来，${n} 的因数共有 ${c} 个。`,
        errorProne: '成对列举时漏掉中间重复的那个因数'
      });
    }
    if (kp.id.endsWith('2')) {
      const digitSum = (x) => String(x).split('').reduce((s, d) => s + Number(d), 0);
      let list = [];
      let answer = 0;
      for (let tries = 0; tries < 30; tries++) {
        const base = rnd(3, 20) * 15;
        const candidates = [base, base + 2, base + 6, base + 9].sort(() => Math.random() - 0.5);
        if (candidates.filter((x) => x % 5 === 0 && digitSum(x) % 3 === 0).length === 1) {
          list = candidates;
          answer = base;
          break;
        }
      }
      if (!list.length) {
        list = [15, 32, 46, 59];
        answer = 15;
      }
      return mk(kp, {
        type: 'choice',
        stem: '下面各数中，既是 5 的倍数又是 3 的倍数的数是（　）。',
        options: list.map((x, i) => `${'ABCD'[i]}. ${x}`),
        answer: 'ABCD'[list.indexOf(answer)],
        solution: `5 的倍数看个位是 0 或 5，3 的倍数看各位数字之和能被 3 整除，只有 ${answer} 同时满足。`,
        errorProne: '只检查了 5 的倍数特征'
      });
    }
    if (kp.id.endsWith('3')) {
      const primes = [11, 13, 17, 19, 23, 29, 31];
      const p = pick(primes);
      const comp = p + 1;
      return mk(kp, {
        type: 'fill',
        stem: `${p} 是质数还是合数？${comp} 呢？（按顺序填写：质数/合数）`,
        answer: `质数，合数`,
        solution: `${p} 只有 1 和它本身两个因数，是质数；${comp} 除了 1 和本身还有别的因数，是合数。`,
        errorProne: '把 1 当成质数，或混淆质数与合数的判断标准'
      });
    }
    const odd1 = rnd(1, 9) * 2 + 1;
    const odd2 = rnd(1, 9) * 2 + 1;
    return mk(kp, {
      type: 'choice',
      stem: `奇数 ${odd1} 与奇数 ${odd2} 的和是（　）。`,
      options: ['A. 奇数', 'B. 偶数', 'C. 可能是奇数也可能是偶数', 'D. 无法确定'],
      answer: 'B',
      solution: `奇数 + 奇数 = 偶数，${odd1} + ${odd2} = ${odd1 + odd2}，是偶数。`,
      errorProne: '只算结果不总结规律'
    });
  },

  '5a-u4': (kp) => {
    if (kp.id.endsWith('1')) {
      const a = rnd(4, 15);
      const h = rnd(3, 9);
      return mk(kp, {
        type: 'calc',
        stem: `一个平行四边形的底是 ${a} 厘米，对应的高是 ${h} 厘米，它的面积是多少平方厘米？`,
        answer: num(a * h),
        solution: `平行四边形面积 = 底 × 高 = ${a} × ${h} = ${a * h}（平方厘米）。`,
        errorProne: '底和高不对应'
      });
    }
    if (kp.id.endsWith('2')) {
      const a = rnd(4, 16);
      const h = rnd(2, 8) * 2;
      return mk(kp, {
        type: 'calc',
        stem: `一个三角形的底是 ${a} 厘米，高是 ${h} 厘米，它的面积是多少平方厘米？`,
        answer: num(a * h / 2),
        solution: `三角形面积 = 底 × 高 ÷ 2 = ${a} × ${h} ÷ 2 = ${a * h / 2}（平方厘米）。`,
        errorProne: '忘记除以 2'
      });
    }
    const up = rnd(3, 8);
    const low = up + rnd(2, 7);
    const h = rnd(2, 6) * 2;
    return mk(kp, {
      type: 'calc',
      stem: `一个梯形的上底是 ${up} 厘米，下底是 ${low} 厘米，高是 ${h} 厘米，面积是多少平方厘米？`,
      answer: num((up + low) * h / 2),
      solution: `梯形面积 = (上底 + 下底) × 高 ÷ 2 = (${up} + ${low}) × ${h} ÷ 2 = ${(up + low) * h / 2}（平方厘米）。`,
      errorProne: '漏乘 2 或漏加上底'
    });
  },

  '5a-u5': (kp) => {
    if (kp.id.endsWith('1')) {
      const d = rnd(2, 6);
      const n = d * rnd(1, 4) + rnd(1, d - 1);
      const whole = Math.floor(n / d);
      return mk(kp, {
        type: 'fill',
        stem: `把假分数 ${n}/${d} 化成带分数。`,
        answer: `${whole}又${frac(n % d, d)}`,
        solution: `${n} ÷ ${d} = ${whole} 余 ${n % d}，所以 ${n}/${d} = ${whole}又${frac(n % d, d)}。`,
        errorProne: '整数部分与分数部分混淆'
      });
    }
    if (kp.id.endsWith('2')) {
      const a = rnd(2, 9);
      const b = rnd(a + 2, 15);
      return mk(kp, {
        type: 'fill',
        stem: `把 ${a} 米长的彩带平均剪成 ${b} 段，每段占全长的几分之几？每段长多少米？`,
        answer: `1/${b}，${frac(a, b)}`,
        solution: `每段占全长的 1/${b}；每段长 ${a} ÷ ${b} = ${frac(a, b)}（米）。`,
        errorProne: '混淆"占全长的几分之几"和"具体长度"'
      });
    }
    if (kp.id.endsWith('3')) {
      const g = rnd(2, 6);
      const n1 = rnd(2, 8) * g;
      const d1 = rnd(3, 9) * g;
      return mk(kp, {
        type: 'calc',
        stem: `把 ${n1}/${d1} 约成最简分数。`,
        answer: frac(n1, d1),
        solution: `分子分母同时除以它们的最大公因数 ${gcd(n1, d1)}，得到 ${frac(n1, d1)}。`,
        errorProne: '没有约到最简'
      });
    }
    if (kp.id.endsWith('4')) {
      const a = rnd(2, 9);
      const b = rnd(2, 9);
      return mk(kp, {
        type: 'fill',
        stem: `${a * b} 和 ${a * (b + 1)} 的最大公因数是多少？`,
        answer: num(gcd(a * b, a * (b + 1))),
        solution: `用列举法或短除法：它们的公因数有 1、${gcd(a * b, a * (b + 1))}…最大的是 ${gcd(a * b, a * (b + 1))}。`,
        errorProne: '把最小公倍数当成最大公因数'
      });
    }
    let d1 = rnd(3, 8);
    let d2 = rnd(3, 8);
    let n1 = rnd(1, d1 - 1);
    let n2 = rnd(1, d2 - 1);
    for (let tries = 0; tries < 30 && Math.abs(n1 / d1 - n2 / d2) < 1e-9; tries++) {
      d1 = rnd(3, 8);
      d2 = rnd(3, 8);
      n1 = rnd(1, d1 - 1);
      n2 = rnd(1, d2 - 1);
    }
    const first = n1 / d1 > n2 / d2;
    return mk(kp, {
      type: 'choice',
      stem: `比较 ${n1}/${d1} 和 ${n2}/${d2} 的大小，较大的是（　）。`,
      options: [`A. ${n1}/${d1}`, `B. ${n2}/${d2}`, 'C. 一样大', 'D. 无法比较'],
      answer: first ? 'A' : 'B',
      solution: `先通分：${n1}/${d1} = ${n1 * d2}/${d1 * d2}，${n2}/${d2} = ${n2 * d1}/${d1 * d2}，比较分子即可。`,
      errorProne: '直接比较分母大小'
    });
  },

  '5a-u6': (kp) => {
    if (kp.id.endsWith('2')) {
      const a = rnd(2, 9);
      return mk(kp, {
        type: 'fill',
        stem: `${a} 公顷 = 多少平方米？`,
        answer: num(a * 10000),
        solution: `1 公顷 = 10000 平方米，${a} 公顷 = ${a * 10000} 平方米。`,
        errorProne: '公顷与平方米的进率记成 100'
      });
    }
    const w1 = rnd(4, 9);
    const h1 = rnd(3, 7);
    const w2 = rnd(2, 5);
    const h2 = rnd(2, 5);
    const ans = w1 * h1 + w2 * h2;
    return mk(kp, {
      type: 'word',
      stem: `学校宣传栏由一个长 ${w1} 分米、宽 ${h1} 分米的长方形和一个长 ${w2} 分米、宽 ${h2} 分米的长方形拼成，总面积是多少平方分米？`,
      answer: num(ans),
      solution: `用分割法：${w1} × ${h1} + ${w2} × ${h2} = ${ans}（平方分米）。`,
      errorProne: '分割后漏算其中一块，或把边长相加'
    });
  },

  '5a-u7': (kp) => {
    const red = rnd(2, 6);
    const blue = rnd(2, 6);
    return mk(kp, {
      type: 'fill',
      stem: `盒子里有 ${red} 个红球和 ${blue} 个蓝球，任意摸出一个，摸到红球的可能性是几分之几？`,
      answer: frac(red, red + blue),
      solution: `一共有 ${red + blue} 个球，红球 ${red} 个，摸到红球的可能性是 ${red}/${red + blue} = ${frac(red, red + blue)}。`,
      errorProne: '把球的总数算错，或忘记约分'
    });
  },

  '5b-u1': (kp) => {
    const d1 = rnd(2, 9);
    let d2 = rnd(2, 9);
    while (d2 === d1) d2 = rnd(2, 9);
    const n1 = rnd(1, d1 - 1);
    const n2 = rnd(1, d2 - 1);
    const l = d1 * d2 / gcd(d1, d2);
    const sum = n1 * (l / d1) + n2 * (l / d2);
    return mk(kp, {
      type: 'calc',
      stem: `计算：${n1}/${d1} + ${n2}/${d2} =`,
      answer: frac(sum, l),
      solution: `通分，公分母取 ${l}：${n1}/${d1} = ${n1 * (l / d1)}/${l}，${n2}/${d2} = ${n2 * (l / d2)}/${l}，相加得 ${sum}/${l} = ${frac(sum, l)}。`,
      errorProne: '分子分母同时相加，或没有约分'
    });
  },

  '5b-u2': (kp) => {
    const a = rnd(3, 10);
    const b = rnd(2, 8);
    const c = rnd(2, 6);
    if (kp.id.endsWith('1')) {
      return mk(kp, {
        type: 'fill',
        stem: `一个长方体长 ${a} 厘米、宽 ${b} 厘米、高 ${c} 厘米，它的棱长总和是多少厘米？`,
        answer: num(4 * (a + b + c)),
        solution: `长方体有 4 组相同的长、宽、高，棱长总和 = (${a} + ${b} + ${c}) × 4 = ${4 * (a + b + c)}（厘米）。`,
        errorProne: '漏乘 4 或只算一组'
      });
    }
    return mk(kp, {
      type: 'word',
      stem: `做一个长 ${a} 分米、宽 ${b} 分米、高 ${c} 分米的长方体纸盒（无盖），至少需要多少平方分米纸板？`,
      answer: num(a * b + 2 * (a * c) + 2 * (b * c)),
      solution: `无盖纸盒只有 1 个底面：${a} × ${b} + (${a} × ${c} + ${b} × ${c}) × 2 = ${a * b + 2 * a * c + 2 * b * c}（平方分米）。`,
      errorProne: '无盖时仍然算了两个底面'
    });
  },

  '5b-u3': (kp) => {
    if (kp.id.endsWith('2')) {
      const n = rnd(2, 9);
      const d = rnd(n + 1, 12);
      return mk(kp, {
        type: 'fill',
        stem: `${n}/${d} 的倒数是多少？`,
        answer: frac(d, n),
        solution: `把分子分母交换位置，${n}/${d} 的倒数是 ${d}/${n}${d % n === 0 ? ` = ${d / n}` : ''}。`,
        errorProne: '整数忘记写成分母是 1 的分数'
      });
    }
    const a = rnd(1, 5);
    const b = rnd(a + 1, 9);
    const k = rnd(2, 6);
    return mk(kp, {
      type: 'calc',
      stem: `计算：${a}/${b} × ${k} =`,
      answer: frac(a * k, b),
      solution: `分数乘整数，用分子乘整数作分子：${a} × ${k} = ${a * k}，结果 ${a * k}/${b} = ${frac(a * k, b)}。`,
      errorProne: '把分母也乘了整数，或忘记约分'
    });
  },

  '5b-u4': (kp) => {
    const a = rnd(3, 9);
    const b = rnd(2, 8);
    const c = rnd(2, 6);
    if (kp.id.endsWith('2')) {
      const ans = a * b * c;
      return mk(kp, {
        type: 'calc',
        stem: `一个长方体长 ${a} 厘米、宽 ${b} 厘米、高 ${c} 厘米，体积是多少立方厘米？`,
        answer: num(ans),
        solution: `长方体体积 = 长 × 宽 × 高 = ${a} × ${b} × ${c} = ${ans}（立方厘米）。`,
        errorProne: '把体积与表面积公式混淆'
      });
    }
    if (kp.id.endsWith('3')) {
      const v = rnd(2, 9);
      return mk(kp, {
        type: 'fill',
        stem: `${v} 立方分米 = 多少立方厘米？`,
        answer: num(v * 1000),
        solution: `1 立方分米 = 1000 立方厘米，${v} 立方分米 = ${v * 1000} 立方厘米。`,
        errorProne: '体积单位进率记成 100'
      });
    }
    return mk(kp, {
      type: 'choice',
      stem: '一个水杯的容积大约是（　）。',
      options: ['A. 300 毫升', 'B. 300 升', 'C. 3 立方米', 'D. 30 立方分米'],
      answer: 'A',
      solution: '水杯容量在几百毫升左右，选 A。',
      errorProne: '对体积单位大小没有感知'
    });
  },

  '5b-u5': (kp) => {
    if (kp.id.endsWith('2')) {
      const total = rnd(2, 6) * 8;
      const d = rnd(2, 4);
      const part = total * d / 8;
      return mk(kp, {
        type: 'word',
        stem: `一袋面粉用去了 ${d}/8，正好用去 ${num(part)} 千克。这袋面粉原来有多少千克？`,
        answer: num(total),
        solution: `用去的 ${d}/8 对应 ${num(part)} 千克，原来有 ${num(part)} ÷ ${d}/8 = ${num(part)} × 8/${d} = ${total}（千克）。`,
        errorProne: '用乘法而不是除法'
      });
    }
    const a = rnd(1, 5);
    const b = rnd(a + 1, 9);
    const c = rnd(2, 6);
    const d = rnd(c + 1, 12);
    return mk(kp, {
      type: 'calc',
      stem: `计算：${a}/${b} ÷ ${c}/${d} =`,
      answer: frac(a * d, b * c),
      solution: `除以一个数等于乘它的倒数：${a}/${b} × ${d}/${c} = ${a * d}/${b * c} = ${frac(a * d, b * c)}。`,
      errorProne: '只把被除数取倒数，或忘记约分'
    });
  },

  '5b-u6': (kp) => {
    if (kp.id.endsWith('2')) {
      const dir = pick(['东', '南', '西', '北']);
      const opp = { 东: '西', 南: '北', 西: '东', 北: '南' }[dir];
      const m = rnd(2, 6) * 100;
      return mk(kp, {
        type: 'fill',
        stem: `小明从学校向${dir}走 ${m} 米到家。从家原路返回学校，应向哪个方向走？走多少米？`,
        answer: `${opp}，${m}米`,
        solution: `方向相反、距离不变：向${opp}走 ${m} 米。`,
        errorProne: '方向说反或距离写错'
      });
    }
    const angle = pick([30, 45, 60]);
    return mk(kp, {
      type: 'choice',
      stem: `图书馆在学校北偏东 ${angle}°方向，那么学校在图书馆的（　）方向。`,
      options: ['A. 北偏东 ' + angle + '°', 'B. 南偏西 ' + angle + '°', 'C. 南偏东 ' + angle + '°', 'D. 北偏西 ' + angle + '°'],
      answer: 'B',
      solution: '两个位置互为观测点，方向完全相反：北偏东反过来是南偏西，角度不变，选 B。',
      errorProne: '只改南北不改东西，或角度也改'
    });
  },

  '5b-u7': (kp) => {
    if (kp.id.endsWith('2')) {
      const v1 = rnd(30, 60);
      const v2 = rnd(20, 50);
      const t = rnd(2, 5);
      return mk(kp, {
        type: 'word',
        stem: `甲车每小时行 ${v1} 千米，乙车每小时行 ${v2} 千米，两车从两地同时出发相向而行，${t} 小时后相遇。两地相距多少千米？`,
        answer: num((v1 + v2) * t),
        solution: `路程 = 速度和 × 相遇时间 = (${v1} + ${v2}) × ${t} = ${(v1 + v2) * t}（千米）。`,
        errorProne: '只算一辆车的路程'
      });
    }
    const k = rnd(2, 5);
    const add = rnd(3, 12);
    const result = k * rnd(2, 9) + add;
    const x = (result - add) / k;
    return mk(kp, {
      type: 'fill',
      stem: `一个数的 ${k} 倍加上 ${add} 等于 ${result}，这个数是多少？`,
      answer: num(x),
      solution: `设这个数是 x，列方程 ${k}x + ${add} = ${result}，${k}x = ${result - add}，x = ${num(x)}。`,
      errorProne: '列方程时等量关系找错'
    });
  },

  '5b-u8': (kp) => {
    if (kp.id.endsWith('2')) {
      const avg = rnd(70, 95);
      const n = 5;
      const part = rnd(60, 90);
      const total = avg * n;
      const rest = total - part;
      return mk(kp, {
        type: 'word',
        stem: `小明 5 次跳绳的平均成绩是 ${avg} 下，前 4 次一共跳了 ${rest} 下，第 5 次跳了多少下？`,
        answer: num(total - rest),
        solution: `5 次总成绩 = 平均数 × 次数 = ${avg} × 5 = ${total}，第 5 次 = ${total} - ${rest} = ${total - rest}（下）。`,
        errorProne: '忘记用平均数乘总次数'
      });
    }
    const a = rnd(80, 120);
    const b = rnd(60, 100);
    return mk(kp, {
      type: 'fill',
      stem: `某商店上周 A 商品销售 ${a} 件，B 商品销售 ${b} 件。要比较两种商品的销售趋势，应该选择复式（条形/折线）统计图？`,
      answer: '折线',
      solution: '要看出数量变化趋势，选择复式折线统计图；只比较数量多少时用复式条形统计图。',
      errorProne: '混淆两种统计图的适用场景'
    });
  }
};

// —— 北师大版五上（新版）章节的离线兜底题 ——

function decimalAddSub(kp) {
  const kind = kp.id.slice(-1);
  if (kind === '1') {
    const n = rnd(5, 95);
    return mk(kp, {
      type: 'fill',
      stem: `${n} 个 0.01 组成的数是多少？`,
      answer: num(n / 100),
      solution: `0.01 是百分之一，${n} 个 0.01 就是 ${n}/100，写作 ${num(n / 100)}。`,
      errorProne: '小数点位置写错'
    });
  }
  if (kind === '2') {
    const useProperty = Math.random() < 0.5;
    if (useProperty) {
      return choice(kp, {
        stem: '0.5 和 0.50 的大小相等吗？',
        correct: '相等',
        wrongs: ['不相等', '0.5 大', '0.50 大'],
        solution: '小数的末尾添上 0 或去掉 0，小数的大小不变，所以 0.5 = 0.50。',
        errorProne: '误以为小数位数多的数更大'
      });
    }
    let a = rnd(120, 980) / 100;
    let b = rnd(120, 980) / 100;
    while (Math.abs(a - b) < 1e-9) b = rnd(120, 980) / 100;
    const bigger = Math.max(a, b);
    return mk(kp, {
      type: 'fill',
      stem: `比较 ${num(a)} 和 ${num(b)} 的大小，较大的数是（　）。`,
      answer: num(bigger),
      solution: `先比较整数部分，整数部分相同再比较十分位、百分位，较大的是 ${num(bigger)}。`,
      errorProne: '误以为小数位数多的数更大'
    });
  }
  if (kind === '3') {
    const useMove = Math.random() < 0.5;
    if (useMove) {
      const a = rnd(12, 85) / 10;
      return mk(kp, {
        type: 'fill',
        stem: `把 ${num(a)} 的小数点向右移动两位，得到的数是多少？`,
        answer: num(a * 100),
        solution: `小数点向右移动两位，小数扩大到原来的 100 倍，${num(a)} × 100 = ${num(a * 100)}。`,
        errorProne: '左右方向搞反，或移动位数记错'
      });
    }
    const meters = rnd(2, 9);
    const decim = rnd(1, 9) / 10;
    const m = meters + decim;
    return mk(kp, {
      type: 'fill',
      stem: `${num(m)} 米 = 多少厘米？`,
      answer: num(Math.round(m * 100)),
      solution: `1 米 = 100 厘米，把小数点向右移动两位，${num(m)} 米 = ${Math.round(m * 100)} 厘米。`,
      errorProne: '单位之间的进率记错'
    });
  }
  if (kind === '4') {
    const a = rnd(120, 980) / 100;
    const b = rnd(20, 500) / 100;
    if (Math.random() < 0.5) {
      return mk(kp, {
        type: 'calc',
        stem: `计算：${num(a)} + ${num(b)} =`,
        answer: num(a + b),
        solution: `小数点对齐，按整数加法计算，结果是 ${num(a + b)}。`,
        errorProne: '小数点没有对齐'
      });
    }
    const bigger = Math.max(a, b);
    const smaller = Math.min(a, b);
    return mk(kp, {
      type: 'calc',
      stem: `计算：${num(bigger)} - ${num(smaller)} =`,
      answer: num(bigger - smaller),
      solution: `小数点对齐，被减数小数位数不够时补 0，结果是 ${num(bigger - smaller)}。`,
      errorProne: '小数点没有对齐，或退位出错'
    });
  }
  if (kind === '5') {
    const a = rnd(300, 900) / 100;
    const b = rnd(100, 400) / 100;
    const c = rnd(50, 250) / 100;
    return mk(kp, {
      type: 'calc',
      stem: `计算：${num(a)} + ${num(b)} - ${num(c)} =`,
      answer: num(a + b - c),
      solution: `按从左到右的顺序计算：${num(a)} + ${num(b)} = ${num(a + b)}，再减 ${num(c)} 得 ${num(a + b - c)}。`,
      errorProne: '运算顺序错误'
    });
  }
  const dividend = rnd(21, 99);
  let divisor = rnd(2, 9);
  while (dividend % divisor === 0) divisor = rnd(2, 9);
  return mk(kp, {
    type: 'calc',
    stem: `计算：${dividend} ÷ ${divisor} =`,
    answer: num(dividend / divisor),
    solution: `整数除法有余数时，在余数后补 0 继续除，商的小数点与被除数对齐，${dividend} ÷ ${divisor} = ${num(dividend / divisor)}。`,
    errorProne: '余数后忘记补 0，或商的小数点位置写错'
  });
}

function triangleQuestion(kp) {
  const kind = kp.id.slice(-1);
  if (kind === '1') {
    const a = rnd(3, 7);
    const b = rnd(3, 7);
    return mk(kp, {
      type: 'fill',
      stem: `三角形两边的长分别是 ${a} 厘米和 ${b} 厘米，第三边的长必须小于多少厘米？`,
      answer: num(a + b),
      solution: `三角形任意两边之和大于第三边，所以第三边要小于 ${a} + ${b} = ${a + b}（厘米）。`,
      errorProne: '把两边之和当成第三边的最大值时忘记“小于”'
    });
  }
  if (kind === '2') {
    return mk(kp, {
      type: 'fill',
      stem: '一个三角形可以画多少条高？',
      answer: '3',
      solution: '三角形有三个顶点，每个顶点对应一条高，所以一共可以画 3 条高。',
      errorProne: '只画了一条高'
    });
  }
  if (kind === '3') {
    const pairs = [
      [40, 60],
      [30, 40],
      [45, 45]
    ];
    const [a, b] = pick(pairs);
    const third = 180 - a - b;
    const type = third === 90 ? '直角' : third > 90 ? '钝角' : '锐角';
    return mk(kp, {
      type: 'choice',
      stem: `一个三角形中有两个角分别是 ${a}° 和 ${b}°，这个三角形是（　）。`,
      options: ['A. 锐角三角形', 'B. 直角三角形', 'C. 钝角三角形', 'D. 无法确定'],
      answer: type === '锐角' ? 'A' : type === '直角' ? 'B' : 'C',
      solution: `第三个角是 180° - ${a}° - ${b}° = ${third}°，所以是${type}三角形。`,
      errorProne: '忘记先求第三个角'
    });
  }
  if (kind === '4') {
    const a = rnd(30, 80);
    const b = rnd(30, 80);
    return mk(kp, {
      type: 'fill',
      stem: `三角形中两个角分别是 ${a}° 和 ${b}°，第三个角是多少度？`,
      answer: num(180 - a - b),
      solution: `三角形内角和是 180°，第三个角是 180° - ${a}° - ${b}° = ${180 - a - b}°。`,
      errorProne: '内角和记错'
    });
  }
  const n = pick([4, 5, 6, 7, 8]);
  return mk(kp, {
    type: 'fill',
    stem: `${n} 边形的内角和是多少度？`,
    answer: num(180 * (n - 2)),
    solution: `n 边形的内角和 = 180° × (n − 2)，${n} 边形的内角和是 180° × ${n - 2} = ${180 * (n - 2)}°。`,
    errorProne: '公式记错，忘记减 2'
  });
}

function decimalMul(kp) {
  const kind = kp.id.slice(-1);
  if (kind === '1') {
    const a = rnd(11, 99) / 10;
    const n = rnd(2, 9);
    return mk(kp, {
      type: 'calc',
      stem: `计算：${num(a)} × ${n} =`,
      answer: num(a * n),
      solution: `先按 ${Math.round(a * 10)} × ${n} 计算，再点上一位小数，结果是 ${num(a * n)}。`,
      errorProne: '积的小数位数点错'
    });
  }
  if (kind === '2') {
    const a = rnd(11, 99) / 10;
    const b = rnd(11, 99) / 10;
    return mk(kp, {
      type: 'calc',
      stem: `计算：${num(a)} × ${num(b)} =`,
      answer: num(a * b),
      solution: `先按整数乘法计算，两个因数一共有两位小数，积也有两位小数，结果是 ${num(a * b)}。`,
      errorProne: '积的小数位数判断错误'
    });
  }
  if (kind === '3') {
    const useRelation = Math.random() < 0.5;
    if (useRelation) {
      const a = rnd(11, 99) / 10;
      const factor = Math.random() < 0.5 ? rnd(2, 9) : rnd(1, 9) / 10;
      const bigger = factor > 1;
      return choice(kp, {
        stem: `${num(a)} × ${num(factor)} 的积与 ${num(a)} 相比，（　）。`,
        correct: bigger ? '积比原数大' : '积比原数小',
        wrongs: bigger ? ['积比原数小', '积与原数相等', '无法比较'] : ['积比原数大', '积与原数相等', '无法比较'],
        solution: `一个数（0 除外）乘大于 1 的数，积比原数大；乘小于 1 的数，积比原数小。${num(factor)} ${bigger ? '大于' : '小于'} 1，所以积比原数${bigger ? '大' : '小'}。`,
        errorProne: '没有观察乘数与 1 的大小关系'
      });
    }
    const a = rnd(11, 99) / 10;
    const b = rnd(11, 99) / 10;
    const product = Math.round(a * b * 10) / 10;
    return mk(kp, {
      type: 'calc',
      stem: `计算：${num(a)} × ${num(b)} ≈（结果保留一位小数）`,
      answer: num(product),
      solution: `${num(a)} × ${num(b)} = ${num(a * b)}，保留一位小数是 ${num(product)}。`,
      errorProne: '保留一位小数时看错数位'
    });
  }
  const a = rnd(11, 49) / 10;
  const b = rnd(2, 6);
  const c = rnd(11, 49) / 10;
  return mk(kp, {
    type: 'calc',
    stem: `计算：${num(a)} × ${b} + ${num(c)} =`,
    answer: num(a * b + c),
    solution: `先算乘法 ${num(a)} × ${b} = ${num(a * b)}，再加上 ${num(c)}，得 ${num(a * b + c)}。`,
    errorProne: '先算了加法'
  });
}

function choice(kp, { stem, correct, wrongs, solution, errorProne }) {
  const opts = [correct, ...wrongs].sort(() => Math.random() - 0.5);
  return mk(kp, {
    type: 'choice',
    stem,
    options: opts.map((t, i) => `${'ABCD'[i]}. ${t}`),
    answer: 'ABCD'[opts.indexOf(correct)],
    solution,
    errorProne
  });
}

function letterAlgebra(kp) {
  const kind = kp.id.slice(-1);
  if (kind === '1') {
    const a = rnd(2, 9);
    const v = pick(['a', 'x', 'n', 'm']);
    return choice(kp, {
      stem: `一个数 ${v} 乘 ${a}，用字母表示的式子是哪一项？`,
      correct: `${a}${v}`,
      wrongs: [`${v}+${a}`, `${v}÷${a}`, `${a}+${v}`],
      solution: `数字与字母相乘时，乘号可以省略，数字写在字母前面，所以是 ${a}${v}。`,
      errorProne: '把乘法写成加法'
    });
  }
  if (kind === '2') {
    const useLaw = Math.random() < 0.5;
    if (useLaw) {
      return choice(kp, {
        stem: '乘法分配律用字母表示是（　）。',
        correct: '(a+b)×c=a×c+b×c',
        wrongs: ['a×b=b×a', '(a×b)×c=a×(b×c)', 'a+b=b+a'],
        solution: '乘法分配律：两个数的和乘一个数，等于这两个数分别乘这个数再相加，即 (a+b)×c=a×c+b×c。',
        errorProne: '把乘法分配律和交换律、结合律混淆'
      });
    }
    const v = pick(['a', 'x', 'n']);
    return choice(kp, {
      stem: `正方形的边长是 ${v}，它的面积用字母表示是（　）。`,
      correct: `${v}²`,
      wrongs: [`2${v}`, `4${v}`, `${v}+${v}`],
      solution: `正方形面积 = 边长 × 边长，即 ${v} × ${v}，写作 ${v}²。`,
      errorProne: '把面积和周长公式混淆，或把 a² 写成 2a'
    });
  }
  if (kind === '3') {
    const first = rnd(5, 9);
    const inc = rnd(3, 6);
    const n = rnd(2, 5);
    const formula = `${inc}n+${first - inc}`;
    return mk(kp, {
      type: 'fill',
      stem: `摆 1 个图形需要 ${first} 根小棒，摆 2 个需要 ${first + inc} 根，摆 3 个需要 ${first + 2 * inc} 根……照这样，摆 n 个图形需要多少根小棒？（用含 n 的式子表示）`,
      answer: formula,
      solution: `每增加 1 个图形增加 ${inc} 根小棒，摆 n 个图形需要 ${first} + (n-1)×${inc} = ${formula} 根小棒。`,
      errorProne: '没有找到每次增加的数量，或首项与通项的关系搞错'
    });
  }
  if (kind === '4') {
    const x = rnd(3, 9);
    const k = rnd(2, 5);
    const b = rnd(1, 9);
    return mk(kp, {
      type: 'calc',
      stem: `当 x=${x} 时，${k}x+${b} 的值是多少？`,
      answer: num(k * x + b),
      solution: `把 x=${x} 代入：${k}×${x}+${b} = ${k * x}+${b} = ${k * x + b}。`,
      errorProne: '代入后运算顺序错误'
    });
  }
  const add = rnd(2, 9);
  return choice(kp, {
    stem: `等式 x = 10 的两边都加上 ${add}，所得结果仍然是等式吗？如果是，新的等式是（　）。`,
    correct: `x+${add}=${10 + add}`,
    wrongs: [`x=${10 + add}`, `x+${add}=10`, `x=${add}`],
    solution: `等式两边都加上同一个数，等式仍然成立。两边都加 ${add}，得 x+${add}=${10 + add}。`,
    errorProne: '只在一边加，或忘记等式两边要同时变化'
  });
}

function probabilityQuestion(kp) {
  if (kp.id.endsWith('2')) {
    const red = rnd(2, 6);
    const fair = Math.random() < 0.5;
    const blue = fair ? red : red + rnd(1, 4);
    return choice(kp, {
      stem: `袋子里有 ${red} 个红球和 ${blue} 个蓝球，任意摸出一个，摸到红球和蓝球的可能性${fair ? '相等' : '不相等'}。这个游戏规则公平吗？`,
      correct: fair ? '公平' : '不公平',
      wrongs: fair ? ['不公平', '无法确定', '红球一定赢'] : ['公平', '无法确定', '蓝球一定赢'],
      solution: fair
        ? `红球和蓝球的数量相同，摸到的可能性都是 1/2，所以游戏规则公平。`
        : `红球 ${red} 个、蓝球 ${blue} 个，数量不同，摸到的可能性不相等，所以游戏规则不公平。`,
      errorProne: '只看球的总数，没有比较两种球的数量'
    });
  }
  const red = rnd(2, 6);
  const blue = rnd(2, 6);
  return mk(kp, {
    type: 'fill',
    stem: `盒子里有 ${red} 个红球和 ${blue} 个蓝球，任意摸出一个，摸到红球的可能性是几分之几？`,
    answer: frac(red, red + blue),
    solution: `一共有 ${red + blue} 个球，红球 ${red} 个，摸到红球的可能性是 ${red}/${red + blue} = ${frac(red, red + blue)}。`,
    errorProne: '把球的总数算错，或忘记约分'
  });
}

function designQuestion(kp) {
  const mode = rnd(1, 3);
  if (mode === 1) {
    return choice(kp, {
      stem: '把一个图形沿一条直线对折，直线两旁的部分能完全重合，这样的图形叫做（　）图形。',
      correct: '轴对称',
      wrongs: ['平移', '旋转', '放大'],
      solution: '沿一条直线对折后两边完全重合的图形是轴对称图形，这条直线就是对称轴。',
      errorProne: '与平移混淆'
    });
  }
  if (mode === 2) {
    const shape = pick(['正方形', '长方形', '等边三角形']);
    const axes = shape === '正方形' ? 4 : shape === '长方形' ? 2 : 3;
    return mk(kp, {
      type: 'fill',
      stem: `${shape}有几条对称轴？`,
      answer: String(axes),
      solution: `${shape}沿不同方向的直线对折都能完全重合，一共可以找到 ${axes} 条对称轴。`,
      errorProne: '容易漏数斜方向的对称轴'
    });
  }
  const n = rnd(2, 8);
  return choice(kp, {
    stem: `设计图案时，把一个图形沿直线方向移动 ${n} 格，这种方法叫做（　）。`,
    correct: '平移',
    wrongs: ['轴对称', '旋转', '放大'],
    solution: `沿直线方向移动若干格、形状和大小都不变，这种变换叫做平移。`,
    errorProne: '把平移和轴对称混淆'
  });
}

function chickenRabbit(kp) {
  const chickens = rnd(4, 12);
  const rabbits = rnd(3, 10);
  const heads = chickens + rabbits;
  const legs = chickens * 2 + rabbits * 4;
  return mk(kp, {
    type: 'word',
    stem: `笼子里有鸡和兔共 ${heads} 只，一共有 ${legs} 条腿。鸡有多少只？`,
    answer: num(chickens),
    solution: `假设全是鸡，共有 ${heads * 2} 条腿，比实际少 ${legs - heads * 2} 条。每把一只鸡换成兔多 2 条腿，所以兔有 ${(legs - heads * 2) / 2} 只，鸡有 ${heads} - ${(legs - heads * 2) / 2} = ${chickens} 只。`,
    errorProne: '假设后忘记按腿数差调整'
  });
}

function areaEstimate(kp) {
  const n = rnd(5, 20) * 5;
  return mk(kp, {
    type: 'fill',
    stem: `每片落叶的面积约 20 平方厘米，${n} 片落叶的面积约是多少平方分米？`,
    answer: num(n / 5),
    solution: `20 × ${n} = ${20 * n}（平方厘米），${20 * n} 平方厘米 = ${n / 5} 平方分米。`,
    errorProne: '平方厘米与平方分米的进率记错'
  });
}

// 多边形的面积：5 个知识点
function areaQuestion(kp) {
  const kind = kp.id.slice(-1);
  if (kind === '1') {
    return choice(kp, {
      stem: '一个平行四边形可以画多少条高？',
      correct: '无数条',
      wrongs: ['1 条', '2 条', '4 条'],
      solution: '平行四边形的高是从对边任意一点向底边画的垂直线段，对边上有无数个点，所以可以画无数条高。',
      errorProne: '误以为高只有一条'
    });
  }
  if (kind === '2') {
    const a = rnd(4, 15);
    const h = rnd(3, 9);
    return mk(kp, {
      type: 'calc',
      stem: `一个平行四边形的底是 ${a} 厘米，对应的高是 ${h} 厘米，它的面积是多少平方厘米？`,
      answer: num(a * h),
      solution: `平行四边形面积 = 底 × 高 = ${a} × ${h} = ${a * h}（平方厘米）。`,
      errorProne: '底和高不对应'
    });
  }
  if (kind === '3') {
    const a = rnd(4, 16);
    const h = rnd(2, 8) * 2;
    return mk(kp, {
      type: 'calc',
      stem: `一个三角形的底是 ${a} 厘米，高是 ${h} 厘米，它的面积是多少平方厘米？`,
      answer: num(a * h / 2),
      solution: `三角形面积 = 底 × 高 ÷ 2 = ${a} × ${h} ÷ 2 = ${a * h / 2}（平方厘米）。`,
      errorProne: '忘记除以 2'
    });
  }
  if (kind === '4') {
    const up = rnd(3, 8);
    const low = up + rnd(2, 7);
    const h = rnd(2, 6) * 2;
    return mk(kp, {
      type: 'calc',
      stem: `一个梯形的上底是 ${up} 厘米，下底是 ${low} 厘米，高是 ${h} 厘米，面积是多少平方厘米？`,
      answer: num((up + low) * h / 2),
      solution: `梯形面积 = (上底 + 下底) × 高 ÷ 2 = (${up} + ${low}) × ${h} ÷ 2 = ${(up + low) * h / 2}（平方厘米）。`,
      errorProne: '漏乘 2 或漏加上底'
    });
  }
  const a = rnd(2, 9);
  return mk(kp, {
    type: 'fill',
    stem: `${a} 公顷 = 多少平方米？`,
    answer: num(a * 10000),
    solution: `1 公顷 = 10000 平方米，${a} 公顷 = ${a * 10000} 平方米。`,
    errorProne: '公顷与平方米的进率记成 100'
  });
}

// 图形的位置与运动（一）：4 个知识点
function transformQuestion(kp) {
  const kind = kp.id.slice(-1);
  if (kind === '1') {
    const col = rnd(1, 9);
    const row = rnd(1, 9);
    return mk(kp, {
      type: 'fill',
      stem: `一个点在第 ${col} 列、第 ${row} 行，用数对表示是（　）。`,
      answer: `${col},${row}`,
      solution: `用数对表示位置时先列后行，所以第 ${col} 列、第 ${row} 行写作 (${col}, ${row})。`,
      errorProne: '行列顺序写反'
    });
  }
  if (kind === '2') {
    const col = rnd(2, 7);
    const row = rnd(2, 7);
    return choice(kp, {
      stem: `点 A 的位置用数对表示是 (${col}, ${row})，把它向下平移 2 格后，新位置的数对是（　）。`,
      correct: `(${col}, ${row - 2})`,
      wrongs: [`(${col + 2}, ${row})`, `(${col}, ${row + 2})`, `(${col - 2}, ${row})`],
      solution: '向下平移是沿竖直方向移动，列数不变（第一个数不变），行数减少 2，所以新位置是 (' + col + ', ' + (row - 2) + ')。',
      errorProne: '平移方向和数对变化的对应关系搞反'
    });
  }
  if (kind === '3') {
    const shape = pick(['正方形', '长方形', '等边三角形']);
    const axes = shape === '正方形' ? 4 : shape === '长方形' ? 2 : 3;
    return mk(kp, {
      type: 'fill',
      stem: `${shape}有几条对称轴？`,
      answer: String(axes),
      solution: `${shape}沿不同方向的直线对折都能完全重合，一共可以找到 ${axes} 条对称轴。`,
      errorProne: '容易漏数斜方向的对称轴'
    });
  }
  const n = rnd(2, 8);
  return choice(kp, {
    stem: `把一个图形向右平移 ${n} 格，图形的形状和大小（改变/不变），位置（改变/不变）。请在横线上依次填写。`,
    correct: '不变，改变',
    wrongs: ['改变，不变', '改变，改变', '不变，不变'],
    solution: '平移只改变图形的位置，不改变图形的形状和大小。',
    errorProne: '误以为平移会让图形变大'
  });
}

// 倍数与因数：6 个知识点
function factorsQuestion(kp) {
  const kind = kp.id.slice(-1);
  if (kind === '1') {
    const a = rnd(2, 9);
    const b = rnd(2, 9);
    const c = a * b;
    return choice(kp, {
      stem: `${a} × ${b} = ${c}，下面说法正确的是（　）。`,
      correct: `${c} 是 ${a} 和 ${b} 的倍数`,
      wrongs: [`${a} 是倍数`, `${b} 是因数`, `${a} 和 ${b} 都是倍数`],
      solution: `在非零自然数范围内，${a} × ${b} = ${c}，所以 ${a} 和 ${b} 是 ${c} 的因数，${c} 是 ${a} 和 ${b} 的倍数。倍数与因数是相互依存的。`,
      errorProne: '单独说某数是倍数或因数，没有说清相互关系'
    });
  }
  if (kind === '2') {
    const digitSum = (x) => String(x).split('').reduce((s, d) => s + Number(d), 0);
    let list = [];
    let answer = 0;
    for (let tries = 0; tries < 30; tries++) {
      const base = rnd(3, 20) * 15;
      const candidates = [base, base + 2, base + 6, base + 9].sort(() => Math.random() - 0.5);
      if (candidates.filter((x) => x % 5 === 0 && digitSum(x) % 3 === 0).length === 1) {
        list = candidates;
        answer = base;
        break;
      }
    }
    if (!list.length) {
      list = [15, 32, 46, 59];
      answer = 15;
    }
    return mk(kp, {
      type: 'choice',
      stem: '下面各数中，既是 5 的倍数又是 3 的倍数的数是（　）。',
      options: list.map((x, i) => `${'ABCD'[i]}. ${x}`),
      answer: 'ABCD'[list.indexOf(answer)],
      solution: `5 的倍数看个位是 0 或 5，3 的倍数看各位数字之和能被 3 整除，只有 ${answer} 同时满足。`,
      errorProne: '只检查了 5 的倍数特征'
    });
  }
  if (kind === '3') {
    const primes = [11, 13, 17, 19, 23, 29, 31];
    const p = pick(primes);
    const comp = p + 1;
    return mk(kp, {
      type: 'fill',
      stem: `${p} 是质数还是合数？${comp} 呢？（按顺序填写：质数/合数）`,
      answer: `质数，合数`,
      solution: `${p} 只有 1 和它本身两个因数，是质数；${comp} 除了 1 和本身还有别的因数，是合数。`,
      errorProne: '把 1 当成质数，或混淆质数与合数的判断标准'
    });
  }
  if (kind === '4') {
    const odd1 = rnd(1, 9) * 2 + 1;
    const odd2 = rnd(1, 9) * 2 + 1;
    return mk(kp, {
      type: 'choice',
      stem: `奇数 ${odd1} 与奇数 ${odd2} 的和是（　）。`,
      options: ['A. 奇数', 'B. 偶数', 'C. 可能是奇数也可能是偶数', 'D. 无法确定'],
      answer: 'B',
      solution: `奇数 + 奇数 = 偶数，${odd1} + ${odd2} = ${odd1 + odd2}，是偶数。`,
      errorProne: '只算结果不总结规律'
    });
  }
  if (kind === '5') {
    const a = rnd(2, 9);
    const b = rnd(2, 9);
    return mk(kp, {
      type: 'fill',
      stem: `${a * b} 和 ${a * (b + 1)} 的最大公因数是多少？`,
      answer: num(gcd(a * b, a * (b + 1))),
      solution: `用列举法或短除法：它们的最大公因数是 ${gcd(a * b, a * (b + 1))}。`,
      errorProne: '把最小公倍数当成最大公因数'
    });
  }
  const comp = pick([12, 18, 24, 30, 36, 48]);
  const factors = [];
  let tmp = comp;
  for (let p = 2; p <= tmp; p++) {
    while (tmp % p === 0) {
      factors.push(p);
      tmp /= p;
    }
  }
  return mk(kp, {
    type: 'fill',
    stem: `把 ${comp} 分解质因数，结果是（用乘号连接，如 2×2×3）。`,
    answer: factors.join('×'),
    solution: `用短除法从最小的质数开始除，${comp} = ${factors.join('×')}。`,
    errorProne: '分解结果中出现了合数，没有分解到质数为止'
  });
}

// —— 语文五上（统编版）离线兜底题 ——

function cnUnit1(kp) {
  const kind = kp.id.slice(-1);
  if (kind === '1') {
    return choice(kp, {
      stem: '《桂花雨》一课中，作者借桂花抒发了怎样的情感？',
      correct: '对故乡和童年生活的怀念',
      wrongs: ['对桂花香气的单纯喜爱', '对秋天丰收的赞美', '对母亲勤劳的赞美'],
      solution: '作者回忆童年摇桂花、桂花雨的场景，借桂花表达了对故乡和童年生活的深切怀念。',
      errorProne: '只看到写桂花，没体会到借物抒情背后的思乡之情'
    });
  }
  if (kind === '2') {
    return choice(kp, {
      stem: '《落花生》借花生告诉我们的道理是（　）。',
      correct: '人要做有用的人，不要做只讲体面而对别人没有好处的人',
      wrongs: ['花生比桃子石榴苹果更好吃', '做人要像花生一样矮矮地长在地上', '我们要多种花生'],
      solution: '课文借花生朴实有用的特点，说明人要做有用的人，不要做只讲体面、对别人没有好处的人。',
      errorProne: '把借物喻理的道理和花生的表面特点混为一谈'
    });
  }
  if (kind === '3') {
    return choice(kp, {
      stem: '《珍珠鸟》中，珍珠鸟逐步信赖“我”的根本原因是（　）。',
      correct: '我对它的爱护与尊重，不去伤害它',
      wrongs: ['我给它喂了很多食物', '笼子很舒适', '它天生不怕人'],
      solution: '正是因为“我”从不惊扰、伤害珍珠鸟，给予它关爱与尊重，它才由怕人到信赖人。',
      errorProne: '误以为是食物或环境让珍珠鸟信赖作者'
    });
  }
  if (kind === '4') {
    return mk(kp, {
      type: 'fill',
      stem: '《落花生》一文围绕花生写了种花生、收花生、尝花生和______四件事。',
      answer: '议花生',
      solution: '课文按事情发展顺序写了种花生、收花生、尝花生、议花生，重点是议花生。',
      errorProne: '漏掉“议花生”这个重点部分'
    });
  }
  return choice(kp, {
    stem: '“全年，整个村子都浸在桂花的香气里。”中“浸”字写出了（　）。',
    correct: '桂花香气浓郁、弥漫范围广',
    wrongs: ['村子被桂花淹没', '桂花很多可以泡茶', '村子在桂花树下'],
    solution: '“浸”字形象地写出桂花香气浓郁、弥漫在整个村子的空气中。',
    errorProne: '只理解字面意思，没体会到香气的弥漫'
  });
}

function cnUnit2(kp) {
  const kind = kp.id.slice(-1);
  if (kind === '1') {
    return choice(kp, {
      stem: '《冀中的地道战》中，地道战取得成功的关键是（　）。',
      correct: '地道式样巧妙、功能齐全，加上人民群众的智慧和团结',
      wrongs: ['地道里有很多武器', '敌人太少', '地道很长'],
      solution: '地道设计巧妙（有住人、存粮、作战等功能），再加上冀中人民的智慧和团结，才能有效地打击敌人。',
      errorProne: '只看到地道的作用，忽略了人民群众的智慧'
    });
  }
  if (kind === '2') {
    return choice(kp, {
      stem: '《将相和》中“将”“相”分别指的是（　）。',
      correct: '廉颇、蔺相如',
      wrongs: ['蔺相如、廉颇', '赵王、秦王', '白起、王翦'],
      solution: '“将”指廉颇，“相”指蔺相如。课文写了完璧归赵、渑池之会、负荆请罪三个故事。',
      errorProne: '把“将”和“相”的对应人物搞反'
    });
  }
  if (kind === '3') {
    return choice(kp, {
      stem: '《什么比猎豹的速度更快》主要运用的说明方法是（　）。',
      correct: '列数字、作比较',
      wrongs: ['打比方、举例子', '分类别、作诠释', '下定义、摹状貌'],
      solution: '课文用具体数字和事物之间速度的比较，由慢到快地介绍了各种事物的运动速度。',
      errorProne: '混淆说明方法的种类'
    });
  }
  if (kind === '4') {
    return choice(kp, {
      stem: '《“诺曼底号”遇难记》中哈尔威船长的品质是（　）。',
      correct: '忠于职守、舍己救人',
      wrongs: ['胆小怕事、自私自利', '骄傲自大、目中无人', '狡猾奸诈、见利忘义'],
      solution: '在轮船遇难时，哈尔威船长沉着指挥救援，最后与船同沉，体现了忠于职守、舍己救人的品质。',
      errorProne: '对人物品质概括不准确'
    });
  }
  if (kind === '5') {
    return choice(kp, {
      stem: '下列哪种做法不能提高阅读速度？（　）',
      correct: '遇到不懂的词语就停下来反复琢磨',
      wrongs: ['集中注意力，连词成句地读', '带着问题读，抓住关键词句', '遇到不影响理解的词先跳过'],
      solution: '提高阅读速度要集中注意力、连词成句地读、不回读，遇到不影响理解的词语可以先跳过去。',
      errorProne: '遇到不懂的词就回读，拖慢阅读速度'
    });
  }
  return mk(kp, {
    type: 'fill',
    stem: '《将相和》中，蔺相如因“完璧归赵”和“渑池之会”立功，被赵王封为上卿，廉颇不服，后来廉颇______，两人和好。',
    answer: '负荆请罪',
    solution: '廉颇知道自己错了，就脱了上衣，背着荆条去蔺相如家请罪，这就是“负荆请罪”。',
    errorProne: '把“负荆请罪”写成别的词'
  });
}

function cnUnit3(kp) {
  const kind = kp.id.slice(-1);
  if (kind === '1') {
    return choice(kp, {
      stem: '《猎人海力布》中，海力布变成石头的原因是（　）。',
      correct: '为了救乡亲们，他说出了宝石的秘密',
      wrongs: ['他不小心摔了一跤', '龙王惩罚他', '他吃了有毒的果子'],
      solution: '海力布为了让乡亲们相信灾难即将来临，说出了宝石的秘密，违反了不能说出秘密的誓言，变成了石头。',
      errorProne: '没理解海力布牺牲自己救乡亲的原因'
    });
  }
  if (kind === '2') {
    return choice(kp, {
      stem: '《牛郎织女（一）》中，牛郎和织女相识是因为（　）。',
      correct: '老牛告诉牛郎仙女下凡洗澡的事',
      wrongs: ['牛郎在集市上遇到织女', '王母娘娘介绍的', '织女主动来找牛郎'],
      solution: '老牛临死前告诉牛郎，仙女们会下凡洗澡，让他去拿走织女的衣裳，两人因此相识。',
      errorProne: '记错牛郎织女相识的情节'
    });
  }
  if (kind === '3') {
    return choice(kp, {
      stem: '《牛郎织女（二）》中，牛郎织女被天河隔开后，每年只能在（　）相会一次。',
      correct: '七夕（七月初七）',
      wrongs: ['中秋节', '春节', '元宵节'],
      solution: '王母娘娘用玉簪划出天河，牛郎织女被隔开，每年七月初七喜鹊搭桥，让他们相会。',
      errorProne: '把七夕和其他节日混淆'
    });
  }
  if (kind === '4') {
    return choice(kp, {
      stem: '讲民间故事时，下列做法不合适的是（　）。',
      correct: '照着书一字不差地读出来',
      wrongs: ['加入适当的动作和神态', '对情节进行合理的想象', '用口语化的语言讲述'],
      solution: '讲民间故事要口语化，可以加入动作神态，对情节合理想象，但不能照着书一字不差地读。',
      errorProne: '把讲故事当成了朗读课文'
    });
  }
  return mk(kp, {
    type: 'fill',
    stem: '《猎人海力布》是一个______故事，海力布为了救乡亲们，自己变成了石头。',
    answer: '民间',
    solution: '《猎人海力布》是民间故事，表现了海力布热心助人、舍己为人的高尚品质。',
    errorProne: '把故事体裁说错，如说成“神话”或“童话”'
  });
}

function cnUnit4(kp) {
  const kind = kp.id.slice(-1);
  if (kind === '1') {
    const poems = [
      { q: '《示儿》中，诗人陆游临终前最牵挂的是（　）。', correct: '祖国统一（王师北定中原）', wrongs: ['自己的身体健康', '子孙的前途', '家里的财产'], sol: '《示儿》是陆游的绝笔诗，他临终前最牵挂的是“王师北定中原日”，即祖国的统一。', ep: '只看到“家祭”，没理解诗人真正牵挂的是国家统一' },
      { q: '《题临安邸》讽刺的是（　）。', correct: '南宋统治者不思收复失地、苟且偷安', wrongs: ['杭州美丽的风景', '旅店老板', '北方的金兵'], sol: '诗人讽刺南宋统治者在临安苟且偷安，不思收复中原失地。', ep: '误以为是赞美杭州风景' },
      { q: '《己亥杂诗》中“我劝天公重抖擞，不拘一格降人材”表达了诗人（　）。', correct: '渴望人才辈出、变革社会的愿望', wrongs: ['对天气的期盼', '对神仙的崇拜', '对官场的留恋'], sol: '诗人希望上天振作精神，打破常规降下各种人才，表达了渴望变革、人才辈出的愿望。', ep: '把诗句理解成迷信或单纯写景' }
    ];
    const p = pick(poems);
    return choice(kp, { stem: p.q, correct: p.correct, wrongs: p.wrongs, solution: p.sol, errorProne: p.ep });
  }
  if (kind === '2') {
    return choice(kp, {
      stem: '《少年中国说》中，作者把少年中国比作（　）等事物，表达了对少年中国的赞美和期望。',
      correct: '红日、河流、潜龙、乳虎、鹰隼',
      wrongs: ['月亮、星星、云朵', '高山、大海、森林', '花朵、树木、小鸟'],
      solution: '作者用红日、河流、潜龙、乳虎、鹰隼等充满生机的事物比喻少年中国，赞美其朝气蓬勃、前途无量。',
      errorProne: '记不清比喻的事物，乱选其他意象'
    });
  }
  if (kind === '3') {
    return choice(kp, {
      stem: '《圆明园的毁灭》中，作者写圆明园昔日辉煌的目的是（　）。',
      correct: '反衬英法联军的野蛮，激发人们对祖国文化的热爱和对侵略者的愤恨',
      wrongs: ['炫耀清朝的富有', '介绍建筑艺术', '让人们去参观圆明园'],
      solution: '作者花大量笔墨写圆明园昔日的辉煌，是为了反衬它被毁灭的可惜，激发人们热爱祖国文化、仇恨侵略者的情感。',
      errorProne: '误以为只是介绍圆明园的建筑'
    });
  }
  if (kind === '4') {
    return choice(kp, {
      stem: '《梅兰芳蓄须明志》中，梅兰芳蓄须的目的是（　）。',
      correct: '拒绝为日本侵略者演出',
      wrongs: ['为了艺术形象', '赶时髦', '生病了不方便刮胡子'],
      solution: '抗日战争时期，梅兰芳蓄须明志，拒绝为日本侵略者演出，表现了崇高的民族气节。',
      errorProne: '把蓄须的目的理解成个人形象问题'
    });
  }
  return mk(kp, {
    type: 'fill',
    stem: '《示儿》中，诗人陆游嘱咐儿子“王师北定中原日，______”。',
    answer: '家祭无忘告乃翁',
    solution: '诗句意思是：等到朝廷军队收复中原失地的那一天，家祭时不要忘了告诉你的父亲。',
    errorProne: '诗句中有错别字，如“无忘”写成“勿忘”、“乃翁”写错'
  });
}

function cnUnit5(kp) {
  const kind = kp.id.slice(-1);
  if (kind === '1') {
    return choice(kp, {
      stem: '《太阳》一课主要运用的说明方法是（　）。',
      correct: '列数字、举例子、作比较',
      wrongs: ['打比方、分类别', '下定义、作诠释', '摹状貌、画图表'],
      solution: '课文用列数字（1.5亿千米、3500年）、作比较（130万个地球抵一个太阳）、举例子等说明方法介绍太阳。',
      errorProne: '混淆说明方法，把列数字说成打比方'
    });
  }
  if (kind === '2') {
    return choice(kp, {
      stem: '《金字塔》一课用了两篇不同形式的材料介绍金字塔，这是为了（　）。',
      correct: '从不同角度呈现金字塔的特点，激发读者兴趣',
      wrongs: ['凑字数', '重复介绍', '让课文更长'],
      solution: '一篇用文字描写，一篇用非连续性文本呈现数据，从不同角度展示金字塔的特点，激发读者兴趣。',
      errorProne: '不理解非连续性文本在文中的作用'
    });
  }
  if (kind === '3') {
    return choice(kp, {
      stem: '《鲸》这篇例文告诉我们，介绍事物时可以（　）。',
      correct: '从外形、种类、生活习性等方面有条理地说明',
      wrongs: ['只写外形就可以', '随便想到什么写什么', '只列数字不写文字'],
      solution: '《鲸》从鲸的外形、种类、生活习性等方面有条理地介绍，是说明文的写作范例。',
      errorProne: '介绍事物时没有条理，东一榔头西一棒子'
    });
  }
  return mk(kp, {
    type: 'fill',
    stem: '《太阳》中说，太阳离我们约有______千米远，到太阳上去，如果步行，日夜不停地走，差不多要走3500年。',
    answer: '1.5亿',
    solution: '课文用列数字的方法说明太阳离我们很远：约1.5亿千米，步行要约3500年。',
    errorProne: '把“1.5亿”记错，如写成“1500万”'
  });
}

function cnUnit6(kp) {
  const kind = kp.id.slice(-1);
  if (kind === '1') {
    return choice(kp, {
      stem: '《慈母情深》中，“母亲说完，立刻又坐了下去，立刻又弯曲了背……”连用四个“立刻”是为了（　）。',
      correct: '突出母亲工作的辛劳和忙碌',
      wrongs: ['说明母亲动作快', '表现母亲心情不好', '强调母亲做了很多事'],
      solution: '四个“立刻”写出母亲把时间抓得很紧，突出她为了养家辛苦劳作、一刻不停。',
      errorProne: '只看到“立刻”的字面意思，没体会到母亲的辛劳'
    });
  }
  if (kind === '2') {
    return choice(kp, {
      stem: '《父爱之舟》中反复出现“小渔船”，是为了（　）。',
      correct: '象征父爱，承载父亲对“我”的关爱与期望',
      wrongs: ['说明作者家很穷', '介绍船的样子', '回忆打鱼的经历'],
      solution: '“小渔船”是全文的线索，象征着父爱，承载着父亲对“我”的关爱与期望。',
      errorProne: '把小渔船仅仅理解成一种交通工具'
    });
  }
  if (kind === '3') {
    return choice(kp, {
      stem: '《航天员写给孩子的信》是一封书信，其语言特点是（　）。',
      correct: '亲切自然，如同面对面和孩子交谈',
      wrongs: ['严肃刻板，像公文', '华丽辞藻，充满比喻', '简短生硬，没有感情'],
      solution: '课文是航天员写给孩子的信，语言亲切自然，充满父爱，就像和孩子面对面交谈。',
      errorProne: '不理解书信体的语言风格'
    });
  }
  if (kind === '4') {
    return choice(kp, {
      stem: '关于“父母之爱”，下列说法正确的是（　）。',
      correct: '父母的爱有不同的表达方式，都值得我们珍惜',
      wrongs: ['只有严厉才是爱', '只有物质满足才是爱', '溺爱才是真正的爱'],
      solution: '父母之爱的表达方式各不相同，有的慈祥，有的严厉，但都出自对孩子的关爱，都值得珍惜。',
      errorProne: '片面理解父母之爱，认为只有一种方式才是爱'
    });
  }
  return mk(kp, {
    type: 'fill',
    stem: '《慈母情深》中，母亲虽然挣钱辛苦，仍然给“我”钱买书，表现了母亲对“我”读书的______。',
    answer: '支持',
    solution: '母亲在极其艰苦的条件下仍给钱让“我”买书，表现了她对“我”读书的支持和深沉的母爱。',
    errorProne: '只写“爱”太笼统，没有点出“支持读书”'
  });
}

function cnUnit7(kp) {
  const kind = kp.id.slice(-1);
  if (kind === '1') {
    const poems = [
      { q: '《山居秋暝》的作者是（　）。', correct: '王维', wrongs: ['李白', '杜甫', '白居易'], sol: '《山居秋暝》是唐代诗人王维的作品，描绘了秋雨初晴后山村的旖旎风光。', ep: '把作者和其他诗人混淆' },
      { q: '《枫桥夜泊》表达了诗人怎样的心情？（　）', correct: '羁旅之愁、孤寂之感', wrongs: ['喜悦兴奋', '悠闲自在', '愤怒不满'], sol: '诗人通过“月落、乌啼、霜、江枫、渔火”等意象，表达了羁旅在外的愁思和孤寂。', ep: '把羁旅愁思误认为其他情感' },
      { q: '《长相思》是一首词，它的作者是（　）。', correct: '纳兰性德', wrongs: ['苏轼', '辛弃疾', '李清照'], sol: '《长相思》是清代词人纳兰性德的作品，表达了思乡之情。', ep: '把词牌名和作者混淆' }
    ];
    const p = pick(poems);
    return choice(kp, { stem: p.q, correct: p.correct, wrongs: p.wrongs, solution: p.sol, errorProne: p.ep });
  }
  if (kind === '2') {
    return choice(kp, {
      stem: '《第一场雪》中，作者写雪的美丽景象，主要表达了（　）。',
      correct: '对第一场雪的喜爱和对来年丰收的期盼',
      wrongs: ['对冬天的厌恶', '对寒冷的害怕', '对雪景的单纯描写'],
      solution: '作者通过描写第一场雪的美丽景象，表达了对雪的喜爱，以及“瑞雪兆丰年”的期盼。',
      errorProne: '只看到写景，没体会到“瑞雪兆丰年”的情感'
    });
  }
  if (kind === '3') {
    return choice(kp, {
      stem: '《白鹭》中，作者认为白鹭是一首（　）。',
      correct: '精巧的诗',
      wrongs: ['动听的歌', '美丽的画', '优美的舞蹈'],
      solution: '作者把白鹭比作“一首精巧的诗”，赞美了白鹭外形和神态的优美。',
      errorProne: '把比喻记错，如写成“一首歌”或“一幅画”'
    });
  }
  return mk(kp, {
    type: 'fill',
    stem: '《山居秋暝》中“明月松间照，______”两句，描绘了月光洒落松林、清泉流淌石上的优美画面。',
    answer: '清泉石上流',
    solution: '“明月松间照，清泉石上流”从视觉和听觉两方面写出了山村秋夜的清幽。',
    errorProne: '诗句中有错别字，如“清”写成“青”、“流”少写笔画'
  });
}

function cnUnit8(kp) {
  const kind = kp.id.slice(-1);
  if (kind === '1') {
    return choice(kp, {
      stem: '《古人谈读书》中，朱熹提出读书有三到，即（　）。',
      correct: '心到、眼到、口到',
      wrongs: ['手到、眼到、口到', '心到、手到、耳到', '眼到、耳到、手到'],
      solution: '朱熹说读书有三到：心到、眼到、口到，其中心到最重要。',
      errorProne: '把“三到”记错，如把“心到”写成“手到”'
    });
  }
  if (kind === '2') {
    return choice(kp, {
      stem: '《忆读书》中，冰心奶奶认为读书（　）。',
      correct: '好，多读书，读好书',
      wrongs: ['读书没用', '只读作文书就行', '读书越多越好，不管什么书'],
      solution: '冰心奶奶在文中提出“读书好，多读书，读好书”，强调读书有益，要多读好书。',
      errorProne: '漏掉“读好书”，以为什么书都可以'
    });
  }
  if (kind === '3') {
    return choice(kp, {
      stem: '《走遍天下书为侣》中，作者把书比作（　）。',
      correct: '朋友、家人、故地',
      wrongs: ['食物、饮料', '金钱、珠宝', '工具、武器'],
      solution: '作者把书比作朋友、家人、故地，说明书可以反复阅读，每次都有新的发现和感受。',
      errorProne: '记错比喻的事物'
    });
  }
  return mk(kp, {
    type: 'fill',
    stem: '朱熹说读书有三到，其中最重要的是______。',
    answer: '心到',
    solution: '朱熹说“三到之中，心到最急”，因为心不在焉，眼就看不仔细，口也读不正确。',
    errorProne: '把最重要的“心到”写成“眼到”或“口到”'
  });
}

Object.assign(GENERATORS, {
  'cn-5a-u1': cnUnit1,
  'cn-5a-u2': cnUnit2,
  'cn-5a-u3': cnUnit3,
  'cn-5a-u4': cnUnit4,
  'cn-5a-u5': cnUnit5,
  'cn-5a-u6': cnUnit6,
  'cn-5a-u7': cnUnit7,
  'cn-5a-u8': cnUnit8,
  '5a-u1': decimalAddSub,
  '5a-u2': triangleQuestion,
  '5a-u3': decimalMul,
  '5a-u4': letterAlgebra,
  '5a-u5': (kp) => (Math.random() < 0.5 ? drawArea(kp) : areaQuestion(kp)),
  '5a-u6': (kp) => (Math.random() < 0.5 ? drawTransform(kp) : transformQuestion(kp)),
  '5a-u7': factorsQuestion,
  '5a-u8': probabilityQuestion,
  '5a-u9': designQuestion,
  '5a-u10': chickenRabbit,
  '5a-u11': areaEstimate
});

// —— 作图题：只出格点可判分的三种结构 ——
const GRID_W = 12;
const GRID_H = 8;

function drawTransform(kp) {
  if (Math.random() < 0.5) {
    const axisAt = rnd(4, 6);
    const x1 = rnd(1, axisAt - 3);
    const x2 = rnd(x1 + 1, axisAt - 1);
    const y1 = rnd(1, 3);
    const y2 = rnd(y1 + 1, 6);
    const base = [[x1, y1], [x2, y1], [x2, y2]];
    const answer = base.map(([x, y]) => [2 * axisAt - x, y]);
    return mk(kp, {
      type: 'draw',
      stem: `下面方格纸的虚线是对称轴，已知三角形的一半（蓝色）。请画出这个三角形关于对称轴的另一半。`,
      figure: {
        kind: 'grid',
        grid: { w: GRID_W, h: GRID_H },
        bg: { type: 'symmetry', axis: { dir: 'v', at: axisAt }, points: base },
        tolerance: 0.5
      },
      answer: JSON.stringify(answer),
      solution: `把已知三角形的三个顶点分别关于对称轴作对称点：对称点到对称轴的距离相等，横坐标是 ${2 * axisAt} 减去原来的横坐标，纵坐标不变，连接三个对称点就得到另一半。`,
      errorProne: '对称点到对称轴的距离没有和原顶点相等'
    });
  }
  const dx = rnd(2, 4);
  const x1 = rnd(1, 3);
  const y1 = rnd(1, 3);
  const base = [[x1, y1], [x1 + rnd(2, 3), y1], [x1, y1 + rnd(2, 3)]];
  return mk(kp, {
    type: 'draw',
    stem: `下面方格纸中已画出一个三角形（蓝色）。请把它向右平移 ${dx} 格，画出平移后的图形。`,
    figure: {
      kind: 'grid',
      grid: { w: GRID_W, h: GRID_H },
      bg: { type: 'translate', points: base, delta: [dx, 0] },
      tolerance: 0.5
    },
    answer: JSON.stringify(base.map(([x, y]) => [x + dx, y])),
    solution: `平移不改变图形的形状和大小：把每个顶点都向右移动 ${dx} 格，再按原来的顺序连接起来。`,
    errorProne: '平移时只移动了一部分顶点，或格数数错'
  });
}

function drawArea(kp) {
  const w = rnd(2, 5);
  const h = rnd(2, 4);
  const area = w * h;
  const x = rnd(1, 4);
  const y = rnd(1, 3);
  const answer = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  return mk(kp, {
    type: 'draw',
    stem: `请在方格纸上画一个面积是 ${area} 平方厘米的长方形（每个小方格边长 1 厘米）。`,
    figure: {
      kind: 'grid',
      grid: { w: GRID_W, h: GRID_H },
      bg: { type: 'target', area: area },
      tolerance: 0.5
    },
    answer: JSON.stringify(answer),
    solution: `长方形的长和宽相乘等于 ${area}，例如 ${w} × ${h} = ${area}，按 ${w} 格和 ${h} 格画出长方形即可。`,
    errorProne: '数格数时漏算边界，或长和宽选错'
  });
}

function fallbackQuestion(kp) {
  const a = rnd(2, 9);
  const b = rnd(2, 9);
  return mk(kp, {
    type: 'calc',
    stem: `计算：${a} × ${b} =`,
    answer: num(a * b),
    solution: `${a} × ${b} = ${a * b}。`,
    errorProne: '乘法口诀不熟练'
  });
}

export function hasLocalSupport(kps) {
  return kps.every((kp) => GENERATORS[kp.id.replace(/-\d+$/, '')]);
}

export function generateLocal(kps, count) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const kp = kps[i % kps.length];
    const unitKey = kp.id.replace(/-\d+$/, '');
    const g = GENERATORS[unitKey];
    out.push(g ? g(kp) : fallbackQuestion(kp));
  }
  return out;
}
