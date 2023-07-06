import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { horizontalScale, verticalScale } from "../../utils/scale";
import { Button, Text, TextInput } from "react-native-paper";
import { HeroSection } from "../../components";
import { AppColor, AppStyle } from "../../constants/themes";
const ForgotPasswordScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    email: "",
  });

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
        <TextInput
          label="email"
          value={user.email}
          mode="outlined"
          onChangeText={(text) => setUser({ ...user, email: text })}
        />
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
