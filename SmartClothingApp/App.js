import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import { PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as StoreProvider } from "react-redux";

import AppRouter from "./src/navigation";
import { useAppFonts } from "./src/hooks/useAppFonts";
import { AppTheme } from "./src/constants/themes";
import configureStore from "./src/store";
import { AppToast } from "./src/components";
import { auth } from "./firebaseConfig.js";

import { getUID, getMetrics } from "./src/utils/localStorage.js";

import {
  startLoadUserData,
  updateUserMetricsData,
} from "./src/actions/userActions.js";
import SplashScreen from "react-native-splash-screen";

import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, sendNotification } from './src/utility/notifications';


const store = configureStore();

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [isLoading, setLoading] = useState(true);

  // useEffect(() => {
  //   if (Platform.OS === "android") {
  //     SplashScreen.hide();
  //   }
  // }, []);

  const sendTestNotification = async () => {
    await sendNotification("Test Notification", "This is a test notification");
  };

  useEffect(() => {
    console.log("from App.js: Auth.currentUser is -->", auth.currentUser);

    // Check if there's a stored token on app launch
    const checkUID = async () => {
      try {
        const storedUID = await getUID();
        console.log("Checking stored UID");
        if (storedUID) {
          // If there's a token, try to refresh the user's session
          console.log("Stored storedUID found");
        } else {
          console.log("No stored UID");
        }
      } catch (error) {
        console.error("Error checking stored UID:", error);
      }
    };
    checkUID();

    // Check if there's a stored user Matrics Data in local storage
    const checkMetrics = async () => {
      try {
        const storedMetrics = await getMetrics();
        // console.log("Checking stored metrics");
        if (storedMetrics) {
          // If there's a token, try to refresh the user's session
          // console.log("Stored metrics found");
          // console.log("Stored metrics is -->", storedMetrics);
          //Set the user metrics data in the Redux store
          store.dispatch(updateUserMetricsData(storedMetrics));
        } else {
          // console.log("No stored metrics");
          //get the user metrics data from the database
          store.dispatch(startLoadUserData());
        }
      } catch (error) {
        console.error("Error checking stored metrics:", error);
      }
    };
    checkMetrics();

    // Loading fonts
    const loadFont = async () => {
      const res = await useAppFonts();
      setLoading(false);
    };
    loadFont();

    console.log("from App.js: Auth.currentUser is -->", auth.currentUser);

    // Notification listeners for Testing Expo Push Notifications
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
    });

    // Clean up the listeners when the component unmounts
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

    // return () => unsubscribe();
  }, []);

  return (
    <>
      {!isLoading && (
        <SafeAreaView style={{ flex: 1 }}>
          <StoreProvider store={store}>
            <PaperProvider theme={AppTheme}>
              <NavigationContainer>
                <AppRouter />
                {/* Test Notification Button */}
                <View style={{ padding: 20 }}>
                  <Button
                    title="Send Test Notification"
                    onPress={sendTestNotification}
                  />
                </View>
              </NavigationContainer>
              <AppToast />
            </PaperProvider>
          </StoreProvider>
        </SafeAreaView>
      )}
    </>
  );
}
