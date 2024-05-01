import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Modal, Button, Text, Linking } from "react-native";
import { useSelector } from "react-redux";
//import { Button, Modal, Text } from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import DailyInsights from "../../components/DailyInsights/DailyInsights";

import {
  ActivityCard,
  AppHeader,
  BreathingRateChart,
  HeartRateChart,
  VentilationChart,
  DataCollectModal,
} from "../../components";

import { AppColor, AppFonts, AppStyle } from "../../constants/themes.js";

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

const getLastWeekDate = (): Date => {
  return new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
};

const getLastTwoWeeksDate = (): Date => {
  return new Date(new Date().getTime() - 2 * 7 * 24 * 60 * 60 * 1000);
};

const getTodayDate = (): Date => {
  return new Date();
};

export default function HomeScreen({ navigation }) {
  // start area that needs to be moved to a separate file
  // test functions start
  const initializeHealthConnect = async () => {
    const result = await initialize();
    console.log({ result });
    setIsHealthConnectInitialized(result);
    return result;
  };

  const checkAvailability = async () => {

    const status = await getSdkStatus();
    setSdkStatus(status);
    console.log({ status });
    if (status === SdkAvailabilityStatus.SDK_AVAILABLE) {
      console.log("SDK is available");

      const isInitialized = await setIsHealthConnectInitialized();
      if (!isInitialized) {
        await initializeHealthConnect();
      }

      console.log("Hit health connect initialized")
        console.log("Hit initialized");
        const permissions = grantedPermissions()
        console.log("Hit granted permissions");
        if (!permissions || permissions.length === 0) {
          requestJSPermissions()
          console.log("recieved permissions")
        }
      }

    if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE) {
      console.log("SDK is not available");
      setModalVisible(true);
    }

    if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
      console.log("SDK is not available, provider update required");
      setModalVisible(true);
    }
  };

  const requestJSPermissions = () => {
    requestPermission([
      {
        // if changing this, also change in app.json (located in the project root folder) and/or AndroidManifest.xml (located in android/app/src/main/AndroidManifest.xml)
        // need to add heart rate & sleep data
        accessType: "read",
        recordType: "Steps",
      },
      {
        accessType: "write",
        recordType: "Steps",
      },
    ]).then((permissions) => {
      console.log("Granted permissions on request ", { permissions });
    });
  };

  const grantedPermissions = () => {
    getGrantedPermissions().then((permissions) => {
      console.log("Granted permissions ", { permissions });
      return permissions;
    });
  };

  // end area that needs to be moved to a separate file

  // sample data functions
  // these functions are for testing purposes only; TO BE REMOVED
  const insertSampleData = () => {
    insertRecords([
      {
        recordType: "Steps",
        count: 1000,
        startTime: getLastWeekDate().toISOString(),
        endTime: getTodayDate().toISOString(),
      },
    ]).then((ids) => {
      console.log("Records inserted ", { ids });
    });
  };

  const readSampleData = () => {
    readRecords("Steps", {
      timeRangeFilter: {
        operator: "between",
        startTime: getLastTwoWeeksDate().toISOString(),
        endTime: getTodayDate().toISOString(),
      },
    }).then((result) => {
      console.log("Retrieved records: ", JSON.stringify({ result }, null, 2));
    });
  };

  const readSampleDataSingle = () => {
    readRecord("Steps", "a7bdea65-86ce-4eb2-a9ef-a87e6a7d9df2").then(
      (result) => {
        console.log("Retrieved record: ", JSON.stringify({ result }, null, 2));
      }
    );
  };

  const aggregateSampleData = () => {
    aggregateRecord({
      recordType: "Steps",
      timeRangeFilter: {
        operator: "between",
        startTime: getLastWeekDate().toISOString(),
        endTime: getTodayDate().toISOString(),
      },
    }).then((result) => {
      console.log("Aggregated record: ", { result });
    });
  };
  // test functions end

  const [modalVisible, setModalVisible] = useState(false);
  const [sdkStatus, setSdkStatus] = useState(null);
  const [isHealthConnectInitialized, setIsHealthConnectInitialized] = useState(false);

  useEffect(() => {
    checkAvailability();
    console.log("Hit check availability");
    // moved to checkAvailability
  }, []);

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

  const route = useRoute();
  const defaultData = [
    70, 63, 63, 63, 42, 42, 42, 58, 57, 57, 62, 62, 63, 67, 73, 67, 71, 71, 71,
    71, 71, 66, 66, 86, 86, 89, 86, 86, 86, 92, 90, 86, 86, 84, 84, 84, 84, 84,
    93, 92, 92, 90, 91, 91, 91, 85, 85, 85, 85, 87, 93, 99, 95, 91, 87, 85, 85,
    87, 87, 86,
  ];
  const navigate = (screen) => {
    navigation.navigate(screen, {
      previousScreenTitle: route.name,
    });
  };
  const firstName = useSelector((state) => state.user.firstName);
  return (
    <ScrollView style={styles.container}>
      <AppHeader title={"Dashboard"} />
      <DataCollectModal />
      <View style={styles.body}>
        <Button title="Initialize" onPress={initializeHealthConnect}>
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
        </Button>
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
      <View style={styles.centeredView}>
        <Modal
          visible={modalVisible}
          transparent={false}
          animationType="slide"
          contentContainerStyle={{
            backgroundColor: AppColor.primaryContainer,
            padding: 20,
          }}
          onRequestClose={() => {setModalVisible(false)}}
        >
          {console.log("Modal visible: ", modalVisible)}
          <View style={styles.modalView}>
            <Text style={styles.modalText}
            >
              {sdkStatus === SdkAvailabilityStatus.SDK_UNAVAILABLE 
              ? "SDK is not available."
              : "SDK requires an update."}
            </Text>
            <View style={styles.buttonContainer}>
              <Button title="Go Back" onPress={() => setModalVisible(false)} />
              { sdkStatus === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED && (
                <Button title="Update Health Connect" onPress={openGooglePlayStore} />
              )}
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
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
