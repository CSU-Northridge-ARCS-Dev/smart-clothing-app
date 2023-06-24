import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { horizontalScale, verticalScale } from "../../utils/scale";
import { Button, Text, TextInput } from "react-native-paper";
const ForgotPasswordScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    email: "",
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.image}></View>
      <View style={styles.title}>
        <Text variant="headlineMedium">Forgot Password</Text>
        <Text variant="titleMedium">Enter the registered Email ID</Text>
      </View>
      <View>
        <TextInput
          label="email"
          value={user.email}
          mode="outlined"
          onChangeText={(text) => setUser({ ...user, email: text })}
        />
      </View>
      <View style={styles.btnContainer}>
        <Button
          mode="outlined"
          style={{ flex: 1, marginHorizontal: horizontalScale(10) }}
        >
          Cancel
        </Button>
        <Button
          mode="elevated"
          style={{ flex: 2, marginHorizontal: horizontalScale(10) }}
        >
          Send reset link
        </Button>
      </View>
      <View
        style={{ justifyContent: "center", marginVertical: verticalScale(10) }}
      >
        <Button mode="text" onPress={() => navigation.navigate("SignIn")}>
          Go back to Signin
        </Button>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: horizontalScale(20),
    marginBottom: verticalScale(20),
  },
  title: {
    alignItems: "center",
    marginVertical: verticalScale(20),
  },
  image: {
    marginTop: verticalScale(20),
    alignSelf: "center",
    backgroundColor: "#00000050",
    borderRadius: 5,
    height: verticalScale(150),
    width: verticalScale(150),
  },
  checkbox: {
    justifyContent: "center",
    marginVertical: verticalScale(10),
  },
  btnContainer: {
    marginVertical: verticalScale(10),
    flexDirection: "row",
  },
});
export default ForgotPasswordScreen;
