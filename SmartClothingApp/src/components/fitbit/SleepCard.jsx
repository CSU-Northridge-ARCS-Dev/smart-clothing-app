import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";

import { AppColor } from "../../constants/themes";
import {
  buildHypnogram,
  formatClockTime,
  formatMinutes,
} from "../../utils/fitbitFormat";
import { fitbitCardStyles as card, LEVEL_COLORS } from "./styles";

const ROW_HEIGHT = 18;

const LEVEL_LABELS = {
  wake: "Awake",
  rem: "REM",
  light: "Light",
  deep: "Deep",
  awake: "Awake",
  restless: "Restless",
  asleep: "Asleep",
};

// Timeline of the night, one row per sleep level (as in Momentum)
const Hypnogram = ({ levels }) => {
  const hypnogram = buildHypnogram(levels);
  if (!hypnogram) return null;
  const { rows, segments } = hypnogram;

  return (
    <View style={styles.hypnogram} testID="hypnogram">
      <View>
        {rows.map((row) => (
          <Text key={row} style={[card.muted, styles.rowLabel]}>
            {LEVEL_LABELS[row]}
          </Text>
        ))}
      </View>
      <View style={[styles.plot, { height: rows.length * ROW_HEIGHT }]}>
        {segments.map((s, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              top: s.row * ROW_HEIGHT + 2,
              height: ROW_HEIGHT - 4,
              left: `${s.left * 100}%`,
              width: `${Math.max(s.width * 100, 0.5)}%`,
              backgroundColor: LEVEL_COLORS[s.level],
              borderRadius: 2,
            }}
          />
        ))}
      </View>
    </View>
  );
};

const STAGES = [
  { key: "deep", label: "Deep" },
  { key: "light", label: "Light" },
  { key: "rem", label: "REM" },
  { key: "wake", label: "Awake" },
];

// sleep: { totalMinutes, efficiency, deep, light, rem, wake, bedTime,
// wakeTime, levels } from the day, or null when no sleep was logged
const SleepCard = ({ sleep, onPress, style }) => {
  const hasStages = sleep && STAGES.some((s) => sleep[s.key] !== null);

  const content = (
    <View style={[card.card, style]} testID="sleep-card">
      <Text style={card.title}>Sleep</Text>
      {!sleep ? (
        <Text style={card.empty}>No sleep recorded for this night.</Text>
      ) : (
        <>
          <View style={styles.summaryRow}>
            <Text style={card.bigValue}>{formatMinutes(sleep.totalMinutes)}</Text>
            {sleep.efficiency !== null && sleep.efficiency !== undefined && (
              <Text style={[card.unit, { marginLeft: 8 }]}>
                {sleep.efficiency}% efficiency
              </Text>
            )}
          </View>
          <Text style={card.muted}>
            {formatClockTime(sleep.bedTime)} - {formatClockTime(sleep.wakeTime)}
          </Text>
          <Hypnogram levels={sleep.levels} />
          {hasStages && (
            <View style={styles.stages}>
              {STAGES.map((stage) => (
                <View key={stage.key} style={styles.stage}>
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: LEVEL_COLORS[stage.key] },
                    ]}
                  />
                  <Text style={card.muted}>
                    {stage.label} {formatMinutes(sleep[stage.key])}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );

  if (!onPress) return content;
  return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
};

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 4,
  },
  hypnogram: {
    flexDirection: "row",
    marginTop: 12,
  },
  rowLabel: {
    height: ROW_HEIGHT,
    lineHeight: ROW_HEIGHT,
    width: 56,
  },
  plot: {
    flex: 1,
    position: "relative",
    backgroundColor: AppColor.surfaceVariant,
    borderRadius: 4,
    overflow: "hidden",
  },
  stages: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  stage: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
});

export default SleepCard;
