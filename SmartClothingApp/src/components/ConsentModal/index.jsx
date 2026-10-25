import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Modal, Portal, Text } from "react-native-paper";

import { AppColor, AppFonts } from "../../constants/themes";

// Asked once before the first AI feedback request, because the request sends
// the user's health data and profile to Anthropic
const ConsentModal = ({ visible, onAgree, onDecline }) => (
  <Portal>
    <Modal
      visible={visible}
      onDismiss={onDecline}
      contentContainerStyle={styles.container}
    >
      <View testID="consent-modal">
        <Text style={styles.title}>Share your data with AI?</Text>
        <Text style={styles.body}>
          To write your feedback, the app sends this day's sleep, heart rate
          and workouts, along with your gender, age, height, weight and sports,
          to Claude, an AI model made by Anthropic.
        </Text>
        <Text style={styles.body}>
          Your name and email are not sent. The feedback is general guidance,
          not medical advice.
        </Text>
        <View style={styles.buttons}>
          <Button mode="text" onPress={onDecline}>
            Not now
          </Button>
          <Button mode="contained" onPress={onAgree}>
            I agree
          </Button>
        </View>
      </View>
    </Modal>
  </Portal>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColor.surface,
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontFamily: AppFonts.poppinsBold,
    fontSize: 18,
    color: AppColor.primary,
    marginBottom: 10,
  },
  body: {
    fontFamily: AppFonts.poppins,
    fontSize: 14,
    lineHeight: 20,
    color: AppColor.onSurface,
    marginBottom: 10,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 6,
  },
});

export default ConsentModal;
