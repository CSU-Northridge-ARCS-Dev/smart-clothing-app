import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { horizontalScale, verticalScale } from "../../utils/scale";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { HeroSection } from "../../components";
import { AppColor, AppStyle } from "../../constants/themes";
const ForgotPasswordScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    email: "",
  });
  const [error, setError] = useState({
    email: "",
  });
  const isValid = () => {
    let flag = false;
    let errors = error;
    if (user.email.length < 1 || !user.email.includes("@")) {
      errors.email = "Enter valid email";
      flag = false;
    }
    setError({ ...errors });
    return flag;
  };
  const onResetPasssword = () => {
    if (isValid()) {
      //forgot pass logic
    } else {
      // handle error
    }
  };
  return (
    <ScrollView>
      <HeroSection />
      <View style={styles.content}>
        <Text
          variant="headlineMedium"
          style={[AppStyle.title, { marginBottom: verticalScale(10) }]}
        >
          Forgot Password
        </Text>
        <Text
          variant="titleMedium"
          style={[AppStyle.subTitle, { marginBottom: verticalScale(10) }]}
        >
          Enter the registered Email ID
        </Text>
        <View>
          <TextInput
            label="email"
            value={user.email}
            mode="outlined"
            onChangeText={(text) => setUser({ ...user, email: text })}
            error={error.email.length > 1}
          />
          <HelperText type="error" visible={error.email.length > 0}>
            Please enter valid Email!
          </HelperText>
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
            onPress={onResetPasssword}
          >
            Send reset link
          </Button>
        </View>
        <View
          style={{
            justifyContent: "center",
            marginVertical: verticalScale(10),
          }}
        >
          <Button mode="text" onPress={() => navigation.navigate("SignIn")}>
            Go back to Sign in
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
  btnContainer: {
    marginVertical: verticalScale(10),
    flexDirection: "row",
  },
});
export default ForgotPasswordScreen;
