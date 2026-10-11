// Turns raw Fitbit responses for one date into the day object the app and
// (from P3) Claude use. Pure function: no I/O.

// Workout types recorded on the Pixel Watch that the PoC keeps (T-003 decision)
const WORKOUT_TYPES = ["Run", "Weights", "Walk"];
const DISTANCE_TYPES = ["Run", "Walk"];
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
  };
}

function normalizeHeart(rawHeart) {
  const value =
    (rawHeart &&
      rawHeart["activities-heart"] &&
      rawHeart["activities-heart"][0] &&
      rawHeart["activities-heart"][0].value) ||
    {};
  return {
    restingHeartRate: value.restingHeartRate ?? null,
    zones: zoneMinutes(value.heartRateZones),
  };
}

function toKm(distance, unit) {
  return /mile/i.test(unit || "") ? distance * KM_PER_MILE : distance;
}

function normalizeWorkout(a) {
  const type = a.activityName;
  const durationMin = Math.round((a.activeDuration || a.duration || 0) / 60000);
  const workout = {
    type,
    startTime: a.startTime || a.originalStartTime || null,
    durationMin,
    avgHeartRate: a.averageHeartRate ?? null,
    zones: zoneMinutes(a.heartRateZones),
  };

  if (DISTANCE_TYPES.includes(type) && a.distance > 0) {
    const km = toKm(a.distance, a.distanceUnit);
    workout.distanceKm = round1(km);
    if (durationMin > 0) workout.paceMinPerKm = round1(durationMin / km);
  }

  return workout;
}

// rawActivities: the already date-filtered list from fitbit-api getActivities
function normalizeDay(date, rawSleep, rawHeart, rawActivities) {
  return {
    date,
    sleep: normalizeSleep(rawSleep),
    heart: normalizeHeart(rawHeart),
    workouts: (rawActivities || [])
      .filter((a) => WORKOUT_TYPES.includes(a.activityName))
      .map(normalizeWorkout),
  };
}

module.exports = { normalizeDay, WORKOUT_TYPES };
