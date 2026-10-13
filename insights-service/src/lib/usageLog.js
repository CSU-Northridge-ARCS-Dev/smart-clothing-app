// Appends one row per Claude call to a CSV file (gitignored). The cost
// estimate is worked out from these token counts.
const fs = require("fs");
const path = require("path");

const DEFAULT_PATH = path.join(__dirname, "..", "..", "usage-log.csv");
const HEADER = "timestamp,date,model,input_tokens,output_tokens\n";

// Never throws: losing a log row must not fail the feedback response
function logUsage(
  { date, model, inputTokens, outputTokens },
  { filePath = DEFAULT_PATH, now = new Date() } = {},
) {
  const row = [now.toISOString(), date, model, inputTokens, outputTokens].join(",");
  console.log(`Claude usage: ${date} ${model} in=${inputTokens} out=${outputTokens}`);
  try {
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, HEADER);
    fs.appendFileSync(filePath, `${row}\n`);
  } catch (error) {
    console.error("Could not write the usage log:", error.message);
  }
}

module.exports = { logUsage, DEFAULT_PATH, HEADER };
