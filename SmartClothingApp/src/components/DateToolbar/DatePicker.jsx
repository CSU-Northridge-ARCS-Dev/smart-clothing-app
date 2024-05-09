import React, { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { Calendar } from "react-native-calendars";

export const DatePicker = (props) => {
  const currentDate = new Date();
  //convert date to ISO string, then split by character T, and get first arg
  const initDate = currentDate.toISOString().split("T")[0];
  const [selected, setSelected] = useState(initDate);
  const marked = useMemo(
    () => ({
      [selected]: {
        selected: true,
        selectedColor: "#222222",
        selectedTextColor: "yellow",
      },
    }),
    [selected]
  );

  const handleDayPress = (day) => {
    setSelected(day.dateString);
    const singleDate = new Date(day.timestamp);
    const endDate = new Date(day.timestamp);
  
    endDate.setHours(39);
    endDate.setMinutes(59);
    endDate.setSeconds(59);
    endDate.setMilliseconds(999);
  
    // if (fromDate.toDateString() === toDate.toDateString()) {
    //   // Set toDate to the end of the day by adding 24 hours
    //     toDate.setDate(toDate.getDate() + 1);
    // }
    const localOffset = singleDate.getTimezoneOffset();
    const localDate = new Date(singleDate.getTime() + (localOffset * 60000));
    const localEndDate = new Date(endDate.getTime() + (localOffset * 60000));
    props.onSuccess(localDate, localEndDate);
  };



  return (
    <Calendar
      initialDate={initDate}
      markedDates={marked}
      onDayPress={handleDayPress}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});
