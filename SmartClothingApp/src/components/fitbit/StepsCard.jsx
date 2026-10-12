import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { ProgressBar, Text } from "react-native-paper";

import { AppColor } from "../../constants/themes";
import { STEP_GOAL } from "../../constants/goals";
import { formatSteps } from "../../utils/fitbitFormat";
import { goalProgress } from "../../utils/rings";
import { fitbitCardStyles as card } from "./styles";

// steps: the day's step count from insights-service, or null
const StepsCard = ({ steps, onPress, style }) => {
  const hasSteps = typeof steps === "number";
  const progress = goalProgress(steps, STEP_GOAL);

  const content = (
    <View style={[card.card, style]} testID="steps-card">
      <Text style={card.title}>Steps</Text>
      <View style={styles.valueRow}>
        <Text style={card.bigValue}>{formatSteps(steps)}</Text>
        <Text style={[card.unit, { marginLeft: 6 }]}>
          / {formatSteps(STEP_GOAL)}
        </Text>
      </View>
      <ProgressBar
        progress={Math.min(progress, 1)}
        color={AppColor.ringSteps}
        style={styles.bar}
      />
      {hasSteps && progress >= 1 && (
        <Text style={card.muted}>Goal reached</Text>
      )}
      {!hasSteps && <Text style={card.empty}>No steps recorded.</Text>}
    </View>
  );

  return onPress ? (
    <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>
  ) : (
    content
  );
};

const styles = StyleSheet.create({
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  bar: {
    height: 8,
    borderRadius: 4,
    marginVertical: 6,
  },
});

export default StepsCard;
