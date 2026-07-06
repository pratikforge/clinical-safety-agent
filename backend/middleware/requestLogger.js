function requestLogger() {
  return (req, res, next) => {
    const startedAt = Date.now();
    res.on("finish", () => {
      const durationMs = Date.now() - startedAt;
      console.log(
        JSON.stringify({
          method: req.method,
          path: req.path,
          status: res.statusCode,
          durationMs,
          requestId: req.requestId
        })
      );
    });
    next();
  };
}

module.exports = { requestLogger };
