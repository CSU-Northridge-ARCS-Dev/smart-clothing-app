import React from "react";
import { Image, ImageBackground, StyleSheet } from "react-native";
import { AppImages } from "../../../assets";
import { AppColor } from "../../constants/themes";
import { verticalScale } from "../../utils/scale";
const HeroSection = () => {
  return (
    <ImageBackground
      source={AppImages.bgImage1}
      style={styles.imageContainer}
      imageStyle={styles.bgImage}
    >
      <Image source={AppImages.appLogo} style={styles.logo} />
    </ImageBackground>
  );
};
const styles = StyleSheet.create({
  imageContainer: {
    backgroundColor: AppColor.primary,
    height: verticalScale(250),
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    resizeMode: "contain",
    height: verticalScale(60),
    width: "100%",
  },
  bgImage: {
    opacity: 0.2,
  },
});
export default HeroSection;
