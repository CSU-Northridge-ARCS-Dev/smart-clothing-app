import React from "react";
import { Button, View, Text, StyleSheet, ScrollView } from "react-native";
import { AppHeader } from "../../components";
import { AppStyle, AppFonts } from "../../constants/themes";

const ViewInsights = ({ route }) => {
  const { previousScreenTitle } = route.params;
  return (
    <ScrollView style={{ flex: 1 }}>
      <AppHeader title={previousScreenTitle} back={true} />
      <View style={styles.content}></View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 36,
    marginVertical: 24,
    textAlign: "center",
    paddingTop: 45,
  },
  content: {
    paddingHorizontal: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginBottom: 20,
  },
});

export default ViewInsights;
