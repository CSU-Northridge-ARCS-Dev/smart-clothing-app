import React, { useCallback, useEffect } from "react";
import { View, StyleSheet, ScrollView, Linking } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { Button, Text } from "react-native-paper";

import { AppHeader, DeviceCard } from "../../components";
import {
  startCheckFitbit,
  startConnectFitbit,
  startDisconnectFitbit,
  startCheckHealthConnect,
  startConnectHealthConnect,
  startDisconnectHealthConnect,
} from "../../actions/deviceActions";
import {
  openSettings,
  HEALTH_CONNECT_STORE_URL,
} from "../../services/healthConnect";
import { AppColor } from "../../constants/themes";

const FITBIT_ERROR_MESSAGES = {
  access_denied: "Fitbit access was not allowed.",
  token_exchange_failed: "Fitbit login failed. Please try again.",
};

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
  const fitbit = useSelector((state) => state.device.fitbit);
  const healthConnect = useSelector((state) => state.device.healthConnect);

  useEffect(() => {
    dispatch(startCheckFitbit());
  }, []);

  // Checked again on every return to this tab, since permissions can be
  // changed in the Health Connect app.
  useFocusEffect(
    useCallback(() => {
      dispatch(startCheckHealthConnect());
    }, [])
  );

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

  const cardProps = (item) => {
    if (item.connection === "fitbit") return fitbitCardProps();
    if (item.connection === "health_connect") return healthConnectCardProps();
    return {};
  };

  const healthConnectMessage = HEALTH_CONNECT_MESSAGES[healthConnect.error];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <AppHeader title={"My Devices"} />
      <View style={styles.body}>
        {fitbit.status === "error" && (
          <Text style={styles.error}>
            {FITBIT_ERROR_MESSAGES[fitbit.error] ||
              "Could not connect to Fitbit. Please try again."}
          </Text>
        )}
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
