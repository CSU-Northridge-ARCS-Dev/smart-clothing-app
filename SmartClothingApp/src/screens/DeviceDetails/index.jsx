import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { useSelector } from "react-redux";
import { Text, Button } from "react-native-paper";

import { AppHeader } from "../../components";
import { horizontalScale, verticalScale } from "../../utils/scale";
import { AppColor, AppFonts, AppStyle } from "../../constants/themes";

const DeviceDetails = ({ route, navigation }) => {
  const { id } = route.params;
  const devicesData = useSelector((state) => state.device.devicesData);
  const [device, setDevice] = useState(devicesData[0]);

  useEffect(() => {
    console.log(id);
    const x = devicesData.find((i) => i.id === id);
    setDevice(x);
  }, [id]);

  return (
    <ScrollView style={styles.container}>
      <AppHeader title={device.name} back={true} />
      <Image source={device.image} style={styles.image} />
      <Text
        variant="titleMedium"
        style={[
          AppStyle.textPrimary,
          { fontFamily: AppFonts.chakraBold, margin: 10 },
        ]}
      >
        {device.device}
      </Text>
      <View style={styles.body}>
        <Text style={styles.bodyText}>{device.details}</Text>
      </View>
      <View style={{ margin: 10 }}>
        <Button mode="elevated" onPress={() => navigation.goBack()}>
          Back
        </Button>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    padding: 10,
  },
  image: {
    width: horizontalScale(360),
    height: verticalScale(300),
    resizeMode: "cover",
  },
  body: {
    backgroundColor: AppColor.primary,
    padding: 10,
    borderRadius: 10,
    elevation: 3,
    margin: 10,
    shadowRadius: 10,
    shadowColor: AppColor.shadow,
    shadowOpacity: 0.3,
  },
  bodyText: {
    color: AppColor.onPrimary,
    fontSize: 16,
    textAlign: "justify",
  },
});
export default DeviceDetails;
