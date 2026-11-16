import React, { memo, useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import IconButton from '../components/IconButton';
import ScreenHeader from '../components/ScreenHeader';
import ScreenShell from '../components/ScreenShell';
import SecondaryButton from '../components/SecondaryButton';
import StoneCard from '../components/StoneCard';
import { BOTTOM_INSET, GUTTER, HIT_SLOP } from '../constants/config';
import { theme } from '../constants/theme';
import type { Settings } from '../game/progression';

type RowProps = {
  title: string;
  helper: string;
  value: boolean;
  onChange: (next: boolean) => void;
};

const ToggleRow = memo(function ToggleRow({ title, helper, value, onChange }: RowProps) {
  const press = useCallback(() => onChange(!value), [onChange, value]);
  return (
    <Pressable
      onPress={press}
      hitSlop={HIT_SLOP}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={title + '. ' + helper}
      style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text numberOfLines={1} style={styles.rowHelper}>
          {helper}
        </Text>
      </View>
      <View style={[styles.track, value ? styles.trackOn : null]}>
        <View style={[styles.thumb, value ? styles.thumbOn : null]} />
      </View>
    </Pressable>
  );
});

type Props = {
  settings: Settings;
  onChange: (next: Settings) => void;
  onBack: () => void;
};

export default function SettingsScreen({ settings, onChange, onBack }: Props) {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <ScreenShell variant="museum">
      <ScreenHeader
        title="Settings"
        leftSlot={<IconButton Icon={ArrowLeft} label="Back" onPress={onBack} />}
      />

      <View style={styles.body}>
        <StoneCard padding={16}>
          <ToggleRow
            title="Grid lines"
            helper="Show grout between tiles"
            value={settings.gridLines}
            onChange={next => onChange({ ...settings, gridLines: next })}
          />
          <View style={styles.divider} />
          <ToggleRow
            title="Sound"
            helper="Soft placement and completion sounds"
            value={settings.sound}
            onChange={next => onChange({ ...settings, sound: next })}
          />
          <View style={styles.divider} />
          <ToggleRow
            title="Reduce motion"
            helper="Replace movement with quiet fades"
            value={settings.reduceMotion}
            onChange={next => onChange({ ...settings, reduceMotion: next })}
          />
        </StoneCard>

        {helpOpen ? (
          <StoneCard padding={16} style={styles.helpCard}>
            <Text style={styles.helpTitle}>How to restore</Text>
            <Text style={styles.helpLine}>1. Every empty tile shows a pigment number.</Text>
            <Text style={styles.helpLine}>2. Pick that number in the palette, then tap the tile.</Text>
            <Text style={styles.helpLine}>3. Overview shows the whole floor; Detail is paintable.</Text>
            <Text style={styles.helpLine}>4. Move mode drags the floor without painting.</Text>
            <Text style={styles.helpLine}>5. NEXT TILE finds the next tile of your color.</Text>
            <View style={styles.helpAction}>
              <SecondaryButton label="CLOSE" onPress={() => setHelpOpen(false)} />
            </View>
          </StoneCard>
        ) : (
          <View style={styles.helpAction}>
            <SecondaryButton label="HOW TO RESTORE" onPress={() => setHelpOpen(true)} />
          </View>
        )}

        <View style={styles.spacer} />
        <Text style={styles.note}>Progress is saved on this device</Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: GUTTER,
    paddingTop: 16,
    paddingBottom: BOTTOM_INSET,
  },
  row: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    ...theme.typography.cardTitle,
    color: theme.colors.textPrimary,
  },
  rowHelper: {
    ...theme.typography.caption,
    textTransform: 'none',
    fontSize: 12,
    letterSpacing: 0.2,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  track: {
    width: 54,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(34,16,22,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(232,221,196,0.25)',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  trackOn: {
    backgroundColor: 'rgba(40,200,224,0.35)',
    borderColor: theme.colors.accent,
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.textMuted,
  },
  thumbOn: {
    backgroundColor: theme.colors.accent,
    alignSelf: 'flex-end',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(232,221,196,0.14)',
  },
  helpCard: {
    marginTop: 14,
  },
  helpTitle: {
    ...theme.typography.cardTitle,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  helpLine: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  helpAction: {
    marginTop: 14,
  },
  spacer: {
    flex: 1,
  },
  note: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
