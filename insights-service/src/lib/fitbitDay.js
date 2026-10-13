// Shared by the Fitbit and insights routes: the date format, the four Fitbit
// calls behind one day, and the mapping from fitbit-api errors to responses.
const fitbitApi = require("./fitbit-api");
const { normalizeDay } = require("./normalizeDay");

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Raw sleep, heart, activities and summary for one YYYY-MM-DD date
function fetchDayRaw(token, date) {
  return Promise.all([
    fitbitApi.getSleep(token, date),
    fitbitApi.getHeart(token, date),
    fitbitApi.getActivities(token, date),
    fitbitApi.getDaySummary(token, date),
  ]);
}

function toDay(date, [sleep, heart, activities, summary]) {
  return normalizeDay(date, sleep, heart, activities, summary);
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
  if (error.message === "WORKOUT_NOT_FOUND") {
    return res.status(404).json({ error: "WORKOUT_NOT_FOUND", ...extra });
  }
  if (error.message === "FITBIT_API_ERROR" || error.message === "FITBIT_FORBIDDEN") {
    return res.status(502).json({ error: "FITBIT_API_ERROR", ...extra });
  }
  console.error(`${context} error:`, error);
  return res.status(500).json({ error: "INTERNAL_ERROR", ...extra });
}

module.exports = { DATE_RE, fetchDayRaw, toDay, sendFitbitError };
