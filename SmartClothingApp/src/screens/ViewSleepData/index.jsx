import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
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
import { scaleLinear, tickStep, ticks } from "d3";
import DateToolbar from "../../components/DateToolbar/DateToolbar";
import { querySleepData } from "../../actions/userActions";

const ViewSleepData = ({ route }) => {
  const font = useFont(inter, 14);
  const dates = useSelector((state) => state.app.sleepDataDateRangeData);
  const { previousScreenTitle } = route.params;
  const [sleepData, setSleepData] = useState([]);



  const data = [
      { x: 1, y: 10 },   //Deep 0-40
      { x: 20, y: 110 }, // Core 40-100
      { x: 40, y: 20 },  // REM 100-160
      { x: 180, y: 160 }, // Awake 160-200
      { x: 170, y: 180 }, 
      { x: 200, y: 10 },
  ];


//Deep 0-46
// Core 46-100
// REM 100-160
// Awake 160-180
   useEffect(() => {
    const fetchSleepData = async () => {
      try {
        // console.log(dates.startDate);
        // console.log(dates.endDate);
        const result = await querySleepData(dates.startDate, dates.endDate);
        console.log("UNPARSED SLEEP DATA: ", result)
        // result.forEach(item => {
        //     console.log("startDate", item.startDate);
        //     console.log("endDate", item.endDate);
        // });
        const parsedData = parseSleepData(result);
        setSleepData(parsedData);
      } catch (error) {
        console.error("Error fetching sleep data:", error);
        // Handle error
      }
    };

    fetchSleepData();
  }, [dates.startDate, dates.endDate]);


  const parseSleepData = (sleepData) => {  
    
    durations = [];

    const parsedData = sleepData.reduce((parsedData, item, index) => {
        // console.log("startDate", startDate, startDate.getTime());
        // console.log("endDate", endDate, endDate.getTime());
        // console.log("hours", durationHours);

        const cumulativeDuration = sleepData.slice(0, index).reduce((sum, stage) => {
            const start = new Date(stage.startDate);
            const end = new Date(stage.endDate);
            return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Duration in hours
        }, 0);

        durations.push(cumulativeDuration);

        const x = (durations[index] / 24) * 200; // Assuming the x range is 0-200
        // console.log("hours", durationHours);
        // console.log("duration", duration);
        // console.log(x);
        // Deep 0-46
        // Core 46-100
        // REM 100-160
        // Awake 160-180
      let y;
      switch (item.sleepValue) {
          case "Deep":
              y = 0; // Deep sleep: 0-46
              break;
          case "Core":
              y = 60; // Core 40-100
              break;
          case "Rem":
              y = 130; //Rem 100-160 
              break;
          case "Awake":
              y = 180; //Awake 160-200 
              break;
          default:
              // Handle unexpected sleepValue
              break;
      }
        parsedData.push({ x: x, y: y });

        console.log(parsedData);

        return parsedData;
    }, []);
    
    return parsedData; 
  };

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

  const x = ticks(0, 180, 30);

  return (
    <ScrollView>
      <AppHeader title={previousScreenTitle} back={true} />
      <View style={{padding: 10}}>
        <DateToolbar dateType="single" dataType="Sleep Data" />
      </View>

      <View style={styles.title}>
        <View style={styles.bigIcon}>
          <Icon name="bed" size={40} color={AppColor.primary} />
        </View>
        <Text style={styles.dataText}>Sleep Data</Text>
      </View>

      <View
        style={{
          height: 400,
          padding: 20,
          backgroundColor: "white",
          borderRadius: 12,
          marginHorizontal: 10,
          marginVertical: 10,
        }}
      >
        <Text style={styles.infoText}>Sleep Data</Text>
        <CartesianChart
          data={sleepData}
          xKey="x"
          yKeys={["y"]}
          domain={{ x: [0, 180, 30], y: [0, 180] }}
          domainPadding={{ bottom: 10, top: 35, right: 80, left: 60 }}
          axisOptions={{
            font,
            tickCount: { x: 8, y: 5 },
            lineColor: { grid: "black", frame: "black" },
            lineWidth: 0.1,
            labelColor: AppColor.primary,
            labelPosition: { x: "outset", y: "inset" },
            formatYLabel(value) {
              if (value === 200) {
                return "Awake";
              } else if (value === 150) {
                return "REM";
              } else if (value === 100) {
                return "Core";
              } else if (value === 50) {
                return "Deep";
              } else {
                return "";
              }
            },
            formatXLabel(value) {
              if (value === 200) {
                return "12AM"
              } else if (value === 150) {
                return "6PM"
              } else if (value === 100) {
                return "12PM"
              } else if (value === 50) {
                return "6AM"
              } else  {
                return "";
              }
            }

          }}
        >
          {({ points, chartBounds, yScale }) => (
            <Line
              points={points.y}
              color={AppColor.sleepAwake}
              strokeWidth={6}
              curveType="step"
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(chartBounds.top, chartBounds.bottom)}
                colors={[
                  AppColor.sleepAwake,
                  AppColor.sleepAwake,
                  AppColor.sleepRem,
                  AppColor.sleepRem,
                  AppColor.sleepCore,
                  AppColor.sleepCore,
                  AppColor.sleepDeep,
                  AppColor.sleepDeep,
                ]}
                positions={[0, 0.292, 0.25, 0.495, 0.5, 0.67, 0.75, 1]}
              />
            </Line>
          )}
        </CartesianChart>
      </View>

      <View style={{ marginBottom: 100 }}>
        <Text style={styles.header}>Stages</Text>

        <View style={styles.sleepStage}>
          <View style={styles.infoContainer}>
            <View style={styles.stageText}>
              <View
                style={[
                  styles.circle,
                  { backgroundColor: AppColor.sleepAwake },
                ]}
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
