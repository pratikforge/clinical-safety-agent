const rateLimit = require("express-rate-limit");

function createRateLimiter(env) {
  return rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Rate limit exceeded. Max 30 requests per minute." }
  });
}

module.exports = { createRateLimiter };
