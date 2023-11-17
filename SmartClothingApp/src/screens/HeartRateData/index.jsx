import React from "react";
import { Button, View, Text } from "react-native";
import { AppHeader } from "../../components";


export default function ViewHeartRateData({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <AppHeader title={"Heart Rate Data"} />

      <Text>View Heart Rate Data</Text>
    </View>
  );
}
