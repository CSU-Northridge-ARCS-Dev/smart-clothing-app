// Ported from Momentum backend/lib/fitbit-api.js. Tokens are passed in by the
// caller (they live on the phone) instead of being loaded from a database.
const { getConfig } = require("../config");

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

// Authenticated GET. 401 means the access token is expired or revoked.
async function fitbitFetch(accessToken, path) {
  const response = await fetch(`${FITBIT_API}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status === 401) {
    throw new Error("FITBIT_TOKEN_EXPIRED");
  }
  if (!response.ok) {
    const error = await response.text();
    console.error(`Fitbit API error (${response.status}) ${path}:`, error);
    throw new Error("FITBIT_API_ERROR");
  }

  return response.json();
}

function getSleep(accessToken, date) {
  return fitbitFetch(accessToken, `/1.2/user/-/sleep/date/${date}.json`);
}

function getHeart(accessToken, date) {
  return fitbitFetch(
    accessToken,
    `/1/user/-/activities/heart/date/${date}/1d.json`,
  );
}

// Activity Log List only accepts one of afterDate/beforeDate, so fetch from
// the date onward and keep only entries that start on that date.
async function getActivities(accessToken, date) {
  const data = await fitbitFetch(
    accessToken,
    `/1/user/-/activities/list.json?afterDate=${date}&sort=asc&offset=0&limit=20`,
  );
  return (data.activities || []).filter((a) => {
    const start = a.startTime || a.originalStartTime;
    return start ? start.slice(0, 10) === date : false;
  });
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
  exchangeCodeForTokens,
  refreshTokens,
  getSleep,
  getHeart,
  getActivities,
  withFreshToken,
};
