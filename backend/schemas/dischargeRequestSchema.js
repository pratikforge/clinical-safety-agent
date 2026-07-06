const { z } = require("zod");

const dischargeStatusValues = ["Routine", "Against Medical Advice", "Deceased", "Transferred"];
const destinationValues = ["Home", "Skilled Nursing Facility", "Rehab Center", "Long-Term Care", "Hospice"];
const stairsAtHomeValues = ["None", "1-5 steps", "6+ steps", "Elevator available"];
const transportTypeValues = ["Self/Family", "Standard Taxi/Rideshare", "Wheelchair Van", "Paratransit", "Ambulance"];
const equipmentValues = ["Wheelchair", "Walker", "Hospital Bed", "Oxygen", "None"];

const formDataSchema = z.object({
  dischargeDate: z.string(),
  dischargeStatus: z.enum(dischargeStatusValues),
  destination: z.enum(destinationValues),
  destinationAddress: z.string(),
  livesAlone: z.boolean(),
  stairsAtHome: z.enum(stairsAtHomeValues),
  caregiverName: z.string(),
  caregiverPhone: z.string(),
  caregiverRelationship: z.string(),
  caregiverAvailableOnDischarge: z.boolean(),
  transportType: z.enum(transportTypeValues),
  medicationReconciliationComplete: z.boolean(),
  newMedications: z.string().max(20000),
  insuranceVerified: z.boolean(),
  followUpType: z.string(),
  followUpDate: z.string(),
  followUpBooked: z.boolean(),
  equipmentNeeded: z.array(z.enum(equipmentValues)),
  homeHealthOrdered: z.boolean(),
  communityServicesReferral: z.boolean(),
  physicianSignature: z.boolean(),
  socialWorkerSignature: z.boolean()
});

const dischargeRequestSchema = z.object({
  clientRequestId: z.string().min(1),
  patientId: z.string().min(1),
  formData: formDataSchema,
  overrideBlock: z.boolean().optional(),
  overrideAdminId: z.string().optional(),
  overrideReason: z.string().optional()
});

function formatZodDetails(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message
  }));
}

module.exports = {
  dischargeRequestSchema,
  formDataSchema,
  formatZodDetails,
  dischargeStatusValues,
  destinationValues,
  stairsAtHomeValues,
  transportTypeValues,
  equipmentValues
};
