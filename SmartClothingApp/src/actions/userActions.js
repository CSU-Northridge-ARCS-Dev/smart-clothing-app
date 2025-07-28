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
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

import { 
  storeUID, 
  storeMetrics, 
  storeFirstName, 
  storeLastName, 
  storeEmail, 
  getUID, 
  getMetrics, 
  getFirstName, 
  getLastName, 
  getEmail, 
  clearUID, 
  clearMetrics, 
  clearFirstName, 
  clearLastName, 
  clearEmail ,
  storeToken,
  clearToken
} from "../utils/localStorage.js";

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
  ADD_TO_COACH_ACCESS,
  DISABLE_COACH_ACCESS,
  REMOVE_FROM_COACH_ACCESS,
  UPDATE_COACH_ACCESS,
  UPDATE_PENDING_PERMISSIONS,
} from "./types";

import { toastError } from "./toastActions.js";
import { userMetricsDataModalVisible } from "./appActions.js";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { registerForPushNotificationsAsync } from '../utils/notifications';


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

export const updateUserMetricsData = (userMetricsData) => {
  return {
    type: UPDATE_USER_METRICS_DATA,
    payload: userMetricsData,
  };
};

export const addToCoachAccess = (coach) => {
  return {
    type: ADD_TO_COACH_ACCESS,
    payload: coach,
  };
};

export const disableCoachAccess = (coach) => {
  return {
    type: DISABLE_COACH_ACCESS,
    payload: coach,
  };
};

export const removeFromCoachAccess = (coach) => {
  return {
    type: REMOVE_FROM_COACH_ACCESS,
    payload: coach,
  };
};

export const updateCoachAccess = (coachList) => {
  return {
    type: UPDATE_COACH_ACCESS,
    payload: coachList,
  };
};

export const updatePendingPermissions = (pendingPermissions) => {
  return {
    type: UPDATE_PENDING_PERMISSIONS,
    payload: pendingPermissions,
  };
};

export const updateEmailData = (newEmail) => {
  return {
    type: UPDATE_EMAIL_SUCCESS,
    payload: newEmail,
  };
};

export const startLogout = () => {
  return async (dispatch) => {
    try {

      // clear Firestore + local token first
      await dispatch(clearPushTokenOnLogout()); 

      const uidBefore = await getUID();
      console.log("UID before logout: ", uidBefore);

      await auth.signOut();

      await clearUID();
      await clearMetrics();
      await clearFirstName();
      await clearLastName();
      await clearEmail();

      const uidAfter = await getUID();
      console.log("UID after logout: ", uidAfter);

      dispatch(logout());
      dispatch(toastError("User logged out!"));
    } catch (error) {
      console.log("Error logging out!");
      console.log(error);
    };
  };
};


// export const startLogout = () => {
//   return (dispatch) => {
//     auth
//       .signOut()
//       .then(() => {
//         dispatch(logout());
//         dispatch(toastError("User logged out!"));
//       })
//       .catch((error) => {
//         console.log("Error logging out!");

//         console.log(error);
//       });
//   };
// };

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
        storeFirstName(firstName);
        storeLastName(lastName);
        dispatch(updateProfileInfo(firstName, lastName));
        console.log("updateProfileInfo()")
      })
      .catch((error) => {
        console.log(error);
        dispatch(toastError("Error updating profile!"));
      });
  };
};



// export const startUpdateUserData = (userData) => {
//   console.log("startUpdateUserData called with", userData);
//   return async (dispatch) => {
//     try {
//       await setDoc(doc(database, "Users", auth.currentUser.uid), userData);
//       console.log("User data added to database successfully!");
//       dispatch(updateUserMetricsData(userData));
//       // Store the user metrics data in the local storage
//       storeMetrics(userData);
//     } catch (e) {
//       console.log(
//         "Error adding user data to database! There might be no data to add."
//       );
//       console.log(e);
//     }
//   };
// };

export const startUpdateUserData = (userData) => {
  console.log("startUpdateUserData called with", userData);
  return async (dispatch) => {
    try {
      const userDocRef = doc(database, "Users", auth.currentUser.uid);

      // Use updateDoc instead of setDoc to only update specific fields
      await updateDoc(userDocRef, userData);
      
      console.log("User data updated in the database successfully!");
      dispatch(updateUserMetricsData(userData));

      // Optionally store the updated user metrics data in local storage
      storeMetrics(userData);
    } catch (e) {
      console.log("Error updating user data in the database!");
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
    return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        // Set the initial user data in Firestore
        const initialUserData = {
          firstName: firstName,
          lastName: lastName,
          email: user.email,
          createdAt: new Date(),
          pendingPermissions: [],
          coachList: [],
          disabledCoachList: [],
        };

        // Save the user data upon sign-up using setDoc
        setDoc(doc(database, "Users", user.uid), initialUserData)
          .then(() => {
            console.log("User data saved to Firestore successfully.");
            storeUID(user.uid); // store the user UID securely in local storages
            storeFirstName(firstName);
            storeLastName(lastName);
            storeEmail(email);
            
            // Store user metrics in local storage
            //storeMetrics(initialUserData);  // Save the initial data in AsyncStorage
            
          })
          .catch((error) => {
            console.error("Error saving user data to Firestore:", error);
          });

        // Dispatch actions to update profile and show metrics modal
        dispatch(startUpdateProfile(firstName, lastName));  // Assuming you already have this action
        dispatch(userMetricsDataModalVisible(true, true));
        dispatch(signupWithEmail({ uuid: user.uid, firstName, lastName, email: user.email }));

        return user;  // return user so we can chain a promise in the component
      })
      .catch((error) => {
        dispatch(toastError(firebaseErrorsMessages[error.code]));
        throw error;  // important to propagate the error
      });
  };
};


export const startLoginWithEmail = (email, password) => {
  console.log(email)
  console.log(password)
  return (dispatch) => {
    return signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        console.log(user);

        storeUID(user.uid); // store the user UID securely in local storages
        storeFirstName(user.displayName?.split(" ")[0]);
        storeLastName(user.displayName?.split(" ")[1]);
        storeEmail(user.email);

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
        return user;
      })
      .catch((error) => {
        dispatch(toastError(firebaseErrorsMessages[error.code]));
        throw error;
      });
  };
};

// Function to restore UUID from AsyncStorage
export const restoreUUID = () => {
  return async (dispatch) => {
    try {
      const storedUID = await getUID();
      const firstName = await getFirstName();
      const lastName = await getLastName();
      const email = await getEmail();

      if (storedUID) {
        // Dispatch the login action to update the UUID in Redux store
        dispatch(
          loginWithEmail({
            uuid: storedUID,
            firstName: firstName || null,
            lastName: lastName || null,
            email: email || null,
          })
        );
        console.log("UUID and user info restored successfully:", {
          uuid: storedUID,
          firstName,
          lastName,
          email,
        });
        // dispatch(
        //   loginWithEmail({
        //     uuid: storedUID,
        //     firstName: null,  // If needed, fetch other user info from Firestore or AsyncStorage
        //     lastName: null,
        //     email: null,
        //   })
        // );
        console.log("UUID restored successfully:", storedUID);
      } else {
        console.log("No UUID found in AsyncStorage.");
      }
    } catch (error) {
      console.error("Error restoring UUID:", error);
    }
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
          storeEmail(newEmail);
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
      console.log("deleteAccount()")

      const user = auth.currentUser;
      const uid = user.uid;
      const docRef = doc(database, "Users", uid);

      // const uidBefore = await getUID();
      // console.log("UID before account deletion: ", uidBefore);

      await user.delete();

      await clearUID();
      await clearMetrics();
      await clearFirstName();
      await clearLastName();
      await clearEmail();

      // const uidAfter = await getUID();
      // console.log("UID after account deletion: ", uidAfter);

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






// Register & save Expo push token (To Replace the one in App.js later)
export const startRegisterPushToken = () => {
  return async (dispatch) => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (!token) return;
      console.log('token: ',token);
      const userRef = doc(database, 'Users', auth.currentUser.uid);
      await updateDoc(userRef, { expoPushToken: token }); // or expoPushTokens: arrayUnion(token)
      await storeToken(token);
    } catch (err) {
      console.error('startRegisterPushToken error:', err);
    }
  };
};
// Clear token on logout (or call inside startLogout before clearing local storage)
export const clearPushTokenOnLogout = () => {
  return async () => {
    try {
      const userRef = doc(database, 'Users', auth.currentUser.uid);
      // If you store a single token:
      await updateDoc(userRef, { expoPushToken: null });

      // If you store an array of tokens, switch to:
      // const token = await getToken();
      // if (token) await updateDoc(userRef, { expoPushTokens: arrayRemove(token) });

      await clearToken();
    } catch (err) {
      console.error('clearPushTokenOnLogout error:', err);
    }
  };
};








export const fetchPendingPermissions = () => {
  console.log("fetchPermissions called.");
  return async (dispatch) => {
    try {
      const userDocRef = doc(database, "Users", auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const pendingPermissions = userData.pendingPermissions || [];
        console.log("Fetched pendingPermissions:", pendingPermissions);
        // Resolve each reference in pendingPermissions
        const resolvedCoaches = await Promise.all(
          pendingPermissions.map(async (coachRef) => {
            try {
              const coachDocSnap = await getDoc(coachRef);
              if (coachDocSnap.exists()) {
                const coachData = coachDocSnap.data();
                const coachId = coachRef.path.split("/").pop(); // Extract coachId from the path
                return {
                  coachId,
                  firstName: coachData.firstName || "Unknown",
                  lastName: coachData.lastName || "Unknown",
                  ref: coachRef,
                };
              } else {
                console.log("Coach document not found for reference:", coachRef.path);
                return null;
              }
            } catch (error) {
              console.error("Error resolving coach reference:", error);
              return null;
            }
          })
        );
        // Filter out any null results from failed resolutions
        const validCoaches = resolvedCoaches.filter((coach) => coach !== null);
        console.log("Resolved coach objects:", validCoaches);
        dispatch(updatePendingPermissions(validCoaches));
      } else {
        console.log("No user document found!");
      }//await updateDoc(userDocRef, pendingPermissions);
    } catch (e) {
      console.log("Error updating pending permissions in the database!");
      console.log(e);
    }
  };
};

export const removeFromPendingPermissions = (coach, updatedPendingPermissions) => {
  return async (dispatch) => {
    try {
      const { uid } = auth.currentUser;
      const userDocRef = doc(database, "Users", uid);
      // Atomically remove the coachId from pendingPermissions
      console.log("Removing Coach Ref", coach.ref);
      await updateDoc(userDocRef, {
        pendingPermissions: arrayRemove(coach.ref),
      });
      // Dispatch to update state with the new pending permissions list
      dispatch(updatePendingPermissions(updatedPendingPermissions));
      
    } catch (err) {
      console.error("Error removing from pendingPermissions:", err);
    }
  };
};

export const fetchCoachAccess = () => {
  console.log("fetchCoachAccess called.");
  return async (dispatch) => {
    try {
      const userDocRef = doc(database, "Users", auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const coachAccess = userData.coachList || [];
        const disabledCoachList = userData.CoachListDisabled || [];
        console.log("Fetched coachList:", coachAccess);
        console.log("Fetched disabledCoachList:", disabledCoachList);
        const resolvedCoaches = await Promise.all(
          coachAccess.map(async (coachRef) => {
            try {
              const coachDocSnap = await getDoc(coachRef);
              if(coachDocSnap.exists()) {
                const coachData = coachDocSnap.data();
                const coachId = coachRef.path.split("/").pop(); // Extract coachId from the path
                return {
                  coachId,
                  firstName: coachData.firstName || "Unknown",
                  lastName: coachData.lastName || "Unknown",
                  ref: coachRef,
                  sharingEnabled: !disabledCoachList.some(
                    (disabledRef) => disabledRef.path === coachRef.path
                  ),
                };
              } else {
                console.log("Coach document not found for reference:", coachRef.path);
                return null;
              }
            } catch (e) {
              console.error("Error resolving coach reference:", error);
              return null;
            }
          })
        );
        // Filter out any null results from failed resolutions
        const validCoaches = resolvedCoaches.filter((coach) => coach !== null);
        console.log("Resolved coach objects:", validCoaches);
        dispatch(updateCoachAccess(validCoaches));
        // Dispatch addToCoachAccess for each coach one by one
        // validCoaches.forEach((coach) => {
        //   dispatch(addToCoachAccess(coach));
        // });
      } else {
        console.log("No user document found!");
      }
    } catch (e) {
      console.log("Error updating pending permissions in the database!");
      console.log(e);
    }
  };
};

export const startAddToCoachAccess = (coach) => {
  return async (dispatch) => {
    try {
      const { uid } = auth.currentUser;
      const userDocRef = doc(database, "Users", uid);
      // Atomically add the coachId to coachList
      await updateDoc(userDocRef, {
        coachList: arrayUnion(coach.ref),
      });
      // Dispatch Redux action to update the state
      dispatch(addToCoachAccess(coach));
      //dispatch({ type: "ADD_TO_COACH_ACCESS", payload: coachId });
      console.log(`Added ${coach.firstName} ${coach.lastName} to coachList.`);
    } catch (err) {
      console.error("Error adding to coach list:", err);
    }
  };
};

// export const startDisableCoachAccess = (coach) => {
//   return async (dispatch) => {
//     try {
//       const { uid } = auth.currentUser;
//       const userDocRef = doc(database, "Users", uid);
//       await updateDoc(userDocRef, {
//         coachListDisabled: arrayUnion(coach.ref),
//       });
//       // Dispatch Redux action to update the state
//       dispatch(disableCoachAccess(coach));
//       console.log(`Added ${coach.firstName} ${coach.lastName} to coachListDisabled.`);
//       // Remove from CoachAccess
//       dispatch(deleteFromCoachAccess(coach));
//     } catch (err) {
//       console.error("Error adding to disable coach list:", err);
//     }
//   };
// };

export const deleteFromCoachAccess = (coach) => {
  return async (dispatch) => {
    try {
      const { uid } = auth.currentUser;
      const userDocRef = doc(database, "Users", uid);
      // Add logic to remove coach access from Firestore or your backend
      console.log("Deleting coach access for:", coach.ref);
      await updateDoc(userDocRef, {
        coachList: arrayRemove(coach.ref),
      });
      dispatch(removeFromCoachAccess(coach));
      console.log(`Removed ${coach.ref.path} from Coach Access.`);
      console.log(`Removed ${coach.firstName} ${coach.lastName} from Coach Access.`);
    } catch (error) {
      console.error("Error deleting coach access:", error);
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




