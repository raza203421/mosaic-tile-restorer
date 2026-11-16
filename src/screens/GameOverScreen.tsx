import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { Home, Sparkles } from 'lucide-react-native';
import { assets } from '../assets';
import IconButton from '../components/IconButton';
import MosaicThumbnail from '../components/MosaicThumbnail';
import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';
import ScreenShell from '../components/ScreenShell';
import SecondaryButton from '../components/SecondaryButton';
import StatCard from '../components/StatCard';
import { BOTTOM_INSET, GUTTER, SCREEN_H, SCREEN_W } from '../constants/config';
import { theme } from '../constants/theme';
import { floorById, roomById, villaById } from '../game/catalog';
import { buildPuzzle, fullPlaced } from '../game/puzzles';

type Props = {
  floorId: number;
  completedCount: number;
  nextFloorId: number | null;
  reduceMotion: boolean;
  onNextFloor: () => void;
  onPlayAgain: () => void;
  onMenu: () => void;
  onArtwork: () => void;
};

const PARTICLE_COLORS = [
  theme.colors.ochre,
  theme.colors.terracotta,
  theme.colors.lapis,
  theme.colors.olive,
  theme.colors.chalk,
  theme.colors.limestone,
  theme.colors.rose,
  theme.colors.accent,
];

const SHOW_STATS = SCREEN_H >= 700;

export default function GameOverScreen(props: Props) {
  const {
    floorId,
    completedCount,
    nextFloorId,
    reduceMotion,
    onNextFloor,
    onPlayAgain,
    onMenu,
    onArtwork,
  } = props;

  const floor = floorById(floorId);
  const room = roomById(floor.roomId);
  const villa = villaById(floor.villaId);
  const puzzle = useMemo(() => buildPuzzle(floorId), [floorId]);
  const placed = useMemo(() => fullPlaced(puzzle), [puzzle]);

  const [frame, setFrame] = useState({ w: Math.min(SCREEN_W - 64, 380), h: 200 });

  const reveal = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const bounce = useRef(new Animated.Value(1)).current;
  const sparkle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      sparkle.setValue(0);
      return;
    }
    Animated.timing(reveal, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    Animated.sequence([
      Animated.timing(bounce, { toValue: 1.03, duration: 110, useNativeDriver: true }),
      Animated.timing(bounce, { toValue: 1, duration: 110, useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.timing(sparkle, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(sparkle, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLayoutFrame = useCallback(
    (e: { nativeEvent: { layout: { width: number; height: number } } }) => {
      const { width, height } = e.nativeEvent.layout;
      const w = Math.min(width, 380);
      const h = Math.max(96, height);
      setFrame(prev => (Math.abs(prev.w - w) < 2 && Math.abs(prev.h - h) < 2 ? prev : { w, h }));
    },
    [],
  );

  const inner = {
    w: Math.max(60, frame.w - 24),
    h: Math.max(60, frame.h - 24),
  };

  return (
    <ScreenShell variant="result">
      <ScreenHeader
        title="Floor restored"
        subtitle={villa.name + ' / ' + room.name}
        leftSlot={<IconButton Icon={Home} label="Villa Map" onPress={onMenu} />}
      />

      <View style={styles.body}>
        <View style={styles.artworkArea} onLayout={onLayoutFrame}>
          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.artFrame,
              { opacity: reveal, transform: [{ scale: bounce }] },
            ]}>
            <MosaicThumbnail
              puzzle={puzzle}
              placed={placed}
              width={inner.w}
              height={inner.h}
              radius={8}
            />
            <View pointerEvents="none" style={styles.particles}>
              {PARTICLE_COLORS.map((c, i) => (
                <Animated.View
                  key={c + i}
                  style={[
                    styles.particle,
                    {
                      backgroundColor: c,
                      left: 18 + ((i * 37) % Math.max(40, inner.w - 36)),
                      top: 14 + ((i * 53) % Math.max(40, inner.h - 30)),
                      opacity: sparkle,
                    },
                  ]}
                />
              ))}
            </View>
          </Animated.View>
          <View pointerEvents="none" style={styles.laurel}>
            <Image source={assets.sprite5} style={styles.laurelImage} resizeMode="contain" />
          </View>
        </View>

        <Text numberOfLines={2} style={styles.floorTitle}>
          {floor.id + '. ' + floor.title}
        </Text>
        <Text style={styles.meta}>{villa.name + ' / ' + room.name}</Text>
        <Text style={styles.museumLine}>
          {SHOW_STATS
            ? 'Added to your museum'
            : 'Added to your museum · ' + completedCount + ' floors restored'}
        </Text>

        {SHOW_STATS && completedCount > 0 && puzzle.regionCount > 0 ? (
          <View style={styles.statsRow}>
            <View style={styles.statSlot}>
              <StatCard
                Icon={Sparkles}
                value={String(completedCount)}
                label="floors restored"
                valueColor={theme.colors.olive}
              />
            </View>
            <View style={styles.statSlot}>
              <StatCard
                Icon={Sparkles}
                value={String(puzzle.regionCount)}
                label="regions here"
                valueColor={theme.colors.ochre}
              />
            </View>
          </View>
        ) : null}

        <View style={styles.actions}>
          <PrimaryButton
            label={nextFloorId ? 'NEXT FLOOR' : 'VIEW MUSEUM'}
            onPress={onNextFloor}
          />
          <SecondaryButton label="PLAY AGAIN" onPress={onPlayAgain} />
          <View style={styles.actionRow}>
            <SecondaryButton label="VILLA MAP" onPress={onMenu} style={styles.half} />
            <SecondaryButton label="VIEW ARTWORK" onPress={onArtwork} style={styles.half} />
          </View>
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
  artworkArea: {
    flex: 1,
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artFrame: {
    padding: 12,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: 'rgba(232,221,196,0.35)',
    backgroundColor: 'rgba(60,28,29,0.9)',
    ...theme.shadows.card,
  },
  particles: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  laurel: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 56,
    height: 56,
    opacity: 0.55,
  },
  laurelImage: {
    width: '100%',
    height: '100%',
  },
  floorTitle: {
    ...theme.typography.section,
    color: theme.colors.textPrimary,
    marginTop: 12,
  },
  meta: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  museumLine: {
    ...theme.typography.body,
    color: theme.colors.accent,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  statSlot: {
    flex: 1,
  },
  actions: {
    marginTop: 14,
    gap: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  half: {
    flex: 1,
  },
});
