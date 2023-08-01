import React from "react";
import { View, TouchableOpacity, ScrollView, StyleSheet } from "react-native";

import { AppHeader } from "../../components";
import { Button, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons.js";
import { AppColor, AppFonts, AppStyle } from "../../constants/themes.js";

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <AppHeader title={"Dashboard"} />
      <View style={styles.body}>
        <Text style={AppStyle.title}>Hello, User</Text>
        <View style={styles.insights}>
          <Text
            style={[AppStyle.subTitle, { fontFamily: AppFonts.chakraBold }]}
          >
            Weekly Summary
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate("Insights")}
            icon={"arrow-right"}
            uppercase
            contentStyle={{ flexDirection: "row-reverse" }}
            style={{ alignSelf: "flex-end" }}
          >
            View
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    padding: 10,
  },
  insights: {
    marginVertical: 10,
    elevation: 2,
    shadowColor: AppColor.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 5, height: 5 },
    backgroundColor: AppColor.primaryContainer,
    padding: 10,
  },
});
