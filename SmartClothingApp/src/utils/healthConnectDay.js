import { ageFromDob } from "./age";
import {
  buildHr5min,
  zoneMinutes,
  zoneStarts,
  zoneForBpm,
  sleepEfficiency,
} from "./daySamples";

// Turns the raw Health Connect records for one local day (readDayRecords)
// into the day object the screens, the saved document and the coach prompt
// use. Pure: no reads and no writes.
const STAGE_LEVELS = {
  0: "asleep",
  1: "wake",
  2: "asleep",
  3: "wake",
  4: "light",
  5: "deep",
  6: "rem",
  7: "wake",
};
const REAL_STAGES = ["light", "deep", "rem"];

// Health Connect exercise type numbers -> the day's workout types
const WORKOUT_TYPES = {
  56: "Run",
  57: "Run",
  70: "Weights",
  79: "Walk",
  81: "Weights",
};
// Distance and pace are only added for these
const DISTANCE_TYPES = ["Run", "Walk", "Workout"];

const round1 = (n) => Math.round(n * 10) / 10;
const pad = (n, width = 2) => String(n).padStart(width, "0");
const ms = (time) => new Date(time).getTime();

// Health Connect times are UTC.
const toLocalDate = (time) => {
  const t = new Date(time);
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
};

const toLocalDateTime = (time) => {
  const t = new Date(time);
  const day = toLocalDate(time);
  const clock = `${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(
    t.getSeconds()
  )}`;
  return `${day}T${clock}.${pad(t.getMilliseconds(), 3)}`;
};

const lastByTime = (records) =>
  records && records.length > 0
    ? records.reduce((a, b) => (ms(b.time) >= ms(a.time) ? b : a))
    : null;

// Every heart rate reading of the day as { time, bpm }, time in milliseconds
const flattenHeartRate = (records) =>
  records
    ? records.flatMap((r) =>
        (r.samples || []).map((s) => ({
          time: ms(s.time),
          bpm: s.beatsPerMinute,
        }))
      )
    : null;

const buildHeart = (date, raw, samples, age) => {
  const resting = raw.restingHeartRate || {};
  const restingHeartRate = lastByTime(resting.today)?.beatsPerMinute ?? null;
  const previousRestingHeartRate =
    lastByTime(resting.previous)?.beatsPerMinute ?? null;
  return {
    restingHeartRate,
    previousRestingHeartRate,
    zones: zoneMinutes(
      samples,
      age,
      restingHeartRate ?? previousRestingHeartRate
    ),
    hr5min: buildHr5min(samples, date),
  };
};

// The main night is the longest session; naps are ignored
const buildSleep = (sessions) => {
  if (!sessions || sessions.length === 0) return null;
  const length = (s) => ms(s.endTime) - ms(s.startTime);
  const night = sessions.reduce((a, b) => (length(b) > length(a) ? b : a));
  const inBedMinutes = length(night) / 60000;
  const bedTime = toLocalDateTime(night.startTime);
  const wakeTime = toLocalDateTime(night.endTime);

  const stages = (night.stages || [])
    .map((s) => ({
      start: ms(s.startTime),
      seconds: Math.round((ms(s.endTime) - ms(s.startTime)) / 1000),
      level: STAGE_LEVELS[s.stage] || "asleep",
    }))
    .filter((s) => s.seconds > 0)
    .sort((a, b) => a.start - b.start);

  // No stages: only the length of the night is known
  if (stages.length === 0) {
    return {
      totalMinutes: Math.round(inBedMinutes),
      efficiency: null,
      deep: null,
      light: null,
      rem: null,
      wake: null,
      bedTime,
      wakeTime,
      levels: [
        {
          dateTime: bedTime,
          level: "asleep",
          seconds: Math.round(inBedMinutes * 60),
        },
      ],
    };
  }

  const seconds = { light: 0, deep: 0, rem: 0, wake: 0, asleep: 0 };
  stages.forEach((s) => {
    seconds[s.level] += s.seconds;
  });
  const minutes = (level) => Math.round(seconds[level] / 60);
  const hasRealStages = REAL_STAGES.some((level) => seconds[level] > 0);
  const totalMinutes = Math.round(
    (seconds.light + seconds.deep + seconds.rem + seconds.asleep) / 60
  );

  return {
    totalMinutes,
    efficiency: sleepEfficiency(totalMinutes, inBedMinutes),
    deep: hasRealStages ? minutes("deep") : null,
    light: hasRealStages ? minutes("light") : null,
    rem: hasRealStages ? minutes("rem") : null,
    wake: minutes("wake"),
    bedTime,
    wakeTime,
    levels: stages
      .filter((s) => !(hasRealStages && s.level === "asleep"))
      .map((s) => ({
        dateTime: toLocalDateTime(s.start),
        level: s.level,
        seconds: s.seconds,
      })),
  };
};

// The latest value the read found
const buildVo2Max = (records) => {
  const value = lastByTime(records)?.vo2MillilitersPerMinuteKilogram;
  if (!Number.isFinite(value)) return null;
  return { low: round1(value), high: round1(value) };
};

// The part of each record's value that falls inside start-end. A record
// that only partly overlaps counts for the share of its time that does.
const sumInside = (records, start, end, valueOf) => {
  if (!records) return null;
  let sum = 0;
  let any = false;
  records.forEach((r) => {
    const from = ms(r.startTime);
    const to = ms(r.endTime);
    const value = valueOf(r);
    if (!Number.isFinite(value)) return;
    const overlap = Math.min(end, to) - Math.max(start, from);
    if (to > from ? overlap <= 0 : from < start || from >= end) return;
    sum += to > from ? (value * overlap) / (to - from) : value;
    any = true;
  });
  return any ? sum : null;
};

const buildWorkout = (session, raw, samples, age, restingHeartRate) => {
  const start = ms(session.startTime);
  const end = ms(session.endTime);
  const type = WORKOUT_TYPES[session.exerciseType] || "Workout";
  const durationMin = Math.round((end - start) / 60000);

  const inside = samples
    ? samples.filter((s) => s.time >= start && s.time < end)
    : null;
  const readings = (inside || []).filter((s) => Number.isFinite(s.bpm));
  const avgHeartRate =
    readings.length > 0
      ? Math.round(readings.reduce((sum, s) => sum + s.bpm, 0) / readings.length)
      : null;

  const kcal = sumInside(
    raw.totalCalories,
    start,
    end,
    (r) => r.energy?.inKilocalories
  );
  const meters = sumInside(
    raw.distance,
    start,
    end,
    (r) => r.distance?.inMeters
  );

  const workout = {
    logId: session.metadata?.id ?? null,
    type,
    startTime: toLocalDateTime(session.startTime),
    durationMin,
    avgHeartRate,
    calories: kcal === null ? null : Math.round(kcal),
    steps: null,
    hasGps: false,
    zones: zoneMinutes(inside, age, restingHeartRate),
  };

  if (DISTANCE_TYPES.includes(type) && meters > 0) {
    const km = meters / 1000;
    workout.distanceKm = round1(km);
    if (durationMin > 0) workout.paceMinPerKm = round1(durationMin / km);
  }

  return workout;
};

const ageOn = (date, profile) => {
  const [y, m, d] = date.split("-").map(Number);
  return ageFromDob(profile?.dob, new Date(y, m - 1, d));
};

// The heart rate chart only needs enough points to draw
const MAX_WORKOUT_POINTS = 600;

// Every nth point, always keeping the last one
const thinOut = (points, max = MAX_WORKOUT_POINTS) => {
  if (points.length <= max) return points;
  const step = Math.ceil(points.length / max);
  const kept = points.filter((_, i) => i % step === 0);
  const last = points[points.length - 1];
  if (kept[kept.length - 1] !== last) kept.push(last);
  return kept;
};

// raw: what readWeekRecords(endDate) returned. One entry per day for the
// activity rings, oldest first: [{ date, steps, sleepMinutes }]. Missing
// data is null, never 0. Sleep follows the day's rule (the longest session).
export const buildWeek = (raw) =>
  (raw.dates || []).map((date) => ({
    date,
    steps: raw.steps?.[date] ?? null,
    sleepMinutes: buildSleep(raw.sleep?.[date])?.totalMinutes ?? null,
  }));

// sessions: the exercise sessions readMonthSessions(month) returned.
// The workouts that started in the YYYY-MM month, oldest first:
// [{ date, logId, type }], for the workout calendar.
export const buildMonthWorkouts = (month, sessions) =>
  [...(sessions || [])]
    .sort((a, b) => ms(a.startTime) - ms(b.startTime))
    .map((session) => ({
      date: toLocalDate(session.startTime),
      logId: session.metadata?.id ?? null,
      type: WORKOUT_TYPES[session.exerciseType] || "Workout",
    }))
    .filter((w) => w.date.slice(0, 7) === month);

// raw: what readWorkoutRecords(date, id) returned. The workout as the day
// lists it, plus its heart rate points for the chart:
// points: [{ t, bpm, zone }], t in seconds from the start. There is no
// route, so the page shows no map. null when the session is gone.
export const buildWorkoutDetail = (date, raw, profile) => {
  if (!raw.session) return null;
  const age = ageOn(date, profile);
  const samples = flattenHeartRate(raw.heartRate);
  const resting = raw.restingHeartRate || {};
  const restingHeartRate =
    lastByTime(resting.today)?.beatsPerMinute ??
    lastByTime(resting.previous)?.beatsPerMinute ??
    null;

  const start = ms(raw.session.startTime);
  const end = ms(raw.session.endTime);
  const starts = zoneStarts(age, restingHeartRate);
  const inside = (samples || [])
    .filter((s) => s.time >= start && s.time < end && Number.isFinite(s.bpm))
    .sort((a, b) => a.time - b.time);

  return {
    ...buildWorkout(raw.session, raw, samples, age, restingHeartRate),
    date,
    points: thinOut(inside).map((s) => ({
      t: Math.round((s.time - start) / 1000),
      bpm: s.bpm,
      zone: zoneForBpm(s.bpm, starts),
    })),
    hasRoute: false,
  };
};

// Health Connect device types that are worn: watch, ring, fitness band,
// chest strap
const WORN_DEVICE_TYPES = [1, 4, 6, 7];

// The model of the watch that recorded the day ("Pixel Watch 3"), or null.
// Only some record types carry it, and the phone's own records are ignored.
export const watchDevice = (raw) => {
  const records = [
    ...(raw.sleep || []),
    ...(raw.exercise || []),
    ...(raw.heartRate || []),
    ...(raw.restingHeartRate?.today || []),
  ];
  for (const record of records) {
    const device = record?.metadata?.device;
    if (device?.model && WORN_DEVICE_TYPES.includes(device.type)) {
      return device.model;
    }
  }
  return null;
};

// True when the watch recorded nothing at all for the day
export const isEmptyDay = (day) =>
  !day.sleep &&
  (day.workouts || []).length === 0 &&
  !day.steps &&
  day.heart?.restingHeartRate == null &&
  !(day.heart?.hr5min || []).some((bpm) => bpm != null);

// date: "YYYY-MM-DD". raw: what readDayRecords(date) returned.
// profile: { dob }, used for the heart rate zones.
export const buildDay = (date, raw, profile) => {
  const age = ageOn(date, profile);
  const samples = flattenHeartRate(raw.heartRate);
  const heart = buildHeart(date, raw, samples, age);
  const resting = heart.restingHeartRate ?? heart.previousRestingHeartRate;

  return {
    date,
    steps: raw.steps?.total ?? null,
    sleep: buildSleep(raw.sleep),
    heart,
    vo2Max: buildVo2Max(raw.vo2Max),
    workouts: [...(raw.exercise || [])]
      .sort((a, b) => ms(a.startTime) - ms(b.startTime))
      .map((session) => buildWorkout(session, raw, samples, age, resting)),
  };
};
