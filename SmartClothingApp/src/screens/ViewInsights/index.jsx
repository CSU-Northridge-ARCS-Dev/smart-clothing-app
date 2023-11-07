import React from "react";
import { Button, View, Text, StyleSheet } from "react-native";
import { AppHeader } from "../../components";
import ActivityRings from "../../components/visualizations/ActivityRings/ActivityRings";
import { AppColor, AppStyle, AppFonts } from "../../constants/themes";

export default function ViewInsights({ route }) {
  const { previousScreenTitle } = route.params;
  const daysOfWeek = ["S", "M", "T", "W", "R", "F", "S"];

  return (
    <View style={[{ flex: 1 }]}>
      <AppHeader title={previousScreenTitle} back={true} />
      <View style={styles.body}>
        <View style={styles.insights}>
          <Text
            style={[AppStyle.subTitle, { fontFamily: AppFonts.chakraBold }]}
          >
            Daily Insights
          </Text>
          <View style={{ justifyContent: "center" }}>
            <View style={styles.ringsRow}>
              {Array(7)
                .fill()
                .map((_, index) => (
                  <View key={index} style={{ alignItems: "center" }}>
                    <Text
                      style={[
                        AppStyle.subTitle,
                        { fontFamily: AppFonts.chakraBold },
                      ]}
                    >
                      {daysOfWeek[index]}
                    </Text>
                    <View style={{ width: 50, height: 50 }}>
                      <ActivityRings
                        scale={0.15}
                        canvasWidth={50}
                        canvasHeight={50}
                        horiPos={2}
                        vertPos={2}
                      />
                    </View>
                  </View>
                ))}
            </View>
          </View>
        </View>
      </View>
      <ActivityRings
        scale={1}
        canvasWidth={400}
        canvasHeight={300}
        horiPos={2}
        vertPos={2}
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
