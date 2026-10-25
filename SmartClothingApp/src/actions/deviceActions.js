import {
  GET_DEVICES,
  FITBIT_SET_STATUS,
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
} from "./types";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
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
import {
  getFitbitTokens,
  setFitbitTokens,
  clearFitbitTokens,
} from "../utils/fitbitTokens";
import {
  getFitbitAuthUrl,
  getFitbitDay,
  getFitbitWeek,
  getFitbitWorkout,
  getFitbitMonthWorkouts,
  getErrorCode,
} from "../services/insightsApi";

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

// Fitbit 

// Service errors that mean the stored tokens are no longer usable
const FITBIT_REAUTH_ERRORS = ["FITBIT_REAUTH_REQUIRED", "FITBIT_NOT_CONNECTED"];

export const setFitbitStatus = (status, error = null) => ({
  type: FITBIT_SET_STATUS,
  status,
  error,
});

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

// Clears the loaded days and weeks
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

export const clearFitbitDays = () => ({ type: FITBIT_CLEAR_DAYS });

// Connected means a token pair is in SecureStore
export const startCheckFitbit = () => {
  return async (dispatch) => {
    const tokens = await getFitbitTokens();
    dispatch(setFitbitStatus(tokens ? "connected" : "not_connected"));
    return Boolean(tokens);
  };
};

// Fitbit login in the in-app browser. The service redirects back to returnTo
// with the tokens (or with error=) in the query string.
export const startConnectFitbit = () => {
  return async (dispatch) => {
    dispatch(setFitbitStatus("connecting"));
    try {
      const returnTo = Linking.createURL("fitbit");
      const authUrl = await getFitbitAuthUrl(returnTo);
      const result = await WebBrowser.openAuthSessionAsync(authUrl, returnTo);

      if (result.type !== "success") {
        // The user closed the browser
        dispatch(setFitbitStatus("not_connected"));
        return false;
      }

      const params = Linking.parse(result.url).queryParams || {};
      if (params.error || !params.accessToken || !params.refreshToken) {
        dispatch(setFitbitStatus("error", params.error || "missing_tokens"));
        return false;
      }

      await setFitbitTokens({
        accessToken: params.accessToken,
        refreshToken: params.refreshToken,
        expiresAt: params.expiresAt,
        fitbitUserId: params.fitbitUserId,
      });
      dispatch(clearFitbitDays());
      dispatch(setFitbitStatus("connected"));
      return true;
    } catch (error) {
      console.log("Fitbit connect error: ", error);
      dispatch(setFitbitStatus("error", getErrorCode(error)));
      return false;
    }
  };
};

export const startDisconnectFitbit = () => {
  return async (dispatch) => {
    await clearFitbitTokens();
    dispatch(clearFitbitDays());
    dispatch(setFitbitStatus("not_connected"));
  };
};

// If a service error means the Fitbit login is no longer usable, forget the
// tokens and go back to not connected. Returns true when that happened.
export const startHandleFitbitError = (code) => {
  return async (dispatch) => {
    if (!FITBIT_REAUTH_ERRORS.includes(code)) return false;
    await clearFitbitTokens();
    dispatch(clearFitbitDays());
    dispatch(setFitbitStatus("not_connected", code));
    return true;
  };
};

// Shared by the day and week loaders. existing is the cached entry; one
// already loaded (or loading) is not fetched again unless force is true.
const loadFitbitEntry = async (
  dispatch,
  existing,
  force,
  { fetch, loading, loaded, failed }
) => {
  if (!force && existing && (existing.loading || existing.data)) return;

  const tokens = await getFitbitTokens();
  if (!tokens) {
    dispatch(setFitbitStatus("not_connected"));
    return;
  }

  dispatch(loading());
  try {
    dispatch(loaded(await fetch()));
  } catch (error) {
    const code = getErrorCode(error);
    dispatch(failed(code));
    await dispatch(startHandleFitbitError(code));
  }
};

// Loads one day (YYYY-MM-DD) into state.device.fitbit.days
export const startLoadFitbitDay = (date, { force = false } = {}) => {
  return (dispatch, getState) =>
    loadFitbitEntry(dispatch, getState().device.fitbit.days[date], force, {
      fetch: () => getFitbitDay(date),
      loading: () => fitbitDayLoading(date),
      loaded: (day) => fitbitDayLoaded(date, day),
      failed: (code) => fitbitDayError(date, code),
    });
};

// Loads the 7 days ending at endDate (steps and sleep for the activity rings)
// into state.device.fitbit.weeks
export const startLoadFitbitWeek = (endDate, { force = false } = {}) => {
  return (dispatch, getState) =>
    loadFitbitEntry(dispatch, getState().device.fitbit.weeks[endDate], force, {
      fetch: () => getFitbitWeek(endDate),
      loading: () => fitbitWeekLoading(endDate),
      loaded: (week) => fitbitWeekLoaded(endDate, week),
      failed: (code) => fitbitWeekError(endDate, code),
    });
};

// Loads one workout (route and heart rate points) into
// state.device.fitbit.workouts. date is the day it was recorded.
export const startLoadFitbitWorkout = (date, logId, { force = false } = {}) => {
  return (dispatch, getState) =>
    loadFitbitEntry(dispatch, getState().device.fitbit.workouts[logId], force, {
      fetch: () => getFitbitWorkout(date, logId),
      loading: () => fitbitWorkoutLoading(logId),
      loaded: (workout) => fitbitWorkoutLoaded(logId, workout),
      failed: (code) => fitbitWorkoutError(logId, code),
    });
};

// Loads the workout days of a YYYY-MM month into state.device.fitbit.months
export const startLoadFitbitMonth = (month, { force = false } = {}) => {
  return (dispatch, getState) =>
    loadFitbitEntry(dispatch, getState().device.fitbit.months[month], force, {
      fetch: () => getFitbitMonthWorkouts(month),
      loading: () => fitbitMonthLoading(month),
      loaded: (workouts) => fitbitMonthLoaded(month, workouts),
      failed: (code) => fitbitMonthError(month, code),
    });
};
