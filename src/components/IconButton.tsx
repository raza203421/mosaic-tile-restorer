import React, { memo, useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { HIT_SLOP, TOUCH_MIN } from '../constants/config';
import { theme } from '../constants/theme';

type Props = {
  Icon: LucideIcon;
  label: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
  tone?: 'stone' | 'accent';
  style?: StyleProp<ViewStyle>;
};

/** 24 dp glyph inside a fixed 48 x 48 dp carved-stone target. */
function IconButtonBase({ Icon, label, onPress, selected, disabled, tone = 'stone', style }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = useCallback(() => {
    Animated.timing(scale, { toValue: 0.92, duration: 90, useNativeDriver: true }).start();
  }, [scale]);

  const pressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: theme.anim.press.tension,
      friction: theme.anim.press.friction,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const glyph = disabled
    ? 'rgba(232,221,196,0.35)'
    : selected
    ? theme.colors.onAccent
    : tone === 'accent'
    ? theme.colors.accent
    : theme.colors.textSecondary;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={disabled ? undefined : pressIn}
      onPressOut={disabled ? undefined : pressOut}
      hitSlop={HIT_SLOP}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, selected: !!selected }}
      style={[styles.press, style]}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.inner,
          selected ? styles.selected : null,
          disabled ? styles.disabled : null,
          { transform: [{ scale }] },
        ]}>
        <Icon size={24} color={glyph} strokeWidth={2.2} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: TOUCH_MIN,
    height: TOUCH_MIN,
    borderRadius: theme.radius.md,
  },
  inner: {
    width: TOUCH_MIN,
    height: TOUCH_MIN,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(89,44,38,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(232,221,196,0.22)',
  },
  selected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.chalk,
  },
  disabled: {
    opacity: 0.45,
  },
});

export const IconButton = memo(IconButtonBase);
export default IconButton;
