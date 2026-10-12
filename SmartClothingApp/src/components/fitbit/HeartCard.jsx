import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";

import { AppColor } from "../../constants/themes";
import { formatMinutes } from "../../utils/fitbitFormat";
import { fitbitCardStyles as card, ZONE_COLORS } from "./styles";

// only the harder zones show.
const ZONES = [
  { key: "cardio", label: "Cardio" },
  { key: "peak", label: "Peak" },
];

// Resting HR change since yesterday. Lower is better, so down is green.
const RestingDelta = ({ today, previous }) => {
  if (today === null || today === undefined) return null;
  if (previous === null || previous === undefined) return null;
  const delta = today - previous;
  if (delta === 0) {
    return <Text style={card.muted}>No change from yesterday</Text>;
  }
  const up = delta > 0;
  return (
    <Text
      testID="resting-delta"
      style={[card.muted, { color: up ? ZONE_COLORS.peak : ZONE_COLORS.fatBurn }]}
    >
      {up ? "▲" : "▼"} {Math.abs(delta)} bpm from yesterday
    </Text>
  );
};

// heart: { restingHeartRate, previousRestingHeartRate, zones } from the day
const HeartCard = ({ heart, onPress, style }) => {
  const zones = (heart && heart.zones) || { cardio: 0, peak: 0 };
  const resting = heart ? heart.restingHeartRate : null;
  const maxMinutes = Math.max(...ZONES.map((z) => zones[z.key] || 0), 1);

  const content = (
    <View style={[card.card, style]} testID="heart-card">
      <Text style={card.title}>Heart Rate</Text>
      <View style={styles.restingRow}>
        <Text style={card.bigValue}>
          {resting === null || resting === undefined ? "--" : resting}
        </Text>
        <Text style={[card.unit, { marginLeft: 6 }]}>resting bpm</Text>
      </View>
      <RestingDelta
        today={resting}
        previous={heart ? heart.previousRestingHeartRate : null}
      />
      <View style={{ marginTop: 10 }}>
        {ZONES.map((zone) => {
          const minutes = zones[zone.key] || 0;
          return (
            <View key={zone.key} style={styles.zoneRow}>
              <View
                style={[styles.dot, { backgroundColor: ZONE_COLORS[zone.key] }]}
              />
              <Text style={[card.muted, styles.zoneLabel]}>{zone.label}</Text>
              <View style={styles.track}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${Math.round((minutes / maxMinutes) * 100)}%`,
                      backgroundColor: ZONE_COLORS[zone.key],
                    },
                  ]}
                />
              </View>
              <Text style={[card.muted, styles.zoneValue]}>
                {formatMinutes(minutes)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  if (!onPress) return content;
  return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
};

const styles = StyleSheet.create({
  restingRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 4,
  },
  zoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  zoneLabel: {
    width: 64,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColor.surfaceVariant,
    overflow: "hidden",
  },
  bar: {
    height: 8,
    borderRadius: 4,
  },
  zoneValue: {
    width: 56,
    textAlign: "right",
  },
});

export default HeartCard;
