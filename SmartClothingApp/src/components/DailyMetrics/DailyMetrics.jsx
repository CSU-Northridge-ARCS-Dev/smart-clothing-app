import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useFocusEffect } from "@react-navigation/native";
import { daysOfWeek } from "../../utils/calendar";
import { AppColor, AppStyle, AppFonts } from "../../constants/themes";

const DailyMetrics = (props) => {
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
    <View style={{ padding: 10 }}>
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
      <View>
        <View style={styles.insights}>
          <Text
            style={[AppStyle.subTitle, { fontFamily: AppFonts.chakraBold }]}
          >
            Daily {props.name}
          </Text>
          <View style={styles.weekdayContainer}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
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
    padding: 7,
    borderRadius: 10,
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
    paddingRight: 10,
    color: AppColor.primary,
    fontSize: 25,
  },
  weekdayContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 10,
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
});

export default DailyMetrics;
