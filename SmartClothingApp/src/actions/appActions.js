import {
  USER_METRICS_DATA_MODAL_VISIBLE,
  COACH_NOTIFICATION_PERMISSIONS_MODAL_VISIBLE,
  UPDATE_ACTIVITY_RINGS_DATA,
  UPDATE_HEART_RATE_DATE_RANGE,
  UPDATE_SLEEP_DATA_DATE_RANGE,
} from "./types";

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

export const coachNotificationPermissionsModalVisible = (
  visibility
) => {
  return {
    type: COACH_NOTIFICATION_PERMISSIONS_MODAL_VISIBLE,
    payload: {
      visibility,
    }
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
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    for (const day of daysOfWeek) {
      const randomData = {
        ring1: generateRandomValue().toFixed(1),
        ring2: generateRandomValue().toFixed(1),
        ring3: generateRandomValue().toFixed(1),
      };

      // Simulate an async operation (e.g., fetching data)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Dispatch the action to update the activity rings data
      dispatch(updateActivityRingsData(day, randomData));
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
