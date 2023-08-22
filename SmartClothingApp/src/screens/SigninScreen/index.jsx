import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { horizontalScale, verticalScale } from "../../utils/scale";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { GoogleButton, HeroSection } from "../../components";
import { AppColor, AppStyle } from "../../constants/themes";

import { useSelector, useDispatch } from "react-redux";
import {
  startLoginWithEmail,
  setAuthError,
} from "../../actions/userActions.js";

const SigninScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const authError = useSelector((state) => state.user.authError);
  const [isSubmitting, setIsSubmitting] = useState(true);

  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const handleClearErrors = () => {
    setError({
      fname: "",
      lname: "",
      email: "",
      password: "",
    });

    setIsSubmitting(false);

    authError && dispatch(setAuthError(null));
  };

  const handleSignInWithEmail = () => {
    if (!isValid()) {
      console.log("Invalid user info!");
      return;
    }

    setIsSubmitting(true);
    dispatch(startLoginWithEmail(user.email, user.password));
  };

  const [error, setError] = useState({
    email: "",
    password: "",
  });

  const isValid = () => {
    let flag = true;
    let errors = error;

    if (user.email.length < 1 || !user.email.includes("@")) {
      errors.email = "Enter valid email!";
      flag = false;
    }
    if (user.password.length < 1) {
      errors.password = "Password cannot be empty";
      flag = false;
    }
    if (user.password.length > 1 && user.password.length < 6) {
      errors.password = "Password length cannot be less than 6!";
      flag = false;
    }

    setError({ ...errors });

    return flag;
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
            label="Email"
            value={user.email}
            mode="outlined"
            onChangeText={(text) => {
              setUser({ ...user, email: text });
              handleClearErrors();
            }}
            error={error.email.length > 1}
          />
          <HelperText type="error" visible={error.email.length > 1}>
            Email is invalid!
          </HelperText>
        </View>
        <View>
          <TextInput
            label="Password"
            secureTextEntry
            value={user.password}
            mode="outlined"
            onChangeText={(text) => {
              setUser({ ...user, password: text });
              handleClearErrors();
            }}
            error={error.password.length > 1}
          />
          <HelperText type="error" visible={error.password.length > 1}>
            {error.password}
          </HelperText>
        </View>
        <View style={styles.checkbox}>
          <Button mode="text" onPress={() => navigation.navigate("Forgot")}>
            Forgot your Username/Password ?
          </Button>
        </View>
        <View>
          {authError && (
            <HelperText type="error" visible={authError}>
              {authError}
            </HelperText>
          )}
        </View>
      </View>
      <View style={styles.btnContainer}>
        <Button
          disabled={isSubmitting}
          mode="elevated"
          onPress={handleSignInWithEmail}
          style={{ flex: 2, marginHorizontal: horizontalScale(10) }}
        >
          Sign In
        </Button>
      </View>
      {/* <GoogleButton /> */}
      <Button mode="text" onPress={() => navigation.navigate("SignUp")}>
        Don't have an account? Sign Up
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    backgroundColor: AppColor.background,
    paddingHorizontal: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    transform: [{ translateY: -25 }],
    paddingTop: 25,
  },
  btnContainer: {
    marginVertical: 10,
    flexDirection: "row",
  },
});

export default SigninScreen;
