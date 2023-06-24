import React from "react";
import { View, Text, StyleSheet } from "react-native";
const HomeScreen = () => {
  return (
    <View>
      <Text style={styles.home}>Hello world</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  home: {
    fontWeight: "600",
    color: "#6A82FB",
  },
});
export default HomeScreen;
