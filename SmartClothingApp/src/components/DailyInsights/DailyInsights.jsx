import React from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback } from "react-native";
import ActivityRings from "../visualizations/ActivityRings/ActivityRings";
import { AppColor, AppStyle, AppFonts } from "../../constants/themes";
import { useSelector, useDispatch } from "react-redux";
import { updateActivityRingsData } from "../../actions/appActions";
import { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";
import { Button } from "react-native-paper";
import { daysOfWeek } from "../../utils/calendar";

const DailyInsights = ({
  fromDashboard = false,
  handleRingPress,
  navigation,
}) => {
  const route = useRoute();
  const navigate = (screen) => {
    navigation.navigate(screen, {
      previousScreenTitle: route.name,
    });
  };

  const activityRingsData = useSelector((state) => state.app.activityRingsData);

  const [selectedRing, setSelectedRing] = useState(null);

  return (
    <View style={styles.insights}>
      <Text style={[AppStyle.subTitle, { fontFamily: AppFonts.chakraBold }]}>
        Daily Insights
      </Text>
      <View style={{ justifyContent: "center" }}>
        <View style={styles.ringsRow}>
          {Object.keys(daysOfWeek).map((dayName) => (
            <View key={dayName} style={{ alignItems: "center" }}>
              <Text
                style={[AppStyle.subTitle, { fontFamily: AppFonts.chakraBold }]}
              >
                {daysOfWeek[dayName]}
              </Text>
              {fromDashboard ? (
                <ActivityRings
                  scale={0.17}
                  canvasWidth={50}
                  canvasHeight={50}
                  horiPos={2}
                  vertPos={2}
                  totalProgress={activityRingsData[dayName]}
                />
              ) : (
                <TouchableWithoutFeedback
                  onPress={() => {
                    handleRingPress(dayName);
                    setSelectedRing(dayName);
                  }}
                >
                  <View
                    style={[
                      { width: 50, height: 50 },
                      selectedRing === dayName
                        ? styles.selectedRing
                        : styles.fadedRing,
                    ]}
                  >
                    <ActivityRings
                      scale={0.17}
                      canvasWidth={50}
                      canvasHeight={50}
                      horiPos={2}
                      vertPos={2}
                      totalProgress={activityRingsData[dayName]}
                    />
                  </View>
                </TouchableWithoutFeedback>
              )}
            </View>
          ))}
        </View>
        {fromDashboard && (
          <Button
            mode="contained"
            onPress={() => navigate("Insights")}
            icon={"arrow-right"}
            uppercase
            contentStyle={{ flexDirection: "row-reverse" }}
            style={{ alignSelf: "flex-end" }}
          >
            View
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  ringsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  selectedRing: {
    opacity: 1, // Ring is fully visible when selected
  },
  fadedRing: {
    opacity: 0.5, // Ring is partially faded when not selected
  },
});

export default DailyInsights;
