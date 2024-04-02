import React from "react";
import { View, Text, Button, Linking } from "react-native";

const HealthConnectNeedsUpdate = ({ navigation }) => {
  return (
    <View>
      <Text>Health Connect Needs Update</Text>
      <Text>
        We're sorry, but the Health Connect SDK on your device is outdated. Please update the Health Connect SDK to continue using the app.
      </Text>
      <Button title="Update Health Connect" onPress={() => Linking.openURL("market://details?id=com.google.android.apps.healthdata")} />
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
}

export default HealthConnectNeedsUpdate;