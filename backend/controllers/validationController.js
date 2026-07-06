const { dischargeRequestSchema, formatZodDetails } = require("../schemas/dischargeRequestSchema");
const { dischargeResponseSchema } = require("../schemas/dischargeResponseSchema");
const { getPatientById } = require("../services/databaseService");
const { runRules } = require("../services/ruleEngine");
const { computeReadinessScore, summarizeAlerts } = require("../services/scoringService");
const { mergeResults } = require("../services/resultMerger");

function systemWarn(message, rule) {
  return { type: "WARN", field: "validationService", message, rule, source: "system" };
}

function createValidationController(env, dependencies = {}) {
  const llmService = dependencies.llmService || { review: async () => ({ status: "rules_only", alerts: [] }) };

  return async function validateDischarge(req, res, next) {
    try {
      const parsed = dischargeRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(422).json({
          error: "Request validation failed.",
          details: formatZodDetails(parsed.error)
        });
        return;
      }

      const { clientRequestId, patientId, formData } = parsed.data;
      const patient = getPatientById(patientId);
      if (!patient) {
        res.status(404).json({ error: `Patient ${patientId} not found in database.` });
        return;
      }

      const ruleAlerts = runRules(patient, formData);
      let llmStatus = env.ALLOW_RULES_ONLY ? "rules_only" : "unavailable";
      let llmAlerts = [];

      try {
        const llmResult = await llmService.review({ patient, formData, ruleAlerts, clientRequestId, requestId: req.requestId });
        llmStatus = llmResult.status || llmStatus;
        llmAlerts = llmResult.alerts || [];
      } catch (error) {
        llmStatus = "unavailable";
        llmAlerts = [systemWarn("LLM advisory review unavailable; deterministic rules were applied.", "LLM_UNAVAILABLE_REVIEW_REQUIRED")];
      }

      const alerts = mergeResults(ruleAlerts, llmAlerts);
      const summary = summarizeAlerts(alerts);
      
      let agentDecision = "allow_demo_submit";
      if (summary.blockCount > 0) {
        if (parsed.data.overrideBlock) {
          const doctorSignature = parsed.data.formData.physicianSignature ? "Signed" : "Unsigned";
          console.log(`[AUDIT_LOG] [${new Date().toISOString()}] Admin ${parsed.data.overrideAdminId || "UNKNOWN"} overrode BLOCK on discharge plan for Patient ${patientId} (Authorized by doc signature: ${doctorSignature}). Reason: ${parsed.data.overrideReason || "No reason provided"}`);
          agentDecision = "overridden_block";
        } else {
          agentDecision = "blocked";
        }
      } else if (summary.warnCount > 0) {
        agentDecision = "warn_confirmation";
      }
      
      let agentMode = env.ALLOW_RULES_ONLY ? "rules_only" : "advisory_llm";
      
      const workflowPath = [
        "parse_discharge_event",
        "local_schema_check",
        "security_screen",
        "deterministic_safety_review",
        "deterministic_router",
        `${agentDecision}_decision`
      ];
      
      const response = {
        requestId: clientRequestId,
        readinessScore: computeReadinessScore(alerts),
        llmStatus,
        alerts,
        summary,
        workflowPath,
        agentDecision,
        agentMode,
        securityEvents: []
      };
      const checked = dischargeResponseSchema.parse(response);
      res.status(200).json(checked);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { createValidationController };
