import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { AppHeader } from "../../components";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/FontAwesome5";
import { AppColor } from "../../constants/themes";
import HeartRateChart from "../../components/visualizations/HeartRateChart";

export default function ViewHeartRateData({ navigation, route }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { previousScreenTitle } = route.params;

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setCurrentDate(selectedDate);
    }
  };

  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <ScrollView>
      <AppHeader title={previousScreenTitle} back={true} />
      <View style={styles.dateContainer}>
        <Text style={styles.title}>{formattedDate}</Text>
        <View style={styles.iconContainer}>
          <Icon
            name="calendar-alt"
            size={20}
            style={styles.icon}
            onPress={() => setShowDatePicker(true)}
          />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.bigIcon}>
          <Icon name="heartbeat" size={40} color="#1160A4" solid />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.dataText}>Heart Rate</Text>
        </View>
      </View>

      <View style={{ alignItems: "center", paddingVertical: 25 }}>
        <HeartRateChart />
      </View>

      <View style={styles.heartRate}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Heart Rate</Text>
          <Text style={styles.infoText}>57 - 126 BPM</Text>
        </View>
      </View>

      <View style={styles.heartRate}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Resting Rate</Text>
          <Text style={styles.infoText}>59 BPM</Text>
        </View>
      </View>

      <View style={styles.heartRate}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Heart Rate Variability</Text>
          <Text style={styles.infoText}>47 MS</Text>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    textAlign: "left",
    color: "black",
  },
  content: {
    paddingHorizontal: 10,
    gap: 10,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  iconContainer: {
    flexDirection: "row",
  },
  icon: {
    color: "#1160A4",
    fontSize: 25,
  },
  bigIcon: {
    backgroundColor: AppColor.primaryContainer,
    height: 70,
    width: 70,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  dataText: {
    color: "black",
    fontSize: 35,
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10, // Adjust the value as needed
  },
  heartRate: {
    height: 50, // Adjust the height as needed
    backgroundColor: AppColor.primaryContainer, // Use the desired background color
    borderRadius: 12,
    marginVertical: 3,
    paddingHorizontal: 5,
    marginHorizontal: 10,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    height: "100%",
  },
  infoText: {
    fontSize: 20,
    color: "#000000",
    marginBottom: 5,
  },
});
