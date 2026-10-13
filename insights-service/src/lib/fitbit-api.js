//Tokens are passed in by the
// caller (they live on the phone) instead of being loaded from a database.
const { getConfig } = require("../config");
const { addDays, activityDate } = require("./dates");

const FITBIT_TOKEN_URL = "https://api.fitbit.com/oauth2/token";
const FITBIT_API = "https://api.fitbit.com";

function getBasicAuthHeader() {
  const { fitbitClientId, fitbitClientSecret } = getConfig();
  const credentials = Buffer.from(
    `${fitbitClientId}:${fitbitClientSecret}`,
  ).toString("base64");
  return `Basic ${credentials}`;
}

// Fitbit token response -> the shape the app stores
function toTokenPair(data) {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    fitbitUserId: data.user_id,
    scope: data.scope,
  };
}

async function postToken(params, errorCode) {
  const response = await fetch(FITBIT_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: getBasicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Fitbit token call failed (${response.status}):`, error);
    throw new Error(errorCode);
  }

  return toTokenPair(await response.json());
}

// Exchange an authorization code for Fitbit tokens
function exchangeCodeForTokens(code) {
  return postToken(
    {
      grant_type: "authorization_code",
      code,
      redirect_uri: getConfig().fitbitRedirectUri,
    },
    "TOKEN_EXCHANGE_FAILED",
  );
}

// Fitbit refresh tokens are single-use: the caller must keep the new pair
function refreshTokens(refreshToken) {
  return postToken(
    { grant_type: "refresh_token", refresh_token: refreshToken },
    "FITBIT_REAUTH_REQUIRED",
  );
}

// Fitbit activity logIds can be larger than Number.MAX_SAFE_INTEGER, so
// JSON.parse would round them (and the rounded id points at no activity).
// Quote them first so they stay exact strings.
function parseFitbitJson(text) {
  return JSON.parse(text.replace(/"logId"\s*:\s*(\d+)/g, '"logId":"$1"'));
}

// Authenticated GET. 401 means the access token is expired or revoked; 403
// means the login lacks a scope the call needs (FITBIT_FORBIDDEN).
// as is "json" or "text" (TCX files are XML).
async function fitbitFetch(accessToken, path, as = "json") {
  const response = await fetch(`${FITBIT_API}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status === 401) {
    throw new Error("FITBIT_TOKEN_EXPIRED");
  }
  if (!response.ok) {
    const error = await response.text();
    console.error(`Fitbit API error (${response.status}) ${path}:`, error);
    throw new Error(
      response.status === 403 ? "FITBIT_FORBIDDEN" : "FITBIT_API_ERROR",
    );
  }

  const text = await response.text();
  return as === "text" ? text : parseFitbitJson(text);
}

function getSleep(accessToken, date) {
  return fitbitFetch(accessToken, `/1.2/user/-/sleep/date/${date}.json`);
}

// YYYY-MM-DD minus one day
function previousDate(date) {
  return addDays(date, -1);
}

// Daily activity summary; summary.steps is the day's step count
function getDaySummary(accessToken, date) {
  return fitbitFetch(accessToken, `/1/user/-/activities/date/${date}.json`);
}

// Steps per day for a date range: { "activities-steps": [{ dateTime, value }] }
function getStepsRange(accessToken, start, end) {
  return fitbitFetch(
    accessToken,
    `/1/user/-/activities/steps/date/${start}/${end}.json`,
  );
}

// Sleep logs for a date range; each log carries its dateOfSleep
function getSleepRange(accessToken, start, end) {
  return fitbitFetch(accessToken, `/1.2/user/-/sleep/date/${start}/${end}.json`);
}

// Two-day range so yesterday's resting HR comes back in the same call
function getHeart(accessToken, date) {
  return fitbitFetch(
    accessToken,
    `/1/user/-/activities/heart/date/${previousDate(date)}/${date}.json`,
  );
}

// Activity Log List from afterDate onward, oldest first. Fitbit caps limit at 100.
async function getActivitiesFrom(accessToken, afterDate, limit) {
  const data = await fitbitFetch(
    accessToken,
    `/1/user/-/activities/list.json?afterDate=${afterDate}&sort=asc&offset=0&limit=${limit}`,
  );
  return data.activities || [];
}

// Activity Log List only accepts one of afterDate/beforeDate, so fetch from
// the date onward and keep only entries that start on that date.
async function getActivities(accessToken, date) {
  const list = await getActivitiesFrom(accessToken, date, 20);
  return list.filter((a) => activityDate(a) === date);
}

// One activity as TCX (XML): trackpoints with time, heart rate and, with the
// location scope, GPS position.
function getActivityTcx(accessToken, logId) {
  return fitbitFetch(accessToken, `/1/user/-/activities/${logId}.tcx`, "text");
}

// Heart rate every second (or as often as the watch recorded it) between two
// HH:MM times on a date: { "activities-heart-intraday": { dataset: [{ time,
// value }] } }. Intraday data needs a Personal app (the T-003 Fitbit app is).
function getHeartIntraday(accessToken, date, start, end) {
  return fitbitFetch(
    accessToken,
    `/1/user/-/activities/heart/date/${date}/1d/1sec/time/${start}/${end}.json`,
  );
}

// Runs fn(accessToken). If Fitbit says the token expired, refreshes once and
// retries. Returns { result, refreshedTokens } (refreshedTokens null if unused).
async function withFreshToken({ accessToken, refreshToken }, fn) {
  try {
    return { result: await fn(accessToken), refreshedTokens: null };
  } catch (error) {
    if (error.message !== "FITBIT_TOKEN_EXPIRED") throw error;
    if (!refreshToken) throw new Error("FITBIT_REAUTH_REQUIRED");

    const refreshedTokens = await refreshTokens(refreshToken);
    try {
      const result = await fn(refreshedTokens.accessToken);
      return { result, refreshedTokens };
    } catch (retryError) {
      // The new pair is still valid; surface it so the app doesn't lose it
      retryError.refreshedTokens = refreshedTokens;
      if (retryError.message === "FITBIT_TOKEN_EXPIRED") {
        retryError.message = "FITBIT_REAUTH_REQUIRED";
      }
      throw retryError;
    }
  }
}

module.exports = {
  parseFitbitJson,
  exchangeCodeForTokens,
  refreshTokens,
  getSleep,
  getHeart,
  getDaySummary,
  getStepsRange,
  getSleepRange,
  previousDate,
  getActivities,
  getActivitiesFrom,
  getActivityTcx,
  getHeartIntraday,
  withFreshToken,
};
