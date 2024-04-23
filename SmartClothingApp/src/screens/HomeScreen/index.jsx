import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";

import { useSelector, useDispatch } from "react-redux";
import { Button, Text } from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import DailyInsights from "../../components/DailyInsights/DailyInsights";
import LoadingOverlay from "../../components/UI/LoadingOverlay.jsx";
import { initialHealthDataSync } from "../../actions/appActions.js";

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
  const route = useRoute();
  const dispatch = useDispatch();
  const defaultData = [
    70, 63, 63, 63, 42, 42, 42, 58, 57, 57, 62, 62, 63, 67, 73, 67, 71, 71, 71,
    71, 71, 66, 66, 86, 86, 89, 86, 86, 86, 92, 90, 86, 86, 84, 84, 84, 84, 84,
    93, 92, 92, 90, 91, 91, 91, 85, 85, 85, 85, 87, 93, 99, 95, 91, 87, 85, 85,
    87, 87, 86,
  ];

  const [isLoading, setIsLoading] = useState(false);

  const onAccountCreation = useSelector((state) => state.app.onAccountCreation);

  useEffect(() => {
    if (onAccountCreation) {
      async function fetchData() {
        try {
          console.log("Fetching data...");
          setIsLoading(true);
          await mockAsyncTimeout(2000); // Simulating a 2-second delay
          console.log("Data fetched successfully!");
          // Add your data fetching logic here
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
          dispatch(initialHealthDataSync(false));
        }
      }

      fetchData();
    }
  }, [onAccountCreation]); // Run effect only when onAccountCreation changes

  function mockAsyncTimeout(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  // if (isLoading) {
  //   return < LoadingOverlay />;
  // }

  const navigate = (screen) => {
    navigation.navigate(screen, {
      previousScreenTitle: route.name,
    });
  };

  const firstName = useSelector((state) => state.user.firstName);

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <ScrollView style={styles.container}>
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
});
