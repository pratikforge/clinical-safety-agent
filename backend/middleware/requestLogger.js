const logger = require("../utils/logger");

function requestLogger() {
  return (req, res, next) => {
    const startedAt = Date.now();
    res.on("finish", () => {
      const durationMs = Date.now() - startedAt;
      logger.info(`HTTP ${req.method} ${req.path} ${res.statusCode} ${durationMs}ms`, {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs,
        requestId: req.requestId
      });
    });
    next();
  };
}

module.exports = { requestLogger };
