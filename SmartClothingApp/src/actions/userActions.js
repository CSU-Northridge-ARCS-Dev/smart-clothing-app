import {
  collection,
  addDoc,
  setDoc,
  doc,
  updateDoc,
  getDoc,
  getFirestore,
  deleteDoc,
} from "firebase/firestore";

import { storeUID } from "../utils/localStorage.js";

import { auth, database } from "../../firebaseConfig.js";
import { firebaseErrorsMessages } from "../utils/firebaseErrorsMessages.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";

import {
  LOGIN_WITH_EMAIL,
  SIGNUP_WITH_EMAIL,
  LOGOUT,
  UPDATE_PROFILE,
  UPDATE_USER_METRICS_DATA,
  UPDATE_EMAIL_SUCCESS,
  UPDATE_PASSWORD_SUCCESS,
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

// password
export const updatePasswordSuccess = () => {
  return {
    type: UPDATE_PASSWORD_SUCCESS,
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
  // remove spaces from first and last name
  firstName = firstName.replace(/\s/g, "");
  lastName = lastName.replace(/\s/g, "");

  console.log("startUpdateProfile()")
  return (dispatch) => {
    updateProfile(auth.currentUser, {
      displayName: `${firstName} ${lastName}`,
    })
      .then(() => {
        console.log(auth.currentUser);
        dispatch(updateProfileInfo(firstName, lastName));
        console.log("updateProfileInfo()")
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

export const updateEmailData = (newEmail) => {
  return {
    type: UPDATE_EMAIL_SUCCESS,
    payload: newEmail,
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
        console.log("User created successfully!");
        console.log(user);

        // After creating User, Adding First and Last Name to User Profile
        dispatch(startUpdateProfile(firstName, lastName));

        console.log("dispatch startUpdateProfile()");
        // After creating User, Adding User Data to Database, so showing userMetricsDataModal component
        dispatch(userMetricsDataModalVisible(true, true));

        console.log("dispatch userMetricsDataModalVisible");

        dispatch(
          signupWithEmail({
            uuid: user.uid,
            firstName: firstName,
            lastName: lastName,
            email: user.email,
          })
        );
        console.log("dispatch signupWithEmail");
      })
      .catch((error) => {
        console.log(error);
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

        storeUID(user.uid); // store the user UID securely in local storages
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

// export const reauthenticate = (currentPassword) => {
//   const user = auth.currentUser;
//   const cred = EmailAuthProvider.credential(user.email, currentPassword);
//   try {
//     reauthenticateWithCredential(user, cred);
//     dispatch(setReauthenticationStatus(true));
//     console.log("Reauthentication success");
//   } catch (error) {
//     dispatch(toastError(firebaseErrorsMessages[error.code]));
//     dispatch(setReauthenticationStatus(false));
//   }
// };

export const reauthenticate = (currentPassword) => {
  return async (dispatch) => {
    try {
      const user = auth.currentUser;
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);
      console.log("Reauthentication success");
      return true;
    } catch (error) {
      dispatch(toastError(firebaseErrorsMessages[error.code]));
      console.log("Reauthentication failure");
      return false;
    }
  };
};

export const updateUserPassword = (newPassword) => {
  return (dispatch) => {
    const user = auth.currentUser;
    try {
      updatePassword(user, newPassword);
      console.log("Password update success");
    } catch (error) {
      dispatch(toastError(firebaseErrorsMessages[error.code]));
      console.log("Password update failure");
    }
  };
};

export const updateUserEmail = (newEmail) => {
  return (dispatch) => {
    const user = auth.currentUser;
    if (user) {
      updateEmail(user, newEmail)
        .then(() => {
          dispatch(updateEmailData(newEmail));
          console.log("Email update success.");
        })
        .catch((error) => {
          dispatch(toastError(firebaseErrorsMessages[error.code]));
          return false;
        });
    }
  };
};

export const deleteAccount = () => {
  return async (dispatch) => {
    try {
      const user = auth.currentUser;
      const uid = user.uid;
      const docRef = doc(database, "Users", uid);

      await user.delete();
      console.log("User deleted successfully.");

      await deleteDoc(docRef);
      console.log("Document deleted successfully.");

      await auth.signOut();
      dispatch(logout());
      dispatch(toastError("User account has been deleted"));
      console.log("User signed out successfully.");
    } catch (error) {
      console.error("Error deleting account:", error);
      dispatch(toastError(error.message || "An error occurred."));
    }
  };
};