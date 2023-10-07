import { collection, addDoc, setDoc, doc, updateDoc } from "firebase/firestore";

import { auth, database } from "../../firebaseConfig.js";
import { firebaseErrorsMessages } from "../utils/firebaseErrorsMessages.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
} from "firebase/auth";

import {
  LOGIN_WITH_EMAIL,
  SIGNUP_WITH_EMAIL,
  LOGOUT,
  UPDATE_PROFILE,
} from "./types";
import { toastError } from "./toastActions.js";

const loginWithEmail = (user) => {
  return {
    type: LOGIN_WITH_EMAIL,
    payload: user,
  };
};

const updateProfileInfo = (firstName, lastName) => {
  return {
    type: UPDATE_PROFILE,
    payload: [firstName, lastName],
  };
};

const signupWithEmail = (user) => {
  return {
    type: SIGNUP_WITH_EMAIL,
    payload: user,
  };
};

const logout = () => {
  return {
    type: LOGOUT,
  };
};

export const startLogout = () => {
  return (dispatch) => {
    auth
      .signOut()
      .then(() => {
        dispatch(logout());
        dispatch(toastError("User logged out!"));
      })
      .catch((error) => {
        console.log("Error logging out!");

        console.log(error);
      });
  };
};

//   const unsubscribe = auth.onAuthStateChanged((user) => {
//     if (user) {
//       // navigation.navigate("HomeScreen");
//     }
//   });

export const startUpdateProfile = (firstName, lastName) => {
  return (dispatch) => {
    updateProfile(auth.currentUser, {
      displayName: `${firstName} ${lastName}`,
    })
      .then(() => {
        console.log(auth.currentUser);
        dispatch(updateProfileInfo(firstName, lastName));
      })
      .catch((error) => {
        console.log(error);
        dispatch(toastError("Error updating profile!"));
      });
  };
};

export const startUpdateUserData = (userData, uid) => {
  console.log("startUpdateUserData called with", userData, "and uid", uid);
  return async (dispatch) => {
    try {
      await setDoc(doc(database, "Users", uid), userData);
      console.log("User data added to database successfully!");
    } catch (e) {
      console.log("Error adding user data to database!");
      console.log(e);
    }
  };
};

export const updateUserData = (userData, uid) => {
  console.log("updateUserData called with", userData, "and uid", uid);
  return async (dispatch) => {
    try {
      await updateDoc(doc(database, "Users", uid), userData);
      console.log("User data edited in the database successfully!");
    } catch (e) {
      console.log("Error adding user data to database!");
      console.log(e);
    }
  };
};

export const startSignupWithEmail = (
  email,
  password,
  firstName,
  lastName,
  userData
) => {
  return (dispatch) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        // console.log("User created successfully!");
        // console.log(user);

        // After creating User, Adding First and Last Name to User Profile
        dispatch(startUpdateProfile(firstName, lastName));

        // After creating User, Adding User Data to Database
        if (userData) {
          console.log("user Id is for DB ...", user.uid);
          dispatch(startUpdateUserData(userData, user.uid));
        } else {
          console.log("No user data to add to database!");
        }

        dispatch(
          signupWithEmail({
            uuid: user.uid,
            firstName: firstName,
            lastName: lastName,
            email: user.email,
          })
        );
      })
      .catch((error) => {
        dispatch(toastError(firebaseErrorsMessages[error.code]));
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
        dispatch(toastError(firebaseErrorsMessages[error.code]));
      });
  };
};

export const startSnedPasswordReserEmail = (email) => {
  sendPasswordResetEmail(auth, email)
    .then(() => {
      console.log("###### Password reset email sent!");
    })
    .catch((error) => {
      console.log(error);
      // console.log("###### Error sending password reset email!");
    });
};

export const checkEmailExists = async (email) => {
  try {
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    return signInMethods.length > 0;
  } catch (error) {
    console.log(error);
    return false;
  }
};
