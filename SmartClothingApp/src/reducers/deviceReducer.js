import {
  GET_DEVICES,
  FITBIT_SET_STATUS,
  FITBIT_DAY_LOADING,
  FITBIT_DAY_LOADED,
  FITBIT_DAY_ERROR,
  FITBIT_CLEAR_DAYS,
  FITBIT_WEEK_LOADING,
  FITBIT_WEEK_LOADED,
  FITBIT_WEEK_ERROR,
  FITBIT_WORKOUT_LOADING,
  FITBIT_WORKOUT_LOADED,
  FITBIT_WORKOUT_ERROR,
  FITBIT_MONTH_LOADING,
  FITBIT_MONTH_LOADED,
  FITBIT_MONTH_ERROR,
} from "./../actions/types";

const dummyDevicesData = [
  {
    id: 1,
    name: "Smart Sock",
    device: "Smart sock v2.0 & Sensoria Core",
    image: require("./../../assets/images/sock.jpeg"),
    details:
      "Sensoria® Running System Utilize this complete system to enhance your training from head to toe. The Smart Upper Garments provide real-time heart rate monitoring capabilities while the Smart Socks can help improve your running form by measuring cadence, impact forces and foot landing. All connected by the Sensoria Run App which provides AI coaching and dashboard tracking.",
  },
  {
    id: 2,
    name: "Smart Shirt",
    device: "HEXOSKIN PROSHIRT V1",
    image: require("./../../assets/images/shirt.jpeg"),
    details:
      "The Hexoskin Smart Garments include textile sensors embedded into comfortable garments for precise and continuous cardiac, respiratory, and activity monitoring. Hexoskin users can visualize, report, and analyse their data with the leading Hexoskin Connected Health Platform. The Hexoskin Smart Garments have been used in over 180 scientific publications, more than all the smart clothing competition combined. Order Today! ",
  },
  {
    id: 3,
    name: "Pixel Watch",
    device: "Google Pixel Watch 3 (Fitbit)",
    // TODO: replace with a Pixel Watch photo (assets/images/pixel_watch.png)
    image: require("./../../assets/images/arcs_logo.png"),
    details:
      "Connect your Pixel Watch through your Fitbit account to see your sleep, resting heart rate, heart rate zones and Run, Weights and Walk workouts recorded on the watch.",
    connection: "fitbit",
  },
];

// status: "unknown" | "not_connected" | "connecting" | "connected" | "error"
// days: { [YYYY-MM-DD]: { loading, error, data } }, shared by Home and
// DailySummary so a date is only fetched once per session.
// weeks: { [endDate]: { loading, error, data } }, data being the 7 entries
// [{ date, steps, sleepMinutes }] behind the activity rings.
// workouts: { [logId]: { loading, error, data } }, one workout with its route
// and heart rate points for the Workout page.
// months: { [YYYY-MM]: { loading, error, data } }, data being the month's
// workouts [{ date, logId, type }] for the Workout page calendar.
const initialFitbitState = {
  status: "unknown",
  error: null,
  days: {},
  weeks: {},
  workouts: {},
  months: {},
};

const initialState = {
  devicesData: dummyDevicesData,
  fitbit: initialFitbitState,
};

// map is "days", "weeks", "workouts" or "months"
const setEntry = (state, map, key, entry) => ({
  ...state,
  fitbit: {
    ...state.fitbit,
    [map]: { ...state.fitbit[map], [key]: entry },
  },
});

// Keeps the old data while an entry reloads
const loadingEntry = (previous) => ({
  loading: true,
  error: null,
  data: previous ? previous.data : null,
});

const loadedEntry = (data) => ({ loading: false, error: null, data });

const errorEntry = (error) => ({ loading: false, error, data: null });

const deviceReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_DEVICES:
      return state.devicesData;
    case FITBIT_SET_STATUS:
      return {
        ...state,
        fitbit: {
          ...state.fitbit,
          status: action.status,
          error: action.error || null,
        },
      };
    case FITBIT_DAY_LOADING:
      return setEntry(
        state,
        "days",
        action.date,
        loadingEntry(state.fitbit.days[action.date])
      );
    case FITBIT_DAY_LOADED:
      return setEntry(state, "days", action.date, loadedEntry(action.day));
    case FITBIT_DAY_ERROR:
      return setEntry(state, "days", action.date, errorEntry(action.error));
    case FITBIT_WEEK_LOADING:
      return setEntry(
        state,
        "weeks",
        action.endDate,
        loadingEntry(state.fitbit.weeks[action.endDate])
      );
    case FITBIT_WEEK_LOADED:
      return setEntry(state, "weeks", action.endDate, loadedEntry(action.week));
    case FITBIT_WEEK_ERROR:
      return setEntry(state, "weeks", action.endDate, errorEntry(action.error));
    case FITBIT_WORKOUT_LOADING:
      return setEntry(
        state,
        "workouts",
        action.logId,
        loadingEntry(state.fitbit.workouts[action.logId])
      );
    case FITBIT_WORKOUT_LOADED:
      return setEntry(
        state,
        "workouts",
        action.logId,
        loadedEntry(action.workout)
      );
    case FITBIT_WORKOUT_ERROR:
      return setEntry(state, "workouts", action.logId, errorEntry(action.error));
    case FITBIT_MONTH_LOADING:
      return setEntry(
        state,
        "months",
        action.month,
        loadingEntry(state.fitbit.months[action.month])
      );
    case FITBIT_MONTH_LOADED:
      return setEntry(state, "months", action.month, loadedEntry(action.workouts));
    case FITBIT_MONTH_ERROR:
      return setEntry(state, "months", action.month, errorEntry(action.error));
    case FITBIT_CLEAR_DAYS:
      return {
        ...state,
        fitbit: { ...state.fitbit, days: {}, weeks: {}, workouts: {}, months: {} },
      };
    default:
      return state;
  }
};

export default deviceReducer;
