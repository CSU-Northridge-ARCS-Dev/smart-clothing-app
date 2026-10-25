import axios from "axios";
import { INSIGHTS_API_URL } from "@env";

import { auth } from "../../firebaseConfig.js";
import { getFitbitTokens, setFitbitTokens } from "../utils/fitbitTokens";

// Client for insights-service
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

// Fitbit refresh tokens are single-use
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

// One workout with its route and heart rate points:
// { ...workout, date, zoneRanges, points: [{ t, lat, lon, bpm, zone }], hasRoute }
export const getFitbitWorkout = async (date, logId) => {
  const response = await insightsApi.get(
    `/api/fitbit/workout/${date}/${logId}`
  );
  return response.data.workout;
};

// [{ date, logId, type }] for every workout in a YYYY-MM month
export const getFitbitMonthWorkouts = async (month) => {
  const response = await insightsApi.get(`/api/fitbit/workouts/${month}`);
  return response.data.workouts;
};

// Claude feedback for one day. profile is { gender, age, height, weight, sports }
//  Returns { insight, usage } or
// { insight: null, reason: "NO_DATA" } when the day has no sleep or workouts.
export const generateInsight = async (date, profile) => {
  const response = await insightsApi.post("/api/insights/generate", {
    date,
    profile,
  });
  return response.data;
};

export default insightsApi;
