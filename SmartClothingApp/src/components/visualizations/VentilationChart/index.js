import React from "react";
import { Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { AppStyle } from "../../../constants/themes";

// Retrieve the width of the device to adjust the width of the chart
const screenWidth = Dimensions.get("window").width - 20;

const VentilationChart = () => {
  // Hardcoded ventilation data
  //minute_ventilation [mL/min](/api/datatype/36/)
  const ventilationRates = [
    110064.64, 110064.64, 110064.64, 110064.64, 110064.64, 8539.04, 8539.04,
    8539.04, 8539.04, 8539.04, 8539.04, 11367.68, 11367.68, 14780.64, 24382.08,
    26135.04, 26135.04, 26135.04, 26135.04, 26135.04, 26135.04, 26135.04,
    26135.04, 39215.84, 39215.84, 39215.84, 39215.84, 39215.84, 39215.84,
    35763.04, 35763.04, 35763.04, 35763.04, 89493.92, 89493.92, 89493.92,
    89493.92, 88192.48, 88192.48, 88192.48, 88192.48, 77887.2, 77887.2, 77887.2,
    77887.2, 77887.2, 58989.76, 58989.76, 58989.76, 58989.76, 52017.76,
    52017.76, 52017.76, 35630.24, 35630.24, 34581.12, 34581.12, 34581.12,
    34581.12, 17662.4, 17662.4, 22297.12, 22297.12, 22297.12, 22297.12,
    22297.12, 20942.56, 20942.56, 20942.56, 20942.56, 20942.56, 21513.6,
    21513.6, 23638.4, 23638.4, 23638.4, 23399.36, 23399.36, 23399.36, 23399.36,
    23399.36, 22297.12, 22297.12, 22297.12, 20876.16, 20876.16, 20876.16,
    20876.16, 18738.08, 18738.08, 18738.08, 18738.08, 21327.68, 21327.68,
    21327.68, 21327.68, 21327.68, 19455.2, 19455.2, 19455.2, 18698.24, 18698.24,
    18698.24, 18698.24, 18698.24, 18698.24, 18698.24, 18698.24, 13545.6,
    13545.6, 12961.28, 12961.28, 12961.28, 12961.28, 12961.28, 12961.28,
    10677.12, 10677.12, 10677.12, 10677.12, 10677.12, 10677.12, 11473.92,
    11473.92, 11473.92, 11473.92, 9933.44, 9933.44, 10663.84, 10663.84,
    10663.84, 10663.84, 10663.84, 10663.84, 12815.2, 12815.2, 15564.16,
    15564.16, 15564.16, 14860.32, 14860.32, 17117.92, 17117.92, 17117.92,
    17117.92, 15829.76, 15829.76, 15829.76, 16374.24, 16374.24, 15723.52,
    15723.52, 15723.52, 12297.28, 12297.28, 10916.16, 10916.16, 10916.16,
    10916.16, 10916.16, 10916.16, 9216.32, 9216.32, 9216.32, 8406.24, 8406.24,
    9229.6, 9229.6, 9229.6, 9229.6, 15922.72, 15922.72, 16148.48, 16148.48,
    16148.48, 21234.72, 21234.72, 21234.72, 21234.72, 21234.72, 21234.72,
    18884.16, 18884.16, 22376.8, 22376.8, 22376.8, 22376.8, 22376.8, 22230.72,
    22230.72, 22230.72, 21566.72, 21566.72, 21566.72, 21566.72, 21566.72,
    21566.72, 21566.72, 18392.8, 18392.8, 18392.8, 18392.8, 17556.16, 17556.16,
    17556.16, 17556.16, 17556.16, 12642.56, 12642.56, 12642.56, 12642.56,
    12642.56, 12642.56, 13266.72, 13266.72, 13266.72, 13266.72, 13266.72,
    12775.36, 12775.36, 13319.84, 14700.96, 14700.96, 12363.68, 13731.52,
    13731.52, 16095.36, 16095.36, 16095.36, 19016.96, 19016.96, 21951.84,
    22483.04, 22483.04, 22483.04, 31035.36, 31035.36, 31035.36, 31035.36,
    31035.36, 31035.36, 31035.36, 31035.36, 23877.44, 23877.44, 23877.44,
    23877.44, 20424.64, 20424.64, 20424.64, 20424.64, 20424.64, 20424.64,
    20424.64, 20424.64, 19070.08, 19070.08, 19070.08, 19070.08, 17343.68,
    17343.68, 17343.68, 16082.08, 16082.08, 10956, 10956,
  ];

  // Generate data for the chart
  const ventilationRateData = {
    datasets: [
      {
        data: ventilationRates,
      },
    ],
  };

  return (
    <LineChart
      style={{ ...AppStyle.cardElevated, borderRadius: 10 }}
      data={ventilationRateData}
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

export default VentilationChart;