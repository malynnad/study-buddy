// 大模型价格与用量换算：单价为「元 / 百万 tokens」，按 DeepSeek 官方公示价估算。
// DeepSeek 采用峰谷定价：北京时间周一至周五 9:00–12:00、14:00–18:00 为高峰时段，
// 其余时段（含周末、法定节假日）为空闲时段；空闲价为高峰价的一半。
const PRICES = {
  'deepseek-flash': {
    peak: { inputMiss: 2, inputHit: 0.04, output: 8 },
    offPeak: { inputMiss: 1, inputHit: 0.02, output: 4 }
  },
  // 旧模型名仍可调用，按 Flash 价格计费
  'deepseek-v4-flash': {
    peak: { inputMiss: 2, inputHit: 0.04, output: 8 },
    offPeak: { inputMiss: 1, inputHit: 0.02, output: 4 }
  },
  'deepseek-v4-pro': {
    peak: { inputMiss: 9, inputHit: 0.3, output: 27 },
    offPeak: { inputMiss: 4.5, inputHit: 0.15, output: 13.5 }
  }
};

// 2026 年国务院公布的法定节假日（北京时间）。跨年运行时请补充下一年度日期。
const HOLIDAYS = new Set([
  '2026-01-01', '2026-01-02', '2026-01-03',
  '2026-02-15', '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20', '2026-02-21', '2026-02-22', '2026-02-23',
  '2026-04-04', '2026-04-05', '2026-04-06',
  '2026-05-01', '2026-05-02', '2026-05-03', '2026-05-04', '2026-05-05',
  '2026-06-19', '2026-06-20', '2026-06-21',
  '2026-09-25', '2026-09-26', '2026-09-27',
  '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07'
]);

const BEIJING_OFFSET_MS = 8 * 60 * 60 * 1000;
const PEAK_WINDOWS = [
  [9 * 60, 12 * 60],
  [14 * 60, 18 * 60]
];

export function normalizeUsage(raw) {
  const promptTokens = Math.max(0, Number(raw?.prompt_tokens) || 0);
  const completionTokens = Math.max(0, Number(raw?.completion_tokens) || 0);
  const cacheHitTokens = Math.max(0, Number(raw?.prompt_cache_hit_tokens) || 0);
  const missRaw = raw?.prompt_cache_miss_tokens;
  const cacheMissTokens = missRaw == null ? Math.max(0, promptTokens - cacheHitTokens) : Math.max(0, Number(missRaw) || 0);
  return {
    promptTokens,
    completionTokens,
    cacheHitTokens,
    cacheMissTokens,
    totalTokens: promptTokens + completionTokens
  };
}

// 判断调用发生时的计费时段：工作日高峰时段为 peak，其余为 offPeak
export function periodAt(at = Date.now()) {
  const beijing = new Date(Number(at) + BEIJING_OFFSET_MS);
  const year = beijing.getUTCFullYear();
  const month = beijing.getUTCMonth() + 1;
  const day = beijing.getUTCDate();
  const weekday = beijing.getUTCDay();
  const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  if (weekday === 0 || weekday === 6 || HOLIDAYS.has(key)) return 'offPeak';
  const minutes = beijing.getUTCHours() * 60 + beijing.getUTCMinutes();
  const inPeak = PEAK_WINDOWS.some(([start, end]) => minutes >= start && minutes < end);
  return inPeak ? 'peak' : 'offPeak';
}

export function calcCost(model, rawUsage, at = Date.now()) {
  const usage = normalizeUsage(rawUsage);
  const period = periodAt(at);
  const entry = PRICES[String(model || '').trim()];
  if (!entry) return { ...usage, period, cost: 0, priced: false, currency: 'CNY' };
  const price = entry[period];
  const cost =
    (usage.cacheMissTokens / 1e6) * price.inputMiss +
    (usage.cacheHitTokens / 1e6) * price.inputHit +
    (usage.completionTokens / 1e6) * price.output;
  return { ...usage, period, cost: Math.round(cost * 1e6) / 1e6, priced: true, currency: 'CNY' };
}

export function priceTable() {
  return Object.entries(PRICES).map(([model, p]) => ({
    model,
    peak: p.peak,
    offPeak: p.offPeak,
    peakWindow: '周一至周五 9:00–12:00、14:00–18:00（北京时间，法定节假日除外）'
  }));
}
