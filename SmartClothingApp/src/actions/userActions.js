import {
  collection,
  addDoc,
  setDoc,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  where,
  query,
  getFirestore,
  deleteDoc,
  orderBy,
} from "firebase/firestore";

import { storeUID, storeMetrics } from "../utils/localStorage.js";

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
      // Store the user metrics data in the local storage
      storeMetrics(userData);
    } catch (e) {
      console.log(
        "Error adding user data to database! There might be no data to add."
      );
      console.log(e);
    }
  };
};

export const startLoadUserData = () => {
  return async (dispatch) => {
    try {
      const userDocRef = doc(database, "Users", auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userDataFromFirebase = userDoc.data();
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
        // console.log("User created successfully!");
        // console.log(user);

        // After creating User, Adding First and Last Name to User Profile
        dispatch(startUpdateProfile(firstName, lastName));

        // After creating User, Adding User Data to Database, so showing userMetricsDataModal component
        dispatch(userMetricsDataModalVisible(true, true));

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

        storeUID(user.uid); // store the user UID securely in local storages

        // console.log("Logged in successfully!");
        // console.log(user);

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
      if (currentPassword) {
        cred = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, cred);
        console.log("Reauthentication success");
        return true;
      } else {
        dispatch(toastError("Current password is required."));
        return false;
      }
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

export const querySleepData = async (startDate, endDate) => {
  try {
    //get the user ID
    const userId = auth.currentUser.uid;

    //make a reference to the doc with the user ID
    const userRef = doc(database, "Users", userId);

    // create a query to filter documents within the date range
    const dataQuery = query(
      collection(userRef, "SleepData"),
      where("startDate", ">=", startDate),
      where("startDate", "<=", endDate),
      orderBy("startDate", "asc")
    );

    // Execute the query to get the result
    const dataSnapshot = await getDocs(dataQuery);

    const fetchedData = [];
    dataSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.endDate >= startDate && data.endDate <= endDate) {
        fetchedData.push({ ...data });
      }
    });

    return fetchedData;
  } catch (error) {
    console.error("Error fetching data: ", error);
    return [];
  }
};

export const queryHeartRateData = async (startDate, endDate) => {
  try {
    //get the user ID
    const userId = auth.currentUser.uid;

    //make a reference to the doc with the user ID
    const userRef = doc(database, "Users", userId);

    // Create a query to filter documents within the date range
    const dataQuery = query(
      collection(userRef, "HeartRateData"),
      where("date", ">=", startDate),
      where("date", "<=", endDate)
    );

    // execute the query to get the result
    const dataSnapshot = await getDocs(dataQuery);

    // get the documents
    const fetchedData = [];
    dataSnapshot.forEach((doc) => {
      fetchedData.push({ ...doc.data() });
    });

    return fetchedData;
  } catch (error) {
    console.error("Error fetching data: ", error);
    return [];
  }
};
