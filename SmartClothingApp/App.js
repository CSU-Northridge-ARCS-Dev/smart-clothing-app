import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import { PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as StoreProvider } from "react-redux";
import * as Notifications from "expo-notifications";

import AppRouter from "./src/navigation";
import { useAppFonts } from "./src/hooks/useAppFonts";
import { AppTheme } from "./src/constants/themes";
import configureStore from "./src/store";
import { AppToast } from "./src/components";
import { auth } from "./firebaseConfig.js";

import { getUID, getMetrics, storeToken } from "./src/utils/localStorage.js";
import { onAuthStateChanged } from "firebase/auth";

import {
  startLoadUserData,
  updateUserMetricsData,
  restoreUUID,
} from "./src/actions/userActions.js";
import SplashScreen from "react-native-splash-screen";
import {
  registerForPushNotificationsAsync,
  sendNotification,
} from "./src/utils/notifications.js";
import NotificationPermissionsModal from "./src/components/NotificationPermissionsModal/index.jsx";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [isNotificationModalVisible, setNotificationModalVisible] = useState(false);
  const [coachName, setCoachName] = useState("");
  const [pendingCoaches, setPendingCoaches] = useState([]);


  const checkUID = async () => {
    try {
      const storedUID = await getUID();
      if (storedUID) {
        console.log("Stored UID found:", storedUID);
        return storedUID;
      } else {
        console.log("No stored UID found");
        return null;
      }
    } catch (error) {
      console.error("Error checking stored UID:", error);
    }
  };

  const checkMetrics = async () => {
    try {
      const storedMetrics = await getMetrics();
      if (storedMetrics) {
        console.log("Stored metrics found:", storedMetrics);
        store.dispatch(updateUserMetricsData(storedMetrics));
      } else {
        console.log("No stored metrics, loading from Firestore");
        store.dispatch(startLoadUserData());
      }
    } catch (error) {
      console.error("Error checking stored metrics:", error);
    }
  };

  const registerForPushNotifications = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        console.log("Expo push token:", token);
        await storeToken(token);
        sendNotification("Welcome to the app!", token);
      }
    } catch (error) {
      console.error("Error registering for push notifications:", error);
    }
  };

  const checkAuthState = async () => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          console.log("User is logged in:", user.uid);
          setIsLoggedIn(true);

          const storedUID = await checkUID();
          if (storedUID) {
            store.dispatch(restoreUUID(storedUID));
            console.log("User UUID restored");
          } else {
            console.log("User UUID not restored");
          }

          checkMetrics();
        } else {
          console.log("No user is logged in");
          setIsLoggedIn(false);
          await checkUID();
          checkMetrics();
        }
        resolve();
      });

      return unsubscribe;
    });
  };

  useEffect(() => {
    const loadAppResources = async () => {
      setLoading(true);

      const loadFont = async () => {
        const fontsLoaded = await useAppFonts();
        console.log("Fonts loaded:", fontsLoaded);
      };

      

      
      await Promise.all([loadFont(), checkAuthState()]);
      setLoading(false);
      registerForPushNotifications();
      //setTimeout(() => setLoading(false), 500);
      //registerForPushNotifications();

       // Check for last notification when app is opened from killed state
      const lastNotificationResponse = await Notifications.getLastNotificationResponseAsync();
      if (lastNotificationResponse) {
        handleNotificationResponse(lastNotificationResponse);
      }
    };

   

    const handleNotificationResponse = async (response) => {
      console.log("Notification response received:", response);

      // Ensure checkAuthState finishes before handling notification
      await checkAuthState();

      if (response.notification?.request?.content?.data) {
        const { screen, showPermissionsModal, coachName } = response.notification.request.content.data;

        console.log("Screen:", screen);
        console.log("Show Permissions Modal:", showPermissionsModal);
        console.log("Coach Name:", coachName);

        // Open PermissionsModal if UID exists
        const uid = await checkUID();
        if (uid && screen === "Home" && showPermissionsModal) {
          console.log("...Opening PermissionsModal");
          setCoachName(coachName || "");
          //setPendingCoaches(coaches || []);
          setPendingCoaches([]);
          setNotificationModalVisible(true);
        }
      } else {
        console.error("Notification data is missing:", response);
      }
    };



    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      handleNotificationResponse(response);
    });

    
    //registerForPushNotifications();
    loadAppResources();
 

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  return (
    <>
      {!isLoading && (
        <SafeAreaView style={{ flex: 1 }}>
          <StoreProvider store={store}>
            <PaperProvider theme={AppTheme}>
              <NavigationContainer>
                <AppRouter />
              </NavigationContainer>
              <NotificationPermissionsModal
                visible={isNotificationModalVisible}
                closeModal={() => setNotificationModalVisible(false)}
                coachName={coachName}
                pendingCoaches={pendingCoaches}
              />
              <AppToast />
            </PaperProvider>
          </StoreProvider>
        </SafeAreaView>
      )}
    </>
  );
}


// // Handle notifications when the app is killed
//     (async () => {
//       const lastNotification = await Notifications.getLastNotificationResponseAsync();
//       if(lastNotification) {
//         const { screen, showPermissionsModal, coachName } = lastNotification.notification.request.content.data;

//         // if(screen === "SettingsScreen" && showPermissionsModal) {
//         //   navigation.navigate(screen, {
//         //     showModal: "PermissionsModal",
//         //     coachName: coachName,
//         //   });
//         // }
//       }
//     })();