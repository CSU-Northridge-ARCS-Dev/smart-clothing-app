import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import { AppColor, AppFonts, AppStyle } from "../../constants/themes";
const ActivityCard = (props) => {
  return (
    <TouchableOpacity
      style={[styles.container, props.style]}
      onPress={props.onPress}
    >
      <View style={styles.title}>
        <Icon
          name={props.icon}
          size={32}
          color={AppColor.primary}
          style={{ marginRight: 10 }}
        />
        <Text
          variant="titleLarge"
          style={[AppStyle.textPrimary, { fontFamily: AppFonts.chakraBold }]}
        >
          {props.title}
        </Text>
      </View>

      <Text
        variant="displaySmall"
        style={[
          AppStyle.textPrimary,
          { fontFamily: AppFonts.chakraBoldItalic },
        ]}
      >
        {props.value}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: AppColor.primaryContainer,
  },
  title: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default ActivityCard;
