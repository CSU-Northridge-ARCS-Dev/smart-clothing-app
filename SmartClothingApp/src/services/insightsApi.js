import axios from "axios";
import { INSIGHTS_API_URL } from "@env";

import { auth } from "../../firebaseConfig.js";
import { getFitbitTokens, setFitbitTokens } from "../utils/fitbitTokens";

// Client for insights-service. This is the only module that knows the
// service URL. Every request carries the Firebase ID token and, when the
// watch is connected, the Fitbit token pair.
const insightsApi = axios.create({
  baseURL: INSIGHTS_API_URL,
  timeout: 30000,
});

export const addAuthHeaders = async (config) => {
  config.headers = config.headers || {};
  // ngrok's free domain shows an HTML warning page unless this is set
  config.headers["ngrok-skip-browser-warning"] = "true";

  const user = auth.currentUser;
  if (user && user.getIdToken) {
    config.headers.Authorization = `Bearer ${await user.getIdToken()}`;
  }

  const tokens = await getFitbitTokens();
  if (tokens) {
    config.headers["X-Fitbit-Token"] = tokens.accessToken;
    config.headers["X-Fitbit-Refresh-Token"] = tokens.refreshToken;
  }
  return config;
};

// Fitbit refresh tokens are single-use. If the service refreshed them, the new
// pair must be saved, even when the response is an error.
export const saveRefreshedTokens = async (data) => {
  if (data && data.refreshedTokens) {
    await setFitbitTokens(data.refreshedTokens);
  }
};

insightsApi.interceptors.request.use(addAuthHeaders);
insightsApi.interceptors.response.use(
  async (response) => {
    await saveRefreshedTokens(response.data);
    return response;
  },
  async (error) => {
    if (error.response) {
      await saveRefreshedTokens(error.response.data);
    }
    return Promise.reject(error);
  }
);

// Service error code from an axios error, e.g. "FITBIT_REAUTH_REQUIRED"
export const getErrorCode = (error) =>
  (error &&
    error.response &&
    error.response.data &&
    error.response.data.error) ||
  (error && error.message) ||
  "UNKNOWN_ERROR";

// { url } - the Fitbit authorize URL; returnTo is the app link to come back to
export const getFitbitAuthUrl = async (returnTo) => {
  const response = await insightsApi.get("/api/fitbit/auth-url", {
    params: { returnTo },
  });
  return response.data.url;
};

// The normalized day: { date, steps, sleep, heart, workouts }. date is YYYY-MM-DD.
export const getFitbitDay = async (date) => {
  const response = await insightsApi.get(`/api/fitbit/day/${date}`);
  return response.data.day;
};

// 7 entries [{ date, steps, sleepMinutes }] ending at endDate (YYYY-MM-DD),
// oldest first. Missing values are null.
export const getFitbitWeek = async (endDate) => {
  const response = await insightsApi.get(`/api/fitbit/week/${endDate}`);
  return response.data.week;
};

export default insightsApi;
