import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
// TODO ENV
const firebaseConfig = {
  apiKey: '', //NEED .ENV CONFIGURATED FOR THIS
  authDomain: 'smart-clothing-app.firebaseapp.com',
  databaseURL: 'https://smart-clothing-app.firebaseio.com',
  projectId: 'smart-clothing-app',
  storageBucket: 'smart-clothing-app.appspot.com',
  messagingSenderId: 'sender-id',
  appId: 'app-id',
  measurementId: 'G-measurement-id',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase

export {app, auth};
