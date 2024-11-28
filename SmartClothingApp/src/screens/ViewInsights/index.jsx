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
import DailyInsights from "../../components/DailyInsights/DailyInsights";
import DateTimePicker from "@react-native-community/datetimepicker";
import ActivityChart from "../../components/visualizations/ActivityChart/ActivityChart";
import DateToolbar from "../../components/DateToolbar/DateToolbar";

const ViewInsights = ({ route }) => {
  const { previousScreenTitle } = route.params;
  const dispatch = useDispatch();
  const activityRingsData = useSelector((state) => state.app.activityRingsData);
  const [currentRingData, setCurrentRingData] = useState({
    ring1: 0,
    ring2: 0,
    ring3: 0,
  });

  const maxCal = 800;
  const maxMin = 30;
  const maxHrs = 12;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      console.log(selectedDate);
      setCurrentDate(selectedDate);
    }
  };

  // console.log(activityRingsData);

  const handleRingPress = (day) => {
    const currentRingData = {
      ring1: activityRingsData[day].ring1,
      ring2: activityRingsData[day].ring2,
      ring3: activityRingsData[day].ring3,
    };

    setCurrentRingData(currentRingData);
  };

  const handleUpdate = async () => {
    await dispatch(updateActivityRings());
  };

  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    setCurrentDate(currentDate);
  }, [currentDate]);

  return (
    <ScrollView style={[{ flex: 1 }]}>
      <AppHeader title={previousScreenTitle} back={true} />
      <View style={{ padding: 10 }}>
        <DateToolbar />
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
      <ActivityChart
        color={AppColor.ringMove}
        name="Move"
        type="CAL"
        goal={maxCal}
        progress={314}
      ></ActivityChart>
      <ActivityChart
        color={AppColor.ringExercise}
        name="Exercise"
        type="MIN"
        goal={maxMin}
        progress={15}
      ></ActivityChart>
      <ActivityChart
        color={AppColor.ringStand}
        name="Stand"
        type="HRS"
        goal={maxHrs}
        progress={3}
      ></ActivityChart>
      {showDatePicker && (
        <DateTimePicker
          testID="date-time-picker"
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
  ringsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default ViewInsights;
