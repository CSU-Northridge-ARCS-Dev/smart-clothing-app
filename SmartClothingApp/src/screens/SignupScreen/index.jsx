import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { horizontalScale, verticalScale } from "../../utils/scale";
import { Button, Checkbox, Text, TextInput } from "react-native-paper";
import { AppColor, AppStyle } from "../../constants/themes";
import { HeroSection } from "../../components";
const SignupScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
    repassword: "",
  });
  const [checked, setChecked] = useState(false);

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
            Create Account
          </Button>
        </View>
        <View style={{ marginVertical: verticalScale(10) }}>
          <Button mode="text" onPress={() => navigation.navigate("SignIn")}>
            Already have an account? Sign In
          </Button>
        </View>
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
