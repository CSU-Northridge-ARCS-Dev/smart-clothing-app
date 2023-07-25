import React from "react";
import { Button, View, Text } from "react-native";
import { AppHeader } from "../../components";

const SettingsScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1 }}>
      <AppHeader title={"Settings"} back={true} menu={false} />
      <Text>Settings</Text>
    </View>
  );
};

export default SettingsScreen;
