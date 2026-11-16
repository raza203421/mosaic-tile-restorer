import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HEADER_CONTENT_H, GUTTER, TOP_INSET } from '../constants/config';
import { theme } from '../constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  compact?: boolean;
};

/**
 * One header for every screen — Menu, Game, Finished Mosaic, Museum, Settings
 * and Artwork — so padding, type scale and borders cannot drift apart.
 */
function ScreenHeaderBase({ title, subtitle, leftSlot, rightSlot, compact }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.row}>
        {leftSlot ? <View style={styles.side}>{leftSlot}</View> : null}
        <View style={styles.titles}>
          <Text numberOfLines={1} style={compact ? styles.titleCompact : styles.title}>
            {title}
          </Text>
          {subtitle ? (
            <Text numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {rightSlot ? <View style={styles.sideRight}>{rightSlot}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingTop: TOP_INSET,
    backgroundColor: 'rgba(34,16,22,0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(232,221,196,0.16)',
  },
  row: {
    height: HEADER_CONTENT_H,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: GUTTER,
    gap: 12,
  },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sideRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titles: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...theme.typography.section,
    color: theme.colors.textPrimary,
  },
  titleCompact: {
    ...theme.typography.cardTitle,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    ...theme.typography.caption,
    fontSize: 13,
    letterSpacing: 0.3,
    textTransform: 'none',
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});

export const ScreenHeader = memo(ScreenHeaderBase);
export default ScreenHeader;
