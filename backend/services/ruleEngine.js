const REQUIRED_FIELDS = ["dischargeDate", "dischargeStatus", "destination", "transportType"];

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function alert(type, field, message, rule) {
  return { type, field, message, rule, source: "rules" };
}

function runRules(patient, formData) {
  const alerts = [];

  for (const field of REQUIRED_FIELDS) {
    if (isBlank(formData[field])) {
      alerts.push(alert("BLOCK", field, `${field} is required before discharge review.`, "REQUIRED_FIELD_MISSING"));
    }
  }

  if (formData.destination === "Home" && isBlank(formData.destinationAddress)) {
    alerts.push(alert("BLOCK", "destinationAddress", "Home discharge requires a destination address.", "DESTINATION_ADDRESS_MISSING"));
  }

  if (!formData.medicationReconciliationComplete) {
    alerts.push(alert("BLOCK", "medicationReconciliationComplete", "Medication reconciliation must be complete before discharge.", "MED_RECONCILIATION_INCOMPLETE"));
  }

  if (!formData.physicianSignature) {
    alerts.push(alert("BLOCK", "physicianSignature", "Physician signature is required before final discharge.", "MISSING_PHYSICIAN_SIGNATURE"));
  }

  if (!formData.socialWorkerSignature) {
    alerts.push(alert("BLOCK", "socialWorkerSignature", "Social worker signature is required before final discharge.", "MISSING_SOCIAL_WORKER_SIGNATURE"));
  }

  if (patient.oxygenRequired && ["Self/Family", "Standard Taxi/Rideshare"].includes(formData.transportType)) {
    alerts.push(alert("BLOCK", "transportType", "Oxygen need is incompatible with the selected transport type.", "OXYGEN_TRANSPORT_MISMATCH"));
  }

  const homeWithStairs =
    formData.destination === "Home" &&
    formData.stairsAtHome !== "None" &&
    formData.stairsAtHome !== "Elevator available" &&
    !patient.livingSituation.hasElevator;
  if (homeWithStairs && ["wheelchair", "bedbound"].includes(patient.mobilityLevel)) {
    alerts.push(alert("BLOCK", "destination", "Home discharge with stairs and no elevator is unsafe for current mobility.", "MOBILITY_STAIRS_NO_ELEVATOR"));
  }

  const caregiverAvailable = !isBlank(formData.caregiverName) && formData.caregiverAvailableOnDischarge;
  if (formData.destination === "Home" && formData.livesAlone && patient.fallRisk && !caregiverAvailable) {
    alerts.push(alert("BLOCK", "caregiverName", "Fall-risk patient living alone needs an available caregiver at home.", "FALL_RISK_LIVES_ALONE_NO_CAREGIVER"));
  }

  if (formData.destination === "Home" && ["confused", "dementia"].includes(patient.cognitiveStatus) && formData.livesAlone && !formData.homeHealthOrdered) {
    alerts.push(alert("BLOCK", "homeHealthOrdered", "Cognitive risk with living alone at home requires home health support.", "COGNITIVE_LIVES_ALONE_NO_HOME_HEALTH"));
  }

  const hasHighTierMedication =
    patient.currentMedications.some((medication) => medication.tier >= 3) ||
    /tier\s*[34]|apixaban|oxycodone/i.test(formData.newMedications || "");
  if (hasHighTierMedication && !formData.insuranceVerified) {
    alerts.push(alert("WARN", "insuranceVerified", "High-tier medication coverage should be verified before discharge.", "HIGH_TIER_MED_INSURANCE_UNVERIFIED"));
  }

  if (!isBlank(formData.followUpType) && !formData.followUpBooked) {
    alerts.push(alert("WARN", "followUpBooked", "Follow-up is specified but not booked.", "FOLLOWUP_NOT_BOOKED"));
  }

  const equipment = new Set(formData.equipmentNeeded || []);
  const needsMobilityEquipment = ["walker", "wheelchair", "bedbound"].includes(patient.mobilityLevel);
  const missingEquipment =
    (patient.oxygenRequired && !equipment.has("Oxygen")) ||
    (needsMobilityEquipment && equipment.has("None") && !formData.homeHealthOrdered);
  if (missingEquipment) {
    alerts.push(alert("WARN", "equipmentNeeded", "Equipment or service orders do not match mobility or oxygen needs.", "EQUIPMENT_OR_SERVICE_GAP"));
  }

  if (!alerts.some((item) => item.type === "BLOCK" || item.type === "WARN")) {
    alerts.push(alert("PASS", "dischargePlan", "No blocking discharge safety issues were found in the configured rules.", "RULES_CLEAR"));
  }

  return alerts;
}

module.exports = { runRules, REQUIRED_FIELDS };
