import React from "react";
import { Button, View, Text } from "react-native";
import { AppHeader } from "../../components";

export default function ViewInsights({ route }) {
  const { previousScreenTitle } = route.params;
  return (
    <View style={{ flex: 1 }}>
      <AppHeader title={previousScreenTitle} back={true} />
      <Text>Insights</Text>
    </View>
  );
}
