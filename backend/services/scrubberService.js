function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceLiteral(text, value, replacement, wordBoundary = false) {
  if (!value || String(value).trim().length < 2) return text;
  const pattern = wordBoundary ? `(?<![\\p{L}\\p{N}])${escapeRegExp(value)}(?![\\p{L}\\p{N}])` : escapeRegExp(value);
  return text.replace(new RegExp(pattern, "giu"), replacement);
}

function scrubObject(input, replacements) {
  const text = JSON.stringify(input);
  let scrubbed = text;

  // 1. Literal exact matches FIRST (Names, exact addresses)
  for (const replacement of replacements) {
    scrubbed = replaceLiteral(scrubbed, replacement.value, replacement.token, replacement.wordBoundary);
  }

  // 2. Regex pattern matches SECOND (SSN, Phone, Email, DOB)
  scrubbed = scrubbed
    .replace(/\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g, "[SSN_REDACTED]")
    .replace(/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, "[EMAIL_REDACTED]")
    .replace(/\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, "[PHONE_REDACTED]")
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, "[DOB_REDACTED]");

  return JSON.parse(scrubbed);
}

function scrubForLlm(patient, formData) {
  const replacements = [
    { value: patient.name, token: "[PATIENT_A]", wordBoundary: true },
    { value: patient.dob, token: "[DOB_REDACTED]" },
    { value: patient.mrn, token: "[MRN_REDACTED]" },
    { value: patient.livingSituation.address, token: "[ADDRESS_REDACTED]" },
    { value: formData.caregiverName, token: "[CAREGIVER_A]", wordBoundary: true },
    { value: formData.caregiverPhone, token: "[PHONE_REDACTED]" },
    { value: formData.destinationAddress, token: "[ADDRESS_REDACTED]" }
  ];

  return {
    patient: scrubObject(patient, replacements),
    formData: scrubObject(formData, replacements)
  };
}

module.exports = { scrubForLlm };
