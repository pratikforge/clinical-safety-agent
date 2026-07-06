function errorHandler() {
  return (err, req, res, next) => {
    if (res.headersSent) {
      next(err);
      return;
    }

    if (err.type === "entity.parse.failed") {
      res.status(400).json({ error: "Malformed JSON request body." });
      return;
    }

    if (err.type === "entity.too.large") {
      res.status(413).json({ error: "Request body exceeds 100kb limit." });
      return;
    }

    console.error(
      JSON.stringify({
        method: req.method,
        path: req.path,
        status: err.status || 500,
        requestId: req.requestId,
        errorCategory: err.code || err.name || "UnhandledError"
      })
    );
    res.status(err.status || 500).json({ error: err.publicMessage || "Validation service is currently unavailable. Please try again." });
  };
}

module.exports = { errorHandler };
