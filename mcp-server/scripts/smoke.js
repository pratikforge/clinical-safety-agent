import { toolDefinitions } from "../src/tools.js";

const safeForm = {
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
  socialWorkerSignature: true
};

async function runSmokeTest() {
  console.log("=== MCP Server Smoke Test ===\n");

  try {
    console.log("1. Testing get_mock_patient (MRN-100)...");
    const patient = await toolDefinitions.get_mock_patient.handler({ patientId: "MRN-100" });
    console.log(`Success: Found patient ${patient.name} (ID: ${patient.patientId})\n`);

    console.log("2. Testing validate_discharge_plan (Safe Form)...");
    const validation = await toolDefinitions.validate_discharge_plan.handler({
      patientId: "MRN-100",
      formData: safeForm
    });
    console.log(`Success: Readiness Score is ${validation.readinessScore}\n`);

    console.log("3. Testing scrub_discharge_payload...");
    const scrub = await toolDefinitions.scrub_discharge_payload.handler({
      patientId: "MRN-100",
      formData: safeForm
    });
    console.log(`Success: Scrub verification OK = ${scrub.leakVerification.ok}\n`);

    console.log("4. Testing explain_rule (OXYGEN_TRANSPORT_MISMATCH)...");
    const explanation = await toolDefinitions.explain_rule.handler({ ruleId: "OXYGEN_TRANSPORT_MISMATCH" });
    console.log(`Success: Rule explanation: "${explanation.explanation}"\n`);
    
    console.log("All smoke tests passed successfully.");
  } catch (error) {
    console.error("Smoke test failed:", error);
    process.exit(1);
  }
}

runSmokeTest();
