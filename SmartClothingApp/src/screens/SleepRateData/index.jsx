import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { AppHeader } from "../../components";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome5";

export default function ViewSleepData({ navigation, route }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const previousScreenTitle = route.params?.previousScreenTitle || "Sleep Data";
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

      <View style={styles.Content}>
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
        <View style={styles.whiteRectangle}>
          <Icon name="bed" size={50} color="#1160A4" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.sleepDataText}>Sleep Rate</Text>
        </View>
      </View>

      <Text style={styles.header}>Stages</Text>

      <View style={styles.rectangleBelowText}>
        <View style={styles.infoContainer}>
          <View style={styles.WhiteRectangle}></View>
          <Text style={styles.infoTextLeft}>Awake</Text>
          <Text style={styles.infoTextRight}>5 min</Text>
        </View>
      </View>

      <View style={styles.rectangleBelowText}>
        <View style={styles.infoContainer}>
          <View
            style={[styles.WhiteRectangle, { backgroundColor: "#31ADE7" }]}
          ></View>
          <Text style={styles.infoTextLeft}>Rem</Text>
          <Text style={styles.infoTextRight}>1 hr 56 min</Text>
        </View>
      </View>

      <View style={styles.rectangleBelowText}>
        <View style={styles.infoContainer}>
          <View
            style={[styles.WhiteRectangle, { backgroundColor: "#0179FF" }]}
          ></View>
          <Text style={styles.infoTextLeft}>Core</Text>
          <Text style={styles.infoTextRight}>5 hr 17 min</Text>
        </View>
      </View>

      <View style={styles.rectangleBelowText}>
        <View style={styles.infoContainer}>
          <View
            style={[styles.WhiteRectangle, { backgroundColor: "#3937A4" }]}
          ></View>
          <Text style={styles.infoTextLeft}>Deep</Text>
          <Text style={styles.infoTextRight}>11 min</Text>
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
    justifyContent: "flex-start", 
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
    height: 100,
    width: 100,
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
    marginLeft: 10, 
  },
  rectangleBelowText: {
    height: 50, 
    backgroundColor: "#D3E4FF", 
    borderRadius: 15, 
    marginTop: 5, 
    marginLeft: 26,
    marginRight: 26,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start", 
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
    marginLeft: 150,
  },
  dayLabelsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 10,
  },
  dateText: {
    fontSize: 18,
    color: "#1160A4",
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
  Content: {
    paddingHorizontal: 0,
    paddingTop: 10,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
  },
  header: {
    textAlign: "center",
    fontSize: 24, 
    color: "#1160A4",
  },
  WhiteRectangle: {
    backgroundColor: "#FF7D66",
    height: 10,
    width: 10,
    borderRadius: 50,
    padding: 16,
  },
});
