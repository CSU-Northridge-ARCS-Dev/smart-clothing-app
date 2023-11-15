import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { AppColor, AppFonts, AppStyle } from "../../../constants/themes";
import Icon from "react-native-vector-icons/FontAwesome5";
import { CartesianChart, Line, Bar } from "victory-native";
import { LinearGradient, vec } from "@shopify/react-native-skia";
import { useFont } from "@shopify/react-native-skia";
import inter from "../../../../assets/fonts/inter-medium.ttf";

const ActivityChart = ({ color, name, type, goal, progress }) => {
  const font = useFont(inter, 14);
  const defaultValue = goal * 0.03;
  const data = Array.from({ length: 96 }, (_, index) => ({
    month: index + 1,
    listenCount: index === 4 ? goal : defaultValue,
  }));

  return (
    <>
      <View style={{ gap: -5, paddingLeft: 20 }}>
        <Text style={styles.ringText}>{name}</Text>
        <Text style={[styles.caloriesBurned, { color }]}>
          <Text>
            {progress}/{goal}
          </Text>
          <Text style={{ fontSize: 20 }}>{type}</Text>
        </Text>
      </View>
      <View style={{ height: 90, paddingBottom: 5 }}>
        <CartesianChart
          data={data}
          domain={{ y: [0, goal] }}
          domainPadding={{ left: 40, right: 30, top: 0 }}
          axisOptions={{
            font,
            tickCount: { x: 20, y: 0 },
            formatXLabel(value) {
              if (value === 5 || value == 55) {
                return "12:00";
              } else if (value === 30 || value === 80) {
                return "6:00";
              } else {
                return "";
              }
            },
          }}
          xKey="month"
          yKeys={["listenCount"]}
        >
          {({ points, chartBounds }) => (
            <Bar
              color={color}
              chartBounds={chartBounds}
              points={points.listenCount}
              roundedCorners={{
                topLeft: 5,
                topRight: 5,
                bottomRight: 5,
                bottomLeft: 5,
              }}
            ></Bar>
          )}
        </CartesianChart>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  ringText: {
    fontSize: 20,
    color: AppColor.primary,
    fontWeight: "bold",
  },
  caloriesBurned: {
    fontSize: 25,
    fontWeight: "bold",
  },
});

export default ActivityChart;
