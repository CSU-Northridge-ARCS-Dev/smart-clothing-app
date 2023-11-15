import { StyleSheet } from "react-native";
import { MD3LightTheme, configureFonts } from "react-native-paper";
import { horizontalScale } from "../utils/scale";

export const AppColor = {
  primary: "rgb(17, 96, 164)",
  onPrimary: "rgb(255, 255, 255)",
  primaryContainer: "rgb(211, 228, 255)",
  onPrimaryContainer: "rgb(0, 28, 56)",
  secondary: "rgb(84, 95, 112)",
  onSecondary: "rgb(255, 255, 255)",
  secondaryContainer: "rgb(215, 227, 248)",
  onSecondaryContainer: "rgb(16, 28, 43)",
  tertiary: "rgb(108, 86, 119)",
  onTertiary: "rgb(255, 255, 255)",
  tertiaryContainer: "rgb(244, 217, 255)",
  onTertiaryContainer: "rgb(38, 20, 49)",
  error: "rgb(186, 26, 26)",
  onError: "rgb(255, 255, 255)",
  errorContainer: "rgb(255, 218, 214)",
  onErrorContainer: "rgb(65, 0, 2)",
  background: "rgb(253, 252, 255)",
  onBackground: "rgb(26, 28, 30)",
  surface: "rgb(253, 252, 255)",
  onSurface: "rgb(26, 28, 30)",
  surfaceVariant: "rgb(223, 226, 235)",
  onSurfaceVariant: "rgb(67, 71, 78)",
  outline: "rgb(115, 119, 127)",
  outlineVariant: "rgb(195, 198, 207)",
  shadow: "rgb(0, 0, 0)",
  scrim: "rgb(0, 0, 0)",
  inverseSurface: "rgb(47, 48, 51)",
  inverseOnSurface: "rgb(241, 240, 244)",
  inversePrimary: "rgb(161, 201, 255)",
  elevation: {
    level0: "transparent",
    level1: "rgb(241, 244, 250)",
    level2: "rgb(234, 240, 248)",
    level3: "rgb(227, 235, 245)",
    level4: "rgb(225, 233, 244)",
    level5: "rgb(220, 230, 242)",
  },
  surfaceDisabled: "rgba(26, 28, 30, 0.12)",
  onSurfaceDisabled: "rgba(26, 28, 30, 0.38)",
  backdrop: "rgba(44, 49, 55, 0.4)",
  customHeader: "rgb(255, 255, 255)",
  lightColor: "#EAF0F8",
  ringStand: "rgb(6, 188, 255)",
  ringExercise: "rgb(33, 100, 180)",
  ringMove: "rgb(9, 14, 62)",
};
export const AppFonts = {
  chakraBold: "ChakraPetch_Bold",
  chakraBoldItalic: "ChakraPetch_BoldItalic",
  chakra: "ChakraPetch_Regular",
  poppins: "Poppins_Regular",
  poppinsBold: "Poppins_Bold",
  poppinsItalic: "Poppins_Italic",
};
const fontConfig = {
  fontFamily: AppFonts.poppins,
  headlineMedium: {
    fontFamily: AppFonts.chakraBoldItalic,
  },
  titleMedium: {
    fontFamily: AppFonts.poppinsBold,
  },
  bodySmall: {
    fontFamily: AppFonts.poppins,
  },
  bodyMedium: {
    fontFamily: AppFonts.poppins,
  },
  bodyLarge: {
    fontFamily: AppFonts.poppins,
  },
  labelSmall: {
    fontFamily: AppFonts.poppins,
  },
  labelMedium: {
    fontFamily: AppFonts.poppins,
  },
  labelLarge: {
    fontFamily: AppFonts.poppins,
  },
};
export const AppTheme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  roundness: 0,
  dark: false,
  colors: AppColor,
};
export const AppStyle = StyleSheet.create({
  textPrimary: {
    color: AppColor.primary,
  },
  title: {
    borderLeftWidth: horizontalScale(5),
    borderLeftColor: AppColor.primary,
    color: AppColor.primary,
    fontSize: 28,
    fontFamily: AppFonts.chakraBoldItalic,
    paddingLeft: 10,
  },
  subTitle: {
    fontFamily: AppFonts.poppinsBold,
    fontSize: 16,
    color: AppColor.primary,
  },
  cardElevated: {
    elevation: 3,
    shadowColor: AppColor.secondary,
    shadowOffset: { height: 5, width: 5 },
    shadowRadius: 10,
    shadowOpacity: 0.2,
  },
});
