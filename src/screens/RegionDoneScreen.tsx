import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import PrimaryButton from '../components/PrimaryButton';
import ProgressRing from '../components/ProgressRing';
import { BOTTOM_INSET, GUTTER, REGION_SHEET_AUTO_MS } from '../constants/config';
import { theme } from '../constants/theme';
import { pigment } from '../game/catalog';
import type { RegionEvent } from '../game/types';

type Props = {
  event: RegionEvent;
  reduceMotion: boolean;
  onContinue: () => void;
};

/** One-shot region feedback over the untouched canvas. */
export default function RegionDoneScreen({ event, reduceMotion, onContinue }: Props) {
  const fade = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: reduceMotion ? 150 : 180,
      useNativeDriver: true,
    }).start();

    if (!reduceMotion) {
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1.04, duration: 110, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 1, duration: 110, useNativeDriver: true }),
      ]).start();
    }

    const timer = setTimeout(onContinue, REGION_SHEET_AUTO_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const p = pigment(event.pigment);

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.scrim, { opacity: fade }]} />
      <Animated.View style={[styles.sheetWrap, { opacity: fade }]} pointerEvents="box-none">
        <LinearGradient
          colors={['#592C26', '#3A1A1C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sheet}>
          <Text style={styles.title}>Region restored</Text>
          <Text style={styles.detail}>
            {event.pigment + ' ' + p.name + ' / ' + event.cells + ' tiles'}
          </Text>

          <Animated.View style={[styles.ring, { transform: [{ scale: bounce }] }]}>
            <ProgressRing value={event.progress} size={96} strokeWidth={8} caption="floor" />
          </Animated.View>

          <Text style={styles.regions}>
            {event.regionsDone + ' of ' + event.totalRegions + ' regions complete'}
          </Text>

          <View style={styles.action}>
            <PrimaryButton label="CONTINUE" onPress={onContinue} />
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34,16,22,0.7)',
  },
  sheetWrap: {
    paddingHorizontal: GUTTER,
    paddingBottom: BOTTOM_INSET + 16,
  },
  sheet: {
    minHeight: 224,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(232,221,196,0.25)',
    padding: 20,
    alignItems: 'center',
    ...theme.shadows.card,
  },
  title: {
    ...theme.typography.section,
    color: theme.colors.textPrimary,
  },
  detail: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  ring: {
    marginTop: 14,
  },
  regions: {
    ...theme.typography.caption,
    textTransform: 'none',
    fontSize: 13,
    letterSpacing: 0.2,
    color: theme.colors.textMuted,
    marginTop: 10,
  },
  action: {
    width: '100%',
    marginTop: 16,
  },
});
