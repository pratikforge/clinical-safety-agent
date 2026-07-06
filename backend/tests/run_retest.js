const { runRules } = require("../services/ruleEngine.js");
const { scrubForLlm } = require("../services/scrubberService.js");

const mockPatient = {
  dob: "1937-01-22",
  mrn: "MRN-300",
  name: "Thomas Reid",
  livingSituation: { address: "123 Patient St", hasElevator: false },
  mobilityLevel: "wheelchair",
  oxygenRequired: true,
  fallRisk: true,
  cognitiveStatus: "confused",
  currentMedications: []
};

const formDataTricky08 = {
  dischargeDate: "2026-07-09",
  dischargeStatus: "Routine",
  destination: "Rehab Center",
  destinationAddress: "",
  livesAlone: true,
  stairsAtHome: "6+ steps",
  caregiverName: "",
  caregiverPhone: "",
  caregiverRelationship: "",
  caregiverAvailableOnDischarge: false,
  transportType: "Ambulance",
  medicationReconciliationComplete: true,
  newMedications: "",
  insuranceVerified: true,
  followUpType: "Orthopedics",
  followUpDate: "2026-07-20",
  followUpBooked: true,
  equipmentNeeded: ["Wheelchair", "Oxygen"],
  homeHealthOrdered: false,
  communityServicesReferral: false,
  physicianSignature: true,
  socialWorkerSignature: true
};

const tricky08Alerts = runRules(mockPatient, formDataTricky08);
console.log("TRICKY 08 (Rehab):", tricky08Alerts);

const formDataTricky05 = {
  caregiverName: "Robert 123-45-6789 Smith",
  caregiverPhone: "555-123-4567",
  destinationAddress: "10 Demo Street"
};

const mockPatient100 = {
  name: "Maya Brooks",
  dob: "1940-05-15",
  mrn: "MRN-100",
  livingSituation: { address: "10 Demo Street" }
};

const scrubbed = scrubForLlm(mockPatient100, formDataTricky05);
console.log("TRICKY 05 (PII Scrubber):", scrubbed.formData.caregiverName);
