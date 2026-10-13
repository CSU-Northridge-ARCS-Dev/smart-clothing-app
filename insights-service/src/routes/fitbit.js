// tokens go back to the app 
const { Router } = require("express");
const { getConfig } = require("../config");
const requireFirebaseUser = require("../middleware/requireFirebaseUser");
const { createStateStore } = require("../lib/oauthState");
const fitbitApi = require("../lib/fitbit-api");
const {
  DATE_RE,
  fetchDayRaw,
  toDay,
  sendFitbitError,
} = require("../lib/fitbitDay");
const { normalizeWeek, weekDates } = require("../lib/normalizeWeek");
const {
  workoutDetail,
  monthWorkouts,
  tcxLacksHeartRate,
} = require("../lib/workoutDetail");
const { workoutWindow } = require("../lib/heartIntraday");

const FITBIT_AUTH_URL = "https://www.fitbit.com/oauth2/authorize";
// location lets the activity TCX include the GPS route
const FITBIT_SCOPES = "sleep heartrate activity profile location";
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const LOG_ID_RE = /^\d+$/;
// Fitbit's maximum page size for the Activity Log List
const MONTH_ACTIVITY_LIMIT = 100;

// Param checks for the data routes: the error code, or null when valid
const validDate = ({ date }) => (DATE_RE.test(date) ? null : "INVALID_DATE");
const validMonth = ({ month }) =>
  MONTH_RE.test(month) ? null : "INVALID_MONTH";
const validWorkout = ({ date, logId }) =>
  validDate({ date }) || (LOG_ID_RE.test(logId) ? null : "INVALID_LOG_ID");

// The callback puts tokens in the redirect URL
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

  // Shared by the data routes: checks the params with validate, reads the
  // Fitbit tokens from the headers, runs fetchAll(token, params) with a fresh
  // token and sends toBody(params, result).
  function fitbitDataRoute(context, validate, fetchAll, toBody) {
    return async (req, res) => {
      const invalid = validate(req.params);
      if (invalid) {
        return res.status(400).json({ error: invalid });
      }

      const accessToken = req.get("X-Fitbit-Token");
      if (!accessToken) {
        return res.status(401).json({ error: "FITBIT_NOT_CONNECTED" });
      }
      const refreshToken = req.get("X-Fitbit-Refresh-Token");

      let refreshed = null;
      try {
        const { result, refreshedTokens } = await fitbitApi.withFreshToken(
          { accessToken, refreshToken },
          (token) => fetchAll(token, req.params),
        );
        refreshed = refreshedTokens;
        const body = toBody(req.params, result);
        if (refreshedTokens) body.refreshedTokens = refreshedTokens;
        res.json(body);
      } catch (error) {
        if (refreshed && !error.refreshedTokens) error.refreshedTokens = refreshed;
        sendFitbitError(res, error, context);
      }
    };
  }

  // GET /api/fitbit/day/:date - normalized steps, sleep, heart and workouts
  router.get(
    "/day/:date",
    requireFirebaseUser,
    fitbitDataRoute(
      "Fitbit day",
      validDate,
      (token, { date }) => fetchDayRaw(token, date),
      ({ date }, raw) => ({ day: toDay(date, raw) }),
    ),
  );

  // GET /api/fitbit/week/:endDate - [{ date, steps, sleepMinutes }] for the 7
  // days ending at endDate (activity rings). Two Fitbit range calls.
  router.get(
    "/week/:date",
    requireFirebaseUser,
    fitbitDataRoute(
      "Fitbit week",
      validDate,
      (token, { date: endDate }) => {
        const start = weekDates(endDate)[0];
        return Promise.all([
          fitbitApi.getStepsRange(token, start, endDate),
          fitbitApi.getSleepRange(token, start, endDate),
        ]);
      },
      ({ date: endDate }, [steps, sleep]) => ({
        week: normalizeWeek(endDate, steps, sleep),
      }),
    ),
  );

  // GET /api/fitbit/workout/:date/:logId - one workout with its route and
  // heart rate points, each tagged with its zone. The activity is looked up
  // in that day's list first, so an unknown logId never reaches the TCX call.
  // A login from before the location scope gets a 403 on the TCX; the workout
  // is still returned, with needsReconnect set. When the TCX has no heart rate
  // (or was refused), the intraday heart rate for the workout's window is
  // fetched instead.
  router.get(
    "/workout/:date/:logId",
    requireFirebaseUser,
    fitbitDataRoute(
      "Fitbit workout",
      validWorkout,
      async (token, { date, logId }) => {
        const activities = await fitbitApi.getActivities(token, date);
        const activity = activities.find((a) => String(a.logId) === logId);
        if (!activity) return { activity: null };

        let tcx = null;
        let tcxDenied = false;
        try {
          tcx = await fitbitApi.getActivityTcx(token, logId);
        } catch (error) {
          if (error.message !== "FITBIT_FORBIDDEN") throw error;
          tcxDenied = true;
        }

        let heartIntraday = null;
        const window = workoutWindow(activity);
        if (window && tcxLacksHeartRate(tcx)) {
          try {
            heartIntraday = await fitbitApi.getHeartIntraday(
              token,
              date,
              window.start,
              window.end,
            );
          } catch (error) {
            if (error.message !== "FITBIT_FORBIDDEN") throw error;
          }
        }
        return { activity, tcx, tcxDenied, heartIntraday };
      },
      (params, { activity, tcx, tcxDenied, heartIntraday }) => {
        if (!activity) throw new Error("WORKOUT_NOT_FOUND");
        return {
          workout: workoutDetail(activity, tcx, { tcxDenied, heartIntraday }),
        };
      },
    ),
  );

  // GET /api/fitbit/workouts/:month - [{ date, logId, type }] for every kept
  // workout in a YYYY-MM month (the Workout page calendar). One list call.
  router.get(
    "/workouts/:month",
    requireFirebaseUser,
    fitbitDataRoute(
      "Fitbit month",
      validMonth,
      (token, { month }) =>
        fitbitApi.getActivitiesFrom(token, `${month}-01`, MONTH_ACTIVITY_LIMIT),
      ({ month }, activities) => ({
        month,
        workouts: monthWorkouts(month, activities),
      }),
    ),
  );

  return router;
}

module.exports = { createFitbitRouter, FITBIT_SCOPES };
