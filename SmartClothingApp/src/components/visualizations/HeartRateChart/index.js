import React from "react";
import { Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { AppStyle } from "../../../constants/themes";
// Retrieve the width of the device to adjust the width of the chart
const screenWidth = Dimensions.get("window").width - 20;
const HeartRateChart = () => {
  // Hardcoded heart rate data
  //heart_rate [bpm](/api/datatype/19/)
  const heartRates = [
    70, 63, 63, 63, 42, 42, 42, 58, 57, 57, 62, 62, 63, 67, 73, 67, 71, 71, 71,
    71, 71, 66, 66, 86, 86, 89, 86, 86, 86, 92, 90, 86, 86, 84, 84, 84, 84, 84,
    93, 92, 92, 90, 91, 91, 91, 85, 85, 85, 85, 87, 93, 99, 95, 91, 87, 85, 85,
    87, 87, 86,
  ];

  // Generate data for the chart
  const heartRateData = {
    datasets: [
      {
        data: heartRates,
      },
    ],
  };

  return (
    <LineChart
      style={{ ...AppStyle.cardElevated, borderRadius: 10 }}
      data={heartRateData}
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

export default HeartRateChart;
