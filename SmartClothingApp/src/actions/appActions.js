import {
  USER_METRICS_DATA_MODAL_VISIBLE,
  UPDATE_ACTIVITY_RINGS_DATA,
  UPDATE_HEART_RATE_DATE_RANGE,
  UPDATE_SLEEP_DATA_DATE_RANGE,
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
    const ringData = [
      {
        date: "2024-03-11T07:00:00.000Z",
        energyBurned: 5.298,
        energyBurnedGoal: 390,
        exerciseTime: 3,
        exerciseTimeGoal: 30,
        standHours: 0,
        standHoursGoal: 12,
      },
      {
        date: "2024-03-12T07:00:00.000Z",
        energyBurned: 417.367,
        energyBurnedGoal: 390,
        exerciseTime: 17,
        exerciseTimeGoal: 30,
        standHours: 9,
        standHoursGoal: 12,
      },
      {
        date: "2024-03-13T07:00:00.000Z",
        energyBurned: 303.338,
        energyBurnedGoal: 390,
        exerciseTime: 26,
        exerciseTimeGoal: 30,
        standHours: 7,
        standHoursGoal: 12,
      },
      {
        date: "2024-03-14T07:00:00.000Z",
        energyBurned: 503.966,
        energyBurnedGoal: 390,
        exerciseTime: 29,
        exerciseTimeGoal: 30,
        standHours: 12,
        standHoursGoal: 12,
      },
      {
        date: "2024-03-15T07:00:00.000Z",
        energyBurned: 230.614,
        energyBurnedGoal: 390,
        exerciseTime: 8,
        exerciseTimeGoal: 30,
        standHours: 7,
        standHoursGoal: 12,
      },
      {
        date: "2024-03-16T07:00:00.000Z",
        energyBurned: 570.646,
        energyBurnedGoal: 390,
        exerciseTime: 66,
        exerciseTimeGoal: 30,
        standHours: 12,
        standHoursGoal: 12,
      },
      {
        date: "2024-03-17T07:00:00.000Z",
        energyBurned: 0,
        energyBurnedGoal: 390,
        exerciseTime: 0,
        exerciseTimeGoal: 30,
        standHours: 0,
        standHoursGoal: 12,
      },
      {
        date: "2024-03-18T07:00:00.000Z",
        energyBurned: 94.756,
        energyBurnedGoal: 390,
        exerciseTime: 1,
        exerciseTimeGoal: 90,
        standHours: 6,
        standHoursGoal: 12,
      },
    ];

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
