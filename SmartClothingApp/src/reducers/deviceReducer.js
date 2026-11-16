import {
  GET_DEVICES,
  WATCH_DAY_LOADING,
  WATCH_DAY_LOADED,
  WATCH_DAY_ERROR,
  WATCH_CLEAR_DAYS,
  WATCH_WEEK_LOADING,
  WATCH_WEEK_LOADED,
  WATCH_WEEK_ERROR,
  WATCH_WORKOUT_LOADING,
  WATCH_WORKOUT_LOADED,
  WATCH_WORKOUT_ERROR,
  WATCH_MONTH_LOADING,
  WATCH_MONTH_LOADED,
  WATCH_MONTH_ERROR,
  HEALTH_CONNECT_SET_STATUS,
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
    id: 4,
    name: "Health Connect",
    device: "Pixel Watch, Galaxy Watch and other Android watches",
    // TODO: replace with a watch photo
    image: require("./../../assets/images/arcs_logo.png"),
    details:
      "Connect Health Connect to read the steps, heart rate, sleep and workouts your watch's phone app (Google Health or Samsung Health) saves on this phone.",
    connection: "health_connect",
  },
];

// The watch data read from Health Connect.
// days: { [YYYY-MM-DD]: { loading, error, data } }, shared by Home and
// DailySummary so a date is only read once per session.
// weeks: { [endDate]: { loading, error, data } }, data being the 7 entries
// [{ date, steps, sleepMinutes }] behind the activity rings.
// workouts: { [logId]: { loading, error, data } }, one workout with its route
// and heart rate points for the Workout page.
// months: { [YYYY-MM]: { loading, error, data } }, data being the month's
// workouts [{ date, logId, type }] for the Workout page calendar.
const initialWatchState = {
  days: {},
  weeks: {},
  workouts: {},
  months: {},
};

// status: "unknown" | "unavailable" | "update_needed" | "not_connected" |
// "connecting" | "connected" | "error"
// permissions: the read permissions granted, [{ accessType, recordType }]
const initialHealthConnectState = {
  status: "unknown",
  permissions: [],
  error: null,
};

const initialState = {
  devicesData: dummyDevicesData,
  watch: initialWatchState,
  healthConnect: initialHealthConnectState,
};

// map is "days", "weeks", "workouts" or "months"
const setEntry = (state, map, key, entry) => ({
  ...state,
  watch: {
    ...state.watch,
    [map]: { ...state.watch[map], [key]: entry },
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
    case WATCH_DAY_LOADING:
      return setEntry(
        state,
        "days",
        action.date,
        loadingEntry(state.watch.days[action.date])
      );
    case WATCH_DAY_LOADED:
      return setEntry(state, "days", action.date, loadedEntry(action.day));
    case WATCH_DAY_ERROR:
      return setEntry(state, "days", action.date, errorEntry(action.error));
    case WATCH_WEEK_LOADING:
      return setEntry(
        state,
        "weeks",
        action.endDate,
        loadingEntry(state.watch.weeks[action.endDate])
      );
    case WATCH_WEEK_LOADED:
      return setEntry(state, "weeks", action.endDate, loadedEntry(action.week));
    case WATCH_WEEK_ERROR:
      return setEntry(state, "weeks", action.endDate, errorEntry(action.error));
    case WATCH_WORKOUT_LOADING:
      return setEntry(
        state,
        "workouts",
        action.logId,
        loadingEntry(state.watch.workouts[action.logId])
      );
    case WATCH_WORKOUT_LOADED:
      return setEntry(
        state,
        "workouts",
        action.logId,
        loadedEntry(action.workout)
      );
    case WATCH_WORKOUT_ERROR:
      return setEntry(state, "workouts", action.logId, errorEntry(action.error));
    case WATCH_MONTH_LOADING:
      return setEntry(
        state,
        "months",
        action.month,
        loadingEntry(state.watch.months[action.month])
      );
    case WATCH_MONTH_LOADED:
      return setEntry(state, "months", action.month, loadedEntry(action.workouts));
    case WATCH_MONTH_ERROR:
      return setEntry(state, "months", action.month, errorEntry(action.error));
    case HEALTH_CONNECT_SET_STATUS:
      return {
        ...state,
        healthConnect: {
          status: action.status,
          permissions: action.permissions || [],
          error: action.error || null,
        },
      };
    case WATCH_CLEAR_DAYS:
      return {
        ...state,
        watch: { ...state.watch, days: {}, weeks: {}, workouts: {}, months: {} },
      };
    default:
      return state;
  }
};

export default deviceReducer;
