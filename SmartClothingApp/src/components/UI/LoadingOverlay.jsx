import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { AppColor } from "../../constants/themes";

function LoadingOverlay() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" style={{ transform: [{ scaleX: 2 }, { scaleY: 2 }] }} color="#1560a4" />
      <Text style={{marginTop: 20, fontSize: 24}}>
        Performing first-time data sync. Please wait...
      </Text>
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
