import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AppColor, AppFonts, AppStyle } from "../../../constants/themes";
import { CartesianChart, Bar, useChartPressState } from "victory-native";
import { useFont, Circle } from "@shopify/react-native-skia";
import inter from "../../../../assets/fonts/inter-medium.ttf";

function ToolTip({ x, y, color }) {
  return <Circle cx={x} cy={y} r={8} color={color} />;
}

const ActivityChart = ({ color, name, type, goal, progress }) => {
  const font = useFont(inter, 14);
  const defaultValue = goal * 0.03;
  const { state: firstPress, isActive: isFirstPressActive } =
    useChartPressState({
      x: 0,
      y: { listenCount: 0 },
    });

  const data = Array.from({ length: 96 }, (_, index) => ({
    month: index + 1,
    listenCount: index === 4 ? goal : defaultValue,
  }));

  return (
    <>
      <View style={{ gap: -5, paddingLeft: 20 }}>
        <Text style={styles.ringText}>{name}</Text>
        <Text style={[styles.ringMetrics, { color }]}>
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
              if (value === 5 || value === 55) {
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
          chartPressState={firstPress}
        >
          {({ points, chartBounds }) => (
            <>
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
              />

              {isFirstPressActive && (
                <ToolTip
                  x={firstPress.x.position}
                  y={firstPress.y.listenCount.position}
                  color={color}
                />
              )}
            </>
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
  ringMetrics: {
    fontSize: 25,
    fontWeight: "bold",
  },
});

export default ActivityChart;
