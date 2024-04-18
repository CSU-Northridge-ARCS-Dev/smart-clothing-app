import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Modal } from "react-native";
import { useSelector } from "react-redux";
import { Button, Text } from "react-native-paper";
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

export default function HomeScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [sdkStatus, setSdkStatus] = useState(null);

  const checkAvailability = () => {
    const status = 1;
    setSdkStatus(status);
    if (status === 3) {
      console.log("SDK is available");
    }

    if (status === 1) {
      console.log("SDK is not available");
      setModalVisible(true);
    }
    if (status === 2) {
      console.log("SDK is not available, provider update required");
      setModalVisible(true);
    }
  };

  useEffect(() => {
    checkAvailability();
  }, []);

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
              {sdkStatus === 2 && (
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
