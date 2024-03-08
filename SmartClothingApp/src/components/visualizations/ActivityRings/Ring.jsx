import {
  Circle,
  Group,
  Path,
  Skia,
  SweepGradient,
  Shadow,
  PathOp,
  Shader,
  Fill,
  mixColors,
  DashPathEffect,
  useComputedValue,
} from "@shopify/react-native-skia";
import React, { useEffect, useMemo } from "react";
import {
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { frag } from "./Frag";

const source = frag`
uniform shader image;
uniform vec2 head;
uniform float progress;
uniform vec4 color;
uniform float r;
uniform float scale;

vec2 rotate(in vec2 coord, in float angle, vec2 origin) {
  vec2 coord1 = coord - origin;
  vec2 rotated = coord1 * mat2( cos(angle), -sin(angle),
  sin(angle),  cos(angle));
  return rotated + origin;
 }

vec4 main(vec2 xy) {
  float d = distance(xy, head);
  vec2 rotated = rotate(xy, ${-Math.PI} - progress * ${2 * Math.PI}, head);
  if (rotated.y > head.y) {
    return vec4(0, 0, 0, 0);
  }
  if (d > r) {
    return vec4(0, 0, 0, smoothstep(35 * scale, 0, d));
  }
  if (progress > 1) {
    return color;
  }
  return image.eval(head);
}
`;

const fromCircle = (center, r) => {
  "worklet";
  return Skia.XYWHRect(center.x - r, center.y - r, r * 2, r * 2);
};

const Ring = ({
  center,
  strokeWidth,
  ring: { size, background, totalProgress, colors },
  scale,
}) => {
  const trim = useSharedValue(0);
  const r = size / 2 - strokeWidth / 2;

  const innerOutlinePath = useMemo(() => {
    const path = Skia.Path.Make();
    path.addCircle(center.x, center.y, r - strokeWidth / 2);
    return path;
  }, [center, r, strokeWidth]);

  const clip = useMemo(() => {
    const outerCircle = Skia.Path.Make();
    outerCircle.addCircle(center.x, center.y, size / 2);
    const innerCircle = Skia.Path.Make();
    innerCircle.addCircle(center.x, center.y, size / 2 - strokeWidth);
    return Skia.Path.MakeFromOp(outerCircle, innerCircle, PathOp.Difference);
  }, [center.x, center.y, size, strokeWidth]);

  const fullPath = useMemo(() => {
    const path = Skia.Path.Make();
    const fullRevolutions = Math.floor(totalProgress);
    for (let i = 0; i < fullRevolutions; i++) {
      path.addCircle(center.x, center.y, r);
    }
    path.addArc(fromCircle(center, r), 0, 360 * (totalProgress % 1));
    return path;
  }, [center, r, totalProgress]);

  // const path = useComputedValue(() => {
  //   if (trim.value < 1) {
  //     return fullPath.copy().trim(0, trim.value, false);
  //   }
  //   return fullPath;
  // });

  const matrix = useDerivedValue(() => {
    const m = Skia.Matrix();
    const progress = trim.value * totalProgress;
    const angle = progress < 1 ? 0 : (progress % 1) * 2 * Math.PI;
    if (angle > 0) {
      m.translate(center.x, center.y);
      m.rotate(angle);
      m.translate(-center.x, -center.y);
    }
    return m;
  });

  const uniforms = useDerivedValue(() => {
    const head = fullPath.getLastPt();
    return {
      head,
      r: strokeWidth / 2,
      progress: trim.value * totalProgress,
      color: [...Skia.Color(colors[1])],
      scale: scale,
    };
  });

  useEffect(() => {
    trim.value = 1;
  }, []);

  return (
    <Group transform={[{ rotate: -Math.PI / 2 }]} origin={center}>
      <Group clip={clip}>
        <Fill color={background} />
        <Circle
          c={fullPath.getPoint(0)}
          r={strokeWidth / 2}
          color={colors[0]}
        />
        <Path
          path={fullPath}
          strokeWidth={strokeWidth}
          style="stroke"
          color={colors[0]}
        >
          <SweepGradient colors={colors} c={center} matrix={matrix} />
        </Path>
        <Path
          path={innerOutlinePath}
          strokeWidth={2}
          style="stroke"
          color="black"
        />

        <Fill>
          <Shader source={source} uniforms={uniforms}>
            <SweepGradient colors={colors} c={center} matrix={matrix} />
          </Shader>
        </Fill>
      </Group>
    </Group>
  );
};

export default Ring;
