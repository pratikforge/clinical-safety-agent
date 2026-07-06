export const FIELD_OPTIONS = {
  dischargeStatus: ["Routine", "Against Medical Advice", "Deceased", "Transferred"],
  destination: ["Home", "Skilled Nursing Facility", "Rehab Center", "Long-Term Care", "Hospice"],
  stairsAtHome: ["None", "1-5 steps", "6+ steps", "Elevator available"],
  transportType: ["Self/Family", "Standard Taxi/Rideshare", "Wheelchair Van", "Paratransit", "Ambulance"],
  equipmentNeeded: ["Wheelchair", "Walker", "Hospital Bed", "Oxygen", "None"]
};

export const initialFormData = {
  dischargeDate: "",
  dischargeStatus: "Routine",
  destination: "Home",
  destinationAddress: "",
  livesAlone: true,
  stairsAtHome: "6+ steps",
  caregiverName: "",
  caregiverPhone: "",
  caregiverRelationship: "",
  caregiverAvailableOnDischarge: false,
  transportType: "Standard Taxi/Rideshare",
  medicationReconciliationComplete: false,
  newMedications: "",
  insuranceVerified: false,
  followUpType: "",
  followUpDate: "",
  followUpBooked: false,
  equipmentNeeded: ["None"],
  homeHealthOrdered: false,
  communityServicesReferral: false,
  physicianSignature: false,
  socialWorkerSignature: false
};

export const requestFieldNames = Object.keys(initialFormData);
