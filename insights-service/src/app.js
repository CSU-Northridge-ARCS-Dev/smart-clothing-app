const express = require("express");
const healthRouter = require("./routes/health");
const { createFitbitRouter } = require("./routes/fitbit");
const { createInsightsRouter } = require("./routes/insights");

// Builds the Express app without listening, so supertest can drive it
function createApp(options = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json());

  app.use("/api/health", healthRouter);
  app.use("/api/fitbit", createFitbitRouter(options));
  app.use("/api/insights", createInsightsRouter(options));

  app.use((req, res) => {
    res.status(404).json({ error: "NOT_FOUND" });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
      return res.status(400).json({ error: "INVALID_JSON" });
    }
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  });

  return app;
}

module.exports = { createApp };
