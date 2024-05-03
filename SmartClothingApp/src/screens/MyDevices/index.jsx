import React from "react";
import { Button, View, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import RefreshView from "../../components/RefreshView";
import { AppHeader, DeviceCard } from "../../components";

const MyDevices = ({ navigation }) => {
  const devicesData = useSelector((state) => state.device.devicesData);
  return (
    <RefreshView style={styles.container}>
      <AppHeader title={"My Devices"} />
      <View style={styles.body}>
        {devicesData.map((item, index) => (
          <DeviceCard
            key={index}
            style={{ margin: 5 }}
            device={item}
            onPress={(e) =>
              navigation.navigate("DeviceDetails", { id: item.id })
            }
          />
        ))}
      </View>
    </RefreshView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    padding: 10,
  },
});
export default MyDevices;
