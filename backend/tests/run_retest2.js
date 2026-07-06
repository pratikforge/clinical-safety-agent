const { runRules } = require("../services/ruleEngine.js");

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

const formDataTricky03 = {
  dischargeDate: "2026-07-09",
  dischargeStatus: "Routine",
  destination: "Home",
  destinationAddress: "88 Synthetic Patient Road",
  livesAlone: true,
  stairsAtHome: "6+ steps",
  caregiverName: "Margaret Reid",
  caregiverPhone: "555-222-3333",
  caregiverRelationship: "Daughter",
  caregiverAvailableOnDischarge: true,
  transportType: "Wheelchair Van",
  medicationReconciliationComplete: true,
  newMedications: "",
  insuranceVerified: true,
  followUpType: "Pulmonology",
  followUpDate: "2026-07-16",
  followUpBooked: true,
  equipmentNeeded: ["Wheelchair", "Oxygen"],
  homeHealthOrdered: true,
  communityServicesReferral: true,
  physicianSignature: true,
  socialWorkerSignature: true
};

const formDataTricky04 = { ...formDataTricky03, stairsAtHome: "Elevator available", transportType: "Ambulance" };

console.log("TRICKY 03:", runRules(mockPatient, formDataTricky03));
console.log("TRICKY 04:", runRules(mockPatient, formDataTricky04));
