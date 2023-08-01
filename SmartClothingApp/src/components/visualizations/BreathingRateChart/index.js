import React from "react";
import { Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { AppStyle } from "../../../constants/themes";
const screenWidth = Dimensions.get("window").width - 20;

const BreathingRateChart = () => {
  const breathingRates = [
    24, 7, 2, 3, 5, 6, 6, 7, 7, 8, 9, 10, 10, 10, 10, 10, 10, 10, 9, 9, 8, 8, 8,
    8, 8, 8, 8, 9, 12, 15, 16, 16, 16, 16, 16, 16, 15, 15, 15, 15, 14, 14, 13,
    13, 13, 12, 12, 12, 13, 14, 15, 16, 16, 16, 16, 16, 17, 17, 18, 18, 17, 17,
    17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 17, 17, 16, 16, 17, 17,
    17, 17, 16, 16, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16,
    16, 16, 15, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 13, 13, 13, 13, 12, 12,
    12, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 13, 14, 14, 15, 15, 15, 16, 16,
    17, 17, 18, 18, 18, 19, 19, 19, 19, 20, 21, 22, 22, 22, 22, 22, 22, 21, 20,
    19, 19, 18, 18, 19,
  ];
  const breathingRateData = {
    datasets: [
      {
        data: breathingRates,
      },
    ],
  };

  return (
    <LineChart
      style={{ ...AppStyle.cardElevated, borderRadius: 10 }}
      data={breathingRateData}
      width={screenWidth}
      height={220}
      chartConfig={{
        backgroundGradientFrom: "#1E2923",
        backgroundGradientTo: "#08130D",
        color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
        strokeWidth: 2,
      }}
      bezier
    />
  );
};

export default BreathingRateChart;
