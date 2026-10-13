import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import Svg, { Polyline } from "react-native-svg";

import { formatMinutes } from "../../utils/fitbitFormat";
import { heartRateChart, ZONE_LABELS } from "../../utils/workoutRoute";
import { fitbitCardStyles as card, ZONE_COLORS } from "./styles";
import ZoneLegend from "./ZoneLegend";

const CHART_HEIGHT = 140;
// Room at the top and bottom so the line's stroke isn't clipped
const INSET = 4;
const BAR_ZONES = ["fatBurn", "cardio", "peak"];

// Heart rate over the session, colored by zone, plus minutes in each zone.
// points: [{ t, bpm, zone }]; zones: { fatBurn, cardio, peak } in minutes.
const HeartRateTimeline = ({ points, zones, style }) => {
  const [width, setWidth] = useState(0);
  const chart = heartRateChart(points, width, CHART_HEIGHT - INSET * 2);
  const zoneMinutes = zones || {};
  const maxMinutes = Math.max(...BAR_ZONES.map((z) => zoneMinutes[z] || 0), 1);

  return (
    <View style={[card.card, style]} testID="heart-rate-timeline">
      <Text style={card.title}>Heart Rate</Text>
      <View
        style={styles.chart}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        {chart ? (
          <>
            <Svg width={width} height={CHART_HEIGHT}>
              {chart.groups.map((group, i) => (
                <Polyline
                  key={`${group.zone}-${i}`}
                  points={group.points
                    .map((p) => `${p.x},${p.y + INSET}`)
                    .join(" ")}
                  fill="none"
                  stroke={ZONE_COLORS[group.zone]}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                />
              ))}
            </Svg>
            <Text style={[card.muted, styles.maxLabel]}>{chart.maxBpm}</Text>
            <Text style={[card.muted, styles.minLabel]}>{chart.minBpm}</Text>
          </>
        ) : (
          <Text style={card.empty} testID="no-heart-rate">
            {width > 0 ? "No heart rate recorded for this workout." : ""}
          </Text>
        )}
      </View>
      <ZoneLegend />
      <View style={{ marginTop: 10 }}>
        {BAR_ZONES.map((zone) => {
          const minutes = zoneMinutes[zone] || 0;
          return (
            <View key={zone} style={styles.zoneRow}>
              <Text style={[card.muted, styles.zoneLabel]}>
                {ZONE_LABELS[zone]}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${(minutes / maxMinutes) * 100}%`,
                      backgroundColor: ZONE_COLORS[zone],
                    },
                  ]}
                />
              </View>
              <Text style={[card.muted, styles.zoneMinutes]}>
                {formatMinutes(minutes)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chart: {
    height: CHART_HEIGHT,
    marginTop: 8,
    justifyContent: "center",
  },
  maxLabel: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  minLabel: {
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  zoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  zoneLabel: {
    width: 70,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  bar: {
    height: 8,
    borderRadius: 4,
  },
  zoneMinutes: {
    width: 50,
    textAlign: "right",
  },
});

export default HeartRateTimeline;
