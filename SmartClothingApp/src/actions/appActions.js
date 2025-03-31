import {
  USER_METRICS_DATA_MODAL_VISIBLE,
  UPDATE_ACTIVITY_RINGS_DATA,
  UPDATE_HEART_RATE_DATE_RANGE,
  UPDATE_SLEEP_DATA_DATE_RANGE,
  INITIAL_HEALTH_DATA_SYNC,
} from "./types";
import { getActivityRingsData } from "../utils/AppleHealthKit/AppleHealthKitUtils";
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

export const updateActivityRingsDataDateRangeData = (startDate, endDate) => {
  return {
    type: UPDATE_ACTIVITY_RINGS_DATA_DATE_RANGE,
    payload: { startDate: startDate, endDate: endDate },
  }
}

export const initialHealthDataSync = (onAccountCreation) => {
  return {
    type: INITIAL_HEALTH_DATA_SYNC,
    payload: { onAccountCreation },
  };
};

export const updateActivityRings = () => {
  return async (dispatch) => {
    // TODO switch to query from firestore than from native module.
    // Load in data of this week so far.
    const { startDateIso, endDateIso } = getCurrentWeekDateRange();
    const ringData = await getActivityRingsData(startDateIso, endDateIso);
    console.log(`Ring data: ${JSON.stringify(ringData)}`);

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

/** TODO move to utils
 * Get the ISO strings for the past week since Sunday. The week range is Sunday to Saturday.
 * ex) If today is Wednesday, this would get the ISO string from this Sunday and the ISO string
 * of today.
 * 
 * @returns { string, string }
 */
function getCurrentWeekDateRange() {
  const today = new Date();
  const todayIndex = today.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
  const sunday = new Date(today);

  // Set sunday to the beginning of the week.
  sunday.setDate(today.getDate() - todayIndex);
  sunday.setHours(0, 0, 0, 0); // Start of Sunday.

  const endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999); // End of current day.

  // Convert to ISO 8601 format.
  const startDateIso = sunday.toISOString();
  const endDateIso = endDate.toISOString();

  return { startDateIso, endDateIso };
}

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

export const updateActivityRingsDataDateRange = (startDate, endDate) => {
  return async (dispatch) => {
    dispatch(updateActivityRingsDataDateRangeData(startDate, endDate));
  }
}
