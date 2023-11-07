import React, { useState, useEffect } from "react";
import { Button, View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { AppHeader } from "../../components";
import { AppStyle, AppFonts } from "../../constants/themes";
import Icon from "react-native-vector-icons/FontAwesome5";
import DateTimePicker from "@react-native-community/datetimepicker"; 

const ViewInsights = ({ route }) => {
  const { previousScreenTitle } = route.params;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false); 

  useEffect(() => {
    setCurrentDate(currentDate);
  }, []);

  const onChangeDate = (event, selectedDate) => { 
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setCurrentDate(selectedDate);
    }
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <AppHeader title={previousScreenTitle} back={true} />
      <View style={styles.content}>
        <View style={styles.dateContainer}>
          <Text style={styles.title}>Date: {`${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`}</Text>
          <View style={styles.iconContainer}>
            <Icon 
              name="calendar-alt" 
              size={20} 
              style={styles.icon} 
              onPress={() => setShowDatePicker(true)} 
            />
            <Icon name="sliders-h" size={20} style={styles.icon} />
            <Icon name="upload" size={20} style={styles.icon} />
          </View>
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
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24, 
    textAlign: "left",
    color: 'black',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,  
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginBottom: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 25, 
  }
});

export default ViewInsights;