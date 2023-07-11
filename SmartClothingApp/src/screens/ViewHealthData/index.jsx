import React from "react";
import { Button, View, Text } from "react-native";
import { AppHeader } from "../../components";

export default function ViewHealthData({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <AppHeader title={"Health Data"} />
      <Text>Health Data</Text>
    </View>
  );
}
