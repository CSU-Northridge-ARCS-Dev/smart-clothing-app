import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { horizontalScale, verticalScale } from "../../utils/scale";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Checkbox,
  HelperText,
  Text,
  TextInput,
} from "react-native-paper";
import { AppColor, AppStyle } from "../../constants/themes";
import { HeroSection } from "../../components";
import ToSModal from "../../components/ToSModal/ToSModal";

import Icon from "react-native-vector-icons/FontAwesome5";

// import GoogleButton from "../../components/GoogleButton";

import { startSignupWithEmail } from "../../actions/userActions.js";

const SignupScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const authError = useSelector((state) => state.user.authError);
  const [isSubmitting, setIsSubmitting] = useState(true);
  const [lockStatusPassword, setLockStatusPassword] = useState("locked");
  const [lockStatusRepassword, setLockStatusRepassword] = useState("locked");
  const [modalVisible, setModalVisible] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

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

  const handleClear = () => {
    setUser({
      fname: "",
      lname: "",
      email: "",
      password: "",
      repassword: "",
    });

    setIsTermsAccepted(false);

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

  const handleSignUpWithEmail = () => {
    let errorMessage = "";

    if (!isTermsAccepted) {
      errorMessage +=
        "You must agree to the user agreement to create an account.\n";
    }

    if (!isValid()) {
      errorMessage +=
        "\nPlease correct the following errors:\n" +
        (error.fname ? `${error.fname}\n` : "") +
        (error.lname ? `${error.lname}\n` : "") +
        (error.email ? `${error.email}\n` : "") +
        (error.password ? `${error.password}\n` : "") +
        (error.repassword ? `${error.repassword}` : "");
    }

    if (errorMessage) {
      Alert.alert("Sign-up Error", errorMessage);
      return;
    }

    setIsSubmitting(true);

    console.log("User is ...", user);
    dispatch(
      startSignupWithEmail(user.email, user.password, user.fname, user.lname)
    );
  };

  const toggleLockStatusPassword = () => {
    setLockStatusPassword((prevStatus) =>
      prevStatus === "locked" ? "unlocked" : "locked"
    );
  };

  const toggleLockStatusRepassword = () => {
    setLockStatusRepassword((prevStatus) =>
      prevStatus === "locked" ? "unlocked" : "locked"
    );
  };

  const toggleModalVisibility = () => {
    setModalVisible(!modalVisible);
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

  const handleAgreement = () => {
    if (isTermsAccepted) {
      // If the checkbox is checked, just uncheck it
      setIsTermsAccepted(false);
    } else {
      // If the checkbox is unchecked, toggle modal visibility
      toggleModalVisibility();
    }
  };

  return (
    <ScrollView>
      <HeroSection />
      <View style={styles.content}>
        <ToSModal
          isTermsAccepted={isTermsAccepted}
          setIsTermsAccepted={setIsTermsAccepted}
          visible={modalVisible}
          closeModal={() => closeModal("modal1")}
          onRequestClose={toggleModalVisibility}
          toggleModalVisibility={toggleModalVisibility}
        ></ToSModal>
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
        <View style={styles.inputContainer}>
          <TextInput
            label="Password"
            secureTextEntry={lockStatusPassword === "locked"}
            value={user.password}
            mode="outlined"
            onChangeText={(text) => {
              setUser({ ...user, password: text });
              handleClearErrors();
            }}
            error={
              error.password.length > 1 || user.password != user.repassword
            }
            style={styles.textInput}
          />
          <Icon
            name={lockStatusPassword === "locked" ? "lock" : "unlock-alt"}
            size={25}
            color="black"
            style={styles.icon}
            onPress={toggleLockStatusPassword}
          />
          <HelperText type="error" visible={error.password.length > 1}>
            {error.password}
          </HelperText>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            secureTextEntry={lockStatusRepassword === "locked"}
            label="Confirm Password"
            value={user.repassword}
            mode="outlined"
            onChangeText={(text) => {
              setUser({ ...user, repassword: text });
              handleClearErrors();
            }}
            error={user.password != user.repassword}
            style={styles.textInput}
          />
          <Icon
            name={lockStatusRepassword === "locked" ? "lock" : "unlock-alt"}
            size={25}
            color="black"
            style={styles.icon}
            onPress={toggleLockStatusRepassword}
          />
          <HelperText type="error" visible={user.password != user.repassword}>
            Passwords do not match.
          </HelperText>
        </View>

        <View style={styles.checkbox}>
          <Checkbox
            status={isTermsAccepted ? "checked" : "unchecked"}
            onPress={() => {
              handleAgreement();
            }}
          />
          <Text>User Agreement</Text>
        </View>

        <View>
          {authError && (
            <HelperText type="error" visible={authError}>
              {authError}
            </HelperText>
          )}
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
            onPress={handleSignUpWithEmail}
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
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  icon: {
    position: "absolute",
    right: 10,
    top: 16,
    transform: [{ translateY: 0 }],
  },
  btnContainer: {
    marginVertical: 10,
    flexDirection: "row",
  },
});

export default SignupScreen;
