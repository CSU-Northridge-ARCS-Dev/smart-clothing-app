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
    const isoDateString = new Date(day.timestamp).toISOString();
    props.onSuccess(isoDateString, isoDateString);
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
