import React from "react";
import { Button, View, Text } from "react-native";
import { AppHeader } from "../../components";

const SettingsScreen = ({ navigation, route }) => {
  const { previousScreenTitle } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <AppHeader title={previousScreenTitle} back={true} menu={false} />
      <Text>Settings</Text>
    </View>
  );
};

export default SettingsScreen;
