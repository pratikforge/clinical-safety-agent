const { createApp } = require("./app");
const { loadEnvironment } = require("./config/environment");
const { createLlmProvider } = require("./providers/llmProvider");
const { createLlmService } = require("./services/llmService");

async function main() {
  const env = loadEnvironment();
  const provider = await createLlmProvider(env);
  const app = createApp(env, { llmService: createLlmService(env, provider) });

  app.listen(env.PORT, () => {
    console.log(`Validation service listening on port ${env.PORT}`);
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
