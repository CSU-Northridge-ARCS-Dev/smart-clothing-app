import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { AppHeader } from "../../components";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useFocusEffect } from "@react-navigation/native";
import { daysOfWeek } from "../../utils/calendar";
import { AppColor, AppStyle, AppFonts } from "../../constants/themes";

const DailyMetrics = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const days = Object.keys(daysOfWeek);

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
    <>
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

      <View style={styles.insights}>
        <Text style={[AppStyle.subTitle, { fontFamily: AppFonts.chakraBold }]}>
          Daily Metrics
        </Text>
        <View style={styles.dayLabelsContainer}>
          {days.map((day) => (
            <Text
              key={day}
              style={[
                AppStyle.subTitle,
                { fontFamily: AppFonts.chakraBold, fontSize: 20 },
                selectedDay === day && styles.selectedDayLabel,
              ]}
              onPress={() => handleDayPress(day)}
            >
              {daysOfWeek[day]}
            </Text>
          ))}
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={currentDate}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    textAlign: "left",
    color: "black",
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
    borderRadius: 10,
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
    fontSize: 25,
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
    borderColor: AppColor.primary,
    borderWidth: 2,
    borderRadius: 50,
    width: 35,
    height: 35,
    textAlign: "center",
    lineHeight: 36.5,
    color: AppColor.primaryContainer,
    backgroundColor: AppColor.primary,
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

export default DailyMetrics;
