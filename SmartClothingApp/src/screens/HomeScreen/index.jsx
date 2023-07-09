import React from "react";
import { Button, View, Text, TouchableOpacity } from "react-native";

import { auth } from "../../../firebaseConfig.js";

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Home Screen</Text>
      <Text>Email: {auth.currentUser?.email}</Text>
      <TouchableOpacity
        onPress={() => {
          auth.signOut().then(() => {
            navigation.navigate("SignIn"); //TODO: Not working because of the AuthStack implementation which is incomplete and needs Redux setup
          });
        }}
      >
        <Text>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}
