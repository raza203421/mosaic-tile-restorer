import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { assets } from '../assets';
import ScreenShell from '../components/ScreenShell';
import { LOADER_DURATION_MS, LOADER_PROGRESS_MS, TOP_INSET } from '../constants/config';
import { theme } from '../constants/theme';

type Props = {
  onDone: () => void;
  reduceMotion: boolean;
};

const BAR_W = 180;

export default function LoaderScreen({ onDone, reduceMotion }: Props) {
  const logoIn = useRef(new Animated.Value(0)).current;
  const titleIn = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0.001)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(logoIn, {
      toValue: 1,
      duration: reduceMotion ? 150 : 220,
      useNativeDriver: true,
    }).start();

    Animated.timing(titleIn, {
      toValue: 1,
      duration: 200,
      delay: 120,
      useNativeDriver: true,
    }).start();

    Animated.timing(progress, {
      toValue: 1,
      duration: LOADER_PROGRESS_MS,
      useNativeDriver: true,
    }).start();

    const exit = setTimeout(() => {
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, LOADER_PROGRESS_MS);

    const finish = setTimeout(onDone, LOADER_DURATION_MS);

    return () => {
      clearTimeout(exit);
      clearTimeout(finish);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logoScale = logoIn.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] });
  const barShift = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-BAR_W / 2, 0],
  });

  return (
    <ScreenShell variant="loader">
      <Animated.View pointerEvents="box-none" style={[styles.root, { opacity: fadeOut }]}>
        <View style={styles.spacerTop} />

        <Animated.View
          style={[styles.medallion, { opacity: logoIn, transform: [{ scale: logoScale }] }]}>
          <Image source={assets.logo} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        <Animated.View style={[styles.titleBlock, { opacity: titleIn }]}>
          <Text style={styles.title}>MOSAIC TILE</Text>
          <Text style={styles.title}>RESTORER</Text>
          <Text style={styles.subtitle}>Bring ancient floors to light</Text>
        </Animated.View>

        <View style={styles.progressBlock}>
          <View style={styles.track}>
            <Animated.View
              style={[
                styles.fill,
                { transform: [{ translateX: barShift }, { scaleX: progress }] },
              ]}
            />
          </View>
          <Text style={styles.loading}>LOADING...</Text>
        </View>

        <View style={styles.spacerBottom} />
      </Animated.View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    paddingTop: TOP_INSET,
    paddingHorizontal: 24,
  },
  spacerTop: {
    flex: 1,
  },
  spacerBottom: {
    flex: 1,
  },
  medallion: {
    width: 144,
    height: 144,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(89,44,38,0.9)',
    borderWidth: 2,
    borderColor: 'rgba(232,221,196,0.28)',
    ...theme.shadows.card,
  },
  logo: {
    width: 112,
    height: 112,
  },
  titleBlock: {
    marginTop: 28,
    alignItems: 'center',
    maxWidth: 296,
  },
  title: {
    ...theme.typography.hero,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 10,
    textAlign: 'center',
  },
  progressBlock: {
    marginTop: 36,
    alignItems: 'center',
  },
  track: {
    width: BAR_W,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.stone,
    borderWidth: 1,
    borderColor: 'rgba(232,221,196,0.2)',
    overflow: 'hidden',
  },
  fill: {
    width: BAR_W,
    height: '100%',
    borderRadius: 3,
    backgroundColor: theme.colors.accent,
  },
  loading: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 10,
  },
});
