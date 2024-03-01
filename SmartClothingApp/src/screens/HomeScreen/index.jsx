import React, { useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import {
  ActivityCard,
  AppHeader,
  BreathingRateChart,
  HeartRateChart,
  VentilationChart,
} from "../../components";
import { Button, Text } from "react-native-paper";
import { AppColor, AppFonts, AppStyle } from "../../constants/themes.js";
import { initialize, getSdkStatus, requestPermission, insertRecords } from "react-native-health-connect";

const firstName = useSelector((state) => state.user.firstName);
const insertSampleData = async () => {
  const isInitalized = await initialize();
  if (!isInitalized) {
    return;
  }
  console.log({isInitalized});
  const status = await getSdkStatus();
  if (status === SdkAvailabilityStatus.SDK_AVAILABLE) {
    console.log('SDK is available');
  }
  await requestPermission([
    { accessType: 'insert', recordType: 'Steps' },
    { accessType: 'insert', recordType: 'HeartRate' },
  ]);

  insertRecords([
    {
      recordType: 'ActiveCaloriesBurned',
      energy: { unit: 'kilocalories', value: 10000 },
      startTime: '2023-01-09T10:00:00.405Z',
      endTime: '2023-01-09T11:53:15.405Z',
    },
    {
      recordType: 'ActiveCaloriesBurned',
      energy: { unit: 'kilocalories', value: 15000 },
      startTime: '2023-01-09T12:00:00.405Z',
      endTime: '2023-01-09T23:53:15.405Z',
    },
  ]).then((ids) => {
    console.log('Records inserted ', { ids }); // Records inserted  {"ids": ["06bef46e-9383-4cc1-94b6-07a5045b764a", "a7bdea65-86ce-4eb2-a9ef-a87e6a7d9df2"]}
  });
}

export default function HomeScreen({ navigation }) {
  insertSampleData();
  return (
    <ScrollView style={styles.container}>
      <AppHeader title={"Dashboard"} />
      <View style={styles.body}>
        <Text style={AppStyle.title}>Hello, {firstName}</Text>
        <Text style={AppStyle.title}>Hello World</Text>
        <View style={styles.insights}>
          <Text
            style={[AppStyle.subTitle, { fontFamily: AppFonts.chakraBold }]}
          >
            Weekly Summary
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate("Insights")}
            icon={"arrow-right"}
            uppercase
            contentStyle={{ flexDirection: "row-reverse" }}
            style={{ alignSelf: "flex-end" }}
          >
            View
          </Button>
        </View>
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
