// Reads config from process.env on every call so tests can set env per case.
// server.js loads .env (dotenv) before anything calls this.

const DEFAULT_RETURN_SCHEMES = ["exp", "exps", "com.arcs.smartclothingapp"];

function getConfig() {
  const schemes = (process.env.ALLOWED_RETURN_SCHEMES || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  return {
    port: Number(process.env.PORT) || 3001,
    fitbitClientId: process.env.FITBIT_CLIENT_ID,
    fitbitClientSecret: process.env.FITBIT_CLIENT_SECRET,
    fitbitRedirectUri: process.env.FITBIT_REDIRECT_URI,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    coachModel: process.env.COACH_MODEL,
    // Empty means the default usage-log.csv in the service folder
    usageLogPath: process.env.USAGE_LOG_PATH || null,
    allowedReturnSchemes: schemes.length ? schemes : DEFAULT_RETURN_SCHEMES,
  };
}

module.exports = { getConfig, DEFAULT_RETURN_SCHEMES };
