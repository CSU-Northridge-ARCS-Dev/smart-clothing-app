import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { AppHeader } from "../../components";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useFocusEffect } from "@react-navigation/native";
import { Button } from "react-native-paper";

export default function ViewHealthData({ navigation }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const days = ["S", "M", "T", "W", "Th", "F", "Sat"];

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setCurrentDate(selectedDate);
    }
  };

  const handleDayPress = (day) => {
    setSelectedDay((prevSelectedDay) => {
      return prevSelectedDay === day ? null : day;
    });
  };

  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    return () => {
      setSelectedDay(null);
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setSelectedDay(null);
    }, [])
  );

  return (
    <ScrollView style={styles.container}>
      <AppHeader title={"Health Data"} />
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
        <View style={styles.date}>
          <Text style={styles.dateText}>Daily Metrics</Text>
          <View style={styles.dayLabelsContainer}>
            {days.map((day) => (
              <Text
                key={day}
                style={[
                  styles.dayLabel,
                  selectedDay === day && styles.selectedDayLabel,
                ]}
                onPress={() => handleDayPress(day)}
              >
                {day}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.rectangleContainer}>
          <View style={styles.whiteRectangle}>
            <Icon name="bed" size={50} color="#1160A4" />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.sleepDataText}>Sleep Data</Text>
            <Icon name="chevron-right" size={16} color="#000000" />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.rectangleContainer}>
          <View style={styles.whiteRectangle}>
            <Icon name="heart" size={50} color="#1160A4" solid />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.sleepDataText}>Heart Data</Text>
            <Icon name="chevron-right" size={16} color="#1160A4" />
          </View>
        </View>
      </View>

      <Button onPress={() => navigation.navigate("HeartRateData")}>
        Hello
      </Button>

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
    paddingHorizontal: 0,
    paddingTop: 10,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
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
  rectangleContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 5,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    height: 100,
  },
  whiteRectangle: {
    backgroundColor: "#D3E4FF",
    borderRadius: 50,
    padding: 16,
  },
  sleepDataText: {
    color: "#000000",
    fontSize: 16,
    marginRight: 8,
  },
  dayLabelsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 10,
  },
  dayLabelContainer: {
    alignItems: "center",
  },
  dayLabel: {
    color: "#1160A4",
    fontSize: 25,
  },
  selectedDayLabel: {
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 50,
    width: 45,
    height: 45,
    textAlign: "center",
    lineHeight: 40,
    color: "#1160A4",
  },
  dateText: {
    fontSize: 18,
    color: "#1160A4",
  },
  date: {
    flex: 1,
    backgroundColor: "#D3E4FF",
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 26,
    flexDirection: "column",
    justifyContent: "flex-start",
    elevation: 5,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    height: 100,
  },
});
