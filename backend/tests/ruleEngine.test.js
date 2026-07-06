const { getPatientById } = require("../services/databaseService");
const { runRules } = require("../services/ruleEngine");
const { computeReadinessScore } = require("../services/scoringService");
const { validForm } = require("./helpers");

function rulesFor(patientId, overrides) {
  return runRules(getPatientById(patientId), validForm(overrides));
}

test("safe complete plan returns pass and high readiness", () => {
  const alerts = rulesFor("MRN-100", {});
  expect(alerts).toEqual(expect.arrayContaining([expect.objectContaining({ rule: "RULES_CLEAR", type: "PASS" })]));
  expect(computeReadinessScore(alerts)).toBeGreaterThanOrEqual(85);
});

test("oxygen patient cannot use taxi transport", () => {
  const alerts = rulesFor("MRN-300", { transportType: "Standard Taxi/Rideshare" });
  expect(alerts).toEqual(expect.arrayContaining([expect.objectContaining({ rule: "OXYGEN_TRANSPORT_MISMATCH", type: "BLOCK" })]));
});

test("wheelchair patient discharged home with stairs and no elevator is blocked", () => {
  const alerts = rulesFor("MRN-300", { stairsAtHome: "6+ steps" });
  expect(alerts).toEqual(expect.arrayContaining([expect.objectContaining({ rule: "MOBILITY_STAIRS_NO_ELEVATOR", type: "BLOCK" })]));
});

test("fall risk living alone without caregiver is blocked", () => {
  const alerts = rulesFor("MRN-200", { livesAlone: true, caregiverName: "", caregiverAvailableOnDischarge: false });
  expect(alerts).toEqual(expect.arrayContaining([expect.objectContaining({ rule: "FALL_RISK_LIVES_ALONE_NO_CAREGIVER", type: "BLOCK" })]));
});

test("required signatures and medication reconciliation are blocking", () => {
  const alerts = rulesFor("MRN-100", {
    medicationReconciliationComplete: false,
    physicianSignature: false,
    socialWorkerSignature: false
  });
  expect(alerts).toEqual(expect.arrayContaining([expect.objectContaining({ rule: "MED_RECONCILIATION_INCOMPLETE" })]));
  expect(alerts).toEqual(expect.arrayContaining([expect.objectContaining({ rule: "MISSING_PHYSICIAN_SIGNATURE" })]));
  expect(alerts).toEqual(expect.arrayContaining([expect.objectContaining({ rule: "MISSING_SOCIAL_WORKER_SIGNATURE" })]));
});

test("high tier medications and unbooked follow-up are warnings", () => {
  const alerts = rulesFor("MRN-200", { insuranceVerified: false, followUpBooked: false });
  expect(alerts).toEqual(expect.arrayContaining([expect.objectContaining({ rule: "HIGH_TIER_MED_INSURANCE_UNVERIFIED", type: "WARN" })]));
  expect(alerts).toEqual(expect.arrayContaining([expect.objectContaining({ rule: "FOLLOWUP_NOT_BOOKED", type: "WARN" })]));
});
