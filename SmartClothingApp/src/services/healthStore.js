import { doc, setDoc, serverTimestamp, increment } from "firebase/firestore";

import { database } from "../../firebaseConfig.js";

// Writes the athlete's finished day (Users/{uid}/DailyStats/{date}) and
// Claude's feedback for it (Users/{uid}/AIFeedback/{date})

export const SCHEMA_VERSION = 1;

// Missing values are stored as null, never undefined or 0
const orNull = (value) => (value === undefined ? null : value);

const toZones = (zones) =>
  zones
    ? {
        fatBurn: orNull(zones.fatBurn),
        cardio: orNull(zones.cardio),
        peak: orNull(zones.peak),
      }
    : null;

// Fitbit days carry the timeline as levels[{ dateTime }]; the document
// uses stages[{ start }]. Days already in the stored shape pass through.
const toStages = (sleep) =>
  (sleep.stages || sleep.levels || []).map((s) => ({
    start: orNull(s.start ?? s.dateTime),
    seconds: orNull(s.seconds),
    level: orNull(s.level),
  }));

const toSleep = (sleep) =>
  sleep
    ? {
        totalMinutes: orNull(sleep.totalMinutes),
        efficiency: orNull(sleep.efficiency),
        deep: orNull(sleep.deep),
        light: orNull(sleep.light),
        rem: orNull(sleep.rem),
        wake: orNull(sleep.wake),
        bedTime: orNull(sleep.bedTime),
        wakeTime: orNull(sleep.wakeTime),
        stages: toStages(sleep),
      }
    : null;

const toHeart = (heart) => {
  const h = heart || {};
  return {
    restingHeartRate: orNull(h.restingHeartRate),
    previousRestingHeartRate: orNull(h.previousRestingHeartRate),
    zones: toZones(h.zones),
    hr5min: orNull(h.hr5min),
  };
};

const toVo2Max = (vo2Max) =>
  vo2Max ? { low: orNull(vo2Max.low), high: orNull(vo2Max.high) } : null;

const toWorkout = (w) => ({
  id: orNull(w.id ?? w.logId),
  type: orNull(w.type),
  startTime: orNull(w.startTime),
  durationMin: orNull(w.durationMin),
  avgHeartRate: orNull(w.avgHeartRate),
  calories: orNull(w.calories),
  steps: orNull(w.steps),
  distanceKm: orNull(w.distanceKm),
  paceMinPerKm: orNull(w.paceMinPerKm),
  hasGps: Boolean(w.hasGps),
  zones: toZones(w.zones),
});

// Day object -> DailyStats document (without syncedAt)
export const toDailyStatsDoc = (day, { source, device, timezone } = {}) => ({
  date: day.date,
  schemaVersion: SCHEMA_VERSION,
  source: orNull(source),
  device: orNull(device),
  timezone: orNull(timezone),
  steps: orNull(day.steps),
  sleep: toSleep(day.sleep),
  heart: toHeart(day.heart),
  vo2Max: toVo2Max(day.vo2Max),
  workouts: (day.workouts || []).map(toWorkout),
});

// One write per day. A re-save overwrites the document.
export const saveDailyStats = async (uid, day, meta) => {
  const data = toDailyStatsDoc(day, meta);
  await setDoc(doc(database, "Users", uid, "DailyStats", data.date), {
    ...data,
    syncedAt: serverTimestamp(),
  });
};

// meta.dataSource: source of the day the feedback was based on.
// meta.regenerate: true for Regenerate, which overwrites the feedback and
// counts the extra call.
export const saveAIFeedback = async (
  uid,
  date,
  insight,
  usage,
  { dataSource, regenerate = false } = {},
) => {
  const u = usage || {};
  await setDoc(
    doc(database, "Users", uid, "AIFeedback", date),
    {
      date,
      schemaVersion: SCHEMA_VERSION,
      headline: orNull(insight.headline),
      keySignals: insight.keySignals || [],
      focus: insight.focus || [],
      model: orNull(u.model),
      inputTokens: orNull(u.inputTokens),
      outputTokens: orNull(u.outputTokens),
      dataSource: orNull(dataSource),
      regeneratedCount: regenerate ? increment(1) : 0,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
};
