import React, { memo, useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Check, Hand, Maximize, Minus, Paintbrush, Plus, Undo2 } from 'lucide-react-native';
import { HIT_SLOP, TRAY_H } from '../constants/config';
import { theme } from '../constants/theme';
import { pigment } from '../game/catalog';
import type { InputMode, PigmentId } from '../game/types';
import IconButton from './IconButton';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

type SwatchProps = {
  id: PigmentId;
  remaining: number;
  selected: boolean;
  onPress: (id: PigmentId) => void;
};

const Swatch = memo(function Swatch({ id, remaining, selected, onPress }: SwatchProps) {
  const p = pigment(id);
  const press = useCallback(() => onPress(id), [id, onPress]);
  const complete = remaining === 0;

  return (
    <Pressable
      onPress={press}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={
        id + ' ' + p.name + (complete ? ', complete' : ', ' + remaining + ' tiles left')
      }
      style={[
        styles.swatch,
        { backgroundColor: p.hex },
        selected ? styles.swatchSelected : null,
        complete ? styles.swatchComplete : null,
      ]}>
      <Text style={[styles.swatchNumber, { color: p.label }]}>{id}</Text>
      {complete ? (
        <View style={styles.swatchCheck}>
          <Check size={12} color={theme.colors.onAccent} strokeWidth={3} />
        </View>
      ) : (
        <Text style={[styles.swatchCount, { color: p.label }]}>{remaining}</Text>
      )}
    </Pressable>
  );
});

type Props = {
  width: number;
  pigments: PigmentId[];
  remaining: Record<number, number>;
  selected: PigmentId;
  status: string;
  inputMode: InputMode;
  canUndo: boolean;
  canZoomIn: boolean;
  canZoomOut: boolean;
  onSelectPigment: (id: PigmentId) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onToggleMode: () => void;
  onUndo: () => void;
  onPlace: () => void;
  onNext: () => void;
};

/** Floating thumb-zone tray: status, swatches, tools and the two guided actions. */
function PaletteTrayBase(props: Props) {
  const {
    width,
    pigments,
    remaining,
    selected,
    status,
    inputMode,
    canUndo,
    canZoomIn,
    canZoomOut,
    onSelectPigment,
    onZoomIn,
    onZoomOut,
    onFit,
    onToggleMode,
    onUndo,
    onPlace,
    onNext,
  } = props;

  const renderSwatch = useCallback(
    ({ item }: { item: PigmentId }) => (
      <Swatch
        id={item}
        remaining={remaining[item] ?? 0}
        selected={item === selected}
        onPress={onSelectPigment}
      />
    ),
    [remaining, selected, onSelectPigment],
  );

  const keyExtractor = useCallback((item: PigmentId) => String(item), []);

  return (
    <LinearGradient
      colors={theme.gradients.tray}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.tray, { width }]}>
      <Text numberOfLines={1} style={styles.status}>
        {status}
      </Text>

      <FlatList
        data={pigments}
        horizontal
        keyExtractor={keyExtractor}
        renderItem={renderSwatch}
        showsHorizontalScrollIndicator={false}
        style={styles.swatchRow}
        contentContainerStyle={styles.swatchContent}
        initialNumToRender={8}
      />

      <View style={styles.toolRow}>
        <IconButton Icon={Minus} label="Zoom out" onPress={onZoomOut} disabled={!canZoomOut} />
        <IconButton Icon={Plus} label="Zoom in" onPress={onZoomIn} disabled={!canZoomIn} />
        <IconButton Icon={Maximize} label="Fit whole floor" onPress={onFit} />
        <IconButton
          Icon={inputMode === 'move' ? Hand : Paintbrush}
          label={inputMode === 'move' ? 'Move mode, switch to paint' : 'Paint mode, switch to move'}
          onPress={onToggleMode}
          selected={inputMode === 'move'}
        />
        <IconButton Icon={Undo2} label="Undo last tile" onPress={onUndo} disabled={!canUndo} />
      </View>

      <View style={styles.actionRow}>
        <PrimaryButton label="PLACE TILE" onPress={onPlace} style={styles.placeBtn} />
        <SecondaryButton label="NEXT TILE" onPress={onNext} style={styles.nextBtn} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  tray: {
    height: TRAY_H,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(232,221,196,0.22)',
    padding: 12,
    ...theme.shadows.tray,
  },
  status: {
    height: 20,
    ...theme.typography.caption,
    textTransform: 'none',
    letterSpacing: 0.2,
    color: theme.colors.textMuted,
  },
  swatchRow: {
    height: 48,
    marginTop: 4,
    flexGrow: 0,
  },
  swatchContent: {
    gap: 6,
    alignItems: 'center',
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34,16,22,0.35)',
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: theme.colors.accent,
  },
  swatchComplete: {
    opacity: 0.6,
  },
  swatchNumber: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 20,
  },
  swatchCount: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
    opacity: 0.8,
  },
  swatchCheck: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolRow: {
    height: 48,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionRow: {
    height: 56,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  placeBtn: {
    flex: 1,
  },
  nextBtn: {
    width: 104,
    height: 56,
  },
});

export const PaletteTray = memo(PaletteTrayBase);
export default PaletteTray;
