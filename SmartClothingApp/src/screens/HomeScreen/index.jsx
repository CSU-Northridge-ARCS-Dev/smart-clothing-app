import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Modal, Button, Text, Linking, Platform, ActivityIndicator } from "react-native";
import { useSelector, useDispatch } from "react-redux";
//import { Button, Modal, Text } from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import DailyInsights from "../../components/DailyInsights/DailyInsights";
import LoadingOverlay from "../../components/UI/LoadingOverlay.jsx";
import { 
  startHealthConnectSetup, 
  setHCSyncLoadingStatus, 
  initHCWithPermissionsCheck  
} from "../../actions/healthConnectActions.js";
import RefreshView from "../../components/RefreshView/index.jsx";
import { sendHeartRateData, sendSleepData } from "../../actions/userActions.js";

import {
  ActivityCard,
  AppHeader,
  BreathingRateChart,
  HeartRateChart,
  VentilationChart,
  DataCollectModal,
} from "../../components";

import { getHeartRateData, getSleepData } from "../../utils/HealthConnectUtils.js";
import { AppColor, AppFonts, AppStyle } from "../../constants/themes.js";
import HealthConnectModal from "../../components/HealthConnectModal/index.jsx";

import { 
  setHealthConnectPermissions,
  setHealthConnectModalVisible
} from "../../actions/healthConnectActions.js";
import { initialHealthDataSync } from "../../actions/appActions.js";


export default function HomeScreen({ navigation }) {
  
  const dispatch = useDispatch();

  // User / App data
  const firstName = useSelector((state) => state.user.firstName);
  const onAccountCreation = useSelector((state) => state.app.onAccountCreation);

    // Android's Health Connect
  const setupHC = useSelector((state) => state.healthConnect.onUserAuthenticated);
  const permissions = useSelector((state) => state.healthConnect.permissions);
  const sdkStatus = useSelector((state) => state.healthConnect.sdkStatus);
  const isHealthConnectInitialized = useSelector((state) => state.healthConnect.isHealthConnectInitialized);
  const healthConnectModalVisible  = useSelector((state) => state.healthConnect.healthConnectModalVisible);
  const isLoading = useSelector((state) => state.healthConnect.healthConnectLoadingScreen)


  //const healthKitSetup = useSelector((state) => state.healthConnect.healthKitSetup);
  const healthKitSetup = false; // Temp
  // Other HealthKit setup logic here


  const route = useRoute();
  const [isProcessing, setIsProcessing] = useState(true);
  const timeoutRef = useRef(null); // Reference to the timeout
  const isTimerSet = useRef(false); // Flag to ensure the timer only runs once



  const getLastYearDate = () => {
    const today = new Date();
    return new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
  };

  const getLastWeekDate = () => {
    return new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
  };

  const getLastTwoWeeksDate = () => {
    return new Date(new Date().getTime() - 2 * 7 * 24 * 60 * 60 * 1000);
  };

  const getTodayDate = () => {
    return new Date();
  };

  const getLastTwoDaysDate = () => {
    return new Date() - 2 * 24 * 60 * 60 * 1000;
  };

  const getLastDayDate = () => {
    return new Date() - 24 * 60 * 60 * 1000;
  }
  



  // ABSTRACT USEEFFECT LOGIC TO A SEPARATE MODULE TO REUSE IN SETTINGS 

  useEffect(() => {
    console.log("Checking Availability and Asking Permission...");

    if (Platform.OS === 'android') {
      dispatch(startHealthConnectSetup(true));
      dispatch(initHCWithPermissionsCheck());
      console.log("Hit initHCWithPermissionsCheck");
    } else {z
      // iOS-specific code for HealthKit
      // Here you would use HealthKit to check availability and ask for permissions
      // Example:
      // dispatch(initHealthKitWithPermissionsCheck());


    }
  }, [dispatch]);



  useEffect(() => {
    console.log("Checking Permissions...");
    console.log("[HomeScreen] onAccountCreation: ", onAccountCreation);
    console.log("[HomeScreen] setupHC: ", setupHC);
    console.log("[HomeScreen] isHealthConnectInitialized: ", isHealthConnectInitialized);
    console.log("[HomeScreen] permissions: ", permissions);
    console.log("[HomeScreen] sdkStatus (not required): ", sdkStatus);
    console.log("[HomeScreen] healthConnectModalVisible: ", healthConnectModalVisible);
    console.log("[HomeScreen] isLoading: ", isLoading);


    const healthConnectReady = setupHC && permissions && isHealthConnectInitialized;
    console.log("\n[HomeScreen] healthConnectReady: ", healthConnectReady);

    //const healthKitReady = healthKitSetup && permissionsHK && isHealthKitInitialized;
    const healthKitReady = false; // Temp
    console.log("[HomeScreen] healthKitReady: ", healthKitReady);

    if (healthConnectReady || healthKitReady) {
      async function fetchData() {
        try {
          console.log("Fetching data...");
          //setIsFetchingData(true);

          // move to app actions
          dispatch(setHCSyncLoadingStatus(true)); 

          if (!onAccountCreation) {
            // If coming from sign-in, adjust retrieve data starting at the last update date
            console.log("[HomeScreen] Not on account creation, fetching data from last update date.");

            if (Platform.OS === 'android') {
              await updateWithLatestData();
              console.log("[HomeScreen] Android data updated successfully.");

            } else if (Platform.OS === 'ios') {
              // iOS-specific code for HealthKit


            } else {
              console.error("Platform not supported");
            }
          } else {
            // If on account creation, set the start date to 30 days ago
            console.log("[HomeScreen] On account creation, fetching data from 30 days ago.");

            if (Platform.OS === 'android') {
              

              // COMMENTED OUT TO LOWER DATABASE WRITES 
              // (CHATGPT PROMPT) CONTINUE TO INCLUDE IN TESTS:
              // const heartRateData = await getHeartRateData(getLastYearDate(), getTodayDate());
              // const sleepData = await getSleepData(getLastYearDate(), getTodayDate());


              // DEBUGGER - heart and sleep data from two days ago
              console.log("[HomeScreen]\n\n\n DEBUGGER - heart and sleep data from two days ago\n\n")
              const heartRateData = await getHeartRateData(getLastDayDate(), getTodayDate());
              const sleepData = await getSleepData(getLastTwoDaysDate(), getTodayDate());




              console.log("\nHeart Rate Data Retrieved from HC")
              console.log("[HomeScreen] Heart Rate Data: ", heartRateData);
              console.log("\nSleep Data Retrieved from HC")
              console.log("[HomeScreen] Sleep Data: ", sleepData);

              await sendHeartRateData(heartRateData);
              await sendSleepData(sleepData);


            } else if (Platform.OS === 'ios') {
              // iOS-specific code for HealthKit
              // Here you would use HealthKit to fetch and handle health data
              // Example:
              // const heartRateData = await getHeartRateDataFromHealthKit(startDate, getTodayDate());
              // const sleepData = await getSleepDataFromHealthKit(startDate, getTodayDate());
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {


          if (Platform.OS === 'android') {
            dispatch(startHealthConnectSetup(false));
            console.log("[HomeScreen] Dispatched initialHealthDataSync");

          } else if (Platform.OS === 'ios') {
            // iOS-specific code for HealthKit


          } else {
            console.error("Platform not supported");
          }

          dispatch(setHCSyncLoadingStatus(false));
          dispatch(initialHealthDataSync(false));

          console.log("\n[HomeScreen]\n-------------\n-------------\n-------------\nLoading complete!\n-------------\n-------------\n-------------");
        }
      };
      fetchData();
    } else if (!permissions && !isTimerSet.current) {
      timeoutRef.current = setTimeout(() => setIsProcessing(false), 10000);  // Fallback timeout
      isTimerSet.current = true; // Set the flag to true
    }
  },  [
    onAccountCreation,
    startHealthConnectSetup,
    isHealthConnectInitialized,
    permissions,
    healthKitSetup,
    dispatch
  ]);
  



  // if (isProcessing) {
  //   return (
  //     <View style={styles.overlay} pointerEvents="auto">
  //       <ActivityIndicator size="large" color="#ffffff" />
  //     </View>
  //   );
  // }

  // ISSUE : NAV BAR IS SHOWING - need to hide it somehow
  if (isProcessing) {
    return (
      <LoadingOverlay visible={true} />
    );
  }

  return (
    <RefreshView style={styles.container}>
      {isLoading && <LoadingOverlay visible={isLoading}/>}
      {/* {isProcessing && (
        <View style={styles.overlay} pointerEvents="auto">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )} */}
      <AppHeader title={"Dashboard"} />
      <DataCollectModal />
      <View style={styles.body}>
        <Text style={AppStyle.title}>Hello, {firstName}</Text>
        <DailyInsights fromDashboard={true} navigation={navigation} />
        <Text variant="titleMedium" style={{ marginTop: 20 }}>
          Today Status
        </Text>
        <ActivityCard
          style={{ marginTop: 10 }}
          icon="directions-run"
          title="Activity"
          value="8H 25Min"
        />
        <ActivityCard
          style={{ marginTop: 10 }}
          icon="transfer-within-a-station"
          title="Steps"
          value="8000"
        />
        <ActivityCard
          style={{ marginTop: 10 }}
          icon="fitness-center"
          title="Calories"
          value="2000 Kcal"
        />

        <Text variant="titleMedium" style={{ marginTop: 20 }}>
          Breath Rate
        </Text>
        <BreathingRateChart />
        <Text variant="titleMedium" style={{ marginTop: 20 }}>
          Ventilation Rate
        </Text>
        <VentilationChart />
        <Text variant="titleMedium" style={{ marginTop: 20 }}>
          Heartbeat Rate
        </Text>
        {/* <HeartRateChart data={defaultData}/> */}
      </View>
      <HealthConnectModal/>
    </RefreshView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 60,
  },
  body: {
    padding: 10,
  },
  insights: {
    marginVertical: 10,
    elevation: 2,
    shadowColor: AppColor.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 5, height: 5 },
    backgroundColor: AppColor.primaryContainer,
    padding: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  // overlay: {
  //   position: 'absolute',
  //   top: 0,
  //   left: 0,
  //   right: 0,
  //   bottom: 0,
  //   backgroundColor: 'rgba(0, 0, 0, 0.5)',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   zIndex: 999,
  // },
});



{/* <Button title="Initialize" onPress={initializeHealthConnect}>
          Initialize
        </Button>
        <Button
          title="Open Health Connect settings"
          onPress={openHealthConnectSettings}
        >
          Open HC Settings
        </Button>
        <Button
          title="Open Health Connect data management"
          onPress={() => openHealthConnectDataManagement()}
        >
          Data Management
        </Button>
        <Button title="Check availability" onPress={checkAvailability}>
          Check availability
        </Button>
        <Button
          title="Request sample permissions"
          onPress={requestJSPermissions}
        >
          Request permissions
        </Button>
        <Button title="Get granted permissions" onPress={grantedPermissions}>
          Get permissions (granted)
        </Button>
        <Button title="Revoke all permissions" onPress={revokeAllPermissions}>
          Revoke all permissions
        </Button>
        <Button title="Insert sample data" onPress={insertSampleData}>
          Insert sample data
        </Button>
        <Button title="Read sample data" onPress={readSampleData}>
          Read sample data
        </Button>
        <Button title="Read specific data" onPress={readSampleDataSingle}>
          Read specific data
        </Button>
        <Button title="Aggregate sample data" onPress={aggregateSampleData}>
          Aggregate sample data
        </Button> */}