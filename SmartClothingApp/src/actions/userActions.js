import {
  collection,
  addDoc,
  setDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

import { auth, database } from "../../firebaseConfig.js";
import { firebaseErrorsMessages } from "../utils/firebaseErrorsMessages.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";

import {
  LOGIN_WITH_EMAIL,
  SIGNUP_WITH_EMAIL,
  LOGOUT,
  UPDATE_PROFILE,
  UPDATE_USER_METRICS_DATA,
} from "./types";

import { toastError } from "./toastActions.js";
import { userMetricsDataModalVisible } from "./appActions.js";

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

export const updateUserMetricsData = (userMetricsData) => {
  return {
    type: UPDATE_USER_METRICS_DATA,
    payload: userMetricsData,
  };
};

export const startUpdateUserData = (userData) => {
  console.log("startUpdateUserData called with", userData);
  return async (dispatch) => {
    try {
      await setDoc(doc(database, "Users", auth.currentUser.uid), userData);
      console.log("User data added to database successfully!");
      dispatch(updateUserMetricsData(userData));
    } catch (e) {
      console.log("Error adding user data to database!");
      console.log(e);
    }
  };
};

export const startLoadUserData = () => {
  return async (dispatch) => {
    try {
      console.log("startLoadUserData - START")
      // console.log(database)
      // console.log(auth.currentUser.uid)
      const userDocRef = doc(database, "Users", auth.currentUser.uid);
      console.log("doc works")
      console.log("uid: " + auth.currentUser.uid)
      const userDoc = await getDoc(userDocRef);
      console.log("getDoc works")
      console.log(userDoc)

      if (userDoc.exists()) {
        console.log("userDoc exists")
        const userDataFromFirebase = userDoc.data();
        console.log("useDoc.data() works")
        dispatch(updateUserMetricsData(userDataFromFirebase));
        console.log("User data loaded from database successfully!");
      } else {
        console.log("User data doesn't exist in the database!");
        const defaultUserData = {
          height: "",
          weight: "",
          age: "",
          gender: "",
          sports: "",
        };
        dispatch(startUpdateUserData(defaultUserData, auth.currentUser.uid));
      }
    } catch (e) {
      console.log("Error loading user data from database!");
      console.log(e);
    }
  };
};

// export const updateUserData = (userData, uid) => {
//   console.log("updateUserData called with", userData, "and uid", uid);
//   return async (dispatch) => {
//     try {
//       const userDocRef = doc(database, "Users", uid);
//       const userDoc = await getDoc(userDocRef);

//       if (userDoc.exists()) {
//         // If the document exists, update it
//         await updateDoc(userDocRef, userData);
//         dispatch(toastInfo("Your edits have been saved."));
//         console.log("User data edited in the database successfully!");
//       } else {
//         // If the document doesn't exist, create it using setDoc
//         await setDoc(userDocRef, userData);
//         console.log("User data added to database successfully!");
//       }
//     } catch (e) {
//       console.log("Error updating user data in the database!");
//       console.error(e);
//     }
//   };
// };

export const startSignupWithEmail = (email, password, firstName, lastName) => {
  return (dispatch) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        // console.log("User created successfully!");
        // console.log(user);

        // After creating User, Adding First and Last Name to User Profile
        dispatch(startUpdateProfile(firstName, lastName));

        // After creating User, Adding User Data to Database, so showing userMetricsDataModal component
        dispatch(userMetricsDataModalVisible(true));

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
  console.log(email)
  console.log(password)
  return (dispatch) => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Logged in successfully!");
        console.log(user);

        // load the user data from the database
        dispatch(startLoadUserData());

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

export const fetchUserData = async (database, uid) => {
  try {
    const userDocRef = doc(database, "Users", uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userDataFromFirebase = userDoc.data();
      return userDataFromFirebase;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
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
