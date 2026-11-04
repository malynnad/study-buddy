// 大模型价格与用量换算：单价为「元 / 百万 tokens」，按 DeepSeek 官方公示价估算。
// 当前官方价格不分峰谷时段，直接按统一单价计算。
const PRICES = {
  'deepseek-v4-flash': { inputMiss: 1, inputHit: 0.02, output: 2 },
  // 兼容旧配置中的模型名，价格与 deepseek-v4-flash 相同
  'deepseek-flash': { inputMiss: 1, inputHit: 0.02, output: 2 },
  'deepseek-v4-pro': { inputMiss: 3, inputHit: 0.025, output: 6 }
};

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

export function calcCost(model, rawUsage) {
  const usage = normalizeUsage(rawUsage);
  const entry = PRICES[String(model || '').trim()];
  if (!entry) return { ...usage, cost: 0, priced: false, currency: 'CNY' };
  const cost =
    (usage.cacheMissTokens / 1e6) * entry.inputMiss +
    (usage.cacheHitTokens / 1e6) * entry.inputHit +
    (usage.completionTokens / 1e6) * entry.output;
  return { ...usage, cost: Math.round(cost * 1e6) / 1e6, priced: true, currency: 'CNY' };
}

export function priceTable() {
  return Object.entries(PRICES).map(([model, p]) => ({ model, ...p }));
}
