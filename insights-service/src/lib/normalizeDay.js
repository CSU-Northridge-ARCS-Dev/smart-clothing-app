// Turns raw Fitbit responses for one date into the day object the app and
// (from P3) Claude use. Pure function: no I/O.

// Workout types recorded on the Pixel Watch that the PoC keeps.
// "Workout" is included because the Pixel Watch logged a run started with the
// Run exercise as "Workout" (activityTypeId 91060); see
// workoutType for how it is shown.
const WORKOUT_TYPES = ["Run", "Weights", "Walk", "Workout"];
// Distance and pace are only added when Fitbit has a distance
const DISTANCE_TYPES = ["Run", "Walk", "Workout"];
const KM_PER_MILE = 1.609344;

const round1 = (n) => Math.round(n * 10) / 10;

// Fitbit zone list -> { fatBurn, cardio, peak } in minutes
function zoneMinutes(zones) {
  const byName = {};
  for (const z of zones || []) byName[z.name] = z.minutes || 0;
  return {
    fatBurn: byName["Fat Burn"] || 0,
    cardio: byName.Cardio || 0,
    peak: byName.Peak || 0,
  };
}

// Main sleep log, or the longest one if none is flagged main
function pickMainSleep(entries) {
  if (!entries || entries.length === 0) return null;
  const main = entries.find((e) => e.isMainSleep);
  if (main) return main;
  return entries.reduce((a, b) => ((b.duration || 0) > (a.duration || 0) ? b : a));
}

function normalizeSleep(rawSleep) {
  const entry = pickMainSleep(rawSleep && rawSleep.sleep);
  if (!entry) return null;

  // "stages" logs have deep/light/rem/wake; "classic" logs do not
  const stages =
    entry.type === "stages" && entry.levels ? entry.levels.summary || {} : {};
  const stageMinutes = (name) => (stages[name] ? stages[name].minutes : null);

  return {
    totalMinutes: entry.minutesAsleep ?? null,
    efficiency: entry.efficiency ?? null,
    deep: stageMinutes("deep"),
    light: stageMinutes("light"),
    rem: stageMinutes("rem"),
    wake: stageMinutes("wake"),
    bedTime: entry.startTime || null,
    wakeTime: entry.endTime || null,
    // Timeline for the app's hypnogram. Too long for the Claude prompt.
    levels: ((entry.levels && entry.levels.data) || []).map((l) => ({
      dateTime: l.dateTime,
      level: l.level,
      seconds: l.seconds,
    })),
  };
}

// rawHeart covers the day before and the date itself 
function normalizeHeart(date, rawHeart) {
  const entries = (rawHeart && rawHeart["activities-heart"]) || [];
  const today = entries.find((e) => e.dateTime === date);
  const previous = entries.find((e) => e.dateTime && e.dateTime < date);
  const value = (today && today.value) || {};
  const previousValue = (previous && previous.value) || {};
  return {
    restingHeartRate: value.restingHeartRate ?? null,
    previousRestingHeartRate: previousValue.restingHeartRate ?? null,
    zones: zoneMinutes(value.heartRateZones),
  };
}

function toKm(distance, unit) {
  return /mile/i.test(unit || "") ? distance * KM_PER_MILE : distance;
}

// A generic "Workout" with GPS and a distance is a run the watch didn't label
// as one. Without GPS (for example a gym session) it stays "Workout".
function workoutType(a) {
  if (a.activityName === "Workout" && a.hasGps && a.distance > 0) return "Run";
  return a.activityName;
}

function normalizeWorkout(a) {
  const type = workoutType(a);
  const durationMin = Math.round((a.activeDuration || a.duration || 0) / 60000);
  const workout = {
    logId: a.logId ?? null,
    type,
    startTime: a.startTime || a.originalStartTime || null,
    durationMin,
    avgHeartRate: a.averageHeartRate ?? null,
    calories: a.calories ?? null,
    steps: a.steps ?? null,
    hasGps: Boolean(a.hasGps),
    zones: zoneMinutes(a.heartRateZones),
  };

  if (DISTANCE_TYPES.includes(type) && a.distance > 0) {
    const km = toKm(a.distance, a.distanceUnit);
    workout.distanceKm = round1(km);
    if (durationMin > 0) workout.paceMinPerKm = round1(durationMin / km);
  }

  return workout;
}

// rawActivities: the already date-filtered list from fitbit-api getActivities.
// rawSummary: the daily activity summary (getDaySummary), for steps.
function normalizeDay(date, rawSleep, rawHeart, rawActivities, rawSummary) {
  const steps = rawSummary && rawSummary.summary && rawSummary.summary.steps;
  return {
    date,
    steps: steps ?? null,
    sleep: normalizeSleep(rawSleep),
    heart: normalizeHeart(date, rawHeart),
    workouts: (rawActivities || [])
      .filter((a) => WORKOUT_TYPES.includes(a.activityName))
      .map(normalizeWorkout),
  };
}

module.exports = {
  normalizeDay,
  normalizeWorkout,
  pickMainSleep,
  workoutType,
  WORKOUT_TYPES,
};
