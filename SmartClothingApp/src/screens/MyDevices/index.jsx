import React, { useCallback } from "react";
import { View, StyleSheet, ScrollView, Linking } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { Button, Text } from "react-native-paper";

import { AppHeader, DeviceCard } from "../../components";
import {
  startCheckHealthConnect,
  startConnectHealthConnect,
  startDisconnectHealthConnect,
} from "../../actions/deviceActions";
import {
  openSettings,
  HEALTH_CONNECT_STORE_URL,
} from "../../services/healthConnect";
import { AppColor } from "../../constants/themes";

const HEALTH_CONNECT_MESSAGES = {
  restart_needed: "Close and reopen the app, then connect again.",
  no_permissions:
    "No data types were allowed. You can allow them in Health Connect.",
  check_failed: "Could not check Health Connect. Please try again.",
  connect_failed: "Could not connect to Health Connect. Please try again.",
};

const MyDevices = ({ navigation }) => {
  const dispatch = useDispatch();
  const devicesData = useSelector((state) => state.device.devicesData);
  const healthConnect = useSelector((state) => state.device.healthConnect);

  // Checked again on every return to this tab, since permissions can be
  // changed in the Health Connect app.
  useFocusEffect(
    useCallback(() => {
      dispatch(startCheckHealthConnect());
    }, [])
  );

  const healthConnectCardProps = () => {
    const { status } = healthConnect;
    if (status === "unavailable") {
      return { connectLabel: "Unavailable", connectDisabled: true };
    }
    if (status === "update_needed") {
      return {
        connectLabel: "Update",
        onConnect: () => Linking.openURL(HEALTH_CONNECT_STORE_URL),
      };
    }
    const connected = status === "connected";
    return {
      connectLabel: connected ? "Disconnect" : "Connect",
      connectLoading: status === "connecting",
      connectDisabled: status === "unknown",
      onConnect: () =>
        dispatch(
          connected
            ? startDisconnectHealthConnect()
            : startConnectHealthConnect()
        ),
    };
  };

  // The other (demo) devices only have their DeviceDetails page
  const cardProps = (item) =>
    item.connection === "health_connect" ? healthConnectCardProps() : {};

  const healthConnectMessage = HEALTH_CONNECT_MESSAGES[healthConnect.error];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <AppHeader title={"My Devices"} />
      <View style={styles.body}>
        {healthConnectMessage && (
          <Text style={styles.error} testID="health-connect-message">
            {healthConnectMessage}
          </Text>
        )}
        {healthConnect.error === "no_permissions" && (
          <Button
            mode="text"
            compact
            onPress={openSettings}
            testID="health-connect-open-settings"
          >
            Open Health Connect
          </Button>
        )}
        {devicesData.map((item, index) => (
          <DeviceCard
            key={index}
            style={{ margin: 5 }}
            device={item}
            onPress={(e) =>
              navigation.navigate("DeviceDetails", { id: item.id })
            }
            {...cardProps(item)}
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
  // Room to scroll the last card clear of the floating tab bar
  content: {
    paddingBottom: 120,
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
