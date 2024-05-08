import React from "react";
import { Button, View, Text } from "react-native";
import { AppHeader } from "../../components";
import RefreshView from "../../components/RefreshView";

const AccessibilityScreen = ({ navigation, route }) => {
  const { previousScreenTitle } = route.params;

  return (
    <RefreshView style={{ flex: 1 }}>
      <AppHeader title={previousScreenTitle} back={true} menu={false} />
      <Text>Accessibility</Text>
    </RefreshView>
  );
};

export default AccessibilityScreen;
