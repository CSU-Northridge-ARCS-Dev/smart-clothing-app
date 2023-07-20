import { auth } from "../../firebaseConfig.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  LOGIN_WITH_EMAIL,
  SIGNUP_WITH_EMAIL,
  LOGOUT,
  AUTH_ERROR,
} from "./types";

const loginWithEmail = (user) => {
  return {
    type: LOGIN_WITH_EMAIL,
    payload: user,
  };
};

const signupWithEmail = (user) => {
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

export const setAuthError = (errorMessage) => {
  return {
    type: AUTH_ERROR,
    payload: errorMessage,
  };
};

//   const unsubscribe = auth.onAuthStateChanged((user) => {
//     if (user) {
//       // navigation.navigate("HomeScreen");
//     }
//   });

export const startSignupWithEmail = (email, password) => {
  return (dispatch) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        // console.log("User created successfully!");
        // console.log(user);
        dispatch(
          signupWithEmail({
            uuid: user.uid,
            firstName: user.displayName?.split(" ")[0],
            lastName: user.displayName?.split(" ")[1],
            email: user.email,
          })
        );
      })
      .catch((error) => {
        //TODO: Setup Good Error Message (https://firebase.google.com/docs/auth/admin/errors)
        // console.log("Error creating user!");
        // console.log(error);
        dispatch(setAuthError(error.message));
      });
  };
};

export const startLoginWithEmail = (email, password) => {
  return (dispatch) => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        // console.log("Logged in successfully!");
        // console.log(user);

        dispatch(
          loginWithEmail({
            uuid: user.uid,
            firstName: user.displayName?.split(" ")[0],
            lastName: user.displayName?.split(" ")[1],
            email: user.email,
          })
        );
      })
      .catch((error) => {
        //TODO: Setup Good Error Message (https://firebase.google.com/docs/auth/admin/errors)
        // console.log("Error login user!");
        // console.log(error);
        dispatch(setAuthError(error.message));
      });
  };
};
