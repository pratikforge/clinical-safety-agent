const request = require("supertest");
const { createApp } = require("../app");
const { loadEnvironment } = require("../config/environment");
const { dischargeRequestSchema } = require("../schemas/dischargeRequestSchema");
const { validRequest } = require("./helpers");

const env = loadEnvironment({ ALLOW_RULES_ONLY: "true", PORT: "3001", FRONTEND_ORIGIN: "http://localhost:5173", LLM_PROVIDER: "mock" });

test("request schema includes caregiverRelationship and all editable fields", () => {
  const parsed = dischargeRequestSchema.safeParse(validRequest());
  expect(parsed.success).toBe(true);
  expect(parsed.data.formData.caregiverRelationship).toBe("Adult child");
});

test("valid request returns contract response fields", async () => {
  const app = createApp(env);
  const response = await request(app).post("/api/validate-discharge").send(validRequest()).expect(200);
  expect(response.body).toEqual(
    expect.objectContaining({
      requestId: "client-request-1",
      readinessScore: expect.any(Number),
      llmStatus: "rules_only",
      alerts: expect.any(Array),
      summary: expect.objectContaining({
        blockCount: expect.any(Number),
        warnCount: expect.any(Number),
        passCount: expect.any(Number),
        missingItemsCount: expect.any(Number),
        unresolvedRiskCount: expect.any(Number)
      })
    })
  );
});

test("invalid enum returns 422 with field details", async () => {
  const app = createApp(env);
  const body = validRequest({ formData: { ...validRequest().formData, dischargeStatus: "Unknown" } });
  const response = await request(app).post("/api/validate-discharge").send(body).expect(422);
  expect(response.body.error).toBe("Request validation failed.");
  expect(response.body.details[0]).toEqual(expect.objectContaining({ field: "formData.dischargeStatus" }));
});

test("unknown patient returns 404", async () => {
  const app = createApp(env);
  const response = await request(app).post("/api/validate-discharge").send(validRequest({ patientId: "MRN-999" })).expect(404);
  expect(response.body.error).toBe("Patient MRN-999 not found in database.");
});
