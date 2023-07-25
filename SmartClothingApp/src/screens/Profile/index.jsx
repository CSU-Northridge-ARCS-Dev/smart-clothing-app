import React from "react";
import { Button, View, Text } from "react-native";
import { AppHeader } from "../../components";

const ProfileScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1 }}>
      <AppHeader title={"Profile"} back={true} menu={false} />
      <Text>Profile</Text>
    </View>
  );
};

export default ProfileScreen;
