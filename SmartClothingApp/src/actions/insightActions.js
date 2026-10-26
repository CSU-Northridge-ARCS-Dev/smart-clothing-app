import { auth } from "../../firebaseConfig.js";
import { generateInsight, getErrorCode } from "../services/insightsApi";
import { saveAIFeedback } from "../services/healthStore";
import { getCachedFeedback, setCachedFeedback } from "../utils/localStorage";
import { ageFromDob } from "../utils/age";
import { startHandleFitbitError } from "./deviceActions";

// The signup profile Claude sees
export const buildCoachProfile = (userMetricsData = {}) => {
  const { gender, dob, height, weight, sports } = userMetricsData;
  return { gender, age: ageFromDob(dob), height, weight, sports };
};

// Saves the feedback to Firestore. A failed write is only logged so the
// card still shows the feedback.
const saveFeedback = async (date, insight, usage, regenerate) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  try {
    await saveAIFeedback(uid, date, insight, usage, {
      dataSource: "fitbit",
      regenerate,
    });
  } catch (error) {
    console.log("AIFeedback save error: ", error);
  }
};

// AI feedback for one day (YYYY-MM-DD). force skips the cache (Regenerate).
export const startGenerateFeedback = (date, { force = false } = {}) => {
  return async (dispatch, getState) => {
    if (!force) {
      const cached = await getCachedFeedback(date);
      if (cached) return { insight: cached, cached: true };
    }

    const profile = buildCoachProfile(getState().user.userMetricsData);
    try {
      const data = await generateInsight(date, profile);
      if (!data.insight) return { reason: data.reason || "NO_DATA" };
      await setCachedFeedback(date, data.insight);
      await saveFeedback(date, data.insight, data.usage, force);
      return { insight: data.insight };
    } catch (error) {
      const code = getErrorCode(error);
      await dispatch(startHandleFitbitError(code));
      throw new Error(code);
    }
  };
};
