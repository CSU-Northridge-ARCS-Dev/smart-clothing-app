import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { AppHeader } from "../../components";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/FontAwesome5";
import { AppColor } from "../../constants/themes";
import HeartRateChart from "../../components/visualizations/HeartRateChart";
import DateToolbar from "../../components/DateToolbar/DateToolbar";
import { useSelector } from "react-redux";
import { CartesianChart, Scatter } from "victory-native";
import inter from "../../../assets/fonts/inter-medium.ttf";
import { useFont } from "@shopify/react-native-skia";
import RefreshView from "../../components/RefreshView";
import FirebaseHealthKitService from "../../services/AppleHealthKit/firebaseHealthKitService";

const ViewHeartRateData = ({ route }) => {
  const font = useFont(inter, 14);
  const dates = useSelector((state) => state.app.heartRateDateRangeData);
  const [heartRateData, setHeartRateData] = useState([]);
  const [minHeartRate, setMinHeartRate] = useState(null);
  const [maxHeartRate, setMaxHeartRate] = useState(null);
  const { previousScreenTitle } = route.params;
  const data = [
    { x: 1, y: 160 },
    { x: 10, y: 150 },
    { x: 20, y: 110 },
    { x: 30, y: 95 },
    { x: 40, y: 95 },
  ];

  useEffect(() => {
    const fetchHeartRateData = async () => {
      try {
        // console.log(dates.startDate);
        // console.log(dates.endDate);
        // const result = await queryHeartRateData(dates.startDate, dates.endDate);
        const result = await FirebaseHealthKitService.queryHeartRateData(dates.startDate, dates.endDate);
        if (result.length > 0) {
          const heartRates = result.map((entry) => entry.heartRate);
          const min = Math.min(...heartRates);
          const max = Math.max(...heartRates);
          setMinHeartRate(min);
          setMaxHeartRate(max);
        } else {
          setMinHeartRate(null);
          setMaxHeartRate(null);
        }
        setHeartRateData(result);
      } catch (error) {
        console.error("Error fetching heart rate data:", error);
        // Handle error
      }
    };

    fetchHeartRateData();
  }, [dates.startDate, dates.endDate]);

  return (
    <RefreshView>
      <AppHeader title={previousScreenTitle} back={true} />
      <View style={{ padding: 10 }}>
        <DateToolbar dateType="period" dataType="Heart Rate" />
      </View>

      <View style={styles.title}>
        <View style={styles.bigIcon}>
          <Icon name="heartbeat" size={40} color="#1160A4" solid />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.dataText}>Heart Rate</Text>
        </View>
      </View>

      <View style={{ alignItems: "center", paddingTop: 10, paddingBottom: 20 }}>
        <HeartRateChart dataArray={heartRateData} />
      </View>

      <View style={styles.heartRate}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Heart Rate</Text>
          <Text style={styles.infoText}>
            {minHeartRate !== null
              ? `${minHeartRate} - ${maxHeartRate} BPM`
              : "N/A"}
          </Text>
        </View>
      </View>

      <View style={styles.heartRate}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Resting Heart Rate</Text>
          <Text style={styles.infoText}>N/A</Text>
        </View>
      </View>

      <View style={styles.heartRate}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Heart Rate Variability</Text>
          <Text style={styles.infoText}>N/A</Text>
        </View>
      </View>
      <View
        style={{
          height: 200,
          marginBottom: 100,
          padding: 20,
          backgroundColor: AppColor.primaryContainer,
          borderRadius: 12,
          marginHorizontal: 10,
          marginVertical: 3,
        }}
      >
        <Text style={styles.infoText}>Heart Rate Recovery</Text>
        <CartesianChart
          data={data}
          xKey="x"
          yKeys={["y"]}
          domain={{ x: [0, 180], y: [0, 180] }}
          domainPadding={{ left: 10, right: 15 }}
          axisOptions={{
            font,
            tickCount: { x: 8 },
            lineColor: { grid: "black", frame: AppColor.primaryContainer },
            lineWidth: 0.5,
            labelColor: AppColor.primary,
            labelPosition: { x: "outset", y: "inset" },
            axisSide: { x: "bottom", y: "bottom" },
          }}
        >
          {({ points }) => (
            <>
              <Scatter
                points={points.y}
                shape="circle"
                radius={3}
                style="fill"
                color="red"
              />
              <Scatter
                points={points.y}
                shape="circle"
                radius={3}
                style="stroke"
                color="black"
              />
            </>
          )}
        </CartesianChart>
      </View>
    </RefreshView>
  );
};

const styles = StyleSheet.create({
  title: {
    padding: 10,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  iconContainer: {
    flexDirection: "row",
  },
  icon: {
    color: "#1160A4",
    fontSize: 25,
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
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10, // Adjust the value as needed
  },
  heartRate: {
    height: 50, // Adjust the height as needed
    backgroundColor: AppColor.primaryContainer, // Use the desired background color
    borderRadius: 12,
    marginVertical: 3,
    paddingHorizontal: 5,
    marginHorizontal: 10,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    height: "100%",
  },
  infoText: {
    fontSize: 20,
    color: "#000000",
    marginBottom: 5,
  },
});

export default ViewHeartRateData;
