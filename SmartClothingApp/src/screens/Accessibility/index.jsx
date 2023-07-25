import React from "react";
import { Button, View, Text } from "react-native";
import { AppHeader } from "../../components";

const AccessibilityScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1 }}>
      <AppHeader title={"Accessibility"} back={true} menu={false} />
      <Text>Accessibility</Text>
    </View>
  );
};

export default AccessibilityScreen;
