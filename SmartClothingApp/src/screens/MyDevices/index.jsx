import React from "react";
import { Button, View, Text, StyleSheet, ScrollView } from "react-native";
import { AppHeader, DeviceCard } from "../../components";
import { devices } from "../../constants/data";

const MyDevices = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <AppHeader title={"My Devices"} />
      <View style={styles.body}>
        {devices.map((item, index) => (
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
});
export default MyDevices;
