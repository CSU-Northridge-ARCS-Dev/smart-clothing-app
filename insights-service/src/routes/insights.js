const { Router } = require("express");
const { getConfig } = require("../config");
const requireFirebaseUser = require("../middleware/requireFirebaseUser");
const fitbitApi = require("../lib/fitbit-api");
const {
  DATE_RE,
  fetchDayRaw,
  toDay,
  sendFitbitError,
} = require("../lib/fitbitDay");
const {
  sanitizeProfile,
  hasCoachableData,
  getFeedback,
} = require("../lib/coach");
const { logUsage } = require("../lib/usageLog");

// The SDK is loaded on first use, so tests can pass a fake client instead
function createAnthropicClient(apiKey) {
  const sdk = require("@anthropic-ai/sdk");
  const Anthropic = sdk.default || sdk;
  return new Anthropic({ apiKey });
}

function createInsightsRouter({ coachClient } = {}) {
  const router = Router();
  let client = coachClient || null;

  // POST /api/insights/generate { date, profile } - Claude feedback on one
  // day. Needs the Fitbit tokens in the same headers as /api/fitbit/day.
  router.post("/generate", requireFirebaseUser, async (req, res) => {
    const { date, profile } = req.body || {};
    if (typeof date !== "string" || !DATE_RE.test(date)) {
      return res.status(400).json({ error: "INVALID_DATE" });
    }

    const accessToken = req.get("X-Fitbit-Token");
    if (!accessToken) {
      return res.status(401).json({ error: "FITBIT_NOT_CONNECTED" });
    }
    const refreshToken = req.get("X-Fitbit-Refresh-Token");

    const { anthropicApiKey, coachModel, usageLogPath } = getConfig();
    if (!coachModel || (!client && !anthropicApiKey)) {
      console.error("Claude feedback needs ANTHROPIC_API_KEY and COACH_MODEL");
      return res.status(500).json({ error: "COACH_NOT_CONFIGURED" });
    }

    let day;
    let extra = {};
    try {
      const { result, refreshedTokens } = await fitbitApi.withFreshToken(
        { accessToken, refreshToken },
        (token) => fetchDayRaw(token, date),
      );
      if (refreshedTokens) extra = { refreshedTokens };
      day = toDay(date, result);
    } catch (error) {
      return sendFitbitError(res, error, "Insights day");
    }

    if (!hasCoachableData(day)) {
      return res.json({ insight: null, reason: "NO_DATA", ...extra });
    }

    try {
      if (!client) client = createAnthropicClient(anthropicApiKey);
      const { insight, usage } = await getFeedback(client, {
        model: coachModel,
        profile: sanitizeProfile(profile),
        day,
      });
      logUsage({ date, ...usage }, usageLogPath ? { filePath: usageLogPath } : {});
      res.json({ insight, usage, ...extra });
    } catch (error) {
      if (error.message === "COACH_API_ERROR" || error.message === "COACH_REFUSED") {
        console.error(`Claude feedback failed (${error.message}):`, error.cause || "");
        return res.status(502).json({ error: error.message, ...extra });
      }
      console.error("Claude feedback error:", error);
      res.status(500).json({ error: "INTERNAL_ERROR", ...extra });
    }
  });

  return router;
}

module.exports = { createInsightsRouter };
