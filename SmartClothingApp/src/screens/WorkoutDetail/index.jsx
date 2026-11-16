import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { ActivityIndicator, Text } from "react-native-paper";

import {
  AppHeader,
  WatchConnectPrompt,
  HeartRateTimeline,
  RouteMap,
  WorkoutCalendar,
  WorkoutStats,
} from "../../components";
import { watchCardStyles as card } from "../../components/watch/styles";
import {
  startCheckWatch,
  startLoadMonth,
  startLoadWorkout,
  selectWatchStatus,
} from "../../actions/deviceActions";
import { toLocalDateString } from "../../utils/dateConversions";
import { formatClockTime, formatDateLabel } from "../../utils/watchFormat";
import { monthOf } from "../../utils/workoutRoute";
import { AppColor, AppFonts } from "../../constants/themes";

const ERROR_MESSAGES = {
  HEALTH_CONNECT_READ_FAILED:
    "Couldn't read Health Connect. Pull down to try again.",
  WORKOUT_NOT_FOUND: "This workout is no longer available.",
};

// One workout from the watch: the GPS route colored by heart rate zone (when
// the workout has one), heart rate over the session, the stats, and a
// calendar of the month's workout days.
// route.params: { date: "YYYY-MM-DD", logId }
const WorkoutDetail = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { date, logId } = route.params || {};
  const today = toLocalDateString();
  const [month, setMonth] = useState(monthOf(date));

  const status = useSelector(selectWatchStatus);
  const workoutState = useSelector(
    (state) => state.device.watch.workouts[logId]
  );
  const monthState = useSelector((state) => state.device.watch.months[month]);

  useEffect(() => {
    if (status === "unknown") dispatch(startCheckWatch());
  }, []);

  useEffect(() => {
    if (status === "connected") dispatch(startLoadWorkout(date, logId));
  }, [status, date, logId]);

  useEffect(() => {
    if (status === "connected" && month) dispatch(startLoadMonth(month));
  }, [status, month]);

  const goToDevices = () => navigation.navigate("Main", { screen: "Device" });
  const onRefresh = () => {
    dispatch(startLoadWorkout(date, logId, { force: true }));
    dispatch(startLoadMonth(month, { force: true }));
  };

  const renderWorkout = () => {
    if (!workoutState || (workoutState.loading && !workoutState.data)) {
      return (
        <ActivityIndicator style={styles.spinner} testID="workout-loading" />
      );
    }
    if (workoutState.error) {
      const key = workoutState.error;
      return (
        <View style={card.card}>
          <Text style={card.title}>Couldn't load this workout</Text>
          <Text style={card.empty}>
            {ERROR_MESSAGES[key] ||
              `Something went wrong (${workoutState.error}).`}
          </Text>
        </View>
      );
    }
    const workout = workoutState.data;
    return (
      <>
        <Text style={styles.subtitle} testID="workout-title">
          {workout.type} · {formatClockTime(workout.startTime)}
        </Text>
        {workout.hasRoute ? <RouteMap points={workout.points} /> : null}
        <WorkoutStats workout={workout} />
        <HeartRateTimeline points={workout.points} zones={workout.zones} />
      </>
    );
  };

  const renderBody = () => {
    if (status === "unknown") {
      return <ActivityIndicator style={styles.spinner} />;
    }
    if (status !== "connected") {
      return <WatchConnectPrompt onPress={goToDevices} />;
    }
    return (
      <>
        {renderWorkout()}
        <WorkoutCalendar
          current={date}
          selectedDate={date}
          maxDate={today}
          monthState={monthState}
          onMonthChange={setMonth}
          onDayPress={(day) => navigation.push("DailySummary", { date: day })}
        />
      </>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title={"Workout"} back={true} />
      {date ? <Text style={styles.dateText}>{formatDateLabel(date)}</Text> : null}
      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl
            refreshing={Boolean(
              workoutState && workoutState.loading && workoutState.data
            )}
            onRefresh={onRefresh}
          />
        }
      >
        {renderBody()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateText: {
    fontFamily: AppFonts.chakraBold,
    fontSize: 20,
    color: AppColor.primary,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  subtitle: {
    fontFamily: AppFonts.poppinsBold,
    fontSize: 16,
    color: AppColor.onPrimaryContainer,
    paddingHorizontal: 4,
  },
  body: {
    paddingHorizontal: 10,
  },
  spinner: {
    marginTop: 40,
  },
});

export default WorkoutDetail;
