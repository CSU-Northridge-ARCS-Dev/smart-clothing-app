import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar
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
import BaseCalendar from "./BaseCalendar";
import { updateHeartRateDateRange, updateSleepDataDateRange } from "../../actions/appActions";


const DateToolbar = (props) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
    const openDatePicker = () => {
    setShowDatePicker(true);
    StatusBar.setBarStyle("dark-content");
  };

  const closeDatePicker = () => {
    setShowDatePicker(false);
    StatusBar.setBarStyle("light-content");
  };

  const heartRateDates = useSelector((state) => state.app.heartRateDateRangeData);
  const sleepDataDates = useSelector((state) => state.app.sleepDataDateRangeData);
  let dates = {
    startDate: new Date(),
    endDate: new Date(),
  };
  switch (props.dataType) {
    case 'Heart Rate':
      dates = heartRateDates;
      break;
    case 'Sleep Data':
      dates = sleepDataDates;
      break;
    default:
      if (props.dataType != undefined) {
        dates = {
          startDate: new Date(),
          endDate: new Date(),
        };
      }
      break;
  }

  const dispatch = useDispatch();


  const handleDateRangeSuccess = (startDate, endDate) => {
    // Handle the selected date range here
    console.log("mystery start date", startDate);

    // console.log(startDateObject);
    // startDateObject.setHours(0, 0, 0, 0);


    const startDateString = startDate.toISOString();
    console.log("startDateString", startDateString);
    const endDateString = endDate.toISOString();
    console.log("endDateString", endDateString);


    // console.log("start", startDate);
    // console.log("end", endDate);

    handleUpdate(startDateString, endDateString);
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setSelected(selectedDate);
    }
  };

  const handleUpdate = async (startDate, endDate) => {
    switch (props.dataType) {
      case "Heart Rate":
        console.log("laliho!");
        await dispatch(updateHeartRateDateRange(startDate, endDate));
        break;
      case "Sleep Data":
        await dispatch(updateSleepDataDateRange(startDate, endDate));
        break;
      default:
        await dispatch(updateSleepDataDateRange(startDate, endDate));
        break;
    }
  }

  const formatDateRange = () => {
    const startDate = new Date(dates.startDate);
    const endDate = new Date(dates.endDate);

    const formattedStartDate = startDate.toLocaleDateString('en-US');
    console.log(props.dateType);
    if(props.dateType === 'single') {
      console.log("start", formattedStartDate);
    }

    
    // Format date range
    const formattedEndDate = endDate.toLocaleDateString('en-US');
    console.log("end1", endDate);

    return props.dateType === 'period' ? `${formattedStartDate} - ${formattedEndDate}` : `${formattedStartDate}`;
};


  useEffect(() => {
  }, [dates.startDate, dates.endDate]);

  return (
    <>
      <View style={styles.dateContainer}>
        <Text style={styles.title}>{formatDateRange()}</Text>
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
      {showDatePicker && 
      <BaseCalendar 
          dateType={props.dateType} 
          onSuccess={handleDateRangeSuccess}
        /> 
      }
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
