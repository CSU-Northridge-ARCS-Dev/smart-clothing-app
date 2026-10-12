import { Canvas, vec } from "@shopify/react-native-skia";
import React from "react";

import Ring from "./Ring";
import { AppColor } from "../../../constants/themes";

// One entry per goal, outermost first (steps, then sleep). The legend
// on Insights uses the same list so the colors always match.
export const RINGS = [
  {
    key: "steps",
    label: "Steps",
    colors: [AppColor.ringSteps, AppColor.ringStepsEnd],
    background: AppColor.ringStepsTrack,
  },
  {
    key: "sleep",
    label: "Sleep",
    colors: [AppColor.ringSleep, AppColor.ringSleepEnd],
    background: AppColor.ringSleepTrack,
  },
];

// totalProgress: { steps, sleep }, each value / goal (1 = a full ring)
const ActivityRings = ({
  scale,
  canvasHeight,
  canvasWidth,
  horiPos,
  vertPos,
  totalProgress,
}) => {
  const width = 245;

  const center = vec(canvasWidth / horiPos, canvasHeight / vertPos);
  const SIZE = width * scale;
  const strokeWidth = 30 * scale;

  return (
    <Canvas style={[{ flex: 1, width: canvasWidth, height: canvasHeight }]}>
      {RINGS.map(({ key, colors, background }, index) => (
        <Ring
          key={key}
          ring={{
            totalProgress: (totalProgress && totalProgress[key]) || 0,
            colors,
            background,
            size: SIZE - strokeWidth * 2 * index,
          }}
          center={center}
          strokeWidth={strokeWidth}
          scale={scale}
        />
      ))}
    </Canvas>
  );
};

export default ActivityRings;
