import React from "react";
import { Button, View, Text } from "react-native";
import { AppHeader } from "../../components";

export default function ViewInsights({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <AppHeader title={"Insights"} />
      <Text>Insights</Text>
    </View>
  );
}
