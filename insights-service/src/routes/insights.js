const { Router } = require("express");
const { getConfig } = require("../config");
const requireFirebaseUser = require("../middleware/requireFirebaseUser");
const { DATE_RE } = require("../lib/dates");
const {
  sanitizeProfile,
  hasCoachableData,
  getFeedback,
} = require("../lib/coach");
const { validateDay } = require("../lib/validateDay");
const { logUsage } = require("../lib/usageLog");

// Where a day sent by the phone can come from
const PHONE_SOURCES = ["health_connect", "healthkit"];

// The SDK is loaded on first use, so tests can pass a fake client instead
function createAnthropicClient(apiKey) {
  const sdk = require("@anthropic-ai/sdk");
  const Anthropic = sdk.default || sdk;
  return new Anthropic({ apiKey });
}

function createInsightsRouter({ coachClient } = {}) {
  const router = Router();
  let client = coachClient || null;

  // The Claude settings, or null after answering 500 when they're missing
  const coachConfig = (res) => {
    const config = getConfig();
    if (!config.coachModel || (!client && !config.anthropicApiKey)) {
      console.error("Claude feedback needs ANTHROPIC_API_KEY and COACH_MODEL");
      res.status(500).json({ error: "COACH_NOT_CONFIGURED" });
      return null;
    }
    return config;
  };

  // Answers NO_DATA without a Claude call, or asks for feedback, logs the
  // usage and answers
  const sendFeedback = async (res, config, { date, profile, day, source }) => {
    if (!hasCoachableData(day)) {
      return res.json({ insight: null, reason: "NO_DATA" });
    }

    const { anthropicApiKey, coachModel, usageLogPath } = config;
    try {
      if (!client) client = createAnthropicClient(anthropicApiKey);
      const { insight, usage } = await getFeedback(client, {
        model: coachModel,
        profile: sanitizeProfile(profile),
        day,
      });
      logUsage(
        { date, ...usage, source },
        usageLogPath ? { filePath: usageLogPath } : {},
      );
      res.json({ insight, usage });
    } catch (error) {
      if (error.message === "COACH_API_ERROR" || error.message === "COACH_REFUSED") {
        console.error(`Claude feedback failed (${error.message}):`, error.cause || "");
        return res.status(502).json({ error: error.message });
      }
      console.error("Claude feedback error:", error);
      res.status(500).json({ error: "INTERNAL_ERROR" });
    }
  };

  // POST /api/insights/generate-from-day { date, profile, day, source } -
  // Claude feedback on a day the phone built itself. source says where the
  // phone read it from.
  router.post("/generate-from-day", requireFirebaseUser, async (req, res) => {
    const { date, profile, day: rawDay, source } = req.body || {};
    if (typeof date !== "string" || !DATE_RE.test(date)) {
      return res.status(400).json({ error: "INVALID_DATE" });
    }
    if (!PHONE_SOURCES.includes(source)) {
      return res.status(400).json({ error: "INVALID_SOURCE" });
    }

    let day;
    try {
      day = validateDay(rawDay, date);
    } catch (error) {
      return res.status(400).json({ error: "INVALID_DAY" });
    }

    const config = coachConfig(res);
    if (!config) return;

    await sendFeedback(res, config, { date, profile, day, source });
  });

  return router;
}

module.exports = { createInsightsRouter };
