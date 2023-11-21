import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { AppHeader } from "../../components";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/FontAwesome5";

export default function ViewHealthData({ navigation, route }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const previousScreenTitle =
    route.params?.previousScreenTitle || "Health Data";

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
    <ScrollView style={styles.container}>
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
        <View style={styles.whiteRectangle}>
          <Icon name="heartbeat" size={50} color="#1160A4" solid />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.sleepDataText}>Heart Rate</Text>
        </View>
      </View>

      <View style={styles.rectangleBelowText}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoTextLeft}>Heart Rate</Text>
          <Text style={styles.infoTextRight}>57 - 126 BPM</Text>
        </View>
      </View>

      <View style={styles.rectangleBelowText}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoTextLeft}>Resting Rate</Text>
          <Text style={styles.infoTextRight}>59 BPM</Text>
        </View>
      </View>

      <View style={styles.rectangleBelowText}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoTextLeft}>Heart Rate Varibility</Text>
          <Text style={styles.infoTextRight}>47 MS</Text>
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
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "flex-start", // Align content to the left
    alignItems: "center",
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconContainer: {
    flexDirection: "row",
  },
  icon: {
    marginLeft: 25,
    paddingRight: 10,
    color: "#1160A4",
    fontSize: 25,
  },
  whiteRectangle: {
    backgroundColor: "#D3E4FF",
    borderRadius: 50,
    padding: 16,
  },
  sleepDataText: {
    color: "#000000",
    fontSize: 35,
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10, // Adjust the value as needed
  },
  rectangleBelowText: {
    height: 50, // Adjust the height as needed
    backgroundColor: "#D3E4FF", // Use the desired background color
    borderRadius: 15, // Optional: add border radius for rounded corners
    marginTop: 5, // Adjust the margin top as needed
    marginLeft: 26, // Adjust the left padding as needed
    marginRight: 26, // Adjust the right padding as needed
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    height: "100%",
  },
  infoTextLeft: {
    fontSize: 20,
    color: "#000000",
    marginBottom: 5,
  },
  infoTextRight: {
    fontSize: 20,
    color: "#000000",
    marginBottom: 5,
  },
});
