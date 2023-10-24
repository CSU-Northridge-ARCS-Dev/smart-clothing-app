// For app settings and other state

import {
  USER_METRICS_DATA_MODAL_VISIBLE,
  DARK_THEME,
  MEASUREMENT_SYSTEM,
} from "../actions/types";

const initialState = {
  darkTheme: false,

  // userMetricsData Modal sub-states
  userMetricsDataModalVisible: false,
  isFromSignUpScreen: false,
  measurementSystem: "imperial", // "imperial" (US) or "metric"
};

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_METRICS_DATA_MODAL_VISIBLE:
      console.log(`Making user matricsModalVisible ${action.payload}`);
      return {
        ...state,
        userMetricsDataModalVisible: action.payload.visibility,
        isFromSignUpScreen: action.payload.isFromSignUpScreen,
      };

    default:
      return state;
  }
};

export default appReducer;
