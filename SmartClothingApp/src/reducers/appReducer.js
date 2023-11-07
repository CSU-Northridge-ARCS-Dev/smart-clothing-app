// For app settings and other state

import {
  USER_METRICS_DATA_MODAL_VISIBLE,
  DARK_THEME,
  MEASUREMENT_SYSTEM,
  UPDATE_ACTIVITY_RINGS_DATA,
} from "../actions/types";

const initialState = {
  darkTheme: false,

  // userMetricsData Modal sub-states
  userMetricsDataModalVisible: false,
  isFromSignUpScreen: false,
  measurementSystem: "imperial", // "imperial" (US) or "metric"
  activityRingsData: {
    U: {
      ring1: 0, // Default value for Sunday, Ring 1
      ring2: 0, // Default value for Sunday, Ring 2
      ring3: 0, // Default value for Sunday, Ring 3
    },
    M: {
      ring1: 0, // Default value for Monday, Ring 1
      ring2: 0, // Default value for Monday, Ring 2
      ring3: 0, // Default value for Monday, Ring 3
    },
    T: {
      ring1: 0, // Default value for Monday, Ring 1
      ring2: 0, // Default value for Monday, Ring 2
      ring3: 0, // Default value for Monday, Ring 3
    },
    W: {
      ring1: 0, // Default value for Monday, Ring 1
      ring2: 0, // Default value for Monday, Ring 2
      ring3: 0, // Default value for Monday, Ring 3
    },
    R: {
      ring1: 0, // Default value for Monday, Ring 1
      ring2: 0, // Default value for Monday, Ring 2
      ring3: 0, // Default value for Monday, Ring 3
    },
    F: {
      ring1: 0, // Default value for Monday, Ring 1
      ring2: 0, // Default value for Monday, Ring 2
      ring3: 0, // Default value for Monday, Ring 3
    },
    S: {
      ring1: 0, // Default value for Monday, Ring 1
      ring2: 0, // Default value for Monday, Ring 2
      ring3: 0, // Default value for Monday, Ring 3
    },
  },
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
    case UPDATE_ACTIVITY_RINGS_DATA:
      console.log(`Updating activity rings data for ${action.payload.day}`);
      return {
        ...state,
        activityRingsData: {
          ...state.activityRingsData,
          [action.payload.day]: {
            ...state.activityRingsData[action.payload.day],
            [action.payload.ring]: action.payload.totalProgress,
          },
        },
      };

    default:
      return state;
  }
};

export default appReducer;
