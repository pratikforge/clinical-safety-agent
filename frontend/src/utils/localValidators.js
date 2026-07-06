const minimumRequired = ["dischargeDate", "dischargeStatus", "destination", "transportType"];

export function validateFormShape(formData) {
  const errors = [];
  for (const field of minimumRequired) {
    if (!String(formData[field] ?? "").trim()) {
      errors.push({ field, message: `${field} is required.` });
    }
  }
  if (formData.destination === "Home" && !formData.destinationAddress.trim()) {
    errors.push({ field: "destinationAddress", message: "Home discharge requires an address." });
  }
  if (formData.newMedications.length > 18000) {
    errors.push({ field: "newMedications", message: "Medication notes are too long for review." });
  }
  return {
    errors,
    touchedFields: [],
    isCompleteEnoughForReview: errors.every((error) => error.field === "destinationAddress")
      ? Boolean(formData.dischargeDate && formData.dischargeStatus && formData.destination && formData.transportType)
      : errors.length === 0
  };
}
