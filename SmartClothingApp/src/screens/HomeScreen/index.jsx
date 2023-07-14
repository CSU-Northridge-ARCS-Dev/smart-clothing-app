import React from "react";
import { Button, View, Text, TouchableOpacity } from "react-native";

import { auth } from "../../../firebaseConfig.js";
import { AppHeader } from "../../components";

export default function HomeScreen({ navigation }) {
  return (
    <View>
      <AppHeader title={"Dashboard"} />
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
