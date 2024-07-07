import React, { useEffect, useState } from "react";
import { View, StyleSheet, Modal, Button, Text, Linking } from "react-native";
import { useSelector, useDispatch } from "react-redux";
//import { Button, Modal, Text } from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import DailyInsights from "../../components/DailyInsights/DailyInsights";
import LoadingOverlay from "../../components/UI/LoadingOverlay.jsx";
import { 
  initialHealthDataSync, 
  setHealthConnectLoadingScreen, 
  checkAvailability  
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
  setPermissions,
  setHealthConnectModalVisible
} from "../../actions/healthConnectActions.js";


export default function HomeScreen({ navigation }) {
  
  const dispatch = useDispatch();

  const firstName = useSelector((state) => state.user.firstName);
  const onAccountCreation = useSelector((state) => state.healthConnect.onAccountCreation);
  const permissions = useSelector((state) => state.healthConnect.permissions);
  const sdkStatus = useSelector((state) => state.healthConnect.sdkStatus);
  const isHealthConnectInitialized = useSelector((state) => state.healthConnect.isHealthConnectInitialized);
  const healthConnectModalVisible  = useSelector((state) => state.healthConnect.healthConnectModalVisible);
  const isLoading = useSelector((state) => state.healthConnect.healthConnectLoadingScreen)

  const route = useRoute();

  // might use redux for this so it can be shown in all screens 
  //const [isLoading, setIsLoading] = useState(false);

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


  const openGooglePlayStore = async () => {
    const healthConnectBetaUrl = "market://details?id=com.google.android.apps.healthdata";
    try {
      if (await Linking.canOpenURL(healthConnectBetaUrl)) {
        Linking.openURL(healthConnectBetaUrl);
      } else {
        console.error("Cannot open Google Play Store");
        // TODO: show error message to user
        // this one means that we cannot open the google play store and returned from Linking
      }
    } catch (error) {
      console.error("Error opening Google Play Store", error);
      // TODO: show error message to user
      // this one means that we cannot open the google play store and errored out of try block
    }
  };

  useEffect(() => {
    console.log("Checking Availability and Asking Permission...");
    //checkAvailability(setModalVisible, setSdkStatus, setIsHealthConnectInitialized, setPermissions);
    dispatch(checkAvailability());
    console.log("Hit check availability");
  }, [dispatch]);

  useEffect(() => {
    console.log("Checking Permissions...");
    console.log("[HomeScreen] onAccountCreation: ", onAccountCreation);
    console.log("[HomeScreen] isHealthConnectInitialized: ", isHealthConnectInitialized);
    console.log("[HomeScreen] permissions: ", permissions);
    console.log("[HomeScreen] sdkStatus: ", sdkStatus);
    console.log("[HomeScreen] healthConnectModalVisible: ", healthConnectModalVisible);
    console.log("[HomeScreen] isLoading: ", isLoading);

    if (onAccountCreation && isHealthConnectInitialized && permissions) {
      async function fetchData() {
        try {
          console.log("Fetching data...");
          //setIsFetchingData(true);
          dispatch(setHealthConnectLoadingScreen(true));
          const heartRateData = await getHeartRateData(getLastYearDate(), getTodayDate());
          const sleepData = await getSleepData(getLastYearDate(), getTodayDate());
          await sendHeartRateData(heartRateData);
          await sendSleepData(sleepData);
          console.log("Data fetched successfully!");
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          dispatch(initialHealthDataSync(false));
          console.log("Dispatched initialHealthDataSync");

          // setIsLoading(false);
          dispatch(setHealthConnectLoadingScreen(false));
          console.log("Loading complete!");
        }
      }
      fetchData();
    }
  }, [onAccountCreation, isHealthConnectInitialized, permissions, dispatch]);
  

  // if (isLoading) {
  //   return <LoadingOverlay />;
  // } 

  // if(!isHealthConnectInitialized) {
  //   setIsLoading(true);
  // } else {
  //   //setIsLoading(false);
  // }



  return (
    <RefreshView style={styles.container}>
      {isLoading && <LoadingOverlay visible={isLoading}/>}
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
      <HealthConnectModal 
        modalVisible={healthConnectModalVisible }
        sdkStatus={sdkStatus}
        permissions={permissions}
        setPermissions={(permissions) => dispatch(setPermissions(permissions))}
        setModalVisible={(healthConnectModalVisible ) => dispatch(setHealthConnectModalVisible(healthConnectModalVisible ))}
        openGooglePlayStore={openGooglePlayStore}
        />
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