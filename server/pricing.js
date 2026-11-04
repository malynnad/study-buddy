// 大模型价格与用量换算：单价为「元 / 百万 tokens」，按 DeepSeek 官方公示价估算。
// DeepSeek 分峰时（08:30–00:30）与谷时（00:30–08:30，北京时间）两档价格，谷时按 5 折计。
const PRICES = {
  'deepseek-flash': {
    peak: { inputMiss: 1, inputHit: 0.02, output: 2 },
    offPeak: { inputMiss: 0.5, inputHit: 0.01, output: 1 }
  },
  'deepseek-v4-pro': {
    peak: { inputMiss: 3, inputHit: 0.025, output: 6 },
    offPeak: { inputMiss: 1.5, inputHit: 0.0125, output: 3 }
  }
};

const OFF_PEAK_START = 30; // 00:30
const OFF_PEAK_END = 510; // 08:30
const BEIJING_OFFSET_MS = 8 * 60 * 60 * 1000;

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

// 判断调用发生时的计费时段：北京时间 00:30–08:30 为谷时
export function periodAt(at = Date.now()) {
  const beijing = new Date(Number(at) + BEIJING_OFFSET_MS);
  const minutes = beijing.getUTCHours() * 60 + beijing.getUTCMinutes();
  return minutes >= OFF_PEAK_START && minutes < OFF_PEAK_END ? 'offPeak' : 'peak';
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
    offPeakWindow: '00:30–08:30（北京时间）'
  }));
}
