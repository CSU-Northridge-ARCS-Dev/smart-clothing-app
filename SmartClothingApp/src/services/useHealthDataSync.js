import { useEffect, useState, useRef } from "react";
import { Platform } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { 
  startHealthConnectSetup, 
  setHCSyncLoadingStatus, 
  initHCWithPermissionsCheck  
} from "../actions/healthConnectActions.js";
import { sendHeartRateData, sendSleepData } from "../actions/userActions.js";
import { getHeartRateData, getSleepData } from "../utils/HealthConnectUtils.js";
import { initialHealthDataSync } from "../actions/appActions.js";

export const useHealthDataSync = (isFirstSync) => {
  const dispatch = useDispatch();

  const setupHC = useSelector((state) => state.healthConnect.onUserAuthenticated);
  const sdkStatus = useSelector((state) => state.healthConnect.sdkStatus);
  const permissions = useSelector((state) => state.healthConnect.permissions);
  const isHealthConnectInitialized = useSelector((state) => state.healthConnect.isHealthConnectInitialized);
  const healthConnectModalVisible = useSelector((state) => state.healthConnect.healthConnectModalVisible);
  
  const [isLoading, setLoading] = useState(true);

  const isTimerSet = useRef(false); // Flag to ensure the timer only runs once
  const timeoutRef = useRef(null); // Reference to the timeout

  
  
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
    console.log("[useHealthDataSync] isFirstSync: ", isFirstSync);
    console.log("[useHealthDataSync] setupHC: ", setupHC);
    console.log("[useHealthDataSync] isHealthConnectInitialized: ", isHealthConnectInitialized);
    console.log("[useHealthDataSync] isFirstSync: ", isFirstSync);
    console.log("[useHealthDataSync] permissions: ", permissions);
    console.log("[useHealthDataSync] sdkStatus (not required): ", sdkStatus);
    console.log("[useHealthDataSync] healthConnectModalVisible: ", healthConnectModalVisible);
    console.log("[useHealthDataSync] isLoading: ", isLoading);


    const healthConnectReady = setupHC && permissions && isHealthConnectInitialized;
    console.log("\n[useHealthDataSync] healthConnectReady: ", healthConnectReady);

    //const healthKitReady = healthKitSetup && permissionsHK && isHealthKitInitialized;
    const healthKitReady = false; // Temp
    console.log("[useHealthDataSync] healthKitReady: ", healthKitReady);

    if (healthConnectReady || healthKitReady) {
      async function fetchData() {
        try {
          console.log("Fetching data...");
          //setIsFetchingData(true);

          // move to app actions
          dispatch(setHCSyncLoadingStatus(true)); 

          if (!isFirstSync) {
            // If coming from sign-in, adjust retrieve data starting at the last update date
            console.log("[useHealthDataSync] Not on account creation, fetching data from last update date.");

            if (Platform.OS === 'android') {
              await updateWithLatestData();
              console.log("[useHealthDataSync] Android data updated successfully.");

            } else if (Platform.OS === 'ios') {
              // iOS-specific code for HealthKit


            } else {
              console.error("Platform not supported");
            }
          } else {
            // If on account creation, set the start date to 30 days ago
            console.log("[useHealthDataSync] On account creation, fetching data from 30 days ago.");

            if (Platform.OS === 'android') {
              

              // COMMENTED OUT TO LOWER DATABASE WRITES 
              // (CHATGPT PROMPT) CONTINUE TO INCLUDE IN TESTS:
              // const heartRateData = await getHeartRateData(getLastYearDate(), getTodayDate());
              // const sleepData = await getSleepData(getLastYearDate(), getTodayDate());


              // DEBUGGER - heart and sleep data from two days ago
              console.log("[useHealthDataSync]\n\n\n DEBUGGER - heart and sleep data from two days ago\n\n")
              const heartRateData = await getHeartRateData(getLastDayDate(), getTodayDate());
              const sleepData = await getSleepData(getLastTwoDaysDate(), getTodayDate());




              console.log("\nHeart Rate Data Retrieved from HC")
              console.log("[useHealthDataSync] Heart Rate Data: ", heartRateData);
              console.log("\nSleep Data Retrieved from HC")
              console.log("[useHealthDataSync] Sleep Data: ", sleepData);

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
            console.log("[useHealthDataSync] Dispatched initialHealthDataSync");

          } else if (Platform.OS === 'ios') {
            // iOS-specific code for HealthKit


          } else {
            console.error("Platform not supported");
          }

          dispatch(setHCSyncLoadingStatus(false));
          dispatch(initialHealthDataSync(false));
          setLoading(false);

          console.log("\n[useHealthDataSync]\n-------------\n-------------\n-------------\nLoading complete!\n-------------\n-------------\n-------------");
        }
      };
      fetchData();
    } 
  },  [
    isFirstSync,
    setupHC,
    isHealthConnectInitialized,
    permissions,
    sdkStatus,
    dispatch
  ]);

  useEffect(() => {
    if(!permissions && !isFirstSync) {
      console.log("[useHealthDataSync] Syncing loading status: off");
      setLoading(false);
    }
    
  }, [permissions, isFirstSync]);

  return { isLoading };
};

