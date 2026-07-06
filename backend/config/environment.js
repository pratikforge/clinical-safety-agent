require("dotenv").config();

function boolFromEnv(value) {
  return String(value).toLowerCase() === "true";
}

function loadEnvironment(overrides = process.env) {
  const env = {
    PORT: Number(overrides.PORT || 3001),
    FRONTEND_ORIGIN: overrides.FRONTEND_ORIGIN || "http://localhost:5173",
    LLM_PROVIDER: overrides.LLM_PROVIDER || "mock",
    LLM_API_KEY: overrides.LLM_API_KEY || "",
    LLM_MODEL: overrides.LLM_MODEL || "",
    ALLOW_RULES_ONLY: boolFromEnv(overrides.ALLOW_RULES_ONLY || "true"),
    LLM_TIMEOUT_MS: Number(overrides.LLM_TIMEOUT_MS || 15000),
    RATE_LIMIT_WINDOW_MS: Number(overrides.RATE_LIMIT_WINDOW_MS || 60000),
    RATE_LIMIT_MAX: Number(overrides.RATE_LIMIT_MAX || 30)
  };

  const missing = [];
  if (!env.PORT) missing.push("PORT");
  if (!env.FRONTEND_ORIGIN) missing.push("FRONTEND_ORIGIN");
  if (!env.LLM_PROVIDER) missing.push("LLM_PROVIDER");
  if (!env.ALLOW_RULES_ONLY && (!env.LLM_API_KEY || !env.LLM_MODEL)) {
    if (!env.LLM_API_KEY) missing.push("LLM_API_KEY");
    if (!env.LLM_MODEL) missing.push("LLM_MODEL");
  }
  if (missing.length) {
    throw new Error(`Missing required environment configuration: ${missing.join(", ")}`);
  }
  return env;
}

module.exports = { loadEnvironment };
