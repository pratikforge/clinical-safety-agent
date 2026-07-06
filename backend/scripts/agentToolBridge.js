const { randomUUID } = require("crypto");
const { dischargeRequestSchema } = require("../schemas/dischargeRequestSchema");
const { getPatientById } = require("../services/databaseService");
const { runRules } = require("../services/ruleEngine");
const { computeReadinessScore, summarizeAlerts } = require("../services/scoringService");
const { scrubForLlm } = require("../services/scrubberService");
const { collectOriginalPii, verifyNoPii } = require("../services/piiLeakVerifier");

const RULE_EXPLANATIONS = {
  REQUIRED_FIELD_MISSING: "Required discharge fields must be present before review.",
  DESTINATION_ADDRESS_MISSING: "Home discharge requires a destination address.",
  MED_RECONCILIATION_INCOMPLETE: "Medication reconciliation must be complete before discharge.",
  MISSING_PHYSICIAN_SIGNATURE: "A physician signature is required before final discharge.",
  MISSING_SOCIAL_WORKER_SIGNATURE: "A social worker signature is required before final discharge.",
  OXYGEN_TRANSPORT_MISMATCH: "Patients requiring oxygen need transport that can safely support oxygen.",
  MOBILITY_STAIRS_NO_ELEVATOR: "Mobility limitations conflict with stairs when no elevator is available.",
  FALL_RISK_LIVES_ALONE_NO_CAREGIVER: "Fall-risk patients living alone need an available caregiver.",
  COGNITIVE_LIVES_ALONE_NO_HOME_HEALTH: "Cognitive risk with living alone requires home health support.",
  HIGH_TIER_MED_INSURANCE_UNVERIFIED: "High-tier medication coverage should be verified.",
  FOLLOWUP_NOT_BOOKED: "Specified follow-up care should be booked before discharge.",
  EQUIPMENT_OR_SERVICE_GAP: "Equipment and service orders should match mobility or oxygen needs.",
  RULES_CLEAR: "No configured deterministic safety rule found a blocking or warning issue."
};

function readStdin() {
  return new Promise((resolve, reject) => {
    let input = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      input += chunk;
    });
    process.stdin.on("end", () => {
      try {
        resolve(JSON.parse(input || "{}"));
      } catch (error) {
        reject(new Error("Malformed JSON bridge input."));
      }
    });
  });
}

function ok(data) {
  process.stdout.write(JSON.stringify({ status: "success", data }));
}

function fail(error) {
  process.stdout.write(JSON.stringify({ status: "error", error: error.message || "Bridge action failed." }));
  process.exitCode = 1;
}

function validateDischargePlan(payload) {
  const body = {
    clientRequestId: payload.clientRequestId || randomUUID(),
    patientId: payload.patientId,
    formData: payload.formData
  };
  const parsed = dischargeRequestSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new Error(`Request validation failed. ${message}`);
  }
  const patient = getPatientById(parsed.data.patientId);
  if (!patient) {
    throw new Error(`Patient ${parsed.data.patientId} not found in database.`);
  }
  const alerts = runRules(patient, parsed.data.formData);
  return {
    requestId: parsed.data.clientRequestId,
    readinessScore: computeReadinessScore(alerts),
    llmStatus: "rules_only",
    alerts,
    summary: summarizeAlerts(alerts)
  };
}

function getMockPatient(payload) {
  const patient = getPatientById(payload.patientId);
  if (!patient) {
    throw new Error(`Patient ${payload.patientId} not found in database.`);
  }
  return patient;
}

function scrubDischargePayload(payload) {
  const patient = getPatientById(payload.patientId);
  if (!patient) {
    throw new Error(`Patient ${payload.patientId} not found in database.`);
  }
  const scrubbedPayload = scrubForLlm(patient, payload.formData);
  const originalPii = collectOriginalPii(patient, payload.formData);
  return {
    scrubbedPayload,
    redactionCategories: ["patient_name", "date", "phone", "email", "ssn", "address", "mrn"],
    leakVerification: verifyNoPii(scrubbedPayload, originalPii)
  };
}

function explainRule(payload) {
  const ruleId = payload.ruleId;
  return {
    ruleId,
    explanation: RULE_EXPLANATIONS[ruleId] || "Unknown deterministic rule."
  };
}

readStdin()
  .then(({ action, payload = {} }) => {
    if (action === "validate_discharge_plan") ok(validateDischargePlan(payload));
    else if (action === "get_mock_patient") ok(getMockPatient(payload));
    else if (action === "scrub_discharge_payload") ok(scrubDischargePayload(payload));
    else if (action === "explain_rule") ok(explainRule(payload));
    else throw new Error(`Unknown bridge action: ${action}`);
  })
  .catch(fail);
