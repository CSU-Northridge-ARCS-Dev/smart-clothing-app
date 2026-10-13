import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

import { AppColor, AppFonts } from "../../constants/themes";
import {
  formatDistanceMiles,
  formatMinutes,
  formatPace,
  formatSteps,
} from "../../utils/fitbitFormat";
import { fitbitCardStyles as card } from "./styles";

const hasValue = (v) => v !== null && v !== undefined;

// [{ label, value }] for the stats the workout has; missing ones are left out
export const workoutStatTiles = (w) =>
  [
    { label: "Duration", value: formatMinutes(w.durationMin) },
    {
      label: "Energy burned",
      value: hasValue(w.calories) ? `${w.calories} cal` : null,
    },
    { label: "Distance", value: formatDistanceMiles(w.distanceKm) },
    { label: "Pace", value: formatPace(w.paceMinPerKm) },
    { label: "Steps", value: hasValue(w.steps) ? formatSteps(w.steps) : null },
    {
      label: "Avg heart rate",
      value: hasValue(w.avgHeartRate) ? `${w.avgHeartRate} bpm` : null,
    },
  ].filter((tile) => tile.value);

// workout: the service's workout (durationMin, calories, distanceKm, ...)
const WorkoutStats = ({ workout, style }) => (
  <View style={[card.card, style]} testID="workout-stats">
    <Text style={card.title}>Stats</Text>
    <View style={styles.grid}>
      {workoutStatTiles(workout || {}).map((tile) => (
        <View key={tile.label} style={styles.tile}>
          <Text style={styles.value}>{tile.value}</Text>
          <Text style={card.muted}>{tile.label}</Text>
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  tile: {
    width: "50%",
    paddingVertical: 8,
  },
  value: {
    fontFamily: AppFonts.chakraBold,
    fontSize: 22,
    color: AppColor.onPrimaryContainer,
  },
});

export default WorkoutStats;
