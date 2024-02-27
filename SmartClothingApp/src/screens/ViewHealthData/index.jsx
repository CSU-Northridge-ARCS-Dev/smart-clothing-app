import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { AppHeader } from "../../components";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useRoute } from "@react-navigation/native";
import { AppColor, AppStyle, AppFonts } from "../../constants/themes";
import DailyMetrics from "../../components/DailyMetrics/DailyMetrics";
import DataButton from "../../components/UI/DataButton";
import DateToolbar from "../../components/DateToolbar/DateToolbar";

export default function ViewHealthData({ navigation }) {
  const route = useRoute();
  const navigate = (screen) => {
    navigation.navigate(screen, {
      previousScreenTitle: route.name,
    });
  };
  return (
    <ScrollView style={{ flex: 1 }}>
      <AppHeader title={"Health Data"} />
      <View style={{paddingLeft: 10, paddingTop: 10}}>
        <DateToolbar />
      </View>
      <DataButton
        screen="SleepData"
        icon="bed"
        color={AppColor.primary}
        dataText="Sleep Data"
        navigate={navigate}
      />

      <DataButton
        screen="HeartRateData"
        icon="heart"
        color={AppColor.primary}
        dataText="Heart Rate"
        navigate={navigate}
        solid
      />
    </ScrollView>
  );
}
