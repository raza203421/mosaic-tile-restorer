import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { pigment } from '../game/catalog';
import type { Puzzle } from '../game/types';
import { placedPaths } from '../utils/mosaicPaths';
import { theme } from '../constants/theme';

type Props = {
  puzzle: Puzzle;
  placed: Uint8Array;
  width: number;
  height: number;
  radius?: number;
};

/** Aspect-fit preview built from the same target data as the board. */
function MosaicThumbnailBase({ puzzle, placed, width, height, radius = 8 }: Props) {
  const cell = Math.min(width / puzzle.cols, height / puzzle.rows);
  const gridW = cell * puzzle.cols;
  const gridH = cell * puzzle.rows;

  const paths = useMemo(() => placedPaths(puzzle, placed, cell, 0), [puzzle, placed, cell]);

  return (
    <View style={[styles.root, { width, height, borderRadius: radius }]}>
      <Svg width={gridW} height={gridH}>
        <Rect x={0} y={0} width={gridW} height={gridH} fill="#2E1419" />
        {paths.map(p => (
          <Path key={p.pigment} d={p.d} fill={pigment(p.pigment).hex} />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#2E1419',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});

export const MosaicThumbnail = memo(MosaicThumbnailBase);
export default MosaicThumbnail;
