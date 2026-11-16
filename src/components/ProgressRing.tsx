import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '../constants/theme';

type Props = {
  value: number;
  size?: number;
  strokeWidth?: number;
  caption?: string;
  showValue?: boolean;
};

/** Shared floor-progress drawing, used by the game header and the result sheets. */
function ProgressRingBase({ value, size = 40, strokeWidth = 5, caption, showValue = true }: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (circumference * clamped) / 100;

  return (
    <View style={[styles.root, { width: size, height: size }]} accessible accessibilityLabel={clamped + ' percent restored'}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={theme.colors.stone}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={theme.colors.accent}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {showValue ? (
        <View pointerEvents="none" style={styles.center}>
          <Text style={[styles.value, { fontSize: size >= 72 ? 24 : 13 }]}>{clamped}</Text>
          {caption ? <Text style={styles.caption}>{caption}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  caption: {
    ...theme.typography.caption,
    fontSize: 10,
    color: theme.colors.textMuted,
  },
});

export const ProgressRing = memo(ProgressRingBase);
export default ProgressRing;
