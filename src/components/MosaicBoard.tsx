import React, { memo, useMemo, useRef } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';
import Svg, { G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { BOARD_BORDER, BOARD_PAD, TAP_SLOP } from '../constants/config';
import { theme } from '../constants/theme';
import { pigment } from '../game/catalog';
import type { InputMode, Puzzle } from '../game/types';
import type { useMosaicCamera } from '../hooks/useMosaicCamera';
import type { BoardMetrics } from '../utils/geometry';
import { cellAtPoint, visibleRange } from '../utils/geometry';
import { groutPath, hintPath, placedPaths } from '../utils/mosaicPaths';

type Camera = ReturnType<typeof useMosaicCamera>;

type Props = {
  puzzle: Puzzle;
  placed: Uint8Array;
  metrics: BoardMetrics;
  camera: Camera;
  selectedPigment: number;
  focus: number;
  showGrid: boolean;
  inputMode: InputMode;
  interactive: boolean;
  showClues: boolean;
  onTapCell: (index: number) => void;
};

const UNPLACED = '#2E1419';

function MosaicBoardBase(props: Props) {
  const {
    puzzle,
    placed,
    metrics,
    camera,
    selectedPigment,
    focus,
    showGrid,
    showClues,
  } = props;

  const { cell, gridW, gridH, tx, ty, pan, mode } = camera;

  // Latest values for the gesture handlers, created once (rule: refs in callbacks).
  const latest = useRef(props);
  latest.current = props;
  const startPoint = useRef({ x: 0, y: 0 });

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => latest.current.interactive,
        onMoveShouldSetPanResponder: (_e, g) =>
          latest.current.interactive && (Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4),
        onPanResponderGrant: e => {
          startPoint.current = {
            x: e.nativeEvent.locationX,
            y: e.nativeEvent.locationY,
          };
          latest.current.camera.beginDrag();
        },
        onPanResponderMove: (_e, g) => {
          if (latest.current.inputMode === 'move' || latest.current.camera.mode === 'fit') {
            latest.current.camera.dragBy(g.dx, g.dy);
          }
        },
        onPanResponderRelease: (_e, g) => {
          const cam = latest.current.camera;
          const moved = Math.hypot(g.dx, g.dy);
          if (moved > TAP_SLOP) {
            cam.endDrag();
            return;
          }
          cam.endDrag();
          const index = cellAtPoint(
            startPoint.current.x,
            startPoint.current.y,
            cam.cell,
            cam.tx,
            cam.ty,
            latest.current.puzzle.cols,
            latest.current.puzzle.rows,
          );
          if (index >= 0) {
            latest.current.onTapCell(index);
          }
        },
        onPanResponderTerminate: () => {
          latest.current.camera.endDrag();
        },
      }),
    [],
  );

  const tilePaths = useMemo(() => placedPaths(puzzle, placed, cell, cell >= 14 ? 1 : 0), [
    puzzle,
    placed,
    cell,
  ]);

  const grout = useMemo(
    () => (showGrid && cell >= 12 ? groutPath(puzzle.cols, puzzle.rows, cell) : ''),
    [showGrid, cell, puzzle.cols, puzzle.rows],
  );

  const range = useMemo(
    () => visibleRange(metrics, cell, tx, ty, puzzle.cols, puzzle.rows),
    [metrics, cell, tx, ty, puzzle.cols, puzzle.rows],
  );

  const hint = useMemo(
    () =>
      cell >= 14
        ? hintPath(puzzle, placed, selectedPigment, cell, range.c0, range.c1, range.r0, range.r1)
        : '',
    [cell, puzzle, placed, selectedPigment, range],
  );

  const clues = useMemo(() => {
    if (!showClues || cell < 26) {
      return [];
    }
    const out: Array<{ i: number; x: number; y: number; n: number }> = [];
    for (let r = range.r0; r <= range.r1; r++) {
      for (let c = range.c0; c <= range.c1; c++) {
        const i = r * puzzle.cols + c;
        if (placed[i]) {
          continue;
        }
        out.push({
          i,
          x: c * cell + cell / 2,
          y: r * cell + cell / 2 + cell * 0.19,
          n: puzzle.target[i],
        });
      }
    }
    return out;
  }, [showClues, cell, range, puzzle, placed]);

  const focusCol = focus >= 0 ? focus % puzzle.cols : -1;
  const focusRow = focus >= 0 ? Math.floor(focus / puzzle.cols) : -1;

  return (
    <View
      style={[
        styles.frame,
        { width: metrics.outerW, height: metrics.outerH },
      ]}>
      <View
        style={[styles.viewport, { width: metrics.innerW, height: metrics.innerH }]}
        {...responder.panHandlers}>
        <Animated.View
          pointerEvents="none"
          style={{
            width: gridW,
            height: gridH,
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
          }}>
          <Svg width={gridW} height={gridH}>
            <Rect x={0} y={0} width={gridW} height={gridH} fill={UNPLACED} />
            {grout ? (
              <Path d={grout} stroke={theme.colors.limestone} strokeWidth={1} opacity={0.1} fill="none" />
            ) : null}
            {tilePaths.map(p => (
              <G key={p.pigment}>
                <Path d={p.d} fill={pigment(p.pigment).hex} />
              </G>
            ))}
            {hint ? (
              <Path d={hint} stroke={theme.colors.accent} strokeWidth={1.5} opacity={0.4} fill="none" />
            ) : null}
            {clues.map(c => (
              <SvgText
                key={c.i}
                x={c.x}
                y={c.y}
                fontSize={Math.min(18, cell * 0.42)}
                fontWeight="600"
                fill={theme.colors.textPrimary}
                opacity={0.82}
                textAnchor="middle">
                {String(c.n)}
              </SvgText>
            ))}
            {focus >= 0 && mode === 'detail' ? (
              <Rect
                x={focusCol * cell + 1}
                y={focusRow * cell + 1}
                width={cell - 2}
                height={cell - 2}
                rx={2}
                fill="none"
                stroke={theme.colors.accent}
                strokeWidth={2}
              />
            ) : null}
          </Svg>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: theme.radius.lg,
    borderWidth: BOARD_BORDER,
    borderColor: 'rgba(232,221,196,0.3)',
    padding: BOARD_PAD,
    backgroundColor: 'rgba(60,28,29,0.92)',
    ...theme.shadows.card,
  },
  viewport: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: UNPLACED,
  },
});

export const MosaicBoard = memo(MosaicBoardBase);
export default MosaicBoard;
