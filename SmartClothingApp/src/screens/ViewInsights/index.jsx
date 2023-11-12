import React, { useEffect, useState } from "react";
import {
  Button,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { AppHeader } from "../../components";
import ActivityRings from "../../components/visualizations/ActivityRings/ActivityRings";
import { AppColor, AppStyle, AppFonts } from "../../constants/themes";
import { useSelector, useDispatch } from "react-redux";
import { updateActivityRings } from "../../actions/appActions";
import { TouchableOpacity } from "react-native";
import DailyInsights from "../../components/DailyInsights/DailyInsights";
import Icon from "react-native-vector-icons/FontAwesome5";
import DateTimePicker from "@react-native-community/datetimepicker";
import { CartesianChart, Line } from "victory-native";
import { useFont } from "@shopify/react-native-skia";

const ViewInsights = ({ route }) => {
  const { previousScreenTitle } = route.params;
  const dispatch = useDispatch();
  const activityRingsData = useSelector((state) => state.app.activityRingsData);
  const [currentRingData, setCurrentRingData] = useState({
    ring1: 0,
    ring2: 0,
    ring3: 0,
  });

  const DATA = Array.from({ length: 31 }, (_, i) => ({
    day: i,
    lowTmp: 20 + 10 * Math.random(),
    highTmp: 40 + 30 * Math.random(),
  }));

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const tickPositions = [0, 24, 48, 72];

  const [chartData, setChartData] = useState(
    Array.from({ length: 96 }, (_, index) => ({
      x: index + 1,
      y: index === 99 ? 1 : 0.3,
    }))
  );

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      console.log(selectedDate);
      setCurrentDate(selectedDate);
    }
  };

  // console.log(activityRingsData);

  const handleRingPress = (day) => {
    // You can add your logic here to update the ring data as needed
    const currentRingData = {
      ring1: activityRingsData[day].ring1,
      ring2: activityRingsData[day].ring2,
      ring3: activityRingsData[day].ring3,
    };

    setCurrentRingData(currentRingData);
  };

  function formatDateToCustomString(date) {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    const suffix = getDaySuffix(day);

    return `Today, ${month} ${day}${suffix}, ${year}`;
  }

  function getDaySuffix(day) {
    if (day >= 11 && day <= 13) {
      return "th";
    }
    const lastDigit = day % 10;
    switch (lastDigit) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  const handleUpdate = async () => {
    await dispatch(updateActivityRings());
  };

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     const randomData = {
  //       ring1: generateRandomValue(),
  //       ring2: generateRandomValue(),
  //       ring3: generateRandomValue(),
  //     };
  //     dispatch(updateActivityRingsData("U", randomData));
  //   }, 10000);

  //   return () => clearInterval(intervalId);
  // }, [dispatch]);

  // useEffect(() => {
  //   setCurrentDate(currentDate);
  // }, [currentDate]);

  return (
    <ScrollView style={[{ flex: 1 }]}>
      <AppHeader title={previousScreenTitle} back={true} />
      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {formatDateToCustomString(currentDate)}
          </Text>
          <Icon
            name="calendar-alt"
            size={20}
            onPress={() => setShowDatePicker(true)}
          />
          <Icon name="sliders-h" size={20} style={styles.icon} />
          <Icon name="upload" size={20} style={styles.icon} />
        </View>
        <DailyInsights
          fromDashboard={false}
          handleRingPress={handleRingPress}
        />
      </View>
      <ActivityRings //big ring
        scale={0.9}
        canvasWidth={400}
        canvasHeight={220}
        horiPos={2}
        vertPos={2}
        totalProgress={{ ...currentRingData }}
      />
      <View style={{ height: 300 }}>
        <CartesianChart
          data={DATA} // 👈 specify your data
          xKey="day" // 👈 specify data key for x-axis
          yKeys={["lowTmp", "highTmp"]} // 👈 specify data keys used for y-axis
        >
          {/* 👇 render function exposes various data, such as points. */}
          {({ points }) => (
            // 👇 and we'll use the Line component to render a line path.
            <Line points={points.highTmp} color="red" strokeWidth={3} />
          )}
        </CartesianChart>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}
      <Button
        title="Update Activity Rings Data"
        onPress={() => {
          handleUpdate();
          // updateDataAtIndex(7, 5);
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    textAlign: "left",
    color: "black",
  },
  content: {
    paddingHorizontal: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginBottom: 20,
    marginVertical: 24,
    paddingTop: 200,
  },
  insights: {
    marginVertical: 10,
    elevation: 2,
    shadowColor: AppColor.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 5, height: 5 },
    backgroundColor: AppColor.primaryContainer,
    padding: 10,
    borderRadius: 10,
    height: 130,
    overflow: "hidden",
  },
  body: {
    padding: 10,
  },
  ringsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default ViewInsights;
