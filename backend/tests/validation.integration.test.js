const request = require("supertest");
const { createApp } = require("../app");
const { loadEnvironment } = require("../config/environment");
const { validRequest } = require("./helpers");

function appWith(max = 30) {
  const env = loadEnvironment({
    ALLOW_RULES_ONLY: "true",
    PORT: "3001",
    FRONTEND_ORIGIN: "http://localhost:5173",
    LLM_PROVIDER: "mock",
    RATE_LIMIT_MAX: String(max)
  });
  return createApp(env);
}

test("malformed JSON returns 400", async () => {
  const app = appWith();
  const response = await request(app).post("/api/validate-discharge").set("Content-Type", "application/json").send("{bad").expect(400);
  expect(response.body.error).toBe("Malformed JSON request body.");
});

test("object patientId is rejected by schema validation", async () => {
  const app = appWith();
  const response = await request(app).post("/api/validate-discharge").send(validRequest({ patientId: { $gt: "" } })).expect(422);
  expect(response.body.error).toBe("Request validation failed.");
});

test("rate limit returns 429 after configured max", async () => {
  const app = appWith(2);
  await request(app).post("/api/validate-discharge").send(validRequest({ clientRequestId: "a" })).expect(200);
  await request(app).post("/api/validate-discharge").send(validRequest({ clientRequestId: "b" })).expect(200);
  const response = await request(app).post("/api/validate-discharge").send(validRequest({ clientRequestId: "c" })).expect(429);
  expect(response.body.error).toBe("Rate limit exceeded. Max 30 requests per minute.");
});
