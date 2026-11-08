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

Object.assign(GENERATORS, {
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
