import React from "react";
import { Text, Button } from "react-native-paper";
import { View, Platform } from "react-native";

import { fitbitCardStyles as card } from "./styles";

// Android reads the watch through Health Connect
const wording = () =>
  Platform.OS === "android"
    ? {
        title: "Connect your watch",
        message:
          "Connect Health Connect to see your sleep, heart rate and workouts here.",
      }
    : {
        title: "Connect your Pixel Watch",
        message:
          "Connect your watch through Fitbit to see your sleep, heart rate and workouts here.",
      };

// Shown on Home and DailySummary while no watch is connected
const FitbitConnectPrompt = ({ onPress, message, style }) => (
  <View style={[card.card, style]} testID="fitbit-connect-prompt">
    <Text style={card.title}>{wording().title}</Text>
    <Text style={[card.empty, { marginBottom: 10 }]}>
      {message || wording().message}
    </Text>
    <Button mode="contained" onPress={onPress}>
      Go to Devices
    </Button>
  </View>
);

export default FitbitConnectPrompt;
