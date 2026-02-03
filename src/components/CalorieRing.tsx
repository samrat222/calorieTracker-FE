import React, { FC, useEffect, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import {
  Canvas,
  Circle,
  Path,
  Skia,
  SweepGradient,
  vec,
} from "@shopify/react-native-skia";
import { useUI } from "@context/UiProvider";
import CustomText from "./CustomText";
import { RFValue } from "react-native-responsive-fontsize";
import { Easing, useSharedValue, withTiming } from "react-native-reanimated";

interface CalorieRingProps {
  consumed: number;
  goal: number;
  size?: number;
}

// Gradient color stops for different progress levels
const GRADIENT_COLORS = {
  level1: "#EF4444", // Red (0-25%)
  level2: "#F97316", // Orange (25-50%)
  level3: "#EAB308", // Yellow (50-75%)
  level4: "#22C55E", // Green (75-100%)
};

const CalorieRing: FC<CalorieRingProps> = ({ consumed, goal, size = 200 }) => {
  const { theme } = useUI();

  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  const percentage = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
  const remaining = goal - consumed;
  const targetProgress = Math.min(Math.max(percentage / 100, 0), 1);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(targetProgress, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, targetProgress]);

  const path = useMemo(() => {
    const fullPath = Skia.Path.Make();
    fullPath.addArc(
      {
        x: center - radius,
        y: center - radius,
        width: radius * 2,
        height: radius * 2,
      },
      -90,
      360,
    );
    return fullPath;
  }, [center, radius]);

  // Get gradient colors based on progress percentage
  const getGradientColors = useMemo(() => {
    if (percentage <= 25) {
      // Just red
      return [GRADIENT_COLORS.level1, GRADIENT_COLORS.level1];
    } else if (percentage <= 50) {
      // Red to Orange
      return [GRADIENT_COLORS.level1, GRADIENT_COLORS.level2];
    } else if (percentage <= 75) {
      // Red to Orange to Yellow
      return [
        GRADIENT_COLORS.level1,
        GRADIENT_COLORS.level2,
        GRADIENT_COLORS.level3,
      ];
    } else {
      // Full gradient: Red to Orange to Yellow to Green
      return [
        GRADIENT_COLORS.level1,
        GRADIENT_COLORS.level2,
        GRADIENT_COLORS.level3,
        GRADIENT_COLORS.level4,
      ];
    }
  }, [percentage]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Canvas style={{ width: size, height: size }}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          style="stroke"
          strokeWidth={strokeWidth}
          color={theme.inputTextFieldBorderColor}
        />
        {/* Progress arc with gradient */}
        <Path
          path={path}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
          start={0}
          end={progress}
        >
          <SweepGradient c={vec(center, center)} colors={getGradientColors} />
        </Path>
      </Canvas>

      {/* Center text */}
      <View style={styles.centerContent}>
        <CustomText
          font="Bold"
          style={[styles.consumedText, { color: theme.text.primary }]}
        >
          {consumed}
        </CustomText>
        <CustomText
          font="Regular"
          style={[styles.labelText, { color: theme.text.secondary }]}
        >
          kcal eaten
        </CustomText>
        <View
          style={[
            styles.divider,
            { backgroundColor: theme.inputTextFieldBorderColor },
          ]}
        />
        <CustomText
          font="SemiBold"
          style={[
            styles.remainingText,
            { color: remaining >= 0 ? theme.green : theme.red },
          ]}
        >
          {remaining >= 0 ? remaining : Math.abs(remaining)}
        </CustomText>
        <CustomText
          font="Regular"
          style={[styles.labelText, { color: theme.text.secondary }]}
        >
          {remaining >= 0 ? "remaining" : "over"}
        </CustomText>
      </View>
    </View>
  );
};

export default CalorieRing;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  centerContent: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  consumedText: {
    fontSize: RFValue(28),
  },
  labelText: {
    fontSize: RFValue(12),
  },
  divider: {
    width: 60,
    height: 1,
    marginVertical: 8,
  },
  remainingText: {
    fontSize: RFValue(18),
  },
});
