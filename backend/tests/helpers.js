function validForm(overrides = {}) {
  return {
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
    socialWorkerSignature: true,
    ...overrides
  };
}

function validRequest(overrides = {}) {
  return {
    clientRequestId: "client-request-1",
    patientId: "MRN-100",
    formData: validForm(),
    ...overrides
  };
}

module.exports = { validForm, validRequest };
