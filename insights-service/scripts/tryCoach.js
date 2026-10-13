// Asks Claude for feedback on a saved day JSON, using the real key in .env,
// and writes a usage row. A manual check of the prompt without the app.
//   npm run try-coach -- <day.json> [profile.json]
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const fs = require("fs");
const path = require("path");
const { getConfig } = require("../src/config");
const { sanitizeProfile, hasCoachableData, getFeedback } = require("../src/lib/coach");
const { logUsage } = require("../src/lib/usageLog");

const SAMPLE_PROFILE = {
  gender: "Male",
  age: 22,
  height: 70,
  weight: 165,
  sports: "Track and field",
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

async function main() {
  const [dayFile, profileFile] = process.argv.slice(2);
  if (!dayFile) {
    console.error("Usage: npm run try-coach -- <day.json> [profile.json]");
    process.exit(1);
  }

  const { anthropicApiKey, coachModel, usageLogPath } = getConfig();
  if (!anthropicApiKey || !coachModel) {
    console.error("Set ANTHROPIC_API_KEY and COACH_MODEL in insights-service/.env");
    process.exit(1);
  }

  const day = readJson(dayFile);
  if (!hasCoachableData(day)) {
    console.log("NO_DATA: no sleep and no workouts, so Claude would not be called");
    return;
  }

  const sdk = require("@anthropic-ai/sdk");
  const Anthropic = sdk.default || sdk;
  const client = new Anthropic({ apiKey: anthropicApiKey });
  const profile = sanitizeProfile(profileFile ? readJson(profileFile) : SAMPLE_PROFILE);

  const { insight, usage } = await getFeedback(client, { model: coachModel, profile, day });
  logUsage({ date: day.date, ...usage }, usageLogPath ? { filePath: usageLogPath } : {});
  console.log(JSON.stringify({ profile, insight, usage }, null, 2));
}

main().catch((error) => {
  console.error(error.message, error.cause || "");
  process.exit(1);
});
