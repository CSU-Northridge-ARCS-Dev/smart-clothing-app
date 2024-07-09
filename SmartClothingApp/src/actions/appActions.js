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
    for (const dayData of ringData) {
      const data = {
        ring1: {
          currentValue: dayData.energyBurned,
          goalValue: dayData.energyBurnedGoal,
        },
        ring2: {
          currentValue: dayData.exerciseTime,
          goalValue: dayData.exerciseTimeGoal,
        },
        ring3: {
          currentValue: dayData.standHours,
          goalValue: dayData.standHoursGoal,
        },
      };

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


export const initialHealthDataSync = (firstSync) => {
  return {
    type: INITIAL_HEALTH_DATA_SYNC,
    payload: { firstSync },
  };
};


