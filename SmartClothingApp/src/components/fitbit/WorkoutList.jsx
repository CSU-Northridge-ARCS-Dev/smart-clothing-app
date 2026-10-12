import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

import { AppColor } from "../../constants/themes";
import {
  formatClockTime,
  formatDistanceMiles,
  formatMinutes,
  formatPace,
} from "../../utils/fitbitFormat";
import { fitbitCardStyles as card } from "./styles";

// One line of details: "30m · avg 152 bpm · 3.1 mi · 9:39 /mi"
const workoutDetails = (w) => {
  const parts = [formatMinutes(w.durationMin)];
  if (w.avgHeartRate) parts.push(`avg ${w.avgHeartRate} bpm`);
  const distance = formatDistanceMiles(w.distanceKm);
  if (distance) parts.push(distance);
  const pace = formatPace(w.paceMinPerKm);
  if (pace) parts.push(pace);
  return parts.join(" · ");
};

// workouts: Run / Weights / Walk / Workout sessions recorded on the watch
const WorkoutList = ({ workouts, style }) => (
  <View style={[card.card, style]} testID="workout-list">
    <Text style={card.title}>Workouts</Text>
    {!workouts || workouts.length === 0 ? (
      <Text style={card.empty}>
        No workouts recorded on the watch.
      </Text>
    ) : (
      workouts.map((w, i) => (
        <View
          key={`${w.type}-${w.startTime}-${i}`}
          style={[styles.row, i > 0 && styles.divider]}
        >
          <View style={styles.header}>
            <Text style={[card.title, styles.type]}>{w.type}</Text>
            <Text style={card.muted}>{formatClockTime(w.startTime)}</Text>
          </View>
          <Text style={card.muted}>{workoutDetails(w)}</Text>
        </View>
      ))
    )}
  </View>
);

const styles = StyleSheet.create({
  row: {
    paddingVertical: 8,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: AppColor.outlineVariant,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  type: {
    fontSize: 15,
    color: AppColor.onPrimaryContainer,
  },
});

export default WorkoutList;
