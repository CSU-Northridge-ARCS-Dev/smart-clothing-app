import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { AppColor, AppStyle, AppFonts } from "../../constants/themes";
const DataButton = (props) => {
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={styles.rectangleContainer}
        onPress={() => props.navigation.navigate(props.screen)}
      >
        <View style={styles.bigIcon}>
          <Icon name={props.icon} size={40} color={props.color} />
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            padding: 10,
            gap: 10,
          }}
        >
          <Text style={styles.dataText}>{props.dataText}</Text>
          <Icon name="chevron-right" size={25} height={35} color="black" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 5,
  },
  rectangleContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 5,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    height: 90,
    width: "98%",
  },
  bigIcon: {
    backgroundColor: AppColor.primaryContainer,
    borderRadius: 50,
    padding: 10,
    height: 70,
    width: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  dataText: {
    color: "black",
    fontSize: 22,
  },
});

export default DataButton;
