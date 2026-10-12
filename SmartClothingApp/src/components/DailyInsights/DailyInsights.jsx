import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import ActivityRings from "../visualizations/ActivityRings/ActivityRings";
import { AppColor, AppStyle, AppFonts } from "../../constants/themes";
import { useSelector, useDispatch } from "react-redux";
import { useRoute } from "@react-navigation/native";
import { ActivityIndicator, Button } from "react-native-paper";
import { startLoadFitbitWeek } from "../../actions/deviceActions";
import { toLocalDateString } from "../../utils/dateConversions";
import { formatMinutes, formatSteps } from "../../utils/fitbitFormat";
import {
  lastSevenDates,
  toRingProgress,
  weekdayLetter,
} from "../../utils/rings";

// The last 7 days of steps and sleep rings from the Pixel Watch.
// On Home (fromDashboard) a tap opens that day's DailySummary; on Insights a
// tap selects the day through onSelectDate.
const DailyInsights = ({
  fromDashboard = false,
  navigation,
  selectedDate,
  onSelectDate,
}) => {
  const route = useRoute();
  const dispatch = useDispatch();
  const today = toLocalDateString();
  const status = useSelector((state) => state.device.fitbit.status);
  const weekState = useSelector((state) => state.device.fitbit.weeks[today]);

  useEffect(() => {
    if (status === "connected") dispatch(startLoadFitbitWeek(today));
  }, [status, today]);

  const connected = status === "connected";
  const week = (connected && weekState && weekState.data) || [];
  const entryFor = (date) => week.find((d) => d.date === date);

  const onRingPress = (date) => {
    if (fromDashboard) {
      navigation.navigate("DailySummary", { date });
    } else if (onSelectDate) {
      onSelectDate(date);
    }
  };

  const renderStatus = () => {
    if (status === "unknown") return null;
    if (!connected) {
      return (
        <Text style={styles.note}>
          Connect your Pixel Watch to fill your rings.
        </Text>
      );
    }
    if (!weekState || (weekState.loading && !weekState.data)) {
      return <ActivityIndicator size="small" style={styles.spinner} />;
    }
    if (weekState.error) {
      return <Text style={styles.note}>Couldn't load this week.</Text>;
    }
    return null;
  };

  return (
    <View style={styles.insights} testID="daily-insights">
      <Text style={[AppStyle.subTitle, { fontFamily: AppFonts.chakraBold }]}>
        Daily Insights
      </Text>
      <View style={styles.ringsRow}>
        {lastSevenDates(today).map((date) => {
          const entry = entryFor(date);
          const faded = !fromDashboard && selectedDate && selectedDate !== date;
          const label = entry
            ? `${date}: ${formatSteps(entry.steps)} steps, ${formatMinutes(
                entry.sleepMinutes
              )} sleep`
            : `${date}: no data`;
          return (
            <TouchableOpacity
              key={date}
              onPress={() => onRingPress(date)}
              disabled={!connected}
              style={[styles.day, faded && styles.fadedRing]}
              testID={`ring-${date}`}
              accessibilityRole="button"
              accessibilityLabel={label}
            >
              <Text
                style={[
                  AppStyle.subTitle,
                  { fontFamily: AppFonts.chakraBold },
                  date === today && { color: AppColor.primary },
                ]}
              >
                {weekdayLetter(date)}
              </Text>
              <View style={{ width: 50, height: 50 }}>
                <ActivityRings
                  scale={0.17}
                  canvasWidth={50}
                  canvasHeight={50}
                  horiPos={2}
                  vertPos={2}
                  totalProgress={toRingProgress(entry)}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      {renderStatus()}
      {fromDashboard && (
        <Button
          mode="contained"
          onPress={() =>
            navigation.navigate("Insights", { previousScreenTitle: route.name })
          }
          icon={"arrow-right"}
          uppercase
          contentStyle={{ flexDirection: "row-reverse" }}
          style={{ alignSelf: "flex-end", marginTop: 6 }}
        >
          View
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  insights: {
    marginVertical: 10,
    elevation: 2,
    shadowColor: AppColor.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 5, height: 5 },
    backgroundColor: AppColor.primaryContainer,
    padding: 10,
    borderRadius: 10,
  },
  ringsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  day: {
    alignItems: "center",
  },
  fadedRing: {
    opacity: 0.5,
  },
  note: {
    fontFamily: AppFonts.poppins,
    fontSize: 13,
    color: AppColor.onSurfaceVariant,
    marginTop: 6,
  },
  spinner: {
    marginTop: 6,
    alignSelf: "flex-start",
  },
});

export default DailyInsights;
