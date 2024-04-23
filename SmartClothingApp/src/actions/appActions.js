import {
  USER_METRICS_DATA_MODAL_VISIBLE,
  UPDATE_ACTIVITY_RINGS_DATA,
  UPDATE_HEART_RATE_DATE_RANGE,
  UPDATE_SLEEP_DATA_DATE_RANGE,
  INITIAL_HEALTH_DATA_SYNC,
} from "./types";

import { getDayFromISODate } from "../utils/dateConversions";

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

const getRandomValue = (goalValue) => {
  return Math.round(Math.random() * goalValue);
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

export const initialHealthDataSync = (onAccountCreation) => {
  return {
    type: INITIAL_HEALTH_DATA_SYNC,
    payload: { onAccountCreation },
  };
};

export const updateActivityRings = () => {
  return async (dispatch) => {
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    for (const dayOfWeek of weekdays) {
      const data = {
        ring1: {
          currentValue: getRandomValue(800),
          goalValue: 800,
        },
        ring2: {
          currentValue: getRandomValue(90),
          goalValue: 90,
        },
        ring3: {
          currentValue: getRandomValue(16),
          goalValue: 16,
        },
      };

      dispatch(updateActivityRingsData(dayOfWeek, data));
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
