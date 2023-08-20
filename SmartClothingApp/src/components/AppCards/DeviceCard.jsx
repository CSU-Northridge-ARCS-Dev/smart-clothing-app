import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { AppColor, AppFonts } from "../../constants/themes";
import { Button, Text } from "react-native-paper";

const DeviceCard = (props) => {
  return (
    <View style={[styles.container, props.style]}>
      <View style={{ display: "flex", flexDirection: "row", flex: 3 }}>
        <Image source={props.device.image} style={styles.image}></Image>
        <View style={styles.body}>
          <Text
            variant="titleLarge"
            style={{ fontFamily: AppFonts.poppinsBold }}
          >
            {props.device.name}
          </Text>
          <Text
            variant="titleSmall"
            style={{ fontFamily: AppFonts.chakraBoldItalic }}
          >
            {props.device.device}
          </Text>
        </View>
      </View>
      <View
        style={{ flexDirection: "row", marginVertical: 10, gap: 10, flex: 1 }}
      >
        <Button mode="elevated" compact uppercase style={{ flex: 1 }}>
          Enable
        </Button>
        <Button
          mode="elevated"
          compact
          uppercase
          style={{ flex: 1 }}
          onPress={props.onPress}
        >
          View
        </Button>
        <Button mode="contained" compact uppercase style={{ flex: 2 }}>
          Connect
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: AppColor.primaryContainer,
    height: 180,
  },
  image: {
    flex: 1,
    borderRadius: 5,
    marginRight: 10,
    width: undefined,
    height: undefined,
    resizeMode: "contain",
  },
  body: {
    flex: 3,
  },
});

export default DeviceCard;
