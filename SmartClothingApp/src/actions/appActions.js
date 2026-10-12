import {
  USER_METRICS_DATA_MODAL_VISIBLE,
  COACH_NOTIFICATION_PERMISSIONS_MODAL_VISIBLE,
  //PERMISSIONS_MODAL_VISIBLE,
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
) => 
  {
  return {
    type: COACH_NOTIFICATION_PERMISSIONS_MODAL_VISIBLE,
    payload: {
      visibility,
    }
  };
};

// export const permissionsModalVisible = (
//   visibility
// ) => 
//   {
//   return {
//     type: PERMISSIONS_MODAL_VISIBLE,
//     payload: {
//       visibility,
//     }
//   };
// };

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
