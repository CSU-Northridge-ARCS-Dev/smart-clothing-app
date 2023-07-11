import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { horizontalScale, verticalScale } from "../../utils/scale";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { GoogleButton, HeroSection } from "../../components";
import { AppColor, AppStyle } from "../../constants/themes";
const SigninScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState({
    email: "",
    password: "",
  });
  const isValid = () => {
    let flag = false;
    let errors = error;
    if (user.email.length < 1) {
      errors.email = "Enter valid email/username";
      flag = false;
    }
    if (user.password.length < 1) {
      errors.password = "Password cannot be empty";
      flag = false;
    }
    setError({ ...errors });
    return flag;
  };

  const onLogin = () => {
    console.log(error);
    if (isValid()) {
      //login api call
    } else {
      //handle error
    }
  };

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
        <View>
          <TextInput
            label="Username/Email"
            value={user.email}
            mode="outlined"
            onChangeText={(text) => setUser({ ...user, email: text })}
            error={error.email.length > 1}
          />
          <HelperText type="error" visible={error.email.length > 1}>
            Email/Username is invalid!
          </HelperText>
        </View>
        <View>
          <TextInput
            label="Password"
            secureTextEntry
            value={user.password}
            mode="outlined"
            onChangeText={(text) => setUser({ ...user, password: text })}
            error={error.password.length > 1}
          />
          <HelperText type="error" visible={error.password.length > 1}>
            Password cannot be empty
          </HelperText>
        </View>
        <View style={styles.checkbox}>
          <Button mode="text" onPress={() => navigation.navigate("Forgot")}>
            Forgot your Username/Password ?
          </Button>
        </View>
        <View style={styles.btnContainer}>
          <Button
            mode="elevated"
            onPress={onLogin}
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
