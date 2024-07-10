import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Modal, Button, Text, Linking, Platform, ActivityIndicator } from "react-native";
import { useSelector, useDispatch } from "react-redux";
//import { Button, Modal, Text } from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import DailyInsights from "../../components/DailyInsights/DailyInsights";
import LoadingOverlay from "../../components/UI/LoadingOverlay.jsx";
import RefreshView from "../../components/RefreshView/index.jsx";
import {
  ActivityCard,
  AppHeader,
  BreathingRateChart,
  HeartRateChart,
  VentilationChart,
  DataCollectModal,
} from "../../components";
import { AppColor, AppFonts, AppStyle } from "../../constants/themes.js";
import HealthConnectModal from "../../components/HealthConnectModal/index.jsx";
import { useHealthDataSync } from "../../services/useHealthDataSync";


export default function HomeScreen({ navigation }) {
  
  const dispatch = useDispatch();

  // User / App data
  const firstName = useSelector((state) => state.user.firstName);
  const isFirstSync = useSelector((state) => state.app.firstSync);


/**
 * Utilizes `useHealthDataSync` hook to synchronize health data (Health Connect/HealthKit) with Firebase.
 * 
 * - **Flow**:
 *   1. Checks if it's the first sync; fetches historical or new data accordingly.
 *   2. Uses actions from `healthConnectActions.js`/`healthKitActions.js` for setup and permissions.
 *   3. After permission, retrieves health data and dispatches it to Firebase.
 *   4. Manages loading states and errors, using UI elements for user feedback.
 * 
 * - **Reusability**:
 *   Designed for easy integration across components needing health data sync, abstracting data retrieval, permission handling, and state management.
 * 
 * - **Redux Integration**:
 *   Seamlessly integrates with Redux for consistent state management during the sync process.
 */
  const { isLoading } = useHealthDataSync(isFirstSync);


  // if (isLoading) {
  //   return <LoadingOverlay />;
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
  // overlay: {     <-------  // Overlay for loading
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


  // FOR REFERENCE:
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