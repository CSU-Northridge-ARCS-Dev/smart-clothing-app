// Heart rate for one workout from Fitbit's intraday heart rate series, used
// when the activity's TCX has no heart rate (gym sessions without GPS, or a
// TCX Fitbit refused).

const MINUTES_PER_DAY = 24 * 60;

// "HH:MM:SS" (or "HH:MM") -> seconds since midnight
function secondsOfDay(time) {
  const [h, m, s] = time.split(":").map(Number);
  return h * 3600 + m * 60 + (s || 0);
}

const pad2 = (n) => String(n).padStart(2, "0");

// The workout's wall-clock window on its start date, for the intraday call:
// { start: "HH:MM", end: "HH:MM" }. The end is rounded up to the next minute
// and stops at 23:59. null without a start time.
function workoutWindow(activity) {
  const startTime = activity.startTime || activity.originalStartTime;
  if (!startTime || startTime.length < 16) return null;
  const startMinute = Math.floor(secondsOfDay(startTime.slice(11, 19)) / 60);
  const durationMs = activity.duration || activity.activeDuration || 0;
  const endMinute = Math.min(
    startMinute + Math.ceil(durationMs / 60000),
    MINUTES_PER_DAY - 1,
  );
  const hhmm = (minute) => `${pad2(Math.floor(minute / 60))}:${pad2(minute % 60)}`;
  return { start: hhmm(startMinute), end: hhmm(endMinute) };
}

// Intraday response -> [{ t, lat: null, lon: null, bpm }], t in seconds from
// the workout's start time. Readings before the start are dropped.
function intradayPoints(rawIntraday, activity) {
  const dataset =
    (rawIntraday &&
      rawIntraday["activities-heart-intraday"] &&
      rawIntraday["activities-heart-intraday"].dataset) ||
    [];
  const startTime = activity.startTime || activity.originalStartTime;
  if (!startTime || startTime.length < 19) return [];
  const start = secondsOfDay(startTime.slice(11, 19));

  return dataset
    .filter((d) => d.time && Number.isFinite(d.value))
    .map((d) => ({
      t: secondsOfDay(d.time) - start,
      lat: null,
      lon: null,
      bpm: d.value,
    }))
    .filter((p) => p.t >= 0);
}

module.exports = { workoutWindow, intradayPoints };
