import { z } from "zod";
import { callBackendBridge } from "./backendBridge.js";

export const formDataSchema = z.object({
  dischargeDate: z.string(),
  dischargeStatus: z.string(),
  destination: z.string(),
  destinationAddress: z.string(),
  livesAlone: z.boolean(),
  stairsAtHome: z.string(),
  caregiverName: z.string(),
  caregiverPhone: z.string(),
  caregiverRelationship: z.string(),
  caregiverAvailableOnDischarge: z.boolean(),
  transportType: z.string(),
  medicationReconciliationComplete: z.boolean(),
  newMedications: z.string(),
  insuranceVerified: z.boolean(),
  followUpType: z.string(),
  followUpDate: z.string(),
  followUpBooked: z.boolean(),
  equipmentNeeded: z.array(z.string()),
  homeHealthOrdered: z.boolean(),
  communityServicesReferral: z.boolean(),
  physicianSignature: z.boolean(),
  socialWorkerSignature: z.boolean()
});

export const toolDefinitions = {
  get_mock_patient: {
    title: "Get mock patient",
    description: "Return a synthetic mock patient record by MRN.",
    inputSchema: z.object({ patientId: z.string() }),
    handler: ({ patientId }) => callBackendBridge("get_mock_patient", { patientId })
  },
  validate_discharge_plan: {
    title: "Validate discharge plan",
    description: "Run the authoritative backend discharge safety validation contract.",
    inputSchema: z.object({ patientId: z.string(), formData: formDataSchema }),
    handler: ({ patientId, formData }) =>
      callBackendBridge("validate_discharge_plan", { patientId, formData })
  },
  scrub_discharge_payload: {
    title: "Scrub discharge payload",
    description: "Return de-identified discharge payload metadata and leak verification.",
    inputSchema: z.object({ patientId: z.string(), formData: formDataSchema }),
    handler: ({ patientId, formData }) =>
      callBackendBridge("scrub_discharge_payload", { patientId, formData })
  },
  explain_rule: {
    title: "Explain rule",
    description: "Explain a deterministic safety rule without patient-specific PII.",
    inputSchema: z.object({ ruleId: z.string() }),
    handler: ({ ruleId }) => callBackendBridge("explain_rule", { ruleId })
  }
};
