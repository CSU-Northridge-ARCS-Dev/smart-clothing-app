import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { AppHeader } from "../../components";
import Icon from "react-native-vector-icons/FontAwesome5";
import DailyMetrics from "../../components/DailyMetrics/DailyMetrics";
import { AppColor, AppStyle, AppFonts } from "../../constants/themes";

export default function ViewSleepRateData({ navigation, route }) {
  const previousScreenTitle = route.params?.previousScreenTitle || "Sleep Data";

  return (
    <ScrollView style={styles.container}>
      <AppHeader title={previousScreenTitle} back={true} />
      <DailyMetrics name="Sleep Data" />

      <View style={styles.title}>
        <View style={styles.bigIcon}>
          <Icon name="bed" size={40} color={AppColor.primary} />
        </View>
        <Text style={styles.dataText}>Sleep Data</Text>
      </View>

      <Text style={styles.header}>Stages</Text>

      <View style={styles.sleepStage}>
        <View style={styles.infoContainer}>
          <View style={styles.stageText}>
            <View
              style={[styles.circle, { backgroundColor: AppColor.sleepAwake }]}
            ></View>
            <Text style={styles.infoText}>Awake</Text>
          </View>
          <Text style={styles.infoText}>5 min</Text>
        </View>
      </View>

      <View style={styles.sleepStage}>
        <View style={styles.infoContainer}>
          <View style={styles.stageText}>
            <View
              style={[styles.circle, { backgroundColor: AppColor.sleepRem }]}
            ></View>
            <Text style={styles.infoText}>REM</Text>
          </View>
          <Text style={styles.infoText}>1 hr 56 min</Text>
        </View>
      </View>

      <View style={styles.sleepStage}>
        <View style={styles.infoContainer}>
          <View style={styles.stageText}>
            <View
              style={[styles.circle, { backgroundColor: AppColor.sleepCore }]}
            />
            <Text style={styles.infoText}>Core</Text>
          </View>
          <Text style={styles.infoText}>5 hr 17 min</Text>
        </View>
      </View>

      <View style={styles.sleepStage}>
        <View style={styles.infoContainer}>
          <View style={styles.stageText}>
            <View
              style={[styles.circle, { backgroundColor: AppColor.sleepDeep }]}
            />
            <Text style={styles.infoText}>Deep</Text>
          </View>
          <Text style={styles.infoText}>11 min</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    paddingTop: 0,
    padding: 10,
    gap: 10,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bigIcon: {
    backgroundColor: "#D3E4FF",
    height: 70,
    width: 70,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  dataText: {
    color: "black",
    fontSize: 35,
  },
  sleepStage: {
    height: 50,
    backgroundColor: "#D3E4FF",
    borderRadius: 15,
    marginVertical: 3,
    marginHorizontal: 10,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoText: {
    fontSize: 20,
    color: "black",
  },
  stageText: {
    flexDirection: "row",
    gap: 10,
  },
  header: {
    textAlign: "center",
    fontSize: 22,
    color: AppColor.primary,
    fontWeight: "bold",
  },
  circle: {
    height: 10,
    width: 10,
    borderRadius: 50,
    padding: 16,
  },
});
