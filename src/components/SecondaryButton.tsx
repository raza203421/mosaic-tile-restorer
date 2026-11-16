import React, { memo, useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { HIT_SLOP, SECONDARY_H } from '../constants/config';
import { theme } from '../constants/theme';

type Props = {
  label: string;
  onPress: () => void;
  Icon?: LucideIcon;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/** Bordered mineral action, at least 48 dp high. */
function SecondaryButtonBase({ label, onPress, Icon, disabled, style, accessibilityLabel }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = useCallback(() => {
    Animated.timing(scale, { toValue: 0.97, duration: 90, useNativeDriver: true }).start();
  }, [scale]);

  const pressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: theme.anim.press.tension,
      friction: theme.anim.press.friction,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={disabled ? undefined : pressIn}
      onPressOut={disabled ? undefined : pressOut}
      hitSlop={HIT_SLOP}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.press, disabled ? styles.disabled : null, style]}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.inner, { transform: [{ scale }] }]}>
        <View style={styles.row}>
          {Icon ? <Icon size={24} color={theme.colors.textSecondary} strokeWidth={2.2} /> : null}
          <Text numberOfLines={1} style={styles.label}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: '100%',
    height: SECONDARY_H,
    borderRadius: theme.radius.md,
  },
  disabled: {
    opacity: 0.45,
  },
  inner: {
    width: '100%',
    height: '100%',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(232,221,196,0.35)',
    backgroundColor: 'rgba(171,42,88,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  label: {
    ...theme.typography.button,
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
});

export const SecondaryButton = memo(SecondaryButtonBase);
export default SecondaryButton;
