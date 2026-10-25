import { generateInsight, getErrorCode } from "../services/insightsApi";
import { getCachedFeedback, setCachedFeedback } from "../utils/localStorage";
import { ageFromDob } from "../utils/age";
import { startHandleFitbitError } from "./deviceActions";

// The signup profile Claude sees
export const buildCoachProfile = (userMetricsData = {}) => {
  const { gender, dob, height, weight, sports } = userMetricsData;
  return { gender, age: ageFromDob(dob), height, weight, sports };
};

// AI feedback for one day (YYYY-MM-DD)
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
      return { insight: data.insight };
    } catch (error) {
      const code = getErrorCode(error);
      await dispatch(startHandleFitbitError(code));
      throw new Error(code);
    }
  };
};
