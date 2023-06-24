import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { AppImages } from "../../../assets";
import { horizontalScale, verticalScale } from "../../utils/scale";
import { Button } from "react-native-paper";
const GoogleButton = ({ onPress, style }) => {
  return (
    <Button
      mode="contained"
      onPress={onPress}
      style={[styles.container, style]}
    >
      <View style={styles.button}>
        <Image style={styles.image} source={AppImages.googleIcon} />
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </View>
    </Button>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    height: verticalScale(40),
    marginHorizontal: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#202020",
    fontWeight: "700",
  },
  image: {
    width: horizontalScale(24),
    height: horizontalScale(24),
  },
});

export default GoogleButton;
