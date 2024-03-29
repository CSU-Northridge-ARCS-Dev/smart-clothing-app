// For app settings and other state

import {
  USER_METRICS_DATA_MODAL_VISIBLE,
  DARK_THEME,
  MEASUREMENT_SYSTEM,
  UPDATE_ACTIVITY_RINGS_DATA,
  UPDATE_HEART_RATE_DATE_RANGE,
  UPDATE_SLEEP_DATA_DATE_RANGE,
} from "../actions/types";

const initialState = {
  darkTheme: false,

  // userMetricsData Modal sub-states
  userMetricsDataModalVisible: false,
  isFromSignUpScreen: false,
  measurementSystem: "imperial", // "imperial" (US) or "metric"
  activityRingsData: {
    Sunday: {
      ring1: 0, // Default value for Sunday, Ring 1
      ring2: 0, // Default value for Sunday, Ring 2
      ring3: 0, // Default value for Sunday, Ring 3
    },
    Monday: {
      ring1: 0, // Default value for Monday, Ring 1
      ring2: 0, // Default value for Monday, Ring 2
      ring3: 0, // Default value for Monday, Ring 3
    },
    Tuesday: {
      ring1: 0, // Default value for Monday, Ring 1
      ring2: 0, // Default value for Monday, Ring 2
      ring3: 0, // Default value for Monday, Ring 3
    },
    Wednesday: {
      ring1: 0, // Default value for Monday, Ring 1
      ring2: 0, // Default value for Monday, Ring 2
      ring3: 0, // Default value for Monday, Ring 3
    },
    Thursday: {
      ring1: 0, // Default value for Monday, Ring 1
      ring2: 0, // Default value for Monday, Ring 2
      ring3: 0, // Default value for Monday, Ring 3
    },
    Friday: {
      ring1: 0, // Default value for Monday, Ring 1
      ring2: 0, // Default value for Monday, Ring 2
      ring3: 0, // Default value for Monday, Ring 3
    },
    Saturday: {
      ring1: 0, // Default value for Monday, Ring 1
      ring2: 0, // Default value for Monday, Ring 2
      ring3: 0, // Default value for Monday, Ring 3
    },
  },
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
      console.log(`Making user matricsModalVisible ${action.payload}`);
      return {
        ...state,
        userMetricsDataModalVisible: action.payload.visibility,
        isFromSignUpScreen: action.payload.isFromSignUpScreen,
      };
    case UPDATE_ACTIVITY_RINGS_DATA:
      return {
        ...state,
        activityRingsData: {
          ...state.activityRingsData,
          [action.payload.day]: {
            ...action.payload.rings,
          },
        },
      };
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
