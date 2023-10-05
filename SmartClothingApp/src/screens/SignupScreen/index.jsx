import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";

import { horizontalScale, verticalScale } from "../../utils/scale";
import {
  Button,
  Checkbox,
  HelperText,
  Text,
  TextInput,
} from "react-native-paper";
import { AppColor, AppStyle } from "../../constants/themes";
import { HeroSection, DataCollectModal } from "../../components";

// import GoogleButton from "../../components/GoogleButton";

import {
  startSignupWithEmail,
  startUpdateUserData,
  checkEmailExists,
} from "../../actions/userActions.js";
import { toastError } from "../../actions/toastActions";

const SignupScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const [isSubmitting, setIsSubmitting] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const [user, setUser] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
    repassword: "",
  });

  const [error, setError] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
    repassword: "",
  });
  const [checked, setChecked] = useState(false);

  const handleClear = () => {
    setUser({
      fname: "",
      lname: "",
      email: "",
      password: "",
      repassword: "",
    });

    setChecked(false);

    setIsSubmitting(false);

    handleClearErrors();
  };

  const handleClearErrors = () => {
    setError({
      fname: "",
      lname: "",
      email: "",
      password: "",
      repassword: "",
    });
    setIsSubmitting(false);
  };

  const handleCollectUserData = async () => {
    const emailExists = await checkEmailExists(user.email);
    if (!isValid()) {
      Alert.alert(
        "Sign-up Error",
        "Please correct the following errors:\n\n" +
          (error.fname && `${error.fname}\n`) +
          (error.lname && `${error.lname}\n`) +
          (error.email && `${error.email}\n`) +
          (error.password && `${error.password}\n`) +
          (error.repassword && `${error.repassword}`)
      );

      return;
    }
    if (emailExists) {
      dispatch(toastError("Email address already in use."));
      return;
    }

    setModalVisible(true);
  };

  const handleSignUpWithEmail = (newUserData) => {
    if (!isValid()) {
      Alert.alert(
        "Sign-up Error",
        "Please correct the following errors:\n\n" +
          (error.fname && `${error.fname}\n`) +
          (error.lname && `${error.lname}\n`) +
          (error.email && `${error.email}\n`) +
          (error.password && `${error.password}\n`) +
          (error.repassword && `${error.repassword}`)
      );

      return;
    }

    console.log("signupwithemail called with", newUserData);

    setIsSubmitting(true);

    console.log("User is ...", user);
    dispatch(
      startSignupWithEmail(
        user.email,
        user.password,
        user.fname,
        user.lname,
        newUserData
      )
    );
  };

  const isValid = () => {
    let flag = true;
    let errors = error;

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!emailRegex.test(user.email)) {
      errors.email = "Enter valid email.";
      flag = false;
    }
    if (user.password.length < 1) {
      errors.password = "Password cannot be empty.";
      flag = false;
    }
    if (user.password.length < 6) {
      errors.password = "Password length cannot be less than 6.";
      flag = false;
    }
    if (user.fname.length < 1) {
      errors.fname = "First name cannot be empty.";
      flag = false;
    }
    if (user.lname.length < 1) {
      errors.lname = "Last name cannot be empty.";
      flag = false;
    }
    if (user.password !== user.repassword) {
      errors.repassword = "Passwords did not match.";
      flag = false;
    }
    setError({ ...errors });
    return flag;
  };

  return (
    <ScrollView>
      <HeroSection />
      <View style={styles.content}>
        <Text
          variant="headlineMedium"
          style={[AppStyle.title, { marginBottom: verticalScale(10) }]}
        >
          Sign Up
        </Text>
        <Text
          variant="titleMedium"
          style={[AppStyle.subTitle, { marginBottom: verticalScale(10) }]}
        >
          User Registration
        </Text>
        <View>
          <TextInput
            label="First Name"
            value={user.fname}
            mode="outlined"
            onChangeText={(text) => {
              setUser({ ...user, fname: text });
              handleClearErrors();
            }}
            error={error.fname.length > 1}
          />
          <HelperText type="error" visible={error.fname.length > 1}>
            Please enter first name.
          </HelperText>
        </View>
        <View>
          <TextInput
            label="Last Name"
            value={user.lname}
            mode="outlined"
            onChangeText={(text) => {
              setUser({ ...user, lname: text });
              handleClearErrors();
            }}
            error={error.lname.length > 1}
          />
          <HelperText type="error" visible={error.lname.length > 1}>
            Please enter last name.
          </HelperText>
        </View>
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
            Please enter a valid email.
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
            error={
              error.password.length > 1 || user.password != user.repassword
            }
          />
          <HelperText type="error" visible={error.password.length > 1}>
            {error.password}
          </HelperText>
        </View>
        <View>
          <TextInput
            secureTextEntry
            label="Confirm Password"
            value={user.repassword}
            mode="outlined"
            onChangeText={(text) => {
              setUser({ ...user, repassword: text });
              handleClearErrors();
            }}
            error={user.password != user.repassword}
          />
          <HelperText type="error" visible={user.password != user.repassword}>
            Passwords do not match.
          </HelperText>
        </View>

        <DataCollectModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          givenUserData={false}
          save={handleSignUpWithEmail}
          later={() => {
            handleSignUpWithEmail();
            setModalVisible(false);
          }}
        />

        <View style={styles.checkbox}>
          <Checkbox
            status={checked ? "checked" : "unchecked"}
            onPress={() => {
              setChecked(!checked);
            }}
          />
          <Text>User Agreement</Text>
        </View>
        <View style={styles.btnContainer}>
          <Button
            mode="outlined"
            onPress={handleClear}
            style={{ flex: 1, marginHorizontal: horizontalScale(10) }}
          >
            Clear
          </Button>
          <Button
            disabled={isSubmitting}
            mode="elevated"
            style={{ flex: 2, marginHorizontal: horizontalScale(10) }}
            onPress={handleCollectUserData}
          >
            Create Account
          </Button>
        </View>
        {/* <GoogleButton /> */}
        <View style={{ marginVertical: verticalScale(10) }}>
          <Button mode="text" onPress={() => navigation.navigate("SignIn")}>
            Already have an account? Sign in.
          </Button>
        </View>
      </View>
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
  checkbox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  btnContainer: {
    marginVertical: 10,
    flexDirection: "row",
  },
});
export default SignupScreen;
