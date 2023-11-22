import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { AppHeader } from "../../components";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useRoute } from "@react-navigation/native";
import { AppColor, AppStyle, AppFonts } from "../../constants/themes";
import DailyMetrics from "../../components/DailyMetrics/DailyMetrics";
import DataButton from "../../components/UI/DataButton";

export default function ViewHealthData({ navigation }) {
  const route = useRoute();
  const navigate = (screen) => {
    navigation.navigate(screen, {
      previousScreenTitle: route.name,
    });
  };
  return (
    <ScrollView style={{ flex: 1 }}>
      <AppHeader title={"Health Data"} />
      <DailyMetrics name="Metrics" />
      <DataButton
        screen="SleepRateData"
        icon="bed"
        color={AppColor.primary}
        dataText="Sleep Data"
        navigate={navigate}
      />

      <DataButton
        screen="HeartRateData"
        icon="heart"
        color={AppColor.primary}
        dataText="Heart Rate"
        navigate={navigate}
        solid
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    textAlign: "left",
    color: "black",
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
    borderRadius: 10,
  },
  content: {
    paddingHorizontal: 0,
    paddingTop: 10,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconContainer: {
    flexDirection: "row",
  },
  icon: {
    marginLeft: 25,
    paddingRight: 10,
    color: "#1160A4",
    fontSize: 25,
  },
  rectangleContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 5,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    height: 100,
  },
  whiteRectangle: {
    backgroundColor: "#D3E4FF",
    borderRadius: 50,
    padding: 16,
  },
  sleepDataText: {
    color: "#000000",
    fontSize: 25,
    marginRight: 8,
  },
  dayLabelsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 10,
  },
  dayLabelContainer: {
    alignItems: "center",
  },
  dayLabel: {
    color: "#1160A4",
    fontSize: 25,
  },
  selectedDayLabel: {
    borderColor: AppColor.primary,
    borderWidth: 2,
    borderRadius: 50,
    width: 35,
    height: 35,
    textAlign: "center",
    lineHeight: 36.5,
    color: AppColor.primaryContainer,
    backgroundColor: AppColor.primary,
  },
  date: {
    flex: 1,
    backgroundColor: "#D3E4FF",
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 26,
    flexDirection: "column",
    justifyContent: "flex-start",
    elevation: 5,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    height: 100,
  },
});
