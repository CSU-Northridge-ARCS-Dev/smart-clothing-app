import React from "react";
import { Text, Button } from "react-native-paper";
import { View } from "react-native";

import { watchCardStyles as card } from "./styles";

// Shown on Home and DailySummary while no watch is connected
const WatchConnectPrompt = ({ onPress, message, style }) => (
  <View style={[card.card, style]} testID="watch-connect-prompt">
    <Text style={card.title}>Connect your watch</Text>
    <Text style={[card.empty, { marginBottom: 10 }]}>
      {message ||
        "Connect Health Connect to see your sleep, heart rate and workouts here."}
    </Text>
    <Button mode="contained" onPress={onPress}>
      Go to Devices
    </Button>
  </View>
);

export default WatchConnectPrompt;
