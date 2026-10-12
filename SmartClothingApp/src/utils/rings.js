import { STEP_GOAL, SLEEP_GOAL_MINUTES } from "../constants/goals";
import { addDaysToDateString, toLocalDateString } from "./dateConversions";

// value / goal for one ring. Missing data is 0 (an empty ring), and a value
// over the goal stays above 1 so the ring overlaps itself.
export const goalProgress = (value, goal) =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? value / goal
    : 0;

// One week entry { steps, sleepMinutes } -> { steps, sleep } ring progress
export const toRingProgress = (entry) => ({
  steps: goalProgress(entry && entry.steps, STEP_GOAL),
  sleep: goalProgress(entry && entry.sleepMinutes, SLEEP_GOAL_MINUTES),
});

// The 7 dates (YYYY-MM-DD) ending at endDate, oldest first
export const lastSevenDates = (endDate = toLocalDateString()) =>
  [6, 5, 4, 3, 2, 1, 0].map((n) => addDaysToDateString(endDate, -n));

// "2026-10-10" -> "S" (a Saturday), for the labels above the small rings
export const weekdayLetter = (date) => {
  const [y, m, d] = date.split("-").map(Number);
  return "SMTWTFS"[new Date(y, m - 1, d).getDay()];
};
