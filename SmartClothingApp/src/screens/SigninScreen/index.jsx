import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { horizontalScale, verticalScale } from "../../utils/scale";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { GoogleButton, HeroSection } from "../../components";
import { AppColor, AppStyle } from "../../constants/themes";
import { firebaseErrorMessages } from "../../utils/firebaseErrorMessages";
import Icon from "react-native-vector-icons/FontAwesome5";
import RefreshView from "../../components/RefreshView/index.jsx";

import { useSelector, useDispatch } from "react-redux";
import { startLoginWithEmail } from "../../actions/userActions.js";

import { initialHealthDataSync } from "../../actions/appActions.js";


const SigninScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(true);
  const [lockStatus, setLockStatus] = useState("locked");

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
  };

  const handleSignInWithEmail = () => {
    if (!isValid()) {
      return;
    }

    setIsSubmitting(true);
    dispatch(startLoginWithEmail(user.email, user.password));

    dispatch(initialHealthDataSync(true)); // 
  };

  // Toggle lock status when the lock icon is pressed
  const toggleLockStatus = () => {
    setLockStatus((prevStatus) =>
      prevStatus === "locked" ? "unlocked" : "locked"
    );
  };

  const [error, setError] = useState({
    email: "",
    password: "",
  });

  const isValid = () => {
    let flag = true;
    let errors = error;

    if (user.email.length < 1 || !user.email.includes("@")) {
      errors.email = "Enter valid email.";
      flag = false;
    }
    if (user.password.length < 1) {
      errors.password = "Password cannot be empty";
      flag = false;
    }
    if (user.password.length > 1 && user.password.length < 6) {
      errors.password = "Password length cannot be less than 6.";
      flag = false;
    }

    setError({ ...errors });
    return flag;
  };

  return (
    <RefreshView style={styles.container}>
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
          <View style={styles.inputContainer}>
            <TextInput
              label="Email"
              value={user.email}
              mode="outlined"
              onChangeText={(text) => {
                setUser({ ...user, email: text });
                handleClearErrors();
              }}
              error={error.email.length > 0}
            />
          </View>
          <HelperText type="error" visible={error.email.length > 0}>
            {error.email}
          </HelperText>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            label="Password"
            secureTextEntry={lockStatus === "locked"}
            value={user.password}
            mode="outlined"
            onChangeText={(text) => {
              setUser({ ...user, password: text });
              handleClearErrors();
            }}
            error={error.password.length > 0}
            style={styles.textInput}
          />
          <Icon
            name={lockStatus === "locked" ? "lock" : "unlock-alt"}
            size={25}
            color="black"
            style={styles.icon}
            onPress={toggleLockStatus}
          />
        </View>
        <HelperText type="error" visible={error.password.length > 0}>
          {error.password}
        </HelperText>

        <View style={styles.checkbox}>
          <Button mode="text" onPress={() => navigation.navigate("Forgot")}>
            Forgot your Username/Password ?
          </Button>
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
    </RefreshView>
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
  icon: {
    position: "absolute",
    right: 10,
    top: 16,
    transform: [{ translateY: 0 }],
  },
});

export default SigninScreen;
