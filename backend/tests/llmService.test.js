const { createLlmService } = require("../services/llmService");
const { getPatientById } = require("../services/databaseService");
const { validForm } = require("./helpers");

test("rules-only mode skips provider and returns deterministic status", async () => {
  const provider = { completeJson: jest.fn() };
  const service = createLlmService({ ALLOW_RULES_ONLY: true, LLM_API_KEY: "", LLM_TIMEOUT_MS: 15000 }, provider);
  const result = await service.review({ patient: getPatientById("MRN-100"), formData: validForm(), ruleAlerts: [] });
  expect(result.status).toBe("rules_only");
  expect(provider.completeJson).not.toHaveBeenCalled();
});

test("LLM block or pass outputs are dropped", async () => {
  const provider = {
    completeJson: jest.fn().mockResolvedValue({
      alerts: [{ type: "BLOCK", field: "destination", message: "Extra risk", rule: "LLM_ADVISORY_RISK" }]
    })
  };
  const service = createLlmService({ ALLOW_RULES_ONLY: false, LLM_API_KEY: "test", LLM_TIMEOUT_MS: 15000 }, provider);
  const result = await service.review({ patient: getPatientById("MRN-100"), formData: validForm(), ruleAlerts: [] });
  expect(result.status).toBe("used");
  expect(result.alerts).toEqual([]);
});

test("valid LLM advisory warnings are accepted", async () => {
  const provider = {
    completeJson: jest.fn().mockResolvedValue({
      alerts: [{ type: "WARN", field: "followUpDate", message: "Follow-up timing may need review.", rule: "LLM_ADVISORY_RISK" }]
    })
  };
  const service = createLlmService({ ALLOW_RULES_ONLY: false, LLM_API_KEY: "test", LLM_TIMEOUT_MS: 15000 }, provider);
  const result = await service.review({ patient: getPatientById("MRN-100"), formData: validForm(), ruleAlerts: [] });
  expect(result.alerts[0]).toEqual(expect.objectContaining({ type: "WARN", source: "llm" }));
});
