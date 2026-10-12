import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import { Button, ProgressBar, Text } from "react-native-paper";

import { AppHeader, FitbitConnectPrompt } from "../../components";
import ActivityRings, {
  RINGS,
} from "../../components/visualizations/ActivityRings/ActivityRings";
import DailyInsights from "../../components/DailyInsights/DailyInsights";
import { fitbitCardStyles as card } from "../../components/fitbit/styles";
import { AppColor, AppFonts } from "../../constants/themes";
import { STEP_GOAL, SLEEP_GOAL_MINUTES } from "../../constants/goals";
import { toLocalDateString } from "../../utils/dateConversions";
import {
  formatDateLabel,
  formatMinutes,
  formatSteps,
} from "../../utils/fitbitFormat";
import { toRingProgress } from "../../utils/rings";

const ringStyle = (key) => RINGS.find((r) => r.key === key);

// One goal: name, value / goal and a bar in the ring's color
const GoalRow = ({ ringKey, value, goal, progress, testID }) => {
  const { label, colors } = ringStyle(ringKey);
  return (
    <View style={styles.goalRow} testID={testID}>
      <View style={styles.goalHeader}>
        <View style={[styles.swatch, { backgroundColor: colors[0] }]} />
        <Text style={card.title}>{label}</Text>
      </View>
      <Text style={[styles.goalValue, { color: colors[0] }]}>
        {value}
        <Text style={card.unit}> / {goal}</Text>
      </Text>
      <ProgressBar
        progress={Math.min(progress, 1)}
        color={colors[0]}
        style={styles.bar}
      />
    </View>
  );
};

// Steps and sleep for the last 7 days against their goals. Tap a
// small ring to see that day in the big ring.
const ViewInsights = ({ route, navigation }) => {
  const { previousScreenTitle } = route.params || {};
  const today = toLocalDateString();
  const [selectedDate, setSelectedDate] = useState(today);

  const status = useSelector((state) => state.device.fitbit.status);
  const weekState = useSelector((state) => state.device.fitbit.weeks[today]);
  const connected = status === "connected";
  const week = (connected && weekState && weekState.data) || [];
  const entry = week.find((d) => d.date === selectedDate);
  const progress = toRingProgress(entry);

  const renderDetails = () => {
    if (status === "unknown") return null;
    if (!connected) {
      return (
        <FitbitConnectPrompt
          onPress={() => navigation.navigate("Main", { screen: "Device" })}
          message="Connect your watch through Fitbit to fill your steps and sleep rings."
        />
      );
    }
    return (
      <>
        <GoalRow
          ringKey="steps"
          value={formatSteps(entry ? entry.steps : null)}
          goal={formatSteps(STEP_GOAL)}
          progress={progress.steps}
          testID="goal-steps"
        />
        <GoalRow
          ringKey="sleep"
          value={formatMinutes(entry ? entry.sleepMinutes : null)}
          goal={formatMinutes(SLEEP_GOAL_MINUTES)}
          progress={progress.sleep}
          testID="goal-sleep"
        />
        <Button
          mode="outlined"
          icon="arrow-right"
          contentStyle={{ flexDirection: "row-reverse" }}
          style={styles.summaryButton}
          onPress={() =>
            navigation.navigate("DailySummary", { date: selectedDate })
          }
        >
          Daily summary
        </Button>
      </>
    );
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 30 }}>
      <AppHeader title={previousScreenTitle} back={true} />
      <View style={styles.body}>
        <DailyInsights
          fromDashboard={false}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
        <Text style={styles.dateText} testID="selected-date">
          {selectedDate === today ? "Today" : formatDateLabel(selectedDate)}
        </Text>
        <View style={styles.bigRing}>
          <ActivityRings
            scale={0.9}
            canvasWidth={400}
            canvasHeight={220}
            horiPos={2}
            vertPos={2}
            totalProgress={progress}
          />
        </View>
        <View style={styles.legend}>
          {RINGS.map(({ key, label, colors }) => (
            <View key={key} style={styles.legendItem}>
              <View style={[styles.swatch, { backgroundColor: colors[0] }]} />
              <Text style={card.muted}>
                {label} ({key === "steps" ? "outer" : "inner"})
              </Text>
            </View>
          ))}
        </View>
        {renderDetails()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  body: {
    padding: 10,
  },
  dateText: {
    fontFamily: AppFonts.chakraBold,
    fontSize: 20,
    color: AppColor.primary,
    textAlign: "center",
    marginTop: 6,
  },
  bigRing: {
    alignItems: "center",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 6,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  goalRow: {
    ...StyleSheet.flatten(card.card),
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  goalValue: {
    fontFamily: AppFonts.chakraBold,
    fontSize: 26,
  },
  bar: {
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  summaryButton: {
    marginTop: 12,
    alignSelf: "flex-end",
  },
});

export default ViewInsights;
