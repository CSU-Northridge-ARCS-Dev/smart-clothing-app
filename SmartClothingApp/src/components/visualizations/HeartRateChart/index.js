import React from "react";
import { Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { AppStyle } from "../../../constants/themes";
// Retrieve the width of the device to adjust the width of the chart
const screenWidth = Dimensions.get("window").width - 20;
const HeartRateChart = ({ dataArray }) => {
  // Hardcoded heart rate data
  //heart_rate [bpm](/api/datatype/19/)

  const heartRates = dataArray.map((entry) => entry.heartRate);

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
        decimalPlaces: 1,
        propsForLabels: {
          fontSize: 15,
        },
      }}
      bezier
    />
  );
};

export default HeartRateChart;
