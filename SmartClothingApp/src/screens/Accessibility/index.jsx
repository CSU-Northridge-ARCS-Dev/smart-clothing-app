import React from "react";
import { Button, View, Text } from "react-native";
import { AppHeader } from "../../components";

const AccessibilityScreen = ({ navigation, route }) => {
  const { previousScreenTitle } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <AppHeader title={previousScreenTitle} back={true} menu={false} />
      <Text>Accessibility</Text>
    </View>
  );
};

export default AccessibilityScreen;
