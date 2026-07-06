const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { requestId } = require("./middleware/requestId");
const { createRateLimiter } = require("./middleware/rateLimiter");
const { requestLogger } = require("./middleware/requestLogger");
const { errorHandler } = require("./middleware/errorHandler");
const { commandBlocker } = require("./middleware/commandBlocker");
const { createValidateDischargeRouter } = require("./routes/validateDischarge");

function createApp(env, dependencies = {}) {
  const app = express();

  app.use(requestId());
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          frameAncestors: ["'none'"],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'", env.FRONTEND_ORIGIN]
        }
      },
      frameguard: { action: "deny" }
    })
  );
  app.use(cors({ origin: env.FRONTEND_ORIGIN }));
  app.use("/api/validate-discharge", createRateLimiter(env));
  app.use(express.json({ limit: "100kb", strict: true }));
  app.use(commandBlocker());
  app.use(requestLogger());
  app.use("/api/validate-discharge", createValidateDischargeRouter(env, dependencies));
  
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });
  
  app.use(errorHandler());

  return app;
}

module.exports = { createApp };
