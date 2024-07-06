import React, { useEffect, useState } from "react";
import { View, StyleSheet, Modal, Button, Text, Linking } from "react-native";
import { useSelector, useDispatch } from "react-redux";
//import { Button, Modal, Text } from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import DailyInsights from "../../components/DailyInsights/DailyInsights";
import LoadingOverlay from "../../components/UI/LoadingOverlay.jsx";
import { initialHealthDataSync } from "../../actions/healthConnectActions.js";
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

import {
  aggregateRecord,
  getGrantedPermissions,
  initialize,
  insertRecords,
  getSdkStatus,
  readRecords,
  requestPermission,
  revokeAllPermissions,
  SdkAvailabilityStatus,
  openHealthConnectSettings,
  openHealthConnectDataManagement,
  readRecord,
} from "react-native-health-connect";

import HealthConnectModal from "../../components/HealthConnectModal/index.jsx";

import { 
  initializeHealthConnect,
  checkAvailability,
  requestJSPermissions,
  grantedPermissions,
  insertSampleData,
  readSampleDataSingle,
  aggregateSampleData,
} from "../../services/HealthConnectServices/HealthConnectServices.js";

import { getHeartRateData, getSleepData } from "../../utils/HealthConnectUtils.js";
//import { readSampleData } from "../../services/HealthConnectServices/HealthConnectServices.js";

import { AppColor, AppFonts, AppStyle } from "../../constants/themes.js";

export default function HomeScreen({ navigation }) {
  // start area that needs to be moved to a separate file
  // test functions start
  // test functions end

  const [modalVisible, setModalVisible] = useState(false);
  const [sdkStatus, setSdkStatus] = useState(null);
  const [permissions, setPermissions] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isHealthConnectInitialized, setIsHealthConnectInitialized] = useState(false);

  const dispatch = useDispatch();
  const route = useRoute();
  const firstName = useSelector((state) => state.user.firstName);
  const onAccountCreation = useSelector((state) => state.app.onAccountCreation);
  const [isLoading, setIsLoading] = useState(false);

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
    checkAvailability(setModalVisible, setSdkStatus, setIsHealthConnectInitialized, setPermissions);
    console.log("Hit check availability");
  }, []);

  useEffect(() => {
    console.log("Checking Permissions...");
    if (onAccountCreation && isHealthConnectInitialized && permissions) {
      async function fetchData() {
        try {
          console.log("Fetching data...");
          //setIsFetchingData(true);
          setIsLoading(true);
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

          setIsLoading(false);
          console.log("Loading complete!");
        }
      }
      fetchData();
    }
  }, [onAccountCreation, isHealthConnectInitialized, permissions]);
  

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
      {<LoadingOverlay visible={isLoading}/>}
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
        modalVisible={modalVisible}
        sdkStatus={sdkStatus}
        permissions={permissions}
        setPermissions={setPermissions}
        setModalVisible={setModalVisible}
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