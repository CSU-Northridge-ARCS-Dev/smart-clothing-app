import React from "react";
import { Button, View, Text, TouchableOpacity } from "react-native";

import { AppHeader } from "../../components";

export default function HomeScreen({ navigation }) {
  return (
    <View>
      <AppHeader title={"Dashboard"} />
      <Text>Home Screen</Text>
    </View>
  );
}
