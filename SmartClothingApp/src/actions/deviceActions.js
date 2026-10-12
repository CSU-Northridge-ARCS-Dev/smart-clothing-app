import {
  GET_DEVICES,
  FITBIT_SET_STATUS,
  FITBIT_DAY_LOADING,
  FITBIT_DAY_LOADED,
  FITBIT_DAY_ERROR,
  FITBIT_CLEAR_DAYS,
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

// Loads one day (YYYY-MM-DD) into state.device.fitbit.days. A day already
// loaded is not fetched again unless force is true.
export const startLoadFitbitDay = (date, { force = false } = {}) => {
  return async (dispatch, getState) => {
    const existing = getState().device.fitbit.days[date];
    if (!force && existing && (existing.loading || existing.data)) return;

    const tokens = await getFitbitTokens();
    if (!tokens) {
      dispatch(setFitbitStatus("not_connected"));
      return;
    }

    dispatch(fitbitDayLoading(date));
    try {
      const day = await getFitbitDay(date);
      dispatch(fitbitDayLoaded(date, day));
    } catch (error) {
      const code = getErrorCode(error);
      dispatch(fitbitDayError(date, code));
      if (FITBIT_REAUTH_ERRORS.includes(code)) {
        await clearFitbitTokens();
        dispatch(clearFitbitDays());
        dispatch(setFitbitStatus("not_connected", code));
      }
    }
  };
};
