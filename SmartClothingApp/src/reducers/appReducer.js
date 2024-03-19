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
  userMetricsDataModalVisible: false,
  measurementSystem: "imperial", // "imperial" (US) or "metric"

  // Initial values at 0.
  activityRingsData: {
    Sunday: {
      ring1: {
        currentValue: 0,
        goalValue: 0
      },
      ring2: {
        currentValue: 0,
        goalValue: 0
      },
      ring3: {
        currentValue: 0,
        goalValue: 0
      },
    },
    Monday: {
      ring1: {
        currentValue: 0,
        goalValue: 0
      },
      ring2: {
        currentValue: 0,
        goalValue: 0
      },
      ring3: {
        currentValue: 0,
        goalValue: 0
      },
    },
    Tuesday: {
      ring1: {
        currentValue: 0,
        goalValue: 0
      },
      ring2: {
        currentValue: 0,
        goalValue: 0
      },
      ring3: {
        currentValue: 0,
        goalValue: 0
      },
    },
    Wednesday: {
      ring1: {
        currentValue: 0,
        goalValue: 0
      },
      ring2: {
        currentValue: 0,
        goalValue: 0
      },
      ring3: {
        currentValue: 0,
        goalValue: 0
      },
    },
    Thursday: {
      ring1: {
        currentValue: 0,
        goalValue: 0
      },
      ring2: {
        currentValue: 0,
        goalValue: 0
      },
      ring3: {
        currentValue: 0,
        goalValue: 0
      },
    },
    Friday: {
      ring1: {
        currentValue: 0,
        goalValue: 0
      },
      ring2: {
        currentValue: 0,
        goalValue: 0
      },
      ring3: {
        currentValue: 0,
        goalValue: 0
      },
    },
    Saturday: {
      ring1: {
        currentValue: 0,
        goalValue: 0
      },
      ring2: {
        currentValue: 0,
        goalValue: 0
      },
      ring3: {
        currentValue: 0,
        goalValue: 0
      },
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
