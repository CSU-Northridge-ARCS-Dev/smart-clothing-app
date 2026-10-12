// For app settings and other state

import { coachNotificationPermissionsModalVisible } from "../actions/appActions";
import {
  USER_METRICS_DATA_MODAL_VISIBLE,
  COACH_NOTIFICATION_PERMISSIONS_MODAL_VISIBLE,
  //PERMISSIONS_MODAL_VISIBLE,
  DARK_THEME,
  MEASUREMENT_SYSTEM,
  UPDATE_HEART_RATE_DATE_RANGE,
  UPDATE_SLEEP_DATA_DATE_RANGE,
} from "../actions/types";

const initialState = {
  darkTheme: false,

  // userMetricsData Modal sub-states
  userMetricsDataModalVisible: false,
  coachNotificationPermissionsModalVisible: false,
  //permissionsModalVisible: false,
  isFromSignUpScreen: false,
  measurementSystem: "imperial", // "imperial" (US) or "metric"
  heartRateDateRangeData: {
    startDate: new Date(),
    endDate: new Date(),
  },
  sleepDataDateRangeData: {
    startDate: new Date(),
    endDate: new Date(),
  },
};

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_METRICS_DATA_MODAL_VISIBLE:
      console.log(`Making user metricsModalVisible ${action.payload}`);
      return {
        ...state,
        userMetricsDataModalVisible: action.payload.visibility,
        isFromSignUpScreen: action.payload.isFromSignUpScreen,
      };
    case COACH_NOTIFICATION_PERMISSIONS_MODAL_VISIBLE:
      console.log(`Making coach notifPermissionsModalVisible ${action.payload}`);
      console.log(`Notification Permission Modal Visible: ${action.payload.visibility}`);
      return {
        ...state,
        coachNotificationPermissionsModalVisible: action.payload.visibility,
      };
    // case PERMISSIONS_MODAL_VISIBLE:
    //   console.log(`Making coach notifPermissionsModalVisible ${action.payload}`);
    //   console.log(`Notification Permission Modal Visible: ${action.payload.visibility}`);
    //   return {
    //     ...state,
    //     permissionsModalVisible: action.payload.visibility,
      // };
    case UPDATE_HEART_RATE_DATE_RANGE:
      return {
        ...state,
        heartRateDateRangeData: {
          startDate: action.payload.startDate,
          endDate: action.payload.endDate,
        },
      };
    case UPDATE_SLEEP_DATA_DATE_RANGE:
      return {
        ...state,
        sleepDataDateRangeData: {
          startDate: action.payload.startDate,
          endDate: action.payload.endDate,
        },
      };
    default:
      return state;
  }
};

export default appReducer;
