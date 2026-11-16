import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ArrowLeft, Hand, Maximize, Minus, Paintbrush, Plus } from 'lucide-react-native';
import IconButton from '../components/IconButton';
import MosaicBoard from '../components/MosaicBoard';
import ScreenHeader from '../components/ScreenHeader';
import ScreenShell from '../components/ScreenShell';
import {
  BOTTOM_INSET,
  GUTTER,
  HEADER_CONTENT_H,
  SCREEN_H,
  SCREEN_W,
  TOP_INSET,
} from '../constants/config';
import { theme } from '../constants/theme';
import { floorById, roomById, villaById } from '../game/catalog';
import { buildPuzzle, fullPlaced } from '../game/puzzles';
import type { InputMode } from '../game/types';
import { useMosaicCamera } from '../hooks/useMosaicCamera';
import { boardMetrics } from '../utils/geometry';

type Props = {
  floorId: number;
  reduceMotion: boolean;
  onBack: () => void;
};

const TRAY_BLOCK = 64 + 24 + 12;
const ESTIMATED_H = Math.max(180, SCREEN_H - TOP_INSET - HEADER_CONTENT_H - TRAY_BLOCK - 16);

export default function ArtworkScreen({ floorId, reduceMotion, onBack }: Props) {
  const floor = floorById(floorId);
  const room = roomById(floor.roomId);
  const villa = villaById(floor.villaId);

  const puzzle = useMemo(() => buildPuzzle(floorId), [floorId]);
  const placed = useMemo(() => fullPlaced(puzzle), [puzzle]);

  const [area, setArea] = useState({ w: SCREEN_W - 2 * GUTTER, h: ESTIMATED_H });
  const [inputMode, setInputMode] = useState<InputMode>('move');

  const metrics = useMemo(() => boardMetrics(area.w, area.h), [area]);
  const camera = useMosaicCamera(metrics, puzzle.cols, puzzle.rows, reduceMotion);

  const onLayoutArea = useCallback(
    (e: { nativeEvent: { layout: { width: number; height: number } } }) => {
      const w = Math.max(120, e.nativeEvent.layout.width - 2 * GUTTER);
      const h = Math.max(120, e.nativeEvent.layout.height - 8 - TRAY_BLOCK);
      setArea(prev => (Math.abs(prev.w - w) < 2 && Math.abs(prev.h - h) < 2 ? prev : { w, h }));
    },
    [],
  );

  const handleTap = useCallback(
    (index: number) => {
      if (camera.mode === 'fit') {
        camera.enterDetail(index);
      }
    },
    [camera],
  );

  return (
    <ScreenShell variant="game">
      <ScreenHeader
        compact
        title={floor.id + '. ' + floor.title}
        subtitle={'Restored · ' + villa.name + ' / ' + room.name}
        leftSlot={<IconButton Icon={ArrowLeft} label="Back" onPress={onBack} />}
      />

      <View style={styles.boardArea} onLayout={onLayoutArea}>
        <MosaicBoard
          puzzle={puzzle}
          placed={placed}
          metrics={metrics}
          camera={camera}
          selectedPigment={0}
          focus={-1}
          showGrid={false}
          inputMode={inputMode}
          interactive
          showClues={false}
          onTapCell={handleTap}
        />
      </View>

      <View style={styles.tray}>
        <IconButton Icon={Minus} label="Zoom out" onPress={() => camera.zoomOut(0)} disabled={!camera.canZoomOut} />
        <IconButton Icon={Plus} label="Zoom in" onPress={() => camera.zoomIn(0)} disabled={!camera.canZoomIn} />
        <IconButton Icon={Maximize} label="Fit whole floor" onPress={camera.toFit} />
        <IconButton
          Icon={inputMode === 'move' ? Hand : Paintbrush}
          label={inputMode === 'move' ? 'Move mode' : 'View mode'}
          onPress={() => setInputMode(m => (m === 'move' ? 'paint' : 'move'))}
          selected={inputMode === 'move'}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  boardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: GUTTER,
    paddingTop: 8,
    paddingBottom: TRAY_BLOCK,
  },
  tray: {
    position: 'absolute',
    left: GUTTER,
    right: GUTTER,
    bottom: 24 + BOTTOM_INSET,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(232,221,196,0.22)',
    backgroundColor: 'rgba(89,44,38,0.92)',
    paddingHorizontal: 12,
    ...theme.shadows.tray,
  },
});
