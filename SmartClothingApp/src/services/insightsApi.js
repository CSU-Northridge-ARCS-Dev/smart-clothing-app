import axios from "axios";
import { INSIGHTS_API_URL } from "@env";

import { auth } from "../../firebaseConfig.js";

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
  return config;
};

insightsApi.interceptors.request.use(addAuthHeaders);

// The tunnel answers with one of these and no error code when the service
// behind it is down
const GATEWAY_STATUSES = [502, 503, 504];

// Service error code from an axios error, e.g. "COACH_API_ERROR".
// A service that can't be reached is "Network Error", with or without a
// tunnel in front of it.
export const getErrorCode = (error) => {
  const response = error && error.response;
  const code = response && response.data && response.data.error;
  if (code) return code;
  if (response && GATEWAY_STATUSES.includes(response.status)) {
    return "Network Error";
  }
  return (error && error.message) || "UNKNOWN_ERROR";
};

// The parts of a day the coach reads. The heart rate slots, the sleep
// timeline, VO2 max and the record ids stay on the phone.
export const dayForCoach = (day) => {
  const { levels, ...sleep } = day.sleep || {};
  const { hr5min, ...heart } = day.heart || {};
  return {
    date: day.date,
    steps: day.steps ?? null,
    sleep: day.sleep ? sleep : null,
    heart,
    workouts: (day.workouts || []).map(
      ({ logId, calories, steps, hasGps, ...workout }) => workout
    ),
  };
};

// Claude feedback for a day the phone built itself (Health Connect).
// profile is { gender, age, height, weight, sports }. Returns
// { insight, usage }, or { insight: null, reason: "NO_DATA" } when the day
// has no sleep or workouts.
export const generateInsightFromDay = async (date, profile, day) => {
  const response = await insightsApi.post("/api/insights/generate-from-day", {
    date,
    profile,
    day: dayForCoach(day),
    source: "health_connect",
  });
  return response.data;
};

export default insightsApi;
