import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, ChevronLeft, ChevronRight, Lock } from 'lucide-react-native';
import IconButton from '../components/IconButton';
import MosaicThumbnail from '../components/MosaicThumbnail';
import ScreenHeader from '../components/ScreenHeader';
import ScreenShell from '../components/ScreenShell';
import SecondaryButton from '../components/SecondaryButton';
import { BOTTOM_INSET, GUTTER, HIT_SLOP, SCREEN_W, TOTAL_FLOORS } from '../constants/config';
import { theme } from '../constants/theme';
import { FLOORS } from '../game/catalog';
import { buildPuzzle, emptyPlaced, fullPlaced } from '../game/puzzles';

type Props = {
  completed: number[];
  onBack: () => void;
  onOpenArtwork: (floorId: number) => void;
  onFocusFloor: (floorId: number) => void;
  onStartRestoring: () => void;
};

const FILTERS = [
  { id: 0, label: 'All' },
  { id: 1, label: 'Sun' },
  { id: 2, label: 'Vines' },
  { id: 3, label: 'Tides' },
];

const CARD_W = (SCREEN_W - 40) / 2;

export default function MuseumScreen(props: Props) {
  const { completed, onBack, onOpenArtwork, onFocusFloor, onStartRestoring } = props;

  const [filter, setFilter] = useState(0);
  const [page, setPage] = useState(0);

  const showIntro = completed.length === 0;
  const rowsPerPage = showIntro ? 2 : 3;
  const pageSize = rowsPerPage * 2;

  const items = useMemo(
    () => (filter === 0 ? FLOORS : FLOORS.filter(f => f.villaId === filter)),
    [filter],
  );

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const slice = items.slice(current * pageSize, current * pageSize + pageSize);

  const rows = useMemo(() => {
    const out: Array<typeof slice> = [];
    for (let i = 0; i < rowsPerPage; i++) {
      out.push(slice.slice(i * 2, i * 2 + 2));
    }
    return out;
  }, [slice, rowsPerPage]);

  const pickFilter = useCallback((id: number) => {
    setFilter(id);
    setPage(0);
  }, []);

  const openCard = useCallback(
    (floorId: number, restored: boolean) => {
      if (restored) {
        onOpenArtwork(floorId);
      } else {
        onFocusFloor(floorId);
      }
    },
    [onFocusFloor, onOpenArtwork],
  );

  return (
    <ScreenShell variant="museum">
      <ScreenHeader
        title="Museum"
        subtitle={completed.length + ' of ' + TOTAL_FLOORS + ' restored'}
        leftSlot={<IconButton Icon={ArrowLeft} label="Back" onPress={onBack} />}
      />

      <View style={styles.body}>
        <View style={styles.filters}>
          {FILTERS.map(f => {
            const active = f.id === filter;
            return (
              <Pressable
                key={f.id}
                onPress={() => pickFilter(f.id)}
                hitSlop={HIT_SLOP}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={'Show ' + f.label}
                style={[styles.filterChip, active ? styles.filterChipActive : null]}>
                <Text style={[styles.filterText, active ? styles.filterTextActive : null]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {showIntro ? (
          <View style={styles.intro}>
            <Text style={styles.introText}>Your restored floors will appear here</Text>
            <SecondaryButton label="START RESTORING" onPress={onStartRestoring} />
          </View>
        ) : null}

        <View style={styles.gallery}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.galleryRow}>
              {row.map(item => {
                const restored = completed.indexOf(item.id) !== -1;
                const puzzle = buildPuzzle(item.id);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => openCard(item.id, restored)}
                    hitSlop={HIT_SLOP}
                    accessibilityRole="button"
                    accessibilityLabel={
                      item.title + (restored ? ', restored' : ', not restored')
                    }
                    style={styles.card}>
                    <MosaicThumbnail
                      puzzle={puzzle}
                      placed={restored ? fullPlaced(puzzle) : emptyPlaced(puzzle)}
                      width={64}
                      height={64}
                      radius={6}
                    />
                    <Text numberOfLines={2} style={styles.cardName}>
                      {item.id + '. ' + item.title}
                    </Text>
                    {restored ? (
                      <Text style={styles.cardState}>Restored</Text>
                    ) : (
                      <View style={styles.cardLocked}>
                        <Lock size={12} color={theme.colors.textMuted} strokeWidth={2.2} />
                        <Text style={styles.cardState}>Not restored</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
              {row.length === 1 ? <View style={styles.cardFiller} /> : null}
            </View>
          ))}
        </View>

        <View style={styles.pager}>
          <IconButton
            Icon={ChevronLeft}
            label="Previous page"
            onPress={() => setPage(p => Math.max(0, p - 1))}
            disabled={current === 0}
          />
          <Text style={styles.pageText}>
            {'Page ' + (current + 1) + ' of ' + pageCount}
          </Text>
          <IconButton
            Icon={ChevronRight}
            label="Next page"
            onPress={() => setPage(p => Math.min(pageCount - 1, p + 1))}
            disabled={current >= pageCount - 1}
          />
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: GUTTER,
    paddingTop: 12,
    paddingBottom: BOTTOM_INSET,
  },
  filters: {
    height: 48,
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flex: 1,
    height: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(232,221,196,0.22)',
    backgroundColor: 'rgba(34,16,22,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    borderColor: theme.colors.accent,
    borderWidth: 2,
    backgroundColor: 'rgba(171,42,88,0.45)',
  },
  filterText: {
    ...theme.typography.caption,
    textTransform: 'none',
    fontSize: 13,
    letterSpacing: 0.2,
    color: theme.colors.textSecondary,
  },
  filterTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  intro: {
    marginTop: 12,
    gap: 8,
  },
  introText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  gallery: {
    flex: 1,
    marginTop: 12,
    gap: 8,
  },
  galleryRow: {
    flex: 1,
    minHeight: 96,
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
    height: '100%',
    minHeight: 96,
    maxWidth: CARD_W,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(232,221,196,0.18)',
    backgroundColor: 'rgba(89,44,38,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 6,
  },
  cardFiller: {
    flex: 1,
  },
  cardName: {
    ...theme.typography.caption,
    textTransform: 'none',
    fontSize: 12,
    letterSpacing: 0.1,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  cardState: {
    ...theme.typography.caption,
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  cardLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pager: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  pageText: {
    ...theme.typography.caption,
    textTransform: 'none',
    fontSize: 14,
    letterSpacing: 0.2,
    color: theme.colors.textSecondary,
  },
});
