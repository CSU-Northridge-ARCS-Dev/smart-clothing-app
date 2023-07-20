import { auth } from "../../firebaseConfig.js";
import { createUserWithEmailAndPassword } from "firebase/auth";

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
  console.log(" ##### Calling the Actual Action function ##### ");
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

// useEffect(() => {
//   const unsubscribe = auth.onAuthStateChanged((user) => {
//     if (user) {
//       // navigation.navigate("HomeScreen");
//     }
//   });

//   return unsubscribe;
// }, []);

export const startSignupWithEmail = (email, password) => {
  console.log(" ##### Calling the Start-Action function ##### ");
  return (dispatch) => {
    console.log(" ##### Calling the CreateUSer Firebase function ##### ");
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
