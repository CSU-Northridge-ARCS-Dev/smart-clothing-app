// A day built on the phone can't be trusted the way one fetched by this
// service can. validateDay rebuilds it with only the fields the coach prompt
// reads, so nothing else the client sends can reach Claude.
const { DATE_RE } = require("./fitbitDay");

const MINUTES_PER_DAY = 1440;
const MAX_WORKOUTS = 20;
const WORKOUT_TYPES = ["Run", "Weights", "Walk", "Workout"];
// A local wall-clock time: only the start is checked, since the prompt
// reads the hour and minute and nothing after them
const LOCAL_TIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

function invalidDay() {
  return new Error("INVALID_DAY");
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// A number inside min-max, or null. decimals: how many to keep.
function cleanNumber(value, min, max, decimals = 0) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value < min || value > max) return null;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

const minutes = (value) => cleanNumber(value, 0, MINUTES_PER_DAY);
const heartRate = (value) => cleanNumber(value, 20, 250);

function cleanTime(value) {
  if (typeof value !== "string" || !LOCAL_TIME_RE.test(value)) return null;
  return value.slice(0, 16);
}

function cleanZones(raw) {
  if (!isObject(raw)) return null;
  return {
    fatBurn: minutes(raw.fatBurn),
    cardio: minutes(raw.cardio),
    peak: minutes(raw.peak),
  };
}

// null when the night has no usable length: there is nothing to coach on
function cleanSleep(raw) {
  if (raw == null) return null;
  if (!isObject(raw)) throw invalidDay();
  const totalMinutes = minutes(raw.totalMinutes);
  if (totalMinutes === null) return null;
  return {
    totalMinutes,
    efficiency: cleanNumber(raw.efficiency, 0, 100),
    deep: minutes(raw.deep),
    light: minutes(raw.light),
    rem: minutes(raw.rem),
    wake: minutes(raw.wake),
    bedTime: cleanTime(raw.bedTime),
    wakeTime: cleanTime(raw.wakeTime),
  };
}

function cleanHeart(raw) {
  if (raw != null && !isObject(raw)) throw invalidDay();
  const heart = raw || {};
  return {
    restingHeartRate: heartRate(heart.restingHeartRate),
    previousRestingHeartRate: heartRate(heart.previousRestingHeartRate),
    zones: cleanZones(heart.zones),
  };
}

// null for an entry that isn't a workout with a duration
function cleanWorkout(raw) {
  if (!isObject(raw)) return null;
  const durationMin = minutes(raw.durationMin);
  if (durationMin === null) return null;
  return {
    type: WORKOUT_TYPES.includes(raw.type) ? raw.type : "Workout",
    startTime: cleanTime(raw.startTime),
    durationMin,
    avgHeartRate: heartRate(raw.avgHeartRate),
    distanceKm: cleanNumber(raw.distanceKm, 0, 200, 1),
    paceMinPerKm: cleanNumber(raw.paceMinPerKm, 0, 60, 1),
    zones: cleanZones(raw.zones),
  };
}

// raw: the day from the request body. date: the body's date (YYYY-MM-DD).
// Returns { date, steps, sleep, heart, workouts } or throws INVALID_DAY.
function validateDay(raw, date) {
  if (!isObject(raw)) throw invalidDay();
  if (typeof raw.date !== "string" || !DATE_RE.test(raw.date)) throw invalidDay();
  if (raw.date !== date) throw invalidDay();

  const workouts = raw.workouts == null ? [] : raw.workouts;
  if (!Array.isArray(workouts) || workouts.length > MAX_WORKOUTS) {
    throw invalidDay();
  }

  return {
    date: raw.date,
    steps: cleanNumber(raw.steps, 0, 200000),
    sleep: cleanSleep(raw.sleep),
    heart: cleanHeart(raw.heart),
    workouts: workouts.map(cleanWorkout).filter(Boolean),
  };
}

module.exports = { validateDay, MAX_WORKOUTS, WORKOUT_TYPES };
