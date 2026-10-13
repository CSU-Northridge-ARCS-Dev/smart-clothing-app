import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

import { ZONE_LABELS, ZONE_ORDER } from "../../utils/workoutRoute";
import { fitbitCardStyles as card, ZONE_COLORS } from "./styles";

// Color key for the heart rate zones on the route map and heart rate chart
const ZoneLegend = () => (
  <View style={styles.legend} testID="zone-legend">
    {ZONE_ORDER.map((zone) => (
      <View key={zone} style={styles.item}>
        <View style={[styles.swatch, { backgroundColor: ZONE_COLORS[zone] }]} />
        <Text style={card.muted}>{ZONE_LABELS[zone]}</Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  swatch: {
    width: 14,
    height: 4,
    borderRadius: 2,
    marginRight: 5,
  },
});

export default ZoneLegend;
