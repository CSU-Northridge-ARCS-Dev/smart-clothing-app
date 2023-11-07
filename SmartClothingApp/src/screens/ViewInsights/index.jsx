import React from "react";
import { Button, View, Text, StyleSheet } from "react-native";
import { AppHeader } from "../../components";
import ActivityRings from "../../components/visualizations/ActivityRings/ActivityRings";
import { AppColor, AppStyle, AppFonts } from "../../constants/themes";
import { useSelector, useDispatch } from "react-redux";
import { updateActivityRingsData } from "../../actions/appActions";
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import DailyInsights from "../../components/DailyInsights/DailyInsights";

export default function ViewInsights({ route }) {
  const { previousScreenTitle } = route.params;
  const daysOfWeek = ["U", "M", "T", "W", "R", "F", "S"];
  const dispatch = useDispatch();
  const activityRingsData = useSelector((state) => state.app.activityRingsData);
  const [currentRingData, setCurrentRingData] = useState({
    ring1: 0,
    ring2: 0,
    ring3: 0,
  });

  // console.log(activityRingsData);

  const handleRingPress = (day) => {
    // You can add your logic here to update the ring data as needed
    const currentRingData = {
      ring1: activityRingsData[day].ring1,
      ring2: activityRingsData[day].ring2,
      ring3: activityRingsData[day].ring3,
    };

    setCurrentRingData(currentRingData);
  };

  const generateRandomValue = () => {
    return Math.random() * 2;
  };

  useEffect(() => {
    // Create an interval to update the data every 5 seconds
    const intervalId = setInterval(() => {
      // Update activity rings data with random values
      daysOfWeek.forEach((day) => {
        const randomData = {
          ring1: generateRandomValue(),
          ring2: generateRandomValue(),
          ring3: generateRandomValue(),
        };
        dispatch(updateActivityRingsData(day, randomData));
      });
    }, 5000); // 5000 milliseconds = 5 seconds

    // Cleanup the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [dispatch]);

  return (
    <View style={[{ flex: 1 }]}>
      <AppHeader title={previousScreenTitle} back={true} />
      <View style={styles.body}>
        <DailyInsights
          fromDashboard={false}
          handleRingPress={handleRingPress}
        />
      </View>
      <ActivityRings //big ring
        scale={1}
        canvasWidth={400}
        canvasHeight={300}
        horiPos={2}
        vertPos={2}
        totalProgress={{ ...currentRingData }}
      />
      <Button
        title="Update Activity Rings Data"
        onPress={() => {
          // Dispatch each action individually
          dispatch(
            updateActivityRingsData("U", {
              ring1: 2.8,
              ring2: 1.8,
              ring3: 0.8,
            })
          );
          dispatch(
            updateActivityRingsData("M", {
              ring1: 1.5,
              ring2: 1,
              ring3: 0.6,
            })
          );
          dispatch(
            updateActivityRingsData("T", {
              ring1: 1.3,
              ring2: 1.2,
              ring3: 0.2,
            })
          );
          dispatch(
            updateActivityRingsData("W", {
              ring1: 0.7,
              ring2: 0.4,
              ring3: 1.8,
            })
          );

          dispatch(
            updateActivityRingsData("R", {
              ring1: 0.5,
              ring2: 0.8,
              ring3: 0.3,
            })
          );

          dispatch(
            updateActivityRingsData("F", {
              ring1: 1.3,
              ring2: 0.4,
              ring3: 0.9,
            })
          );

          dispatch(
            updateActivityRingsData("S", {
              ring1: 0.6,
              ring2: 0.7,
              ring3: 0.8,
            })
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginBottom: 20,
    marginVertical: 24,
    paddingTop: 200,
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
    height: 130,
    overflow: "hidden",
  },
  body: {
    padding: 10,
  },
  ringsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
