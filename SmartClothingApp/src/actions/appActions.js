import {
  USER_METRICS_DATA_MODAL_VISIBLE,
  UPDATE_ACTIVITY_RINGS_DATA,
  UPDATE_HEART_RATE_DATE_RANGE,
  UPDATE_SLEEP_DATA_DATE_RANGE,
} from "./types";
import { getActivityRingsData } from "../utils/AppleHealthKit/AppleHealthKitUtils";

export const userMetricsDataModalVisible = (
  visibility,
  isFromSignUpScreen = false
) => {
  return {
    type: USER_METRICS_DATA_MODAL_VISIBLE,
    payload: {
      visibility,
      isFromSignUpScreen,
    },
  };
};

export const updateActivityRingsData = (day, ringData) => {
  return {
    type: UPDATE_ACTIVITY_RINGS_DATA,
    payload: { day, rings: ringData },
  };
};

const generateRandomValue = () => {
  return Math.random() * 2;
};

export const updateHeartRateDateRangeData = (startDate, endDate) => {
  return {
    type: UPDATE_HEART_RATE_DATE_RANGE,
    payload: { startDate: startDate, endDate: endDate },
  };
};

export const updateSleepDataDateRangeData = (startDate, endDate) => {
  return {
    type: UPDATE_SLEEP_DATA_DATE_RANGE,
    payload: { startDate: startDate, endDate: endDate },
  };
};

export const updateActivityRings = () => {
  return async (dispatch) => {
    // Load in all past 7 days.
    const ringData = await getActivityRingsData();
    console.log(`Ring data: ${JSON.stringify(ringData)}`);

    for (const dayData of ringData) {
      const data = {
        ring1: (dayData.energyBurned / dayData.energyBurnedGoal),
        ring2: (dayData.exerciseTime / dayData.exerciseTimeGoal),
        ring3: (dayData.standHours / dayData.standHoursGoal),
      }

      dispatch(updateActivityRingsData(getDayFromISODate(dayData.date), data));
    }
  };
};

export const updateHeartRateDateRange = (startDate, endDate) => {
  return async (dispatch) => {
    dispatch(updateHeartRateDateRangeData(startDate, endDate));
  };
};

export const updateSleepDataDateRange = (startDate, endDate) => {
  return async (dispatch) => {
    dispatch(updateSleepDataDateRangeData(startDate, endDate));
  };
};

function getDayFromISODate(isoDate) {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const date = new Date(isoDate);
  const dayIndex = date.getDay();
  return daysOfWeek[dayIndex];
}
