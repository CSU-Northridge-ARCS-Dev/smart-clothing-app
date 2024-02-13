import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { horizontalScale, verticalScale } from "../../utils/scale";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { GoogleButton, HeroSection } from "../../components";
import { AppColor, AppStyle } from "../../constants/themes";
import { firebaseErrorMessages } from "../../utils/firebaseErrorMessages";
import Icon from "react-native-vector-icons/FontAwesome5";

import { useSelector, useDispatch } from "react-redux";
import { startLoginWithEmail } from "../../actions/userActions.js";

// SigninScreen functional component that receives a 'navigation' prop as an argument
const SigninScreen = ({ navigation }) => {
    // useDispatch and useSelector are react-redux hooks used to connect component to Redux store
  //    authError is a state from Redux store to dispatch actions (trigger event that changes app state)
  // useState hook manages local state including: 'isSubmitting', 'user', and 'error' states.
  //    isSubmitting is boolean used to track whether or not a form submission is in progress 
  //    setIsSubmitting a function used to update isSubmitting state.
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(true);
  const [lockStatus, setLockStatus] = useState("locked");

  //    user holds the user's email and password 
  //    setUser is a function that allows you to update the 'user' state -> called in View-TextInput when user submits email and password
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  // handleClearErrors is a function that resets or clears states and error messages
  //    setError function updates error state by setting properties to empty strings ""
  //    setIsSubmitting is set to false which indicates the form is not in the process of being submitted
  //    authError - checks for truthy and then dispatches setAuthError.
  const handleClearErrors = () => {
    setError({
      fname: "",
      lname: "",
      email: "",
      password: "",
    });

    setIsSubmitting(false);
  };

  // handleSignInWithEmail is a function that handles signing in process
  const handleSignInWithEmail = () => {
    // - !isValid performs sign in validation - email and password
    // setIsSubmitting(true) - after validating, isSubmitting state is set to true to indicate form submission is in progress
    // then asynchronous sign-in process is dispatched. 
    if (!isValid()) {
      Alert.alert(
        "Authentication Error",
        "Please correct the following errors:\n\n" +
          (error.email && `${error.email}\n`) +
          (error.password && `${error.password}`)
      );
      return;
    }

    setIsSubmitting(true);
    dispatch(startLoginWithEmail(user.email, user.password));
  };


  // Toggle lock status when the lock icon is pressed
  const toggleLockStatus = () => {
    setLockStatus((prevStatus) =>
      prevStatus === "locked" ? "unlocked" : "locked"
    );
  };

  //    error is state with two properties: email and password. initially empty strings ""
  //    setError sets email and password error message from isValid function
  const [error, setError] = useState({
    email: "",
    password: "",
  });

  // isValid function validates user inputs: email and password. if error, then error message is returned.
  //    if error, false boolean is returned, if valid then true boolean is returned.
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


  if (firebaseErrorMessages.hasOwnProperty("authError")) {
    const errorMessage = firebaseErrorMessages[authError];

    Alert.alert("Authentication Error", errorMessage);
  }

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
          <View style={styles.inputContainer}>
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
          </View>
          <HelperText type="error" visible={error.email.length > 1}>
            Email is invalid!
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
            error={error.password.length > 1}
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

        <View style={styles.checkbox}>
          <Button mode="text" onPress={() => navigation.navigate("Forgot")}>
            Forgot your Username/Password ?
          </Button>
        </View>
      </View>
      <View style={styles.btnContainer}>
        <Button
          ID="signInButton"
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
  icon: {
    position: "absolute",
    right: 10,
    top: 16,
    transform: [{ translateY: 0 }],
  },
});

export default SigninScreen;
