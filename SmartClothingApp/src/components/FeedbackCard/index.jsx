import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Icon, Text } from "react-native-paper";

import { fitbitCardStyles as card } from "../fitbit/styles";
import { AppColor, AppFonts } from "../../constants/themes";

const BulletList = ({ items, color }) =>
  items.map((item, i) => (
    <View key={i} style={styles.bulletRow}>
      <Text style={[styles.bullet, { color }]}>{"•"}</Text>
      <Text style={styles.bulletText}>{item}</Text>
    </View>
  ));

// Claude's feedback for one day: { headline, keySignals, focus }
const FeedbackCard = ({ insight, onRegenerate, regenerating }) => {
  const { headline, keySignals = [], focus = [] } = insight;
  return (
    <View style={card.card} testID="feedback-card">
      <View style={styles.labelRow}>
        <Icon source="robot-outline" size={16} color={AppColor.primary} />
        <Text style={styles.label}>AI Feedback</Text>
      </View>

      {headline ? <Text style={styles.headline}>{headline}</Text> : null}

      {keySignals.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key signals</Text>
          <BulletList items={keySignals} color={AppColor.onSurfaceVariant} />
        </View>
      )}

      {focus.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: AppColor.primary }]}>
            Focus
          </Text>
          <BulletList items={focus} color={AppColor.primary} />
        </View>
      )}

      {onRegenerate && (
        <Button
          mode="text"
          icon="refresh"
          onPress={onRegenerate}
          loading={regenerating}
          disabled={regenerating}
          style={styles.regenerate}
        >
          Regenerate
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontFamily: AppFonts.poppinsBold,
    fontSize: 12,
    color: AppColor.primary,
    marginLeft: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headline: {
    fontFamily: AppFonts.poppinsBold,
    fontSize: 17,
    color: AppColor.onPrimaryContainer,
    marginBottom: 6,
  },
  section: {
    marginTop: 6,
  },
  sectionTitle: {
    fontFamily: AppFonts.poppinsBold,
    fontSize: 12,
    color: AppColor.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 4,
  },
  bullet: {
    fontSize: 14,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontFamily: AppFonts.poppins,
    fontSize: 14,
    lineHeight: 20,
    color: AppColor.onSurface,
  },
  regenerate: {
    alignSelf: "flex-end",
    marginTop: 6,
  },
});

export default FeedbackCard;
