import React, { memo, useMemo } from 'react';
import { ImageBackground, StatusBar, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { G, Line, Rect } from 'react-native-svg';
import { assets } from '../assets';
import { SCREEN_H, SCREEN_W } from '../constants/config';
import { theme } from '../constants/theme';

export type ShellVariant = 'loader' | 'menu' | 'game' | 'result' | 'museum';

const GRADIENTS: Record<ShellVariant, string[]> = {
  loader: theme.gradients.loader,
  menu: theme.gradients.menu,
  game: theme.gradients.game,
  result: theme.gradients.result,
  museum: theme.gradients.museum,
};

const OPACITY: Record<ShellVariant, number> = {
  loader: 0.93,
  menu: 0.78,
  game: 0.9,
  result: 0.82,
  museum: 0.88,
};

const START: Record<ShellVariant, { x: number; y: number }> = {
  loader: { x: 0.5, y: 0 },
  menu: { x: 0, y: 0 },
  game: { x: 0.5, y: 0 },
  result: { x: 0, y: 0 },
  museum: { x: 0, y: 0 },
};

const END: Record<ShellVariant, { x: number; y: number }> = {
  loader: { x: 0.5, y: 1 },
  menu: { x: 1, y: 1 },
  game: { x: 0.5, y: 1 },
  result: { x: 1, y: 1 },
  museum: { x: 1, y: 1 },
};

/** Low-contrast grout / meander layer, drawn once per variant. */
const StoneDecor = memo(function StoneDecor({ variant }: { variant: ShellVariant }) {
  const cells = useMemo(() => {
    const size = 48;
    const cols = Math.ceil(SCREEN_W / size) + 1;
    const rows = Math.ceil(SCREEN_H / size) + 1;
    const out: Array<{ x: number; y: number }> = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((r + c) % 2 === 0) {
          out.push({ x: c * size, y: r * size });
        }
      }
    }
    return out;
  }, []);

  const strength = variant === 'loader' ? 0.06 : variant === 'game' ? 0.05 : 0.09;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={SCREEN_W} height={SCREEN_H}>
        <G opacity={strength}>
          {cells.map((c, i) => (
            <Rect
              key={i}
              x={c.x + 4}
              y={c.y + 4}
              width={40}
              height={40}
              rx={4}
              fill="none"
              stroke={theme.colors.limestone}
              strokeWidth={1}
            />
          ))}
        </G>
        <G opacity={strength * 1.4}>
          <Line
            x1={0}
            y1={SCREEN_H * 0.33}
            x2={SCREEN_W}
            y2={SCREEN_H * 0.33}
            stroke={theme.colors.ochre}
            strokeWidth={1}
          />
          <Line
            x1={0}
            y1={SCREEN_H * 0.67}
            x2={SCREEN_W}
            y2={SCREEN_H * 0.67}
            stroke={theme.colors.terracotta}
            strokeWidth={1}
          />
        </G>
      </Svg>
    </View>
  );
});

type Props = {
  variant: ShellVariant;
  children: React.ReactNode;
};

function ScreenShellBase({ variant, children }: Props) {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ImageBackground source={assets.bgGame} style={StyleSheet.absoluteFill} resizeMode="cover">
        <LinearGradient
          colors={GRADIENTS[variant]}
          start={START[variant]}
          end={END[variant]}
          style={[StyleSheet.absoluteFill, { opacity: OPACITY[variant] }]}
        />
        <StoneDecor variant={variant} />
      </ImageBackground>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
});

export const ScreenShell = memo(ScreenShellBase);
export default ScreenShell;
