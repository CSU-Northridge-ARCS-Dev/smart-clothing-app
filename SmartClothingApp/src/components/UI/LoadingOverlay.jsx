import { View, ActivityIndicator, StyleSheet } from "react-native";
import { AppColor } from "../../constants/themes";

function LoadingOverlay() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1560a4" />
    </View>
  );
}

export default LoadingOverlay;

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColor.background,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
});
