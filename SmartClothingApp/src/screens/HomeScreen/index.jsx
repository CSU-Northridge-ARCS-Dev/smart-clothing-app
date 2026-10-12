import React, { useCallback } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import DailyInsights from "../../components/DailyInsights/DailyInsights";

import {
  AppHeader,
  DataCollectModal,
  HeartCard,
  SleepCard,
  FitbitConnectPrompt,
} from "../../components";
import {
  startCheckFitbit,
  startLoadFitbitDay,
} from "../../actions/deviceActions";
import { toLocalDateString } from "../../utils/dateConversions";

import { AppColor, AppFonts, AppStyle } from "../../constants/themes.js";

import { registerForPushNotificationsAsync, sendNotification } from '../../utils/notifications.js';


export default function HomeScreen({ navigation }) {
  const route = useRoute();
  const navigate = (screen) => {
    navigation.navigate(screen, {
      previousScreenTitle: route.name,
    });
  };
  const firstName = useSelector((state) => state.user.firstName);
  const dispatch = useDispatch();
  const today = toLocalDateString();
  const fitbitStatus = useSelector((state) => state.device.fitbit.status);
  const todayState = useSelector((state) => state.device.fitbit.days[today]);

  // Today's Pixel Watch data. Loaded once per session (pull to refresh on
  // DailySummary); the focus check picks up a connect from the Devices tab.
  useFocusEffect(
    useCallback(() => {
      dispatch(startCheckFitbit()).then((connected) => {
        if (connected) dispatch(startLoadFitbitDay(today));
      });
    }, [today])
  );

  const openDailySummary = () =>
    navigation.navigate("DailySummary", { date: today });

  const renderToday = () => {
    if (fitbitStatus === "unknown") return null;
    if (fitbitStatus !== "connected") {
      return <FitbitConnectPrompt onPress={() => navigation.navigate("Device")} />;
    }
    if (!todayState || (todayState.loading && !todayState.data)) {
      return <ActivityIndicator style={{ marginTop: 20 }} />;
    }
    if (todayState.error || !todayState.data) {
      return (
        <Text style={{ marginTop: 10 }}>
          Couldn't load today's Pixel Watch data.
        </Text>
      );
    }
    return (
      <>
        <SleepCard sleep={todayState.data.sleep} onPress={openDailySummary} />
        <HeartCard heart={todayState.data.heart} onPress={openDailySummary} />
      </>
    );
  };

  // Function to send a test notification
  const sendTestNotification = () => {
    sendNotification("Test Notification", "This is a test notification!");
  };

  // useEffect(() => {
  //   sendTestNotification();
  // }, []);

  return (
    <ScrollView
      style={styles.container}
      // Room for the floating tab bar so the last card can scroll into view
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <AppHeader title={"Dashboard"} />
      <DataCollectModal />
      <View style={styles.body}>
        <Text style={AppStyle.title}>Hello, {firstName}</Text>
        <DailyInsights fromDashboard={true} navigation={navigation} />
        {/* Test Notification Button */}
        {/* <Button
          mode="contained"
          onPress={sendTestNotification}
          style={{ marginTop: 20 }}
        >
          Send Test Notification
        </Button> */}
        <Text variant="titleMedium" style={{ marginTop: 20 }}>
          Today
        </Text>
        {renderToday()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 60,
  },
  body: {
    padding: 10,
  },
  insights: {
    marginVertical: 10,
    elevation: 2,
    shadowColor: AppColor.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 5, height: 5 },
    backgroundColor: AppColor.primaryContainer,
    padding: 10,
  },
});