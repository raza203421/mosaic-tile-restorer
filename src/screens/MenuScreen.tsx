import React, { useCallback, useMemo } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Images, Lock, Settings, Sparkles } from 'lucide-react-native';
import { assets, villaSprites } from '../assets';
import IconButton from '../components/IconButton';
import MosaicThumbnail from '../components/MosaicThumbnail';
import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';
import ScreenShell from '../components/ScreenShell';
import StatCard from '../components/StatCard';
import { BOTTOM_INSET, GUTTER, HIT_SLOP, SCREEN_W, TOTAL_FLOORS } from '../constants/config';
import { theme } from '../constants/theme';
import { FLOORS, VILLAS, floorById, roomById, roomsOfVilla } from '../game/catalog';
import { buildPuzzle, emptyPlaced, fullPlaced } from '../game/puzzles';
import type { Selection } from '../game/progression';
import { isFloorUnlocked, isRoomUnlocked, isVillaUnlocked, restoredInVilla } from '../game/progression';

type Props = {
  completed: number[];
  selection: Selection;
  onSelectVilla: (villaId: number) => void;
  onSelectRoom: (roomId: string) => void;
  onSelectFloor: (floorId: number) => void;
  onStart: () => void;
  onMuseum: () => void;
  onSettings: () => void;
};

const CARD_W = Math.min(248, SCREEN_W - 64);

export default function MenuScreen(props: Props) {
  const {
    completed,
    selection,
    onSelectVilla,
    onSelectRoom,
    onSelectFloor,
    onStart,
    onMuseum,
    onSettings,
  } = props;

  const rooms = useMemo(() => roomsOfVilla(selection.villaId), [selection.villaId]);
  const floors = useMemo(
    () => roomById(selection.roomId).floorIds.map(id => FLOORS[id - 1]),
    [selection.roomId],
  );

  const floor = floorById(selection.floorId);
  const unlocked = isFloorUnlocked(floor.id, completed);
  const restored = completed.indexOf(floor.id) !== -1;
  const villaRestored = restoredInVilla(selection.villaId, completed);

  const cta = !unlocked
    ? 'Complete the previous floor'
    : restored
    ? 'PLAY AGAIN'
    : 'START RESTORING';

  const helper = completed.length
    ? 'Your progress is saved'
    : 'Choose a color, then match its number';

  const renderRoom = useCallback(
    ({ item }: { item: { id: string; name: string } }) => {
      const open = isRoomUnlocked(item.id, completed);
      const active = item.id === selection.roomId;
      return (
        <Pressable
          onPress={() => onSelectRoom(item.id)}
          disabled={!open}
          hitSlop={HIT_SLOP}
          accessibilityRole="button"
          accessibilityState={{ selected: active, disabled: !open }}
          accessibilityLabel={open ? item.name : item.name + ', locked'}
          style={[styles.chip, active ? styles.chipActive : null, !open ? styles.chipLocked : null]}>
          <View style={styles.chipRow}>
            {open ? null : <Lock size={14} color={theme.colors.textMuted} strokeWidth={2.2} />}
            <Text numberOfLines={1} style={[styles.chipText, active ? styles.chipTextActive : null]}>
              {item.name}
            </Text>
          </View>
        </Pressable>
      );
    },
    [completed, onSelectRoom, selection.roomId],
  );

  const renderFloor = useCallback(
    ({ item }: { item: (typeof FLOORS)[number] }) => {
      const open = isFloorUnlocked(item.id, completed);
      const done = completed.indexOf(item.id) !== -1;
      const active = item.id === selection.floorId;
      const puzzle = buildPuzzle(item.id);
      return (
        <Pressable
          onPress={() => onSelectFloor(item.id)}
          disabled={!open}
          hitSlop={HIT_SLOP}
          accessibilityRole="button"
          accessibilityState={{ selected: active, disabled: !open }}
          accessibilityLabel={item.title + (done ? ', restored' : open ? '' : ', locked')}
          style={[styles.floorCard, active ? styles.floorCardActive : null]}>
          <MosaicThumbnail
            puzzle={puzzle}
            placed={done ? fullPlaced(puzzle) : emptyPlaced(puzzle)}
            width={48}
            height={48}
            radius={6}
          />
          <View style={styles.floorText}>
            <Text numberOfLines={2} style={styles.floorTitle}>
              {item.id + '. ' + item.title}
            </Text>
            <Text numberOfLines={1} style={styles.floorMeta}>
              {done ? 'Restored · ' : ''}
              {(done ? item.total : 0) + ' of ' + item.total + ' tiles'}
            </Text>
          </View>
          {open ? null : <Lock size={16} color={theme.colors.textMuted} strokeWidth={2.2} />}
        </Pressable>
      );
    },
    [completed, onSelectFloor, selection.floorId],
  );

  return (
    <ScreenShell variant="menu">
      <ScreenHeader
        title="Villa Map"
        subtitle={completed.length + ' of ' + TOTAL_FLOORS + ' restored'}
        rightSlot={
          <>
            <IconButton Icon={Images} label="Museum" onPress={onMuseum} />
            <IconButton Icon={Settings} label="Settings" onPress={onSettings} />
          </>
        }
      />

      <View style={styles.map}>
        <View style={styles.villaRow}>
          {VILLAS.map((villa, index) => {
            const open = isVillaUnlocked(villa.id, completed);
            const active = villa.id === selection.villaId;
            const doneHere = restoredInVilla(villa.id, completed);
            return (
              <Pressable
                key={villa.id}
                onPress={() => onSelectVilla(villa.id)}
                disabled={!open}
                hitSlop={HIT_SLOP}
                accessibilityRole="button"
                accessibilityState={{ selected: active, disabled: !open }}
                accessibilityLabel={villa.name + ', ' + doneHere + ' of ' + villa.floorIds.length}
                style={[
                  styles.villaSlot,
                  { marginTop: index * 18 },
                ]}>
                <LinearGradient
                  colors={theme.gradients.stone}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.villaCard, active ? styles.villaCardActive : null]}>
                  <Image source={villaSprites[index]} style={styles.villaSprite} resizeMode="contain" />
                  <Text numberOfLines={2} style={styles.villaName}>
                    {villa.name}
                  </Text>
                  <Text style={styles.villaCount}>
                    {doneHere + '/' + villa.floorIds.length}
                  </Text>
                  {open ? null : (
                    <View style={styles.villaLock}>
                      <Lock size={14} color={theme.colors.textMuted} strokeWidth={2.2} />
                    </View>
                  )}
                </LinearGradient>
              </Pressable>
            );
          })}
        </View>

        {completed.length > 0 && villaRestored > 0 ? (
          <View style={styles.statsRow}>
            <View style={styles.statSlot}>
              <StatCard
                Icon={Sparkles}
                value={String(completed.length)}
                label="floors restored"
                valueColor={theme.colors.olive}
              />
            </View>
            <View style={styles.statSlot}>
              <StatCard
                Icon={Sparkles}
                value={String(villaRestored)}
                label="in this villa"
                valueColor={theme.colors.ochre}
              />
            </View>
          </View>
        ) : null}

        <View pointerEvents="none" style={styles.decor}>
          <Image source={assets.sprite4} style={styles.decorImage} resizeMode="contain" />
        </View>
      </View>

      <LinearGradient
        colors={['#653128', '#4A231D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.sheet}>
        <Text numberOfLines={1} style={styles.sheetTitle}>
          {VILLAS[selection.villaId - 1].name}
        </Text>

        <FlatList
          data={rooms}
          horizontal
          keyExtractor={item => item.id}
          renderItem={renderRoom}
          showsHorizontalScrollIndicator={false}
          style={styles.chipRowList}
          contentContainerStyle={styles.chipContent}
        />

        <FlatList
          data={floors}
          horizontal
          keyExtractor={item => String(item.id)}
          renderItem={renderFloor}
          showsHorizontalScrollIndicator={false}
          style={styles.floorList}
          contentContainerStyle={styles.floorContent}
          initialNumToRender={3}
        />

        <Text numberOfLines={1} style={styles.helper}>
          {helper}
        </Text>

        <PrimaryButton label={cta} onPress={onStart} disabled={!unlocked} />
      </LinearGradient>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    paddingHorizontal: GUTTER,
    paddingTop: 16,
    justifyContent: 'flex-start',
  },
  villaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  villaSlot: {
    flex: 1,
    minHeight: 64,
  },
  villaCard: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(232,221,196,0.18)',
    alignItems: 'center',
    ...theme.shadows.card,
  },
  villaCardActive: {
    borderColor: theme.colors.accent,
    borderWidth: 2,
  },
  villaSprite: {
    width: 56,
    height: 56,
    marginBottom: 6,
  },
  villaName: {
    ...theme.typography.caption,
    textTransform: 'none',
    letterSpacing: 0.2,
    fontSize: 12,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  villaCount: {
    ...theme.typography.caption,
    color: theme.colors.ochre,
    marginTop: 4,
  },
  villaLock: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  statSlot: {
    flex: 1,
  },
  decor: {
    position: 'absolute',
    left: 18,
    bottom: 10,
    width: 72,
    height: 72,
    opacity: 0.5,
  },
  decorImage: {
    width: '100%',
    height: '100%',
  },
  sheet: {
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(232,221,196,0.2)',
    padding: 12,
    paddingBottom: 12 + BOTTOM_INSET,
    ...theme.shadows.tray,
  },
  sheetTitle: {
    ...theme.typography.cardTitle,
    color: theme.colors.textPrimary,
    height: 20,
  },
  chipRowList: {
    height: 48,
    marginTop: 8,
    flexGrow: 0,
  },
  chipContent: {
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    height: 48,
    minWidth: 96,
    paddingHorizontal: 14,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(232,221,196,0.22)',
    backgroundColor: 'rgba(34,16,22,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipActive: {
    borderColor: theme.colors.accent,
    borderWidth: 2,
    backgroundColor: 'rgba(171,42,88,0.45)',
  },
  chipLocked: {
    opacity: 0.55,
  },
  chipText: {
    ...theme.typography.caption,
    textTransform: 'none',
    fontSize: 13,
    letterSpacing: 0.2,
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  floorList: {
    height: 64,
    marginTop: 8,
    flexGrow: 0,
  },
  floorContent: {
    gap: 8,
    alignItems: 'center',
  },
  floorCard: {
    width: CARD_W,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(232,221,196,0.18)',
    backgroundColor: 'rgba(34,16,22,0.55)',
  },
  floorCardActive: {
    borderColor: theme.colors.accent,
    borderWidth: 2,
  },
  floorText: {
    flex: 1,
  },
  floorTitle: {
    ...theme.typography.caption,
    textTransform: 'none',
    letterSpacing: 0.1,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  floorMeta: {
    ...theme.typography.caption,
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  helper: {
    ...theme.typography.caption,
    textTransform: 'none',
    fontSize: 13,
    letterSpacing: 0.2,
    color: theme.colors.textMuted,
    height: 18,
    marginTop: 8,
    marginBottom: 8,
  },
});
