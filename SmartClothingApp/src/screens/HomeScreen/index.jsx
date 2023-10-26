import React, { useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { Button, Text } from "react-native-paper";
import { useRoute } from "@react-navigation/native";

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
        <Text style={AppStyle.title}>Hello, {firstName}</Text>
        <View style={styles.insights}>
          <Text
            style={[AppStyle.subTitle, { fontFamily: AppFonts.chakraBold }]}
          >
            Weekly Summary
          </Text>
          <Button
            mode="contained"
            onPress={() => navigate("Insights")}
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
