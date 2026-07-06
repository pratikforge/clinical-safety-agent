const { alertSchema } = require("../schemas/dischargeResponseSchema");

function mergeResults(ruleAlerts, llmAlerts = []) {
  const safeLlmAlerts = [];
  for (const candidate of llmAlerts) {
    const parsed = alertSchema.safeParse({ ...candidate, type: "WARN", source: "llm" });
    if (parsed.success) {
      safeLlmAlerts.push(parsed.data);
    }
  }
  return [...ruleAlerts.filter((alert) => alert.type !== "PASS" || safeLlmAlerts.length === 0), ...safeLlmAlerts];
}

module.exports = { mergeResults };
