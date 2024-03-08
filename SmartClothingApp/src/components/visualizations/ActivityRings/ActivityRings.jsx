import {
  Canvas,
  Fill,
  vec,
} from "@shopify/react-native-skia";
import React from "react";

import Ring from "./Ring";
import { AppColor } from "../../../constants/themes";

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

  const PI = Math.PI;
  const TAU = 2 * PI;
  const SIZE = width * scale;
  const strokeWidth = 30 * scale;

  const color = (r, g, b) => `rgb(${r * 255}, ${g * 255}, ${b * 255})`;

  const commonRing1 = {
    colors: [color(0.024, 0.737, 1), color(0.075, 0.953, 0.768)],
    background: color(0.094, 0.49, 0.557),
    size: SIZE - strokeWidth * 4,
  };

  const commonRing2 = {
    colors: [color(0.129, 0.392, 0.706), color(0.184, 0.49, 0.851)],
    background: color(0.22, 0.384, 0.576),
    size: SIZE - strokeWidth * 2,
  };

  const commonRing3 = {
    colors: [color(0.035, 0.055, 0.243), color(0.059, 0.09, 0.416)],
    background: color(0.067, 0.078, 0.227),
    size: SIZE,
  };

  const ringProps = [
    {
      totalProgress: totalProgress.ring1,
      ...commonRing1,
    },
    {
      totalProgress: totalProgress.ring2,
      ...commonRing2,
    },
    {
      totalProgress: totalProgress.ring3,
      ...commonRing3,
    },
  ];
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
