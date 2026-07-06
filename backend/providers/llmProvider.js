const { createMockProvider } = require("./mockProvider");

async function createLlmProvider(env) {
  if (env.LLM_PROVIDER === "mock" || env.ALLOW_RULES_ONLY) {
    return createMockProvider();
  }
  if (env.LLM_PROVIDER === "gemini") {
    const { createGeminiProvider } = require("./geminiProvider");
    return createGeminiProvider(env);
  }
  throw new Error("Configured LLM provider is not implemented in this prototype.");
}

module.exports = { createLlmProvider };
