import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  ReactNativeAsyncStorage,
} from "firebase/auth";
// import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";


import {
  FIREBASE_CONFIG_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_DATABASE_URL,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSANGIND_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} from "@env";


// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
  apiKey: FIREBASE_CONFIG_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  databaseURL: FIREBASE_DATABASE_URL,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSANGIND_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getFirestore(app);
export { auth, database };
