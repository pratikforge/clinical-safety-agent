function summarizeAlerts(alerts) {
  const blockCount = alerts.filter((alert) => alert.type === "BLOCK").length;
  const warnCount = alerts.filter((alert) => alert.type === "WARN").length;
  const passCount = alerts.filter((alert) => alert.type === "PASS").length;
  const missingItemsCount = alerts.filter((alert) => alert.rule === "REQUIRED_FIELD_MISSING").length;
  return {
    blockCount,
    warnCount,
    passCount,
    missingItemsCount,
    unresolvedRiskCount: blockCount + warnCount
  };
}

function computeReadinessScore(alerts) {
  const summary = summarizeAlerts(alerts);
  let score = 100 - summary.blockCount * 30 - summary.warnCount * 10 - summary.missingItemsCount * 5;
  if (summary.blockCount > 0) score = Math.min(score, 59);
  if (summary.warnCount > 0 && summary.blockCount === 0) score = Math.min(score, 84);
  return Math.max(0, Math.min(100, score));
}

module.exports = { summarizeAlerts, computeReadinessScore };
