import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, ScrollView } from "react-native";
import { horizontalScale, verticalScale } from "../../utils/scale";
import { Button, Checkbox, Text, TextInput } from "react-native-paper";

// import GoogleButton from "../../components/GoogleButton";

import { auth } from "../../../firebaseConfig.js";
import { createUserWithEmailAndPassword } from "firebase/auth";

const SignupScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
    repassword: "",
  });
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigation.navigate("HomeScreen");
      }
    });

    return unsubscribe;
  }, []);

  const handleSignUpWithEmail = () => {
    createUserWithEmailAndPassword(auth, user.email, user.password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("User created successfully!");
        console.log(user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("Error creating user!");
        console.log(errorCode);
        console.log(errorMessage);
      });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.image}></View>
      <View style={styles.title}>
        <Text variant="headlineMedium">Sign Up</Text>
        <Text variant="titleMedium">User Registration</Text>
      </View>
      <View>
        <TextInput
          label="First Name"
          value={user.fname}
          mode="outlined"
          onChangeText={(text) => setUser({ ...user, fname: text })}
        />
        <TextInput
          label="Last Name"
          value={user.lname}
          mode="outlined"
          onChangeText={(text) => setUser({ ...user, lname: text })}
        />
        <TextInput
          label="Email"
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
        <TextInput
          secureTextEntry
          label="Confirm Password"
          value={user.repassword}
          mode="outlined"
          onChangeText={(text) => setUser({ ...user, repassword: text })}
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
          onPress={handleSignUpWithEmail}
        >
          Create Account
        </Button>
      </View>
      {/* <GoogleButton /> */}
      <View style={{ marginVertical: verticalScale(10) }}>
        <Button mode="text" onPress={() => navigation.navigate("SignIn")}>
          Already have an account? Sign In
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
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: verticalScale(10),
  },
  btnContainer: {
    marginVertical: verticalScale(10),
    flexDirection: "row",
  },
});
export default SignupScreen;
