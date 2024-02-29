import React, { useState, useMemo } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { Calendar } from "react-native-calendars";

export const DatePicker = (props) => {
  const initDate = "2022-12-01";
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
    props.onSuccess && props.onSuccess(day.dateString);
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
