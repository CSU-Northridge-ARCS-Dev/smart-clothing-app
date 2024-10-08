import { GET_DEVICES } from "./types";
import {
  collection,
  addDoc,
  setDoc,
  doc,
  updateDoc,
  getDoc,
  getDocs
} from "firebase/firestore";
import { auth, database } from "../../firebaseConfig.js";

export const getDevices = () => {
  return {
    type: GET_DEVICES,
  };
};

export const savePushTokenToBackend = (token) => {
  return async (dispatch) => {
    try {
      const userId = auth.currentUser.uid;
      const tokenRef = doc(database, "Users", userId);  // Firestore example

      // Update or set the push token
      await setDoc(tokenRef, { expoPushToken: token }, { merge: true });

      console.log("Push token saved to the backend.");
    } catch (error) {
      console.error("Error saving push token:", error);
    }
  };
};
