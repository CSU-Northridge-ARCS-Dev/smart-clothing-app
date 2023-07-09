import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { horizontalScale, verticalScale } from "../../utils/scale";
import { Button, Text, TextInput } from "react-native-paper";
import { GoogleButton } from "../../components";

import { auth } from "../../../firebaseConfig.js";
import { signInWithEmailAndPassword } from "firebase/auth";

const SigninScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigation.navigate("Home");
      }
    });
    return unsubscribe;
  }, []);

  const handleSignInWithEmail = () => {
    signInWithEmailAndPassword(auth, user.email, user.password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Logged in successfully!");
        console.log(user);
        navigation.navigate("HomeScreen");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("Error login user!");
        console.log(errorCode);
        console.log(errorMessage);
      });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.image}></View>
      <View style={styles.title}>
        <Text variant="headlineMedium">Sign In</Text>
        <Text variant="titleMedium">Welcome back. Login to continue</Text>
      </View>
      <View>
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
      </View>
      <View style={styles.btnContainer}>
        <Button
          mode="elevated"
          onPress={handleSignInWithEmail}
          style={{ flex: 2, marginHorizontal: horizontalScale(10) }}
        >
          Sign In
        </Button>
      </View>
      <GoogleButton />
      <Button mode="text" onPress={() => navigation.navigate("SignUp")}>
        Don't have an account? Sign Up
      </Button>
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
  },
  btnContainer: {
    marginVertical: verticalScale(10),
    flexDirection: "row",
  },
});
export default SigninScreen;
