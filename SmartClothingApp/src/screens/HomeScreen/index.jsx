import React, { useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  AppHeader,
  BreathingRateChart,
  HeartRateChart,
  VentilationChart,
} from "../../components";
import { Button, Text } from "react-native-paper";
import { AppColor, AppFonts, AppStyle } from "../../constants/themes.js";

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <AppHeader title={"Dashboard"} />
      <View style={styles.body}>
        <Text style={AppStyle.title}>Hello, User</Text>
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
