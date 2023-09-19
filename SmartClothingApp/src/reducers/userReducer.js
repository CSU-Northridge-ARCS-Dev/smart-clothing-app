import {
  LOGIN_WITH_EMAIL,
  SIGNUP_WITH_EMAIL,
  LOGOUT,
  AUTH_ERROR,
  UPDATE_PROFILE,
} from "../actions/types";

const initialState = {
  uuid: true,
  firstName: null,
  lastName: null,
  email: null,
  authError: null,
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
      };
    case AUTH_ERROR:
      return {
        ...state,
        authError: action.payload,
      };
    case UPDATE_PROFILE:
      return {
        ...state,
        firstName: action.payload[0],
        lastName: action.payload[1],
      };
    default:
      return state;
  }
};

export default userReducer;
