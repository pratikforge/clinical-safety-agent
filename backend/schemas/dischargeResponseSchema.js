const { z } = require("zod");

const alertSchema = z.object({
  type: z.enum(["BLOCK", "WARN", "PASS"]),
  field: z.string(),
  message: z.string(),
  rule: z.string(),
  source: z.enum(["rules", "llm", "system"])
});

const dischargeResponseSchema = z.object({
  requestId: z.string(),
  readinessScore: z.number().min(0).max(100),
  llmStatus: z.enum(["used", "rules_only", "unavailable"]),
  alerts: z.array(alertSchema),
  summary: z.object({
    blockCount: z.number(),
    warnCount: z.number(),
    passCount: z.number(),
    missingItemsCount: z.number(),
    unresolvedRiskCount: z.number()
  }),
  workflowPath: z.array(z.string()).optional(),
  agentDecision: z.enum(["allow_demo_submit", "blocked", "warn_confirmation", "human_review_required", "overridden_block"]).optional(),
  securityEvents: z.array(z.string()).optional(),
  agentMode: z.enum(["rules_only", "advisory_llm", "human_review_required"]).optional()
});

module.exports = { alertSchema, dischargeResponseSchema };
