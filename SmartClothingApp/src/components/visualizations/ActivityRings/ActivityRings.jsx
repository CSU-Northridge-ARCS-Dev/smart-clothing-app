import { Canvas, Fill, vec } from "@shopify/react-native-skia";
import React from "react";

import Ring from "./Ring";
import { useWindowDimensions } from "react-native";

const ActivityRings = ({
  scale,
  canvasHeight,
  canvasWidth,
  horiPos,
  vertPos,
}) => {
  const width = 245;

  const center = vec(canvasWidth / horiPos, canvasHeight / vertPos);

  const PI = Math.PI;
  const TAU = 2 * PI;
  const SIZE = width * scale;
  const strokeWidth = 30 * scale;

  const color = (r, g, b) => `rgb(${r * 255}, ${g * 255}, ${b * 255})`;

  const ringProps = [
    {
      totalProgress: 2.8,
      colors: [color(0.008, 1, 0.659), color(0, 0.847, 1)],
      background: color(0.016, 0.227, 0.212),
      size: SIZE - strokeWidth * 4,
    },
    {
      totalProgress: 0.6,
      colors: [color(0.847, 1, 0), color(0.6, 1, 0.004)],
      background: color(0.133, 0.2, 0),
      size: SIZE - strokeWidth * 2,
    },
    {
      totalProgress: 0.7,
      colors: [color(0.98, 0.067, 0.31), color(0.976, 0.22, 0.522)],
      background: color(0.196, 0.012, 0.063),
      size: SIZE,
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
