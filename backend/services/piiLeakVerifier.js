function flattenValues(value) {
  if (Array.isArray(value)) return value.flatMap(flattenValues);
  if (value && typeof value === "object") return Object.values(value).flatMap(flattenValues);
  if (value === null || value === undefined) return [];
  return [String(value)];
}

function verifyNoPii(payload, originalValues) {
  const serialized = JSON.stringify(payload).toLowerCase();
  const leaked = originalValues
    .filter((value) => typeof value === "string" && value.trim().length >= 3)
    .find((value) => serialized.includes(value.toLowerCase()));
  return { ok: !leaked, leakedValue: leaked || null };
}

function collectOriginalPii(patient, formData) {
  return [
    patient.name,
    patient.dob,
    patient.mrn,
    patient.livingSituation.address,
    formData.caregiverName,
    formData.caregiverPhone,
    formData.destinationAddress,
    ...flattenValues(formData).filter((value) => /\d{3}[-\s]?\d{2}[-\s]?\d{4}|@|\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(value))
  ].filter(Boolean);
}

module.exports = { verifyNoPii, collectOriginalPii };
