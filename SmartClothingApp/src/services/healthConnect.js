import { Platform } from "react-native";
import {
  getSdkStatus,
  initialize,
  requestPermission,
  getGrantedPermissions,
  revokeAllPermissions,
  openHealthConnectSettings,
  readRecords,
  aggregateRecord,
  SdkAvailabilityStatus,
} from "react-native-health-connect";
import { addDaysToDateString } from "../utils/dateConversions";

// Health Connect is the health store on an Android phone. The watch's own
// phone app (Google Health, Samsung Health) fills it, and this app only
// reads it. Nothing here touches Redux or Firebase.

// The record types the app reads
export const READ_RECORD_TYPES = [
  "Steps",
  "HeartRate",
  "RestingHeartRate",
  "SleepSession",
  "ExerciseSession",
  "Distance",
  "TotalCaloriesBurned",
  "Vo2Max",
];

// What the permission sheet asks for
export const PERMISSIONS = [
  ...READ_RECORD_TYPES.map((recordType) => ({
    accessType: "read",
    recordType,
  })),
  { accessType: "read", recordType: "ReadHealthDataHistory" },
];

// Where the phone's Health Connect can be installed or updated
export const HEALTH_CONNECT_STORE_URL =
  "market://details?id=com.google.android.apps.healthdata";

let initialized = false;

// A revoke only takes effect when the app next starts
let revokePending = false;

const ensureInitialized = async () => {
  if (!initialized) initialized = await initialize();
  return initialized;
};

// "available" | "update_needed" | "unavailable"
export const getStatus = async () => {
  if (Platform.OS !== "android") return "unavailable";
  try {
    const status = await getSdkStatus();
    if (
      status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED
    ) {
      return "update_needed";
    }
    if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) return "unavailable";
    return (await ensureInitialized()) ? "available" : "unavailable";
  } catch (error) {
    console.log("Health Connect status error: ", error);
    return "unavailable";
  }
};

const onlyReads = (permissions) =>
  (permissions || []).filter(
    (p) => p.accessType === "read" && READ_RECORD_TYPES.includes(p.recordType)
  );

// Opens the Health Connect permission sheet and returns the read permissions
// the athlete allowed
export const requestPermissions = async () => {
  await ensureInitialized();
  return onlyReads(await requestPermission(PERMISSIONS));
};

// The read permissions the app holds right now
export const getGranted = async () => {
  await ensureInitialized();
  return onlyReads(await getGrantedPermissions());
};

export const revoke = async () => {
  await ensureInitialized();
  await revokeAllPermissions();
  revokePending = true;
};

export const isRevokePending = () => revokePending;

export const openSettings = () => openHealthConnectSettings();

// Local midnight of a YYYY-MM-DD date. Built from parts, not parsed, so it
// stays in the phone's time zone and handles daylight saving days.
const localMidnight = (date) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const between = (start, end) => ({
  operator: "between",
  startTime: start.toISOString(),
  endTime: end.toISOString(),
});

// Every page of one record type. Heart rate can run past one page.
const readAll = async (recordType, start, end) => {
  const records = [];
  let pageToken;
  do {
    const options = { timeRangeFilter: between(start, end) };
    if (pageToken) options.pageToken = pageToken;
    const page = await readRecords(recordType, options);
    records.push(...(page?.records || []));
    pageToken = page?.pageToken;
  } while (pageToken);
  return records;
};

// When two apps on the same phone write the same type (Samsung Health and
// Google Health both on), keep only the app with the most records so
// nothing is counted twice. The first app seen wins a tie.
const oneSource = (records) => {
  const counts = new Map();
  records.forEach((r) => {
    const origin = r?.metadata?.dataOrigin ?? "";
    counts.set(origin, (counts.get(origin) || 0) + 1);
  });
  if (counts.size <= 1) return records;
  let keep;
  let most = -1;
  counts.forEach((count, origin) => {
    if (count > most) {
      most = count;
      keep = origin;
    }
  });
  return records.filter((r) => (r?.metadata?.dataOrigin ?? "") === keep);
};

// The phone's own step counter writes steps under a package that starts
// with this. It counts the same walking as the watch, and it also counts
// on days the watch isn't worn, so it is never used.
const PHONE_STEPS_ORIGIN = "com.android.healthconnect.phone";

// The day's step total from the watch apps only. With no watch steps there
// is no total, even though Health Connect reports 0 or the phone's count.
const readSteps = async (start, end) => {
  const request = { recordType: "Steps", timeRangeFilter: between(start, end) };
  const all = await aggregateRecord(request);
  const origins = all?.dataOrigins || [];
  const watchApps = origins.filter((o) => !o.startsWith(PHONE_STEPS_ORIGIN));
  if (watchApps.length === 0) return { total: null, dataOrigins: [] };
  if (watchApps.length === origins.length) {
    return { total: all.COUNT_TOTAL ?? null, dataOrigins: origins };
  }
  const watch = await aggregateRecord({
    ...request,
    dataOriginFilter: watchApps,
  });
  return { total: watch?.COUNT_TOTAL ?? null, dataOrigins: watchApps };
};

const VO2_MAX_LOOKBACK_DAYS = 30;

// Noon of the day before a date. A night's sleep starts after it.
const noonOfDayBefore = (date) => {
  const noon = localMidnight(addDaysToDateString(date, -1));
  noon.setHours(12);
  return noon;
};

// attempt(recordType, read) runs one read. A type the athlete didn't allow,
// or one that can't be read, comes back as null with the reason in errors.
const startReads = async () => {
  const granted = new Set((await getGranted()).map((p) => p.recordType));
  const errors = {};

  const attempt = async (recordType, read) => {
    if (!granted.has(recordType)) {
      errors[recordType] = "no_permission";
      return null;
    }
    try {
      return await read();
    } catch (error) {
      console.log(`Health Connect ${recordType} read error: `, error);
      errors[recordType] = "read_failed";
      return null;
    }
  };

  return { attempt, errors };
};

// The raw Health Connect records for one local day, unchanged apart from
// keeping one source per type
export const readDayRecords = async (date) => {
  await ensureInitialized();
  const start = localMidnight(date);
  const end = localMidnight(addDaysToDateString(date, 1));
  const dayBefore = localMidnight(addDaysToDateString(date, -1));
  const noonBefore = noonOfDayBefore(date);
  // The watch's app only writes VO2 max now and then (after an outdoor
  // run), so a day carries the latest value from the days before it
  const vo2MaxFrom = localMidnight(
    addDaysToDateString(date, -VO2_MAX_LOOKBACK_DAYS)
  );

  const { attempt, errors } = await startReads();

  const raw = async (recordType, from = start) =>
    attempt(recordType, async () =>
      oneSource(await readAll(recordType, from, end))
    );

  const [
    steps,
    heartRate,
    resting,
    sleep,
    exercise,
    distance,
    calories,
    vo2Max,
  ] = await Promise.all([
    attempt("Steps", () => readSteps(start, end)),
    raw("HeartRate"),
    raw("RestingHeartRate", dayBefore),
    raw("SleepSession", noonBefore),
    raw("ExerciseSession"),
    raw("Distance"),
    raw("TotalCaloriesBurned"),
    raw("Vo2Max", vo2MaxFrom),
  ]);

  const onDay = (time) => {
    const t = new Date(time);
    return t >= start && t < end;
  };

  return {
    date,
    start: start.toISOString(),
    end: end.toISOString(),
    steps,
    heartRate,
    restingHeartRate: resting && {
      today: resting.filter((r) => onDay(r.time)),
      previous: resting.filter((r) => !onDay(r.time)),
    },
    sleep: sleep && sleep.filter((s) => onDay(s.endTime)),
    exercise,
    distance,
    totalCalories: calories,
    vo2Max,
    errors,
  };
};

const WEEK_LENGTH = 7;

// Steps and sleep for the 7 local days ending at endDate, for the activity
// rings. Heart rate isn't read, so this stays quick.
// steps: { [date]: total or null }. sleep: { [date]: the sessions that end
// on that date }, or null when sleep couldn't be read.
export const readWeekRecords = async (endDate) => {
  await ensureInitialized();
  const dates = [];
  for (let i = WEEK_LENGTH - 1; i >= 0; i--) {
    dates.push(addDaysToDateString(endDate, -i));
  }
  const dayStart = (date) => localMidnight(date);
  const dayEnd = (date) => localMidnight(addDaysToDateString(date, 1));

  const { attempt, errors } = await startReads();
  const [totals, sessions] = await Promise.all([
    attempt("Steps", () =>
      Promise.all(dates.map((date) => readSteps(dayStart(date), dayEnd(date))))
    ),
    attempt("SleepSession", () =>
      readAll("SleepSession", noonOfDayBefore(dates[0]), dayEnd(endDate))
    ),
  ]);

  const steps = {};
  dates.forEach((date, i) => {
    steps[date] = totals ? totals[i].total : null;
  });

  // The same sessions a single day's read keeps: one source out of those
  // from noon the day before, then the ones that end on the date
  const sleep = sessions && {};
  if (sessions) {
    dates.forEach((date) => {
      const from = noonOfDayBefore(date);
      const start = dayStart(date);
      const end = dayEnd(date);
      const near = sessions.filter(
        (s) => new Date(s.endTime) > from && new Date(s.startTime) < end
      );
      sleep[date] = oneSource(near).filter((s) => {
        const ended = new Date(s.endTime);
        return ended >= start && ended < end;
      });
    });
  }

  return { endDate, dates, steps, sleep, errors };
};

// The exercise sessions of a YYYY-MM month, for the workout calendar
export const readMonthSessions = async (month) => {
  await ensureInitialized();
  const [y, m] = month.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);

  const { attempt, errors } = await startReads();
  const exercise = await attempt("ExerciseSession", async () =>
    oneSource(await readAll("ExerciseSession", start, end))
  );
  return { month, exercise, errors };
};

// Heart rate is read a little past both ends of a workout, so a record
// that only partly overlaps it isn't missed
const WORKOUT_HEART_RATE_MARGIN_MS = 10 * 60 * 1000;

// One exercise session and what its page needs. date is the day it was
// recorded and id is the session's record id. session is null when Health
// Connect no longer has it. Heart rate covers only the session, so a long
// day isn't read for one workout; distance and calories are the day's, the
// same records the day's own workout list is built from.
export const readWorkoutRecords = async (date, id) => {
  await ensureInitialized();
  const start = localMidnight(date);
  const end = localMidnight(addDaysToDateString(date, 1));
  const dayBefore = localMidnight(addDaysToDateString(date, -1));

  const { attempt, errors } = await startReads();
  const sessions = await attempt("ExerciseSession", () =>
    readAll("ExerciseSession", start, end)
  );
  const session = (sessions || []).find((s) => s?.metadata?.id === id) || null;
  if (!session) return { date, session: null, errors };

  const raw = async (recordType, from, to) =>
    attempt(recordType, async () =>
      oneSource(await readAll(recordType, from, to))
    );
  const heartFrom = new Date(
    new Date(session.startTime).getTime() - WORKOUT_HEART_RATE_MARGIN_MS
  );
  const heartTo = new Date(
    new Date(session.endTime).getTime() + WORKOUT_HEART_RATE_MARGIN_MS
  );

  const [heartRate, resting, distance, calories] = await Promise.all([
    raw("HeartRate", heartFrom, heartTo),
    raw("RestingHeartRate", dayBefore, end),
    raw("Distance", start, end),
    raw("TotalCaloriesBurned", start, end),
  ]);

  return {
    date,
    session,
    heartRate,
    restingHeartRate: resting && {
      today: resting.filter((r) => new Date(r.time) >= start),
      previous: resting.filter((r) => new Date(r.time) < start),
    },
    distance,
    totalCalories: calories,
    errors,
  };
};
