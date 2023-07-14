import React from "react";
import { Button, View, Text } from "react-native";
import { AppHeader } from "../../components";

export default function MyDevices({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <AppHeader title={"My Devices"} back={true} />
      <Text>My Devices</Text>
    </View>
  );
}
