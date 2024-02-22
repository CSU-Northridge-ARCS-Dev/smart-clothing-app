import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
import DailyInsights from "../../components/DailyInsights/DailyInsights";
import Icon from "react-native-vector-icons/FontAwesome5";
import DateTimePicker from "@react-native-community/datetimepicker";
import ActivityChart from "../../components/visualizations/ActivityChart/ActivityChart";
import { useFocusEffect } from "@react-navigation/native";
import DateRangePicker from "./DateRangePicker";
import { updateDateRange } from "../../actions/appActions";

const DateToolbar = () => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dates = useSelector((state) => state.app.dateRangeData);
  const dispatch = useDispatch();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  })

  const handleDateRangeSuccess = (startDate, endDate) => {
    // Handle the selected date range here
    const startDateString = new Date(startDate).toISOString();
    const endDateObject = new Date(endDate)

    endDateObject.setHours(39);
    endDateObject.setMinutes(59);
    endDateObject.setSeconds(59);
    endDateObject.setMilliseconds(999);

    const endDateString = endDateObject.toISOString();

    setDateRange({
      startDate: startDateString,
      endDate: endDateString
      });
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setSelected(selectedDate);
    }
  };

  const handleUpdate = async () => {
    await dispatch(updateDateRange(dateRange.startDate, dateRange.endDate));
  }

  // const formattedDate = selected.toLocaleDateString("en-US", {
  //   weekday: "long",
  //   month: "long",
  //   day: "numeric",
  //   year: "numeric",
  // });

  useEffect(() => {
    handleUpdate();
  }, [dateRange]);

  return (
    <>
      <View style={styles.dateContainer}>
        {/* <Text style={styles.title}>{formattedDate}</Text> */}
        <View style={styles.iconContainer}>
          <Icon
            name="calendar-alt"
            size={20}
            style={styles.icon}
            onPress={() => setShowDatePicker(!showDatePicker)}
          />
          <Icon name="sliders-h" size={20} style={styles.icon} />
          <Icon name="upload" size={20} style={styles.icon} />
        </View>
      </View>
      {showDatePicker && (
        <DateRangePicker onSuccess={handleDateRangeSuccess}/>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    textAlign: "left",
    color: "black",
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconContainer: {
    flexDirection: "row",
    gap: 10,
  },
  icon: {
    color: AppColor.primary,
  },
});

export default DateToolbar;
