import React, { useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Text } from "react-native-paper";

import { AppHeader, DeviceCard } from "../../components";
import {
  startCheckFitbit,
  startConnectFitbit,
  startDisconnectFitbit,
} from "../../actions/deviceActions";
import { AppColor } from "../../constants/themes";

const FITBIT_ERROR_MESSAGES = {
  access_denied: "Fitbit access was not allowed.",
  token_exchange_failed: "Fitbit login failed. Please try again.",
};

const MyDevices = ({ navigation }) => {
  const dispatch = useDispatch();
  const devicesData = useSelector((state) => state.device.devicesData);
  const fitbit = useSelector((state) => state.device.fitbit);

  useEffect(() => {
    dispatch(startCheckFitbit());
  }, []);

  // The Pixel Watch card connects through Fitbit and opens DailySummary.
  // The other (demo) devices keep their DeviceDetails page.
  const fitbitCardProps = () => {
    const connected = fitbit.status === "connected";
    return {
      connectLabel: connected ? "Disconnect" : "Connect",
      connectLoading: fitbit.status === "connecting",
      onConnect: () =>
        dispatch(connected ? startDisconnectFitbit() : startConnectFitbit()),
      onPress: () => navigation.navigate("DailySummary"),
    };
  };

  return (
    <ScrollView style={styles.container}>
      <AppHeader title={"My Devices"} />
      <View style={styles.body}>
        {fitbit.status === "error" && (
          <Text style={styles.error}>
            {FITBIT_ERROR_MESSAGES[fitbit.error] ||
              "Could not connect to Fitbit. Please try again."}
          </Text>
        )}
        {devicesData.map((item, index) => (
          <DeviceCard
            key={index}
            style={{ margin: 5 }}
            device={item}
            onPress={(e) =>
              navigation.navigate("DeviceDetails", { id: item.id })
            }
            {...(item.connection === "fitbit" ? fitbitCardProps() : {})}
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
  error: {
    color: AppColor.error,
    margin: 5,
  },
});
export default MyDevices;
