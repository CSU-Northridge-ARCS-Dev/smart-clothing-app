// Turns the Fitbit steps and sleep range responses into one entry per day for
// the activity rings.
const { addDays } = require("./dates");
const { pickMainSleep } = require("./normalizeDay");

const WEEK_LENGTH = 7;

// The 7 dates ending at endDate, oldest first
function weekDates(endDate) {
  const dates = [];
  for (let i = WEEK_LENGTH - 1; i >= 0; i--) dates.push(addDays(endDate, -i));
  return dates;
}

// { [date]: steps }. Fitbit sends the values as strings.
function stepsByDate(rawSteps) {
  const byDate = {};
  for (const entry of (rawSteps && rawSteps["activities-steps"]) || []) {
    const steps = Number(entry.value);
    if (entry.dateTime && Number.isFinite(steps)) byDate[entry.dateTime] = steps;
  }
  return byDate;
}

// { [date]: minutes asleep in the main sleep }. Naps don't count.
function sleepByDate(rawSleep) {
  const logsByDate = {};
  for (const log of (rawSleep && rawSleep.sleep) || []) {
    if (!log.dateOfSleep) continue;
    (logsByDate[log.dateOfSleep] = logsByDate[log.dateOfSleep] || []).push(log);
  }
  const byDate = {};
  for (const [date, logs] of Object.entries(logsByDate)) {
    const main = pickMainSleep(logs);
    byDate[date] = main.minutesAsleep ?? null;
  }
  return byDate;
}

// Missing data is null, never 0, so the app can tell "no data" from "0 steps"
function normalizeWeek(endDate, rawSteps, rawSleep) {
  const steps = stepsByDate(rawSteps);
  const sleep = sleepByDate(rawSleep);
  return weekDates(endDate).map((date) => ({
    date,
    steps: steps[date] ?? null,
    sleepMinutes: sleep[date] ?? null,
  }));
}

module.exports = { normalizeWeek, weekDates, WEEK_LENGTH };
