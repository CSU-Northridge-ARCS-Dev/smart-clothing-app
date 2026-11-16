import { auth } from "../../firebaseConfig.js";
import { generateInsightFromDay, getErrorCode } from "../services/insightsApi";
import { saveAIFeedback } from "../services/healthStore";
import { getCachedFeedback, setCachedFeedback } from "../utils/localStorage";
import { ageFromDob } from "../utils/age";

// The signup profile Claude sees
export const buildCoachProfile = (userMetricsData = {}) => {
  const { gender, dob, height, weight, sports } = userMetricsData;
  return { gender, age: ageFromDob(dob), height, weight, sports };
};

// Sleep or a workout is enough to give feedback on; the service applies the
// same rule
const hasCoachableData = (day) =>
  Boolean(day && (day.sleep || (day.workouts || []).length > 0));

// Saves the feedback to Firestore. A failed write is only logged so the
// card still shows the feedback.
const saveFeedback = async (date, insight, usage, { dataSource, regenerate }) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  try {
    await saveAIFeedback(uid, date, insight, usage, { dataSource, regenerate });
  } catch (error) {
    console.log("AIFeedback save error: ", error);
  }
};

// Caches and saves a service answer. Returns what the feedback card shows.
const keepFeedback = async (date, data, meta) => {
  if (!data.insight) return { reason: data.reason || "NO_DATA" };
  await setCachedFeedback(date, data.insight);
  await saveFeedback(date, data.insight, data.usage, meta);
  return { insight: data.insight };
};

// AI feedback for one day (YYYY-MM-DD), which the phone built from Health
// Connect and sends to the service. force skips the cache (Regenerate).
export const startGenerateFeedback = (date, { force = false } = {}) => {
  return async (dispatch, getState) => {
    if (!force) {
      const cached = await getCachedFeedback(date);
      if (cached) return { insight: cached, cached: true };
    }

    const profile = buildCoachProfile(getState().user.userMetricsData);

    const day = getState().device.watch.days[date]?.data;
    if (!hasCoachableData(day)) return { reason: "NO_DATA" };
    try {
      const data = await generateInsightFromDay(date, profile, day);
      return await keepFeedback(date, data, {
        dataSource: "health_connect",
        regenerate: force,
      });
    } catch (error) {
      throw new Error(getErrorCode(error));
    }
  };
};
