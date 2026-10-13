import { StyleSheet } from "react-native";
import { AppColor, AppFonts } from "../../constants/themes";

// Shared card look for the Fitbit (Pixel Watch) cards
export const fitbitCardStyles = StyleSheet.create({
  card: {
    elevation: 3,
    shadowColor: AppColor.secondary,
    shadowOffset: { height: 5, width: 5 },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    backgroundColor: AppColor.primaryContainer,
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  title: {
    fontFamily: AppFonts.poppinsBold,
    fontSize: 16,
    color: AppColor.primary,
  },
  bigValue: {
    fontFamily: AppFonts.chakraBold,
    fontSize: 32,
    color: AppColor.onPrimaryContainer,
  },
  unit: {
    fontFamily: AppFonts.poppins,
    fontSize: 14,
    color: AppColor.onSurfaceVariant,
  },
  muted: {
    fontFamily: AppFonts.poppins,
    fontSize: 12,
    color: AppColor.onSurfaceVariant,
  },
  empty: {
    fontFamily: AppFonts.poppins,
    fontSize: 14,
    color: AppColor.onSurfaceVariant,
    marginTop: 8,
  },
});

export const ZONE_COLORS = {
  outOfRange: "#7C8C99",
  fatBurn: "#4DA58E",
  cardio: "#C4945A",
  peak: "#C4555A",
};

export const LEVEL_COLORS = {
  wake: AppColor.sleepAwake,
  rem: AppColor.sleepRem,
  light: AppColor.sleepCore,
  deep: AppColor.sleepDeep,
  awake: AppColor.sleepAwake,
  restless: AppColor.sleepRem,
  asleep: AppColor.sleepCore,
};
