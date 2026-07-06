const { GoogleGenAI } = require("@google/genai");

async function createGeminiProvider(env) {
  const ai = new GoogleGenAI({ apiKey: env.LLM_API_KEY });
  const modelName = env.LLM_MODEL || "gemini-2.5-flash";

  return {
    async completeJson(prompt, { timeoutMs }) {
      const controller = new AbortController();
      let timeoutId;
      if (timeoutMs) {
        timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      }

      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: JSON.stringify(prompt.user),
          config: {
            systemInstruction: prompt.system,
            responseMimeType: "application/json"
          },
          signal: controller.signal
        });
        
        return JSON.parse(response.text());
      } catch (error) {
        throw error;
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    }
  };
}

module.exports = { createGeminiProvider };
