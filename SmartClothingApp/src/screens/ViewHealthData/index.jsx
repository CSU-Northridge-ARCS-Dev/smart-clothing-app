import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { AppHeader } from "../../components";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useFocusEffect } from "@react-navigation/native";
import { daysOfWeek } from "../../utils/calendar";
import { AppColor, AppStyle, AppFonts } from "../../constants/themes";
import DailyMetrics from "../../components/DailyMetrics/DailyMetrics";

export default function ViewHealthData({ navigation }) {
  return (
    <ScrollView style={{ flex: 1 }}>
      <AppHeader title={"Health Data"} />
      <View style={{ padding: 10 }}>
        <DailyMetrics></DailyMetrics>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.rectangleContainer}
          onPress={() => navigation.navigate("SleepRateData")}
        >
          <View style={styles.whiteRectangle}>
            <Icon name="bed" size={50} color="#1160A4" />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.sleepDataText}>Sleep Data</Text>
            <Icon name="chevron-right" size={25} color="#000000" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.rectangleContainer}
          onPress={() => navigation.navigate("HeartRateData")}
        >
          <View style={styles.whiteRectangle}>
            <Icon name="heart" size={50} color="#1160A4" solid />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.sleepDataText}>Heart Data</Text>
            <Icon name="chevron-right" size={25} color="#000000" />
          </View>
        </TouchableOpacity>
      </View>
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
