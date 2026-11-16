import React, { memo, useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { BUTTON_H, HIT_SLOP } from '../constants/config';
import { theme } from '../constants/theme';

type Props = {
  label: string;
  onPress: () => void;
  Icon?: LucideIcon;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/**
 * 56 dp gradient action. The Pressable is the parent and the animated scale
 * view is its child, which is the only arrangement that keeps onPress alive in
 * Android release builds.
 */
function PrimaryButtonBase({ label, onPress, Icon, disabled, style, accessibilityLabel }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = useCallback(() => {
    Animated.timing(scale, {
      toValue: 0.97,
      duration: 90,
      useNativeDriver: true,
    }).start();
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
        style={[styles.scaleWrap, { transform: [{ scale }] }]}>
        <LinearGradient
          colors={disabled ? ['#6B4038', '#55302B'] : theme.gradients.action}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.fill}>
          <View style={styles.row}>
            {Icon ? <Icon size={24} color={theme.colors.onAccent} strokeWidth={2.4} /> : null}
            <Text numberOfLines={1} style={styles.label}>
              {label}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: '100%',
    height: BUTTON_H,
    borderRadius: theme.radius.lg,
    ...theme.shadows.action,
  },
  disabled: {
    opacity: 0.55,
  },
  scaleWrap: {
    width: '100%',
    height: '100%',
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(250,245,236,0.45)',
  },
  fill: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  label: {
    ...theme.typography.button,
    color: theme.colors.onAccent,
  },
});

export const PrimaryButton = memo(PrimaryButtonBase);
export default PrimaryButton;
