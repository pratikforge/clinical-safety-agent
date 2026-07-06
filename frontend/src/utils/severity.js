export function severityClass(type) {
  if (type === "BLOCK") return "severity-block";
  if (type === "WARN") return "severity-warn";
  if (type === "PASS") return "severity-pass";
  return "severity-system";
}

export function scoreBand(score) {
  if (score === null || score === undefined) return "score-idle";
  if (score < 60) return "score-block";
  if (score < 85) return "score-warn";
  return "score-pass";
}
