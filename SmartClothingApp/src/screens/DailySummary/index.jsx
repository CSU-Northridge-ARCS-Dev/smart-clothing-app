import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  ActivityIndicator,
  IconButton,
  Modal,
  Portal,
  Text,
  TouchableRipple,
} from "react-native-paper";
import { Calendar } from "react-native-calendars";

import {
  AppHeader,
  HeartCard,
  SleepCard,
  WorkoutList,
  FitbitConnectPrompt,
} from "../../components";
import { fitbitCardStyles as card } from "../../components/fitbit/styles";
import {
  startCheckFitbit,
  startLoadFitbitDay,
} from "../../actions/deviceActions";
import {
  toLocalDateString,
  addDaysToDateString,
} from "../../utils/dateConversions";
import { formatDateLabel } from "../../utils/fitbitFormat";
import { AppColor, AppFonts } from "../../constants/themes";

const ERROR_MESSAGES = {
  FITBIT_API_ERROR: "Fitbit didn't respond. Pull down to try again.",
  Network_Error: "Can't reach the insights service. Is it running?",
};

// One day of Pixel Watch data: sleep, heart rate and workouts.
// The AI feedback for the day goes here
const DailySummary = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const today = toLocalDateString();
  const [date, setDate] = useState(
    (route.params && route.params.date) || today
  );
  const [calendarVisible, setCalendarVisible] = useState(false);

  const status = useSelector((state) => state.device.fitbit.status);
  const dayState = useSelector((state) => state.device.fitbit.days[date]);

  useEffect(() => {
    dispatch(startCheckFitbit());
  }, []);

  useEffect(() => {
    if (status === "connected") dispatch(startLoadFitbitDay(date));
  }, [status, date]);

  const goToDevices = () => navigation.navigate("Main", { screen: "Device" });
  const onRefresh = () => dispatch(startLoadFitbitDay(date, { force: true }));

  const renderBody = () => {
    if (status === "unknown") {
      return <ActivityIndicator style={styles.spinner} />;
    }
    if (status !== "connected") {
      return <FitbitConnectPrompt onPress={goToDevices} />;
    }
    if (!dayState || (dayState.loading && !dayState.data)) {
      return <ActivityIndicator style={styles.spinner} testID="day-loading" />;
    }
    if (dayState.error) {
      const key = dayState.error.replace(/ /g, "_");
      return (
        <View style={card.card}>
          <Text style={card.title}>Couldn't load this day</Text>
          <Text style={card.empty}>
            {ERROR_MESSAGES[key] || `Something went wrong (${dayState.error}).`}
          </Text>
        </View>
      );
    }
    const day = dayState.data;
    return (
      <>
        <SleepCard sleep={day.sleep} />
        <HeartCard heart={day.heart} />
        <WorkoutList workouts={day.workouts} />
        <View style={card.card} testID="ai-feedback-placeholder">
          <Text style={card.title}>AI Feedback</Text>
          <Text style={card.empty}>
            Personalised feedback for this day will appear here.
          </Text>
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title={"Daily Summary"} back={true} />
      <View style={styles.dateRow}>
        <IconButton
          icon="chevron-left"
          onPress={() => setDate(addDaysToDateString(date, -1))}
          testID="prev-day"
          accessibilityLabel="Previous day"
        />
        <TouchableRipple
          onPress={() => setCalendarVisible(true)}
          testID="date-label"
        >
          <Text style={styles.dateText}>
            {date === today ? "Today" : formatDateLabel(date)}
          </Text>
        </TouchableRipple>
        <IconButton
          icon="chevron-right"
          onPress={() => setDate(addDaysToDateString(date, 1))}
          disabled={date >= today}
          testID="next-day"
          accessibilityLabel="Next day"
        />
      </View>
      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl
            refreshing={Boolean(dayState && dayState.loading && dayState.data)}
            onRefresh={onRefresh}
          />
        }
      >
        {renderBody()}
      </ScrollView>
      <Portal>
        <Modal
          visible={calendarVisible}
          onDismiss={() => setCalendarVisible(false)}
          contentContainerStyle={styles.calendarModal}
        >
          <Calendar
            current={date}
            maxDate={today}
            markedDates={{
              [date]: { selected: true, selectedColor: AppColor.primary },
            }}
            onDayPress={(day) => {
              setDate(day.dateString);
              setCalendarVisible(false);
            }}
          />
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  dateText: {
    fontFamily: AppFonts.chakraBold,
    fontSize: 20,
    color: AppColor.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  body: {
    paddingHorizontal: 10,
  },
  spinner: {
    marginTop: 40,
  },
  calendarModal: {
    backgroundColor: AppColor.surface,
    margin: 20,
    padding: 10,
    borderRadius: 10,
  },
});

export default DailySummary;
