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
import BaseCalendar from "./BaseCalendar";
import { updateHeartRateDateRange, updateSleepDataDateRange } from "../../actions/appActions";


const DateToolbar = (props) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const heartRateDates = useSelector((state) => state.app.heartRateDateRangeData);
  const sleepDataDates = useSelector((state) => state.app.sleepDataDateRangeData);
  let dates;
  switch (props.dateType) {
    case 'Heart Rate':
      dates = heartRateDates;
      break;
    case 'Sleep Data':
      dates = sleepDataDates;
      break;
    default:
      dates = {
        startDate: new Date(),
        endDate: new Date(),
      };
      break;
  }

  const dispatch = useDispatch();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });



  const handleDateRangeSuccess = (startDate, endDate) => {
    // Handle the selected date range here
    const startDateString = new Date(startDate).toISOString();
    const endDateObject = new Date(endDate)

    endDateObject.setHours(39);
    endDateObject.setMinutes(59);
    endDateObject.setSeconds(59);
    endDateObject.setMilliseconds(999);

    const endDateString = endDateObject.toISOString();

    console.log("start", startDate);
    console.log("end", endDate);

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
    
    const startOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    const endOptions = { month: 'long', day: 'numeric', year: 'numeric' };

    const startFormatted = startDate.toLocaleDateString('en-US', startOptions);
    const endFormatted = endDate.toLocaleDateString('en-US', endOptions);
    
    return `${startFormatted} - ${endFormatted}`;
};

  // const formattedDate = selected.toLocaleDateString("en-US", {
  //   weekday: "long",
  //   month: "long",
  //   day: "numeric",
  //   year: "numeric",
  // });

  // useEffect(() => {
  //   setDateRange({
  //     startDate: dates.startDate,
  //     endDate: dates.endDate,
  //   })
  // }, [dates.startDate, dates.endDate]);

  return (
    <>
      <View style={styles.dateContainer}>
        {/* <Text style={styles.title}>{formatDateRange()}</Text> */}
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
