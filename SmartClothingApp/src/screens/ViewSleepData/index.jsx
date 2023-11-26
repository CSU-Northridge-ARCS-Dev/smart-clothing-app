import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { AppHeader } from "../../components";
import Icon from "react-native-vector-icons/FontAwesome5";
import DailyMetrics from "../../components/DailyMetrics/DailyMetrics";
import { AppColor, AppStyle, AppFonts } from "../../constants/themes";
import { CartesianChart, Line, useLinePath, PointsArray } from "victory-native";
import inter from "../../../assets/fonts/inter-medium.ttf";
import {
  useFont,
  LinearGradient,
  vec,
  topLeft,
  bottomRight,
  bottomLeft,
  rect,
} from "@shopify/react-native-skia";
import { useWindowDimensions } from "react-native";
import { useMemo } from "react";

const ViewSleepData = ({ route }) => {
  const font = useFont(inter, 14);
  const { previousScreenTitle } = route.params;
  const data = [
    { x: 1, y: 10 },
    { x: 20, y: 110 },
    { x: 40, y: 20 },
    { x: 160, y: 160 },
    { x: 170, y: 180 },
    { x: 180, y: 10 },
  ];

  const getDynamicPositionForY = (y, maxRange) => {
    // Calculate the relative position within the range [0, maxRange]
    const relativePosition = 1 - Math.min(y / maxRange, 1);
    return relativePosition;
  };

  const maxRange = 180;

  const positions = data.map((point) =>
    getDynamicPositionForY(point.y, maxRange)
  );

  const colors = positions.map((position) => {
    if (position >= 0.75) {
      return AppColor.sleepDeep;
    } else if (position >= 0.5 && position <= 0.75) {
      return AppColor.sleepCore;
    } else if (position >= 0.25 && position <= 0.5) {
      return AppColor.sleepRem;
    } else {
      return AppColor.sleepAwake;
    }
  });
  const colorStops = positions.map((position, index) => ({
    position,
    color: colors[index],
  }));

  // Sort colorStops based on positions
  colorStops.sort((a, b) => a.position - b.position);

  // Extract sorted positions and colors
  const sortedPositions = colorStops.map((stop) => stop.position);
  const sortedColors = colorStops.map((stop) => stop.color);

  return (
    <ScrollView>
      <AppHeader title={previousScreenTitle} back={true} />
      <DailyMetrics name="Sleep Data" />

      <View style={styles.title}>
        <View style={styles.bigIcon}>
          <Icon name="bed" size={40} color={AppColor.primary} />
        </View>
        <Text style={styles.dataText}>Sleep Data</Text>
      </View>
      <View
        style={{
          height: 300,
          marginBottom: 100,
          padding: 20,
          backgroundColor: AppColor.primaryContainer,
          borderRadius: 12,
          marginHorizontal: 10,
          marginVertical: 10,
        }}
      >
        <Text style={styles.infoText}>Sleep Data</Text>
        <CartesianChart
          data={data}
          xKey="x"
          yKeys={["y"]}
          domain={{ x: [0, 180], y: [0, 180] }}
          domainPadding={{ bottom: 10, top: 20, right: 80, left: 60 }}
          axisOptions={{
            font,
            tickCount: { x: 8, y: 32 },
            lineColor: { grid: "black", frame: "black" },
            lineWidth: 0.1,
            labelColor: AppColor.primary,
            labelPosition: { x: "outset", y: "inset" },
            formatYLabel(value) {
              if (value === 180) {
                return "Awake";
              } else if (value === 135) {
                return "REM";
              } else if (value === 90) {
                return "Core";
              } else if (value === 45) {
                return "Deep";
              } else {
                // Handle values outside the specified ranges
                return "";
              }
            },
          }}
        >
          {({ points, chartBounds }) => (
            <Line
              points={points.y}
              color={AppColor.sleepAwake}
              strokeWidth={5}
              curveType="linear"
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(chartBounds.top, chartBounds.bottom)}
                colors={sortedColors}
                positions={sortedPositions}
              />
            </Line>
          )}
        </CartesianChart>
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
};

const styles = StyleSheet.create({
  title: {
    paddingHorizontal: 10,
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
    backgroundColor: AppColor.primaryContainer,
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
    backgroundColor: AppColor.primaryContainer,
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

export default ViewSleepData;
