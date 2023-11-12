import React, { useEffect, useState } from "react";
import {
  Button,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { AppHeader } from "../../components";
import { AppColor, AppStyle, AppFonts } from "../../constants/themes";
import { useSelector, useDispatch } from "react-redux";
import { updateActivityRings } from "../../actions/appActions";
import DailyInsights from "../../components/DailyInsights/DailyInsights";
import Icon from "react-native-vector-icons/FontAwesome5";
import DateTimePicker from "@react-native-community/datetimepicker";
import { CartesianChart, Line, Bar } from "victory-native";
import { LinearGradient, vec } from "@shopify/react-native-skia";
import { useFont } from "@shopify/react-native-skia";

const ActivityChart = ({
  scale,
  canvasHeight,
  canvasWidth,
  horiPos,
  vertPos,
  totalProgress,
}) => {
  const width = 245;

  const center = vec(canvasWidth / horiPos, canvasHeight / vertPos);

  return (
    <Canvas style={[{ flex: 1, width: canvasWidth, height: canvasHeight }]}>
      {ringProps.map((ring, index) => {
        return (
          <Ring
            key={index}
            ring={ring}
            center={center}
            strokeWidth={strokeWidth}
            scale={scale}
          />
        );
      })}
    </Canvas>
  );
};

export default ActivityRings;
