import React from "react";
import { View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { Calendar } from "react-native-calendars";

import { AppColor } from "../../constants/themes";
import { fitbitCardStyles as card } from "./styles";

// markedDates for react-native-calendars: a dot on every workout day, and the
// selected day (the workout being viewed) filled in.
export const workoutMarkedDates = (workouts, selectedDate) => {
  const marked = {};
  for (const w of workouts || []) {
    if (w.date) marked[w.date] = { marked: true, dotColor: AppColor.primary };
  }
  if (selectedDate) {
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: AppColor.primary,
    };
  }
  return marked;
};

// Month calendar with a dot on each day that has a workout.
// monthState: { loading, error, data: [{ date, logId, type }] } for the shown
// month. onMonthChange gets "YYYY-MM"; onDayPress gets "YYYY-MM-DD".
const WorkoutCalendar = ({
  current,
  monthState,
  selectedDate,
  maxDate,
  onMonthChange,
  onDayPress,
  style,
}) => {
  const workouts = (monthState && monthState.data) || [];
  const workoutDays = new Set(workouts.map((w) => w.date));

  return (
    <View style={[card.card, style]} testID="workout-calendar">
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={card.title}>Workout days</Text>
        {monthState && monthState.loading ? <ActivityIndicator size={16} /> : null}
      </View>
      {monthState && monthState.error ? (
        <Text style={card.muted}>Couldn't load this month's workouts.</Text>
      ) : null}
      <Calendar
        current={current}
        maxDate={maxDate}
        markedDates={workoutMarkedDates(workouts, selectedDate)}
        onMonthChange={(m) => onMonthChange(m.dateString.slice(0, 7))}
        onDayPress={(d) => {
          if (workoutDays.has(d.dateString)) onDayPress(d.dateString);
        }}
        theme={{
          calendarBackground: "transparent",
          todayTextColor: AppColor.primary,
          arrowColor: AppColor.primary,
        }}
      />
    </View>
  );
};

export default WorkoutCalendar;
