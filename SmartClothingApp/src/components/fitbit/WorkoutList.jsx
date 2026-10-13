import React from "react";
import { View, StyleSheet } from "react-native";
import { Icon, Text, TouchableRipple } from "react-native-paper";

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

// workouts: Run / Weights / Walk / Workout sessions recorded on the watch.
// onPressWorkout(workout) makes the rows that have a logId tappable.
const WorkoutList = ({ workouts, onPressWorkout, style }) => (
  <View style={[card.card, style]} testID="workout-list">
    <Text style={card.title}>Workouts</Text>
    {!workouts || workouts.length === 0 ? (
      <Text style={card.empty}>
        No workouts recorded on the watch.
      </Text>
    ) : (
      workouts.map((w, i) => {
        const tappable = Boolean(onPressWorkout && w.logId);
        const row = (
          <View style={styles.rowContent}>
            <View style={{ flex: 1 }}>
              <View style={styles.header}>
                <Text style={[card.title, styles.type]}>{w.type}</Text>
                <Text style={card.muted}>{formatClockTime(w.startTime)}</Text>
              </View>
              <Text style={card.muted}>{workoutDetails(w)}</Text>
            </View>
            {tappable ? (
              <Icon
                source="chevron-right"
                size={22}
                color={AppColor.onSurfaceVariant}
              />
            ) : null}
          </View>
        );
        const key = `${w.type}-${w.startTime}-${i}`;
        const rowStyle = [styles.row, i > 0 && styles.divider];
        return tappable ? (
          <TouchableRipple
            key={key}
            style={rowStyle}
            onPress={() => onPressWorkout(w)}
            testID={`workout-row-${w.logId}`}
            accessibilityRole="button"
            accessibilityLabel={`Open ${w.type} workout`}
          >
            {row}
          </TouchableRipple>
        ) : (
          <View key={key} style={rowStyle}>
            {row}
          </View>
        );
      })
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
  rowContent: {
    flexDirection: "row",
    alignItems: "center",
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
