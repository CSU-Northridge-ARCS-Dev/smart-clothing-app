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
import { auth, database } from "./firebaseConfig.js";
import { getUID, getMetrics, storeToken } from "./src/utils/localStorage.js";
import { onAuthStateChanged } from "firebase/auth";


import { getDoc, doc } from "firebase/firestore";

import {
  startLoadUserData,
  updateUserMetricsData,
  restoreUUID,
  fetchPendingPermissions,
} from "./src/actions/userActions.js";
import SplashScreen from "react-native-splash-screen";
import {
  registerForPushNotificationsAsync,
  sendNotification,
} from "./src/utils/notifications.js";
import NotificationPermissionsModal from "./src/components/NotificationPermissionsModal/index.jsx";
import { coachNotificationPermissionsModalVisible } from "./src/actions/appActions.js";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
  // const [coachName, setCoachName] = useState("");
  // const [coachId, setCoachId] = useState("");
  const [recentNotificationCoach, setRecentNotificationCoach] = useState({ 
    coachId:"",
    coachName:""
  });
  const [user, setUser] = useState([]);


  // const lastNotificationResponse = Notifications.useLastNotificationResponse();


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
        // sendNotification("Welcome to the app!", token);
      }
    } catch (error) {
      console.error("Error registering for push notifications:", error);
    }
  };

  const handleNotificationResponse = async (response) => {
      console.log("Notification response received:", response);
      console.log("Notification response actionIdentifier: ", response.actionIdentifier);
      // Ensure checkAuthState finishes before handling notification
      // await checkAuthState();
      // Check if the response is from a button press
      if (response.actionIdentifier !== "expo.modules.notifications.actions.DEFAULT") {
        return;  // If no button was pressed (or if it was dismissed), do nothing
      }
      if (response.notification?.request?.content?.data) {
        const { screen, showPermissionsModal, coachId, coachFirstName, coachLastName } = response.notification.request.content.data;
        const coachName = `${coachFirstName} ${coachLastName}`;
        console.log("Screen:", screen);
        console.log("Show Permissions Modal:", showPermissionsModal);
        console.log("Coach Id:", coachId);
        console.log("Coach First Name:", coachFirstName);
        console.log("Coach Last Name", coachLastName);
        // let pendingCoaches = getPendingCoaches();
        // pendingCoaches.push(coachId);
        // Open PermissionsModal if UID exists
        const uid = await checkUID();
        //let pendingCoaches = await fetchPendingPermissionsList(uid);
        if (uid && screen === "Home" && showPermissionsModal) {
          console.log("...Opening PermissionsModal");
          // setCoachName(coachName || "");
          // setCoachId(coachId);
          setRecentNotificationCoach({coachId, coachName});
          //setPrevPendingCoaches(pendingCoaches || []);
          //setPendingCoaches([]);
          //await store.dispatch(fetchPendingPermissions());
          store.dispatch(coachNotificationPermissionsModalVisible(true));
          console.log("Dispatch Coach notifications Modal visibility set to true");
          //setNotificationModalVisible(showPermissionsModal);
        }
      } else {
        console.error("Notification data is missing:", response);
      }
    };

  const fetchPendingPermissionsList = async(uid) => {
    const userDoc = await getDoc(doc(database, "Users", uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const pendingPermissions = userData.pendingPermissions || [];
      console.log("Pending Permissions from DB:", pendingPermissions);
      return pendingPermissions;
      // const pendingCoachList = await Promise.all(
      //   pendingPermissions.map(async (coachId) => {
      //     const coachDoc = await getDoc(doc(database, "Users", coachId));
      //     if(coachDoc.exists()) {
      //       const coachData = coachDoc.data();
      //       const coachFullName = `${coachData.firstName || ""} ${coachData.lastName || ""}`.trim();
      //       return {
      //         coachId,
      //         coachFullName,
      //       }
      //     }
      //   })
      // );
      // // Filter out any null results
      // const validPendingCoachList = pendingCoachList.filter((item) => item!==null);
      // return validPendingCoachList;
    } else {
      console.error("User document not found.");
      return [];
    }
  }; 
    
  

    

  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification);
    });
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Response received:", response);
      handleNotificationResponse(response);
    });
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, [isNotificationModalVisible]);

  

//


  useEffect(() => {
    const checkLastNotificationResponse = async () => {
      const lastNotificationResponse = Notifications.getLastNotificationResponseAsync();
      console.log("Last Notification Response: " + lastNotificationResponse);
      if (lastNotificationResponse) {
        const { notification } = lastNotificationResponse;
        const { content } = notification.request;
        console.log("Notification Title:", content.title);
        console.log("Notification Body:", content.body);
        console.log("Notification Data:", content.data);
        handleNotificationResponse(lastNotificationResponse);
      } else {
        console.log("Not from Notification")
      }
    };
    checkLastNotificationResponse();
    // Cleanup function (if needed)
    return () => {
      // Remove any listeners or subscriptions here
    };
  }, []);





  const checkPendingPermissions = async (user) => {
    try {
      // Fetch user document from Firestore
      //const pendingPermissions = await fetchPendingPermissionsList(uid);
      //await store.dispatch(fetchPendingPermissions());
      const uid = user.uid || null;
      if(user !== null || uid === null) {
        const pendingPermissions = user.pendingPermissions || await fetchPendingPermissionsList(uid);
        if(pendingPermissions.length > 0) {
          console.log("Pending coaches found. Opening Permissions Modal.");
          //setPrevPendingCoaches(pendingPermissions);
          setNotificationModalVisible(true);
          store.dispatch(coachNotificationPermissionsModalVisible(true));
        } else {
          console.log("pendingPermissions null");
        }
      } else {
        console.log("user is null or user.uid is null");
      }
    } catch (error) {
      console.error("Error checking pending permissions:", error);
    }
  };
  useEffect(() => {
    const loadAppResources = async () => {
      setLoading(true);
      const loadFont = async () => {
        const fontsLoaded = await useAppFonts();
        console.log("Fonts loaded:", fontsLoaded);
      };
      
      const checkAuthState = async () => {
        return new Promise((resolve) => {
          const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
              setUser(user);
              console.log("User is logged in:", user.uid);
              const storedUID = await checkUID();
              if (storedUID) {
                store.dispatch(restoreUUID(storedUID));
                console.log("User UUID restored");
                setIsLoggedIn(true);
              } else {
                console.log("User UUID not restored");
                setIsLoggedIn(false);
                setUser([]);
              }
              checkMetrics();
              // Check pending permissions after signing in
              await checkPendingPermissions(user);
            } else {
              console.log("No user is logged in");
              //setIsLoggedIn(false);
              await checkUID();
              checkMetrics();
            }
            resolve();
          });
          return unsubscribe;
        });
      };
      await Promise.all([loadFont(), checkAuthState()]);
      setLoading(false);
      registerForPushNotifications();
      //setTimeout(() => setLoading(false), 500);
      //registerForPushNotifications();
      
    };
    loadAppResources();
  }, []);
  
  useEffect(() => {
    console.log("isLoggedIn state useEffect:", isLoggedIn);
    console.log("isLoggedIn user:", user);
    const updatePendingPermissions = async () => {
      //const uid = await checkUID();
      //await store.dispatch(fetchPendingPermissions());
      await checkPendingPermissions(user);
    };
    updatePendingPermissions();
  }, [isLoggedIn]);


  return (
    <>
      {!isLoading && (
        <SafeAreaView style={{ flex: 1 }}>
          <StoreProvider store={store}>
            <PaperProvider theme={AppTheme}>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <NavigationContainer>
                  <AppRouter />
                </NavigationContainer>
                <NotificationPermissionsModal 
                  //closeModal={() => setNotificationModalVisible(false)}
                  coachName={recentNotificationCoach.coachName}
                  coachId={recentNotificationCoach.coachId}
                />
                <AppToast />
              </GestureHandlerRootView>
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