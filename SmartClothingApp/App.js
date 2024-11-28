import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import { PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as StoreProvider } from "react-redux";
import * as Notifications from 'expo-notifications';


import AppRouter from "./src/navigation";
import { useAppFonts } from "./src/hooks/useAppFonts";
import { AppTheme } from "./src/constants/themes";
import configureStore from "./src/store";
import { AppToast } from "./src/components";
import { auth } from "./firebaseConfig.js";

import { getUID, getMetrics, storeToken } from "./src/utils/localStorage.js";
import { onAuthStateChanged } from 'firebase/auth';

import {
  startLoadUserData,
  updateUserMetricsData,
  restoreUUID,
} from "./src/actions/userActions.js";
import SplashScreen from "react-native-splash-screen";
import { registerForPushNotificationsAsync, sendNotification } from './src/utils/notifications.js';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const store = configureStore();


export default function App() {
  const [isLoading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // for persistent login if user closes app

  // useEffect(() => {
  //   if (Platform.OS === "android") {
  //     SplashScreen.hide();
  //   }
  // }, []);

  // Check if there's a stored token on app launch
  const checkUID = async () => {
    try {
      const storedUID = await getUID();
      console.log("Checking stored UID");
      if (storedUID) {
        // If there's a token, try to refresh the user's session
        console.log("Stored storedUID found");
        return storedUID;

      } else {
        console.log("No stored UID");
        return null;
      }
    } catch (error) {
      console.error("Error checking stored UID:", error);
    }
  };
  // checkUID();

  // Check if there's a stored user Matrics Data in local storage
  const checkMetrics = async () => {
    try {
      const storedMetrics = await getMetrics();
      console.log("Checking stored metrics");

      if (storedMetrics) {
        // If there's a token, try to refresh the user's session
        console.log("Stored metrics found");
        console.log("Stored metrics is -->", storedMetrics);
        //Set the user metrics data in the Redux store
        store.dispatch(updateUserMetricsData(storedMetrics));
      } else {
        console.log("No stored metrics, loading from Firestore");
        //get the user metrics data from the database
        store.dispatch(startLoadUserData());
      }
    } catch (error) {
      console.error("Error checking stored metrics:", error);
    }
  };
  //checkMetrics();

  useEffect(() => {
    console.log("from App.js: Auth.currentUser is -->", auth.currentUser);

    // Listen for changes in authentication state
    // const unsubscribe = onAuthStateChanged(auth, (user) => {
    //   setLoading(true); // Start loading while checking auth state
    //   const handleAuthChange = async () => {
    //     if (user) {
    //       console.log("User is logged in:", user.uid);
    //       setIsLoggedIn(true);

    //       const storedUID = await checkUID()

    //       // Dispatch Redux actions or fetch data if necessary
    //       if (storedUID) {
    //         // Restore UUID on app launch
    //         store.dispatch(restoreUUID(storedUID));
    //         console.log("User UUID restored - MainTab render")
    //       } else {
    //         console.log("User UUID not restored - MainTab won't render")
    //       }

    //       // Load user data if logged in
    //       // store.dispatch(startLoadUserData());  // Done in checkMetrics
    //       checkMetrics();
    //     } else {
    //       console.log("No user is logged in.");
    //       setIsLoggedIn(false);
    //       checkUID();
    //       checkMetrics();
    //     }
    //     setLoading(false); // End loading when auth check completes
    //   };
    //   handleAuthChange();
    // });
    // Create a function to handle both font loading and authentication checks
    const loadAppResources = async () => {
      setLoading(true); // Set loading to true at the start

      // Load fonts
      const loadFont = async () => {
        const res = await useAppFonts();
        console.log("Fonts loaded");
      };

      // Check the authentication state
      const checkAuthState = async () => {
        return new Promise((resolve) => {
          const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
              console.log("User is logged in:", user.uid);
              setIsLoggedIn(true);

              const storedUID = await checkUID();

              if (storedUID) {
                store.dispatch(restoreUUID());
                console.log("User UUID restored - MainTab render");
              } else {
                console.log("User UUID not restored - MainTab won't render");
              }

              checkMetrics();
            } else {
              console.log("No user is logged in.");
              setIsLoggedIn(false);
              checkUID();
              checkMetrics();
            }

            resolve(); // Resolve the promise once authentication check is complete
          });

          // Clean up the listener when the component unmounts
          return unsubscribe;
        });
      };

      // Run both font loading and auth state check in parallel and wait for both to finish
      await Promise.all([loadFont(), checkAuthState()]);

      // Set a 0.5 second delay before setting loading to false
      setTimeout(() => {
        setLoading(false); // All loading operations completed
      }, 500);
    };

    loadAppResources();

    // Cleanup the onAuthStateChanged listener
    return () => {
      const unsubscribe = onAuthStateChanged(() => {}); // Store unsubscribe in the return function
      unsubscribe(); // Call it here
    };
  }, []);

    

    // Loading fonts
    // const loadFont = async () => {
    //   const res = await useAppFonts();
      
    //   //setLoading(false);
    //   // Set a 0.5 second delay before setting loading to false
    //   setTimeout(() => {
    //     setLoading(false);
    //   }, 500);
    // };
    // loadFont();

    console.log("from App.js: Auth.currentUser is -->", auth.currentUser);




    const registerForPushNotifications = async () => {
      const token = await registerForPushNotificationsAsync();
      storeToken(token);

      if (token) {
        // Save the token in  backend 
        console.log("Expo push token:", token);
        // await dispatch(savePushTokenToBackend(token));  // Example of saving it to the backend
        sendNotification('Test Notification 1', token);
      }
    };
    registerForPushNotifications();

    // Setup notification listeners
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);

      // Show the notification as a local notification
      // Notifications.scheduleNotificationAsync({
      //   content: notification.request.content,
      //   trigger: null,
      // });
      // Notifications.scheduleNotificationAsync({
      //   content: {
      //     title: title,
      //     body: body,
      //   },
      //   trigger: null,
      // });
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
    });

    // Clean up listeners on unmount
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };


    // // Check if there's a stored token on app launch
    // const checkToken = async () => {
    //   try {
    //     const storedToken = await AsyncStorage.getItem("userToken");
    //     if (storedToken) {
    //       // If there's a token, try to refresh the user's session
    //       const credential = auth.GoogleAuthProvider.credential(storedToken);
    //       const refreshedUser = await auth().signInWithCredential(credential);
    //       setUser(refreshedUser);
    //     }
    //   } catch (error) {
    //     console.error("Error checking token:", error);
    //   }
    // };

    // checkToken();

    // Listen for changes in authentication state
    // const unsubscribe = auth().onAuthStateChanged((newUser) => {
    //   if (newUser) {
    //     setUser(newUser);
    //   } else {
    //     setUser(null);
    //   }
    // });

    

  //   return () => unsubscribe();
  // }, []);

  return (
    <>
      {!isLoading && (
        <SafeAreaView style={{ flex: 1 }}>
          <StoreProvider store={store}>
            <PaperProvider theme={AppTheme}>
              <NavigationContainer>
                <AppRouter />
              </NavigationContainer>
              <AppToast />
            </PaperProvider>
          </StoreProvider>
        </SafeAreaView>
      )}
    </>
  );
}
