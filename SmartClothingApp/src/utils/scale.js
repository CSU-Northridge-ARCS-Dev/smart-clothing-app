import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");
const guidelineBaseWidth = 360;
const guidelineBaseHeight = 640;
const horizontalScale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (horizontalScale(size) - size) * factor;
export {
  guidelineBaseHeight,
  guidelineBaseWidth,
  horizontalScale,
  verticalScale,
  moderateScale,
};
