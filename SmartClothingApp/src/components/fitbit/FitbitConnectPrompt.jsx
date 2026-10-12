import React from "react";
import { Text, Button } from "react-native-paper";
import { View } from "react-native";

import { fitbitCardStyles as card } from "./styles";

// Shown on Home and DailySummary while no Pixel Watch is connected
const FitbitConnectPrompt = ({ onPress, message, style }) => (
  <View style={[card.card, style]} testID="fitbit-connect-prompt">
    <Text style={card.title}>Connect your Pixel Watch</Text>
    <Text style={[card.empty, { marginBottom: 10 }]}>
      {message ||
        "Connect your watch through Fitbit to see your sleep, heart rate and workouts here."}
    </Text>
    <Button mode="contained" onPress={onPress}>
      Go to Devices
    </Button>
  </View>
);

export default FitbitConnectPrompt;
