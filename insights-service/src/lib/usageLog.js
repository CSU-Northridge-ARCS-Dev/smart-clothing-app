// Appends one row per Claude call to a CSV file (gitignored). The cost
// estimate is worked out from these token counts.
const fs = require("fs");
const path = require("path");

const DEFAULT_PATH = path.join(__dirname, "..", "..", "usage-log.csv");
const HEADER = "timestamp,date,model,input_tokens,output_tokens,source\n";
const OLD_HEADER = "timestamp,date,model,input_tokens,output_tokens\n";

// A file started before the source column gets the new header line. Its
// rows stay as they are.
function upgradeHeader(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  if (!text.startsWith(OLD_HEADER)) return;
  fs.writeFileSync(filePath, HEADER + text.slice(OLD_HEADER.length));
}

// source: where the day came from ("fitbit", "health_connect", "healthkit").
function logUsage(
  { date, model, inputTokens, outputTokens, source = "" },
  { filePath = DEFAULT_PATH, now = new Date() } = {},
) {
  const row = [
    now.toISOString(),
    date,
    model,
    inputTokens,
    outputTokens,
    source,
  ].join(",");
  console.log(
    `Claude usage: ${date} ${model} in=${inputTokens} out=${outputTokens} source=${source}`,
  );
  try {
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, HEADER);
    else upgradeHeader(filePath);
    fs.appendFileSync(filePath, `${row}\n`);
  } catch (error) {
    console.error("Could not write the usage log:", error.message);
  }
}

module.exports = { logUsage, DEFAULT_PATH, HEADER, OLD_HEADER };
