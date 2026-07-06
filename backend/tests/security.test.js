/**
 * Security tests mapped to STRIDE framework and OWASP Top 10.
 *
 * S-1  (Spoofing / CORS bypass)    — OWASP #1 Broken Access Control
 * O-3  (Oversized payload)         — OWASP #5 Security Misconfiguration
 * S-2  (Audit log assertion)       — STRIDE Repudiation / OWASP #9 Logging Failures
 */
const request = require("supertest");
const { createApp } = require("../app");
const { loadEnvironment } = require("../config/environment");
const { validRequest } = require("./helpers");

function buildEnv(overrides = {}) {
  return loadEnvironment({
    ALLOW_RULES_ONLY: "true",
    PORT: "3001",
    FRONTEND_ORIGIN: "http://localhost:5173",
    LLM_PROVIDER: "mock",
    RATE_LIMIT_MAX: "30",
    ...overrides
  });
}

// ─── S-1: CORS Bypass (STRIDE → Spoofing) ───────────────────────────
describe("CORS enforcement (STRIDE S-1)", () => {
  test("preflight from allowed origin receives CORS headers", async () => {
    const app = createApp(buildEnv());
    const response = await request(app)
      .options("/api/validate-discharge")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "POST");
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
  });

  test("preflight from disallowed origin is rejected", async () => {
    const app = createApp(buildEnv());
    const response = await request(app)
      .options("/api/validate-discharge")
      .set("Origin", "http://evil-site.com")
      .set("Access-Control-Request-Method", "POST");
    // The cors middleware with a static origin will not reflect a mismatched origin
    // It either omits the header or sets it to the configured origin (not the attacker's)
    const acao = response.headers["access-control-allow-origin"];
    expect(acao).not.toBe("http://evil-site.com");
  });
});

// ─── O-3: Oversized Payload (OWASP #5 → Security Misconfiguration) ──
describe("Payload size limit (OWASP O-3)", () => {
  test("request exceeding 100kb JSON limit is rejected", async () => {
    const app = createApp(buildEnv());
    // Build a payload that exceeds the 100kb limit
    const oversizedPayload = {
      ...validRequest(),
      formData: {
        ...validRequest().formData,
        newMedications: "A".repeat(150 * 1024) // ~150kb string
      }
    };
    const response = await request(app)
      .post("/api/validate-discharge")
      .send(oversizedPayload);
    // Express returns 413 (Payload Too Large) when body exceeds limit
    expect([400, 413, 422]).toContain(response.status);
  });
});

// ─── S-2: Audit Log Assertion (STRIDE → Repudiation / OWASP #9) ─────
describe("Request audit logging (STRIDE S-2 / OWASP #9)", () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("successful request is logged with requestId and status", async () => {
    const app = createApp(buildEnv());
    await request(app)
      .post("/api/validate-discharge")
      .send(validRequest())
      .expect(200);

    const logEntries = consoleSpy.mock.calls.map(call => call[0]);
    const logEntry = logEntries.find(entry =>
      typeof entry === "string" && entry.includes('"status":200')
    );
    expect(logEntry).toBeDefined();
    // Verify the log entry contains a requestId
    const parsed = JSON.parse(logEntry);
    expect(parsed.requestId).toBeDefined();
    expect(parsed.status).toBe(200);
    expect(parsed.method).toBe("POST");
  });

  test("failed request (404) is logged with requestId and error status", async () => {
    const app = createApp(buildEnv());
    await request(app)
      .post("/api/validate-discharge")
      .send(validRequest({ patientId: "MRN-NONEXISTENT" }))
      .expect(404);

    const logEntries = consoleSpy.mock.calls.map(call => call[0]);
    const logEntry = logEntries.find(entry =>
      typeof entry === "string" && entry.includes('"status":404')
    );
    expect(logEntry).toBeDefined();
    const parsed = JSON.parse(logEntry);
    expect(parsed.requestId).toBeDefined();
    expect(parsed.status).toBe(404);
  });
});
