// Ported from Momentum backend/routes/fitbit.js. Firebase auth replaces Auth0,
// tokens go back to the app instead of a database, and returnTo replaces the
// fixed momentum:// scheme.
const { Router } = require("express");
const { getConfig } = require("../config");
const requireFirebaseUser = require("../middleware/requireFirebaseUser");
const { createStateStore } = require("../lib/oauthState");
const fitbitApi = require("../lib/fitbit-api");
const { normalizeDay } = require("../lib/normalizeDay");

const FITBIT_AUTH_URL = "https://www.fitbit.com/oauth2/authorize";
const FITBIT_SCOPES = "sleep heartrate activity profile";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// The callback puts tokens in the redirect URL, so only app schemes are allowed
function parseReturnTo(returnTo) {
  if (!returnTo) return null;
  let url;
  try {
    url = new URL(returnTo);
  } catch {
    return null;
  }
  const scheme = url.protocol.replace(/:$/, "").toLowerCase();
  return getConfig().allowedReturnSchemes.includes(scheme) ? url : null;
}

function redirectWith(res, returnTo, params) {
  const url = new URL(returnTo);
  for (const [key, value] of Object.entries(params)) {
    if (value != null) url.searchParams.set(key, String(value));
  }
  res.redirect(url.toString());
}

// Maps fitbit-api error codes to responses. Refreshed tokens are passed back
// even on failure, because the old refresh token is already spent.
function sendFitbitError(res, error, context) {
  const extra = error.refreshedTokens
    ? { refreshedTokens: error.refreshedTokens }
    : {};
  if (error.message === "FITBIT_REAUTH_REQUIRED") {
    return res.status(401).json({ error: "FITBIT_REAUTH_REQUIRED", ...extra });
  }
  if (error.message === "FITBIT_API_ERROR") {
    return res.status(502).json({ error: "FITBIT_API_ERROR", ...extra });
  }
  console.error(`${context} error:`, error);
  return res.status(500).json({ error: "INTERNAL_ERROR", ...extra });
}

function createFitbitRouter({ stateStore = createStateStore() } = {}) {
  const router = Router();

  // GET /api/fitbit/auth-url?returnTo= - Fitbit authorize URL for this user
  router.get("/auth-url", requireFirebaseUser, (req, res) => {
    const returnTo = parseReturnTo(req.query.returnTo);
    if (!returnTo) {
      return res.status(400).json({ error: "INVALID_RETURN_TO" });
    }

    const { fitbitClientId, fitbitRedirectUri } = getConfig();
    const state = stateStore.create({
      uid: req.uid,
      returnTo: returnTo.toString(),
    });

    const params = new URLSearchParams({
      response_type: "code",
      client_id: fitbitClientId,
      redirect_uri: fitbitRedirectUri,
      scope: FITBIT_SCOPES,
      state,
    });

    res.json({ url: `${FITBIT_AUTH_URL}?${params.toString()}` });
  });

  // GET /api/fitbit/callback - Fitbit redirects here (public endpoint)
  router.get("/callback", async (req, res) => {
    const { code, state, error } = req.query;

    const entry = state ? stateStore.consume(state) : null;
    if (!entry) {
      return res
        .status(400)
        .type("text")
        .send("This Fitbit login link expired. Go back to the app and try again.");
    }

    if (error || !code) {
      return redirectWith(res, entry.returnTo, {
        error: error || "missing_code",
      });
    }

    try {
      const tokens = await fitbitApi.exchangeCodeForTokens(code);
      redirectWith(res, entry.returnTo, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        fitbitUserId: tokens.fitbitUserId,
      });
    } catch (err) {
      console.error("Fitbit callback error:", err.message);
      redirectWith(res, entry.returnTo, { error: "token_exchange_failed" });
    }
  });

  // POST /api/fitbit/refresh { refreshToken } - new token pair
  router.post("/refresh", requireFirebaseUser, async (req, res) => {
    const refreshToken = req.body && req.body.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ error: "MISSING_REFRESH_TOKEN" });
    }

    try {
      res.json(await fitbitApi.refreshTokens(refreshToken));
    } catch (error) {
      sendFitbitError(res, error, "Fitbit refresh");
    }
  });

  // GET /api/fitbit/day/:date - normalized sleep, heart and workouts
  router.get("/day/:date", requireFirebaseUser, async (req, res) => {
    const { date } = req.params;
    if (!DATE_RE.test(date)) {
      return res.status(400).json({ error: "INVALID_DATE" });
    }

    const accessToken = req.get("X-Fitbit-Token");
    if (!accessToken) {
      return res.status(401).json({ error: "FITBIT_NOT_CONNECTED" });
    }
    const refreshToken = req.get("X-Fitbit-Refresh-Token");

    try {
      const { result, refreshedTokens } = await fitbitApi.withFreshToken(
        { accessToken, refreshToken },
        (token) =>
          Promise.all([
            fitbitApi.getSleep(token, date),
            fitbitApi.getHeart(token, date),
            fitbitApi.getActivities(token, date),
          ]),
      );
      const [sleep, heart, activities] = result;
      const body = { day: normalizeDay(date, sleep, heart, activities) };
      if (refreshedTokens) body.refreshedTokens = refreshedTokens;
      res.json(body);
    } catch (error) {
      sendFitbitError(res, error, "Fitbit day");
    }
  });

  return router;
}

module.exports = { createFitbitRouter, FITBIT_SCOPES };
