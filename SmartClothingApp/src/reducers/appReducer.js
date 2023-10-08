// For app settings and other state

import {
  USER_METRICS_DATA_MODAL_VISIBLE,
  DARK_THEME,
  MEASUREMENT_SYSTEM,
} from "../actions/types";

const initialState = {
  darkTheme: false,
  userMetricsDataModalVisible: true, // by deault, show the modal after signup
  measurementSystem: "imperial", // "imperial" (US) or "metric"
};

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_METRICS_DATA_MODAL_VISIBLE:
      console.log(`Making user matricsModalVisible ${action.payload}`);
      return {
        ...state,
        userMetricsDataModalVisible: action.payload,
      };

    default:
      return state;
  }
};

export default appReducer;
