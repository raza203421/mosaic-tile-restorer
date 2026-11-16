import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { theme } from '../constants/theme';

type Props = {
  Icon: LucideIcon;
  value: string;
  label: string;
  valueColor: string;
};

/**
 * Every pill in a row shares one icon and one geometry; only the colour, the
 * number and the caption differ. Never rendered for a zero value.
 */
function StatCardBase({ Icon, value, label, valueColor }: Props) {
  return (
    <View style={[styles.card, { borderColor: valueColor + '55' }]}>
      <View style={[styles.iconWrap, { backgroundColor: valueColor + '22' }]}>
        <Icon size={22} color={valueColor} strokeWidth={2.4} />
      </View>
      <Text numberOfLines={1} style={[styles.value, { color: valueColor }]}>
        {value}
      </Text>
      <Text numberOfLines={1} style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    backgroundColor: 'rgba(89,44,38,0.85)',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    ...theme.typography.stat,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});

export const StatCard = memo(StatCardBase);
export default StatCard;
