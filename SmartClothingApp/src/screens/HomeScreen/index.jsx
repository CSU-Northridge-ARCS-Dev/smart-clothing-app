import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { Button, Modal, Text } from "react-native-paper";
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

const getLastWeekDate = () => {
  return new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
};

const getLastTwoWeeksDate = () => {
  return new Date(new Date().getTime() - 2 * 7 * 24 * 60 * 60 * 1000);
};

const getTodayDate = () => {
  return new Date();
};

export default function HomeScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [sdkStatus, setSdkStatus] = useState(null);

  const initializeHealthConnect = async () => {
    const result = await initialize();
    console.log({ result });
  };

  const checkAvailability = async () => {
    const status = await getSdkStatus();
    setSdkStatus(status);
    if (status === SdkAvailabilityStatus.SDK_AVAILABLE) {
      console.log("SDK is available");
    }

    if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE) {
      console.log("SDK is not available");
      setModalVisible(true);
    }
    if (
      status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED
    ) {
      console.log("SDK is not available, provider update required");
      setModalVisible(true);
    }
  };

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

  const requestSamplePermissions = () => {
    requestPermission([
      {
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
    });
  };

  const openGooglePlayStore = async () => {
    const healthConnectBetaUrl =
      "market://details?id=com.google.android.apps.healthdata";
    if (await Linking.canOpenURL(healthConnectBetaUrl)) {
      Linking.openURL(healthConnectBetaUrl);
    } else {
      console.error("Cannot open Google Play Store");
    }
  };

  const route = useRoute();
  const navigate = (screen) => {
    navigation.navigate(screen, {
      previousScreenTitle: route.name,
    });
  };
  const firstName = useSelector((state) => state.user.firstName);
  return (
    <ScrollView style={styles.container}>
      <AppHeader title={"Dashboard"} />
      <View style={{ marginTop: 20 }}>
        <Modal
          visible={modalVisible}
          transparent={false}
          animationType="slide"
          contentContainerStyle={{
            backgroundColor: AppColor.primaryContainer,
            padding: 20,
          }}
          onRequestClose={() => {
            setModalVisible(false);
          }}
        >
          {console.log("Modal visible: ", modalVisible)}
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <Text>SDK</Text>
              {sdkStatus ===
                SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED && (
                <Button
                  title="Update Health Connect"
                  onPress={openGooglePlayStore}
                />
              )}
              <Button title="Go Back" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>
      </View>
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
          onPress={requestSamplePermissions}
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
        <HeartRateChart />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 60,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Translucent black ovelay
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignSelf: "center",
    elevation: 5,
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
});
