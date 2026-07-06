import assert from "node:assert/strict";
import test from "node:test";
import { toolDefinitions } from "../src/tools.js";

const safeForm = {
  dischargeDate: "2026-07-07",
  dischargeStatus: "Routine",
  destination: "Home",
  destinationAddress: "10 Demo Street",
  livesAlone: false,
  stairsAtHome: "None",
  caregiverName: "Jordan Lee",
  caregiverPhone: "555-123-4567",
  caregiverRelationship: "Adult child",
  caregiverAvailableOnDischarge: true,
  transportType: "Wheelchair Van",
  medicationReconciliationComplete: true,
  newMedications: "",
  insuranceVerified: true,
  followUpType: "Primary care",
  followUpDate: "2026-07-14",
  followUpBooked: true,
  equipmentNeeded: ["None"],
  homeHealthOrdered: false,
  communityServicesReferral: true,
  physicianSignature: true,
  socialWorkerSignature: true
};

test("validate_discharge_plan returns backend validation contract", () => {
  const result = toolDefinitions.validate_discharge_plan.handler({
    patientId: "MRN-100",
    formData: safeForm
  });
  assert.equal(result.readinessScore, 100);
  assert.equal(result.alerts[0].rule, "RULES_CLEAR");
});

test("scrub_discharge_payload does not return raw caregiver phone", () => {
  const result = toolDefinitions.scrub_discharge_payload.handler({
    patientId: "MRN-100",
    formData: { ...safeForm, newMedications: "Call 555-222-3333 or email test@example.com" }
  });
  const serialized = JSON.stringify(result);
  assert.equal(result.leakVerification.ok, true);
  assert.equal(serialized.includes("555-222-3333"), false);
  assert.equal(serialized.includes("test@example.com"), false);
});

test("explain_rule returns explanation", () => {
  const result = toolDefinitions.explain_rule.handler({
    ruleId: "OXYGEN_TRANSPORT_MISMATCH"
  });
  assert.ok(result.explanation.includes("oxygen"));
});

test("unknown patient returns error structure from backend bridge", () => {
  assert.throws(
    () => toolDefinitions.get_mock_patient.handler({ patientId: "UNKNOWN" }),
    /Patient UNKNOWN not found/
  );
});
