const { scrubForLlm } = require("../services/scrubberService");
const { collectOriginalPii, verifyNoPii } = require("../services/piiLeakVerifier");
const { getPatientById } = require("../services/databaseService");
const { validForm } = require("./helpers");

test("scrubs patient and caregiver PII before outbound payload", () => {
  const patient = getPatientById("MRN-200");
  const formData = validForm({
    caregiverName: "Nina Vance",
    caregiverPhone: "555-222-3333",
    destinationAddress: "22 Cedar Test Avenue",
    newMedications: "Contact nina@example.com. SSN 123-45-6789."
  });
  const scrubbed = scrubForLlm(patient, formData);
  const piiValues = collectOriginalPii(patient, formData);
  expect(verifyNoPii(scrubbed, piiValues).ok).toBe(true);
  expect(JSON.stringify(scrubbed)).toContain("[PATIENT_A]");
  expect(JSON.stringify(scrubbed)).toContain("[PHONE_REDACTED]");
});

test("word-boundary name scrub does not redact unrelated words", () => {
  const patient = { ...getPatientById("MRN-100"), name: "Art" };
  const scrubbed = scrubForLlm(patient, validForm({ newMedications: "artery medication discussion with Art" }));
  expect(scrubbed.formData.newMedications).toContain("artery");
  expect(scrubbed.formData.newMedications).toContain("[PATIENT_A]");
});
