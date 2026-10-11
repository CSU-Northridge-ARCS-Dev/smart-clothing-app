// Shared test helpers (not a test file: jest only runs *.test.js)

// Minimal stand-in for a fetch Response
function fakeResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
  };
}

// Fitbit /oauth2/token success body
function tokenBody(suffix = "1") {
  return {
    access_token: `access-${suffix}`,
    refresh_token: `refresh-${suffix}`,
    expires_in: 28800,
    user_id: "FITBIT123",
    scope: "sleep heartrate activity profile",
  };
}

function setFitbitEnv() {
  process.env.FITBIT_CLIENT_ID = "client-id";
  process.env.FITBIT_CLIENT_SECRET = "client-secret";
  process.env.FITBIT_REDIRECT_URI = "https://tunnel.example/api/fitbit/callback";
  process.env.FIREBASE_PROJECT_ID = "test-project";
  delete process.env.ALLOWED_RETURN_SCHEMES;
}

module.exports = { fakeResponse, tokenBody, setFitbitEnv };
