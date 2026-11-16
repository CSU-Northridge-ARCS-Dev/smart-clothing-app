import {
  GET_DEVICES,
  FITBIT_DAY_LOADING,
  FITBIT_DAY_LOADED,
  FITBIT_DAY_ERROR,
  FITBIT_CLEAR_DAYS,
  FITBIT_WEEK_LOADING,
  FITBIT_WEEK_LOADED,
  FITBIT_WEEK_ERROR,
  FITBIT_WORKOUT_LOADING,
  FITBIT_WORKOUT_LOADED,
  FITBIT_WORKOUT_ERROR,
  FITBIT_MONTH_LOADING,
  FITBIT_MONTH_LOADED,
  FITBIT_MONTH_ERROR,
  HEALTH_CONNECT_SET_STATUS,
} from "./types";
import {
  collection,
  addDoc,
  setDoc,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  deleteField 
} from "firebase/firestore";
import { auth, database } from "../../firebaseConfig.js";
import { saveDailyStats } from "../services/healthStore";
import {
  toLocalDateString,
  addDaysToDateString,
} from "../utils/dateConversions";
import {
  getLastSavedDate,
  setLastSavedDate,
  getHealthConnectDisconnected,
  setHealthConnectDisconnected,
} from "../utils/localStorage";
import * as healthConnect from "../services/healthConnect";
import {
  buildDay,
  buildWeek,
  buildMonthWorkouts,
  buildWorkoutDetail,
  isEmptyDay,
  watchDevice,
} from "../utils/healthConnectDay";

export const getDevices = () => {
  return {
    type: GET_DEVICES,
  };
};

export const savePushTokenToBackend = (token) => {
  return async (dispatch) => {
    try {
      const userId = auth.currentUser.uid;
      const tokenRef = doc(database, "Users", userId);  

      // Update or set the push token
      await setDoc(tokenRef, { expoPushToken: token }, { merge: true });

      console.log("Push token saved to the backend.");
    } catch (error) {
      console.error("Error saving push token:", error);
    }
  };
};


export const removePushTokenFromBackend = () => {
  return async (dispatch) => {
    try {
      const userId = auth.currentUser.uid;
      const tokenRef = doc(database, "Users", userId);

      // Remove the push token field
      await updateDoc(tokenRef, { expoPushToken: deleteField() });

      console.log("Push token field removed from the backend.");
    } catch (error) {
      console.error("Error removing push token:", error);
    }
  };
};

// The watch data cache

export const fitbitDayLoading = (date) => ({ type: FITBIT_DAY_LOADING, date });

export const fitbitDayLoaded = (date, day) => ({
  type: FITBIT_DAY_LOADED,
  date,
  day,
});

export const fitbitDayError = (date, error) => ({
  type: FITBIT_DAY_ERROR,
  date,
  error,
});

export const fitbitWeekLoading = (endDate) => ({
  type: FITBIT_WEEK_LOADING,
  endDate,
});

export const fitbitWeekLoaded = (endDate, week) => ({
  type: FITBIT_WEEK_LOADED,
  endDate,
  week,
});

export const fitbitWeekError = (endDate, error) => ({
  type: FITBIT_WEEK_ERROR,
  endDate,
  error,
});

export const fitbitWorkoutLoading = (logId) => ({
  type: FITBIT_WORKOUT_LOADING,
  logId,
});

export const fitbitWorkoutLoaded = (logId, workout) => ({
  type: FITBIT_WORKOUT_LOADED,
  logId,
  workout,
});

export const fitbitWorkoutError = (logId, error) => ({
  type: FITBIT_WORKOUT_ERROR,
  logId,
  error,
});

export const fitbitMonthLoading = (month) => ({
  type: FITBIT_MONTH_LOADING,
  month,
});

export const fitbitMonthLoaded = (month, workouts) => ({
  type: FITBIT_MONTH_LOADED,
  month,
  workouts,
});

export const fitbitMonthError = (month, error) => ({
  type: FITBIT_MONTH_ERROR,
  month,
  error,
});

// Clears the loaded days, weeks, workouts and months
export const clearFitbitDays = () => ({ type: FITBIT_CLEAR_DAYS });

// Saves a finished day to Firestore. Today isn't over yet, so it's skipped,
// and a failed write is only logged so the screen still shows the day.
// Returns "saved", "skipped" (nothing to write: today, or a day already
// saved from Fitbit) or "failed".
const saveFinishedDay = async (
  date,
  day,
  { source = "health_connect", device = null } = {}
) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return "failed";
  if (date >= toLocalDateString()) return "skipped";
  try {
    const result = await saveDailyStats(uid, day, {
      source,
      device,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    return result === "skipped" ? "skipped" : "saved";
  } catch (error) {
    console.log("DailyStats save error: ", error);
    return "failed";
  }
};

// True when a record type couldn't be read
const hasReadFailure = (raw) =>
  Object.values(raw.errors || {}).includes("read_failed");

// Reads and builds one Health Connect day. device is the watch model, and
// readFailed is true when a record type couldn't be read.
const readHealthConnectDay = async (date, getState) => {
  const raw = await healthConnect.readDayRecords(date);
  const dob = getState().user.userMetricsData?.dob;
  return {
    day: buildDay(date, raw, { dob }),
    device: watchDevice(raw),
    readFailed: hasReadFailure(raw),
  };
};

const HEALTH_CONNECT_READ_FAILED = "HEALTH_CONNECT_READ_FAILED";

// An error whose code is shown to the athlete
const loadError = (code) => Object.assign(new Error(code), { loadCode: code });

// Shared by the Health Connect week, month and workout loaders. existing is
// the cached entry; one already loaded (or loading) is not read again unless
// force is true. read returns the raw records and build turns them into
// what the screen shows.
const loadHealthConnectEntry = async (
  dispatch,
  getState,
  existing,
  force,
  { read, build, loading, loaded, failed }
) => {
  if (!force && existing && (existing.loading || existing.data)) return;
  if (getState().device.healthConnect.status !== "connected") return;

  dispatch(loading());
  try {
    const raw = await read();
    if (hasReadFailure(raw)) throw loadError(HEALTH_CONNECT_READ_FAILED);
    dispatch(loaded(build(raw)));
  } catch (error) {
    if (!error?.loadCode) console.log("Health Connect load error: ", error);
    dispatch(failed(error?.loadCode || HEALTH_CONNECT_READ_FAILED));
  }
};

// How many finished days the auto-save goes back at most
const AUTO_SAVE_MAX_DAYS = 30;
// A day with no data this recent may only be waiting for the watch to sync
const EMPTY_DAY_WAIT_DAYS = 3;
let autoSaveRunning = false;

// The first day the auto-save still has to save
const firstDayToSave = async (uid, today, maxDays) => {
  const earliest = addDaysToDateString(today, -maxDays);
  const lastSaved = await getLastSavedDate(uid);
  const next = lastSaved ? addDaysToDateString(lastSaved, 1) : earliest;
  return next > earliest ? next : earliest;
};

// A day that can't be read or written stops the run, and the next run starts
// again from that day. A day with no data is never written: a recent one
// stops the run too, and an older one is passed over.
const autoSaveHealthConnectDays = async (dispatch, getState, uid) => {
  if (!(await dispatch(startCheckHealthConnect()))) return;

  const today = toLocalDateString();
  const yesterday = addDaysToDateString(today, -1);
  const emptyWaitFrom = addDaysToDateString(today, -EMPTY_DAY_WAIT_DAYS);
  let date = await firstDayToSave(uid, today, AUTO_SAVE_MAX_DAYS);

  for (; date <= yesterday; date = addDaysToDateString(date, 1)) {
    const { day, device, readFailed } = await readHealthConnectDay(
      date,
      getState
    );
    if (readFailed) return;
    if (isEmptyDay(day)) {
      if (date >= emptyWaitFrom) return;
    } else {
      const result = await saveFinishedDay(date, day, {
        source: "health_connect",
        device,
      });
      if (result === "failed") return;
    }
    await setLastSavedDate(uid, date);
  }
};

// Saves the finished days since the last auto-save
// without opening DailySummary.
export const startAutoSaveDays = () => {
  return async (dispatch, getState) => {
    if (autoSaveRunning) return;
    autoSaveRunning = true;
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      await autoSaveHealthConnectDays(dispatch, getState, uid);
    } catch (error) {
      console.log("Auto-save error: ", error);
    } finally {
      autoSaveRunning = false;
    }
  };
};

// Health Connect

export const setHealthConnectStatus = (
  status,
  permissions = [],
  error = null
) => ({
  type: HEALTH_CONNECT_SET_STATUS,
  status,
  permissions,
  error,
});

// Connected means Health Connect is on the phone, at least one read
// permission is granted, and the athlete hasn't pressed Disconnect.
// Returns true when connected.
export const startCheckHealthConnect = () => {
  return async (dispatch) => {
    const status = await healthConnect.getStatus();
    if (status !== "available") {
      dispatch(setHealthConnectStatus(status));
      return false;
    }
    try {
      const uid = auth.currentUser?.uid;
      const disconnected = uid
        ? await getHealthConnectDisconnected(uid)
        : false;
      const permissions = disconnected ? [] : await healthConnect.getGranted();
      const connected = permissions.length > 0;
      dispatch(
        setHealthConnectStatus(
          connected ? "connected" : "not_connected",
          permissions
        )
      );
      return connected;
    } catch (error) {
      console.log("Health Connect check error: ", error);
      dispatch(setHealthConnectStatus("error", [], "check_failed"));
      return false;
    }
  };
};

// Opens the Health Connect permission sheet. Returns true when the athlete
// allowed at least one data type.
export const startConnectHealthConnect = () => {
  return async (dispatch) => {
    const status = await healthConnect.getStatus();
    if (status !== "available") {
      dispatch(setHealthConnectStatus(status));
      return false;
    }
    // After a Disconnect, Health Connect only drops the permissions when the
    // app next starts, so the sheet can't be trusted until then.
    if (healthConnect.isRevokePending()) {
      dispatch(setHealthConnectStatus("not_connected", [], "restart_needed"));
      return false;
    }

    dispatch(setHealthConnectStatus("connecting"));
    try {
      const permissions = await healthConnect.requestPermissions();
      if (permissions.length === 0) {
        dispatch(setHealthConnectStatus("not_connected", [], "no_permissions"));
        return false;
      }
      const uid = auth.currentUser?.uid;
      if (uid) await setHealthConnectDisconnected(uid, false);
      dispatch(clearFitbitDays());
      dispatch(setHealthConnectStatus("connected", permissions));
      return true;
    } catch (error) {
      console.log("Health Connect connect error: ", error);
      dispatch(setHealthConnectStatus("error", [], "connect_failed"));
      return false;
    }
  };
};

// Remembers the choice on the phone so the card changes at once, then asks
// Health Connect to drop the permissions (applied when the app next starts).
export const startDisconnectHealthConnect = () => {
  return async (dispatch) => {
    const uid = auth.currentUser?.uid;
    if (uid) await setHealthConnectDisconnected(uid, true);
    try {
      await healthConnect.revoke();
    } catch (error) {
      console.log("Health Connect revoke error: ", error);
    }
    dispatch(clearFitbitDays());
    dispatch(setHealthConnectStatus("not_connected"));
  };
};

// The watch

// The connection status the screens wait on
export const selectWatchStatus = (state) => state.device.healthConnect.status;

// Returns true when the watch's data can be read
export const startCheckWatch = () => {
  return (dispatch) => dispatch(startCheckHealthConnect());
};

// Loads one day (YYYY-MM-DD) into state.device.fitbit.days, the cache Home
// and DailySummary share. A day already loaded (or loading) is not read
// again unless force is true. A finished day with data is then saved.
export const startLoadDay = (date, { force = false } = {}) => {
  return async (dispatch, getState) => {
    const { fitbit, healthConnect: connection } = getState().device;
    const existing = fitbit.days[date];
    if (!force && existing && (existing.loading || existing.data)) return;
    if (connection.status !== "connected") return;

    dispatch(fitbitDayLoading(date));
    let loaded;
    try {
      loaded = await readHealthConnectDay(date, getState);
      dispatch(fitbitDayLoaded(date, loaded.day));
    } catch (error) {
      console.log("Health Connect day load error: ", error);
      dispatch(fitbitDayError(date, HEALTH_CONNECT_READ_FAILED));
      return;
    }
    if (loaded.readFailed || isEmptyDay(loaded.day)) return;
    await saveFinishedDay(date, loaded.day, {
      source: "health_connect",
      device: loaded.device,
    });
  };
};

// Loads the 7 days ending at endDate (steps and sleep for the activity
// rings) into state.device.fitbit.weeks
export const startLoadWeek = (endDate, { force = false } = {}) => {
  return (dispatch, getState) => {
    return loadHealthConnectEntry(
      dispatch,
      getState,
      getState().device.fitbit.weeks[endDate],
      force,
      {
        read: () => healthConnect.readWeekRecords(endDate),
        build: buildWeek,
        loading: () => fitbitWeekLoading(endDate),
        loaded: (week) => fitbitWeekLoaded(endDate, week),
        failed: (code) => fitbitWeekError(endDate, code),
      }
    );
  };
};

// Loads the workout days of a YYYY-MM month into state.device.fitbit.months
export const startLoadMonth = (month, { force = false } = {}) => {
  return (dispatch, getState) => {
    return loadHealthConnectEntry(
      dispatch,
      getState,
      getState().device.fitbit.months[month],
      force,
      {
        read: () => healthConnect.readMonthSessions(month),
        build: (raw) => buildMonthWorkouts(month, raw.exercise),
        loading: () => fitbitMonthLoading(month),
        loaded: (workouts) => fitbitMonthLoaded(month, workouts),
        failed: (code) => fitbitMonthError(month, code),
      }
    );
  };
};

// Loads one workout (its stats and heart rate points) into
// state.device.fitbit.workouts. date is the day it was recorded, and id is
// the workout's logId from that day.
export const startLoadWorkout = (date, id, { force = false } = {}) => {
  return (dispatch, getState) => {
    const dob = getState().user.userMetricsData?.dob;
    return loadHealthConnectEntry(
      dispatch,
      getState,
      getState().device.fitbit.workouts[id],
      force,
      {
        read: () => healthConnect.readWorkoutRecords(date, id),
        build: (raw) => {
          if (!raw.session) throw loadError("WORKOUT_NOT_FOUND");
          return buildWorkoutDetail(date, raw, { dob });
        },
        loading: () => fitbitWorkoutLoading(id),
        loaded: (workout) => fitbitWorkoutLoaded(id, workout),
        failed: (code) => fitbitWorkoutError(id, code),
      }
    );
  };
};
