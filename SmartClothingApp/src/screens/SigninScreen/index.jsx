import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { horizontalScale, verticalScale } from "../../utils/scale";
import { Button, Text, TextInput } from "react-native-paper";
import { GoogleButton, HeroSection } from "../../components";
import { AppColor, AppStyle } from "../../constants/themes";
const SigninScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  return (
    <ScrollView style={styles.container}>
      <HeroSection />
      <View style={styles.content}>
        <Text
          variant="headlineMedium"
          style={[AppStyle.title, { marginBottom: verticalScale(10) }]}
        >
          Sign In
        </Text>
        <Text
          variant="titleMedium"
          style={[AppStyle.subTitle, { marginBottom: verticalScale(10) }]}
        >
          Welcome back. Login to continue
        </Text>
        <TextInput
          label="Username/Email"
          value={user.email}
          mode="outlined"
          onChangeText={(text) => setUser({ ...user, email: text })}
        />
        <TextInput
          label="Password"
          secureTextEntry
          value={user.password}
          mode="outlined"
          onChangeText={(text) => setUser({ ...user, password: text })}
        />
        <View style={styles.checkbox}>
          <Button mode="text" onPress={() => navigation.navigate("Forgot")}>
            Forgot your Username/Password ?
          </Button>
        </View>
        <View style={styles.btnContainer}>
          <Button
            mode="elevated"
            onPress={() => navigation.navigate("SignIn")}
            style={{ flex: 2, marginHorizontal: horizontalScale(10) }}
          >
            Sign In
          </Button>
        </View>
        <GoogleButton />
        <Button mode="text" onPress={() => navigation.navigate("SignUp")}>
          Don't have an account? Sign Up
        </Button>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  content: {
    backgroundColor: AppColor.background,
    paddingHorizontal: horizontalScale(20),
    borderTopLeftRadius: horizontalScale(25),
    borderTopRightRadius: horizontalScale(25),
    transform: [{ translateY: verticalScale(-25) }],
    paddingTop: verticalScale(25),
  },
  btnContainer: {
    marginVertical: verticalScale(10),
    flexDirection: "row",
  },
});
export default SigninScreen;
