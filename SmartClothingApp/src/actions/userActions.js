import { LOGIN_WITH_EMAIL, SIGNUP_WITH_EMAIL, LOGOUT } from "./types";

export const loginWithEmail = (user) => {
  return {
    type: LOGIN_WITH_EMAIL,
    payload: user,
  };
};

export const signupWithEmail = (user) => {
  return {
    type: SIGNUP_WITH_EMAIL,
    payload: user,
  };
};

export const logout = () => {
  return {
    type: LOGOUT,
  };
};
