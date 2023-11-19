import {
  LOGIN_WITH_EMAIL,
  SIGNUP_WITH_EMAIL,
  LOGOUT,
  UPDATE_PROFILE,
  UPDATE_USER_METRICS_DATA,
  UPDATE_EMAIL_SUCCESS,
} from "../actions/types";

const initialState = {
  uuid: null,
  firstName: null,
  lastName: null,
  email: null,
  authError: null,
  userMetricsData: {
    gender: "No Data",
    dob: new Date(),
    height: "No Data",
    weight: "No Data",
    sports: "No Data",
  },
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_WITH_EMAIL:
      console.log("LOGIN_WITH_EMAIL");
      console.log("UUID is ...", action.payload);
      return {
        ...state,
        uuid: action.payload.uuid,
        firstName: action.payload.firstName,
        lastName: action.payload.lastName,
        email: action.payload.email,
      };
    case SIGNUP_WITH_EMAIL:
      return {
        ...state,
        uuid: action.payload.uuid,
        firstName: action.payload.firstName,
        lastName: action.payload.lastName,
        email: action.payload.email,
      };
    case LOGOUT:
      return {
        ...state,
        uuid: null,
        firstName: null,
        lastName: null,
        email: null,
        authError: null,
        reAuth: null,
      };
    case UPDATE_PROFILE:
      return {
        ...state,
        firstName: action.payload[0],
        lastName: action.payload[1],
      };
    case UPDATE_USER_METRICS_DATA:
      return {
        ...state,
        userMetricsData: action.payload,
      };
    case UPDATE_EMAIL_SUCCESS:
      return {
        ...state,
        user: { ...state.user, email: action.payload },
      };
    default:
      return state;
  }
};

export default userReducer;
