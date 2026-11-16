import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../constants/theme';

type Props = {
  children: React.ReactNode;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  padding?: number;
};

/** Raised stone panel: carved edge, mineral border, soft shadow. */
function StoneCardBase({ children, selected, style, padding = 14 }: Props) {
  return (
    <View style={[styles.shadow, style]}>
      <LinearGradient
        colors={theme.gradients.stone}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, selected ? styles.selected : null, { padding }]}>
        <View pointerEvents="none" style={styles.highlight} />
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: theme.radius.lg,
    ...theme.shadows.card,
  },
  card: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(232,221,196,0.18)',
    overflow: 'hidden',
  },
  selected: {
    borderColor: theme.colors.accent,
    borderWidth: 2,
  },
  highlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 2,
    backgroundColor: 'rgba(250,245,236,0.14)',
  },
});

export const StoneCard = memo(StoneCardBase);
export default StoneCard;
