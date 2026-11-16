// Reads config from process.env on every call so tests can set env per case.
// server.js loads .env (dotenv) before anything calls this.

function getConfig() {
  return {
    port: Number(process.env.PORT) || 3001,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    coachModel: process.env.COACH_MODEL,
    // Empty means the default usage-log.csv in the service folder
    usageLogPath: process.env.USAGE_LOG_PATH || null,
  };
}

module.exports = { getConfig };
