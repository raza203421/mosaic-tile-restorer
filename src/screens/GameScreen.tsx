import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { Home, Pause } from 'lucide-react-native';
import IconButton from '../components/IconButton';
import MosaicBoard from '../components/MosaicBoard';
import PaletteTray from '../components/PaletteTray';
import PrimaryButton from '../components/PrimaryButton';
import ProgressRing from '../components/ProgressRing';
import ScreenHeader from '../components/ScreenHeader';
import ScreenShell from '../components/ScreenShell';
import SecondaryButton from '../components/SecondaryButton';
import {
  BOTTOM_INSET,
  GUTTER,
  HEADER_CONTENT_H,
  SCREEN_H,
  SCREEN_W,
  TOP_INSET,
  TRAY_BOTTOM_OFFSET,
  TRAY_RESERVED,
} from '../constants/config';
import { theme } from '../constants/theme';
import { floorById, roomById, villaById } from '../game/catalog';
import type { Settings } from '../game/progression';
import type { InputMode, PigmentId, RegionEvent } from '../game/types';
import { useMosaicCamera } from '../hooks/useMosaicCamera';
import { useRestorationSession } from '../hooks/useRestorationSession';
import { boardMetrics } from '../utils/geometry';

type Props = {
  floorId: number;
  settings: Settings;
  tutorialSeen: boolean;
  onTutorialDone: () => void;
  onHome: () => void;
  onSettings: () => void;
  onRegionDone: (event: RegionEvent) => void;
  onGameOver: () => void;
};

const ESTIMATED_H = Math.max(
  180,
  SCREEN_H - TOP_INSET - HEADER_CONTENT_H - TRAY_RESERVED - 16,
);
const TRAY_W = SCREEN_W - 2 * GUTTER;

export default function GameScreen(props: Props) {
  const {
    floorId,
    settings,
    tutorialSeen,
    onTutorialDone,
    onHome,
    onSettings,
    onRegionDone,
    onGameOver,
  } = props;

  const floor = floorById(floorId);
  const room = roomById(floor.roomId);
  const villa = villaById(floor.villaId);

  const [area, setArea] = useState({ w: SCREEN_W - 2 * GUTTER, h: ESTIMATED_H });
  const [inputMode, setInputMode] = useState<InputMode>('paint');
  const [paused, setPaused] = useState(false);
  const [showHelp, setShowHelp] = useState(!tutorialSeen && floorId === 1);

  const session = useRestorationSession(floorId, {
    onRegionDone,
    onFloorComplete: onGameOver,
  });
  const { puzzle, placed, selected, focus, notice, remaining, done, progress } = session;

  const metrics = React.useMemo(() => boardMetrics(area.w, area.h), [area]);
  const camera = useMosaicCamera(metrics, puzzle.cols, puzzle.rows, settings.reduceMotion);

  const guided = useRef(false);

  useEffect(() => {
    if (guided.current) {
      guided.current = false;
      camera.ensureVisible(focus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setPaused(true);
      return true;
    });
    return () => sub.remove();
  }, []);

  // The measured view carries its own padding, so the content box is derived
  // from the same constants used in the stylesheet.
  const onLayoutArea = useCallback(
    (e: { nativeEvent: { layout: { width: number; height: number } } }) => {
      const w = Math.max(120, e.nativeEvent.layout.width - 2 * GUTTER);
      const h = Math.max(120, e.nativeEvent.layout.height - 8 - TRAY_RESERVED);
      setArea(prev => (Math.abs(prev.w - w) < 2 && Math.abs(prev.h - h) < 2 ? prev : { w, h }));
    },
    [],
  );

  const handleTapCell = useCallback(
    (index: number) => {
      if (camera.mode === 'fit') {
        camera.enterDetail(index);
        return;
      }
      if (inputMode === 'paint') {
        session.place(index);
      }
    },
    [camera, inputMode, session],
  );

  const handlePlace = useCallback(() => {
    guided.current = true;
    if (camera.mode === 'fit') {
      camera.enterDetail(focus);
    }
    session.placeFocused();
  }, [camera, focus, session]);

  const handleNext = useCallback(() => {
    guided.current = true;
    const cell = session.focusNext();
    if (cell >= 0 && camera.mode === 'fit') {
      camera.enterDetail(cell);
    }
  }, [camera, session]);

  const handleSelect = useCallback(
    (id: PigmentId) => {
      guided.current = true;
      session.selectPigment(id);
    },
    [session],
  );

  const toggleMode = useCallback(() => {
    setInputMode(m => (m === 'paint' ? 'move' : 'paint'));
  }, []);

  const zoomIn = useCallback(() => camera.zoomIn(focus), [camera, focus]);
  const zoomOut = useCallback(() => camera.zoomOut(focus), [camera, focus]);

  const modeLabel =
    (camera.mode === 'fit' ? 'Overview' : 'Detail') + ' · ' + (inputMode === 'move' ? 'Move' : 'Paint');
  const status = notice
    ? notice
    : camera.mode === 'fit'
    ? modeLabel + ' · tap the floor to zoom in'
    : modeLabel + ' · ' + session.focusDescription;

  return (
    <ScreenShell variant="game">
      <ScreenHeader
        compact
        title={floor.id + '. ' + floor.title}
        subtitle={room.name + ' / ' + villa.name}
        leftSlot={<IconButton Icon={Home} label="Save and open Villa Map" onPress={onHome} />}
        rightSlot={
          <>
            <ProgressRing value={progress} size={40} strokeWidth={5} />
            <IconButton Icon={Pause} label="Pause" onPress={() => setPaused(true)} />
          </>
        }
      />

      <View style={styles.tileCount}>
        <Text style={styles.tileCountText}>
          {done + ' of ' + puzzle.total + ' tiles placed'}
        </Text>
      </View>

      <View style={styles.boardArea} onLayout={onLayoutArea}>
        <MosaicBoard
          puzzle={puzzle}
          placed={placed}
          metrics={metrics}
          camera={camera}
          selectedPigment={selected}
          focus={focus}
          showGrid={settings.gridLines}
          inputMode={inputMode}
          interactive={!paused && !showHelp}
          showClues
          onTapCell={handleTapCell}
        />
      </View>

      <View style={styles.trayWrap} pointerEvents="box-none">
        <PaletteTray
          width={TRAY_W}
          pigments={puzzle.pigments}
          remaining={remaining}
          selected={selected}
          status={status}
          inputMode={inputMode}
          canUndo={session.canUndo}
          canZoomIn={camera.canZoomIn}
          canZoomOut={camera.canZoomOut}
          onSelectPigment={handleSelect}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onFit={camera.toFit}
          onToggleMode={toggleMode}
          onUndo={session.undo}
          onPlace={handlePlace}
          onNext={handleNext}
        />
      </View>

      {showHelp ? (
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>How to restore</Text>
            <Text style={styles.helpLine}>1. Choose a numbered color</Text>
            <Text style={styles.helpLine}>2. Match the tile number</Text>
            <Text style={styles.helpLine}>3. Use NEXT TILE to reach more tiles</Text>
            <View style={styles.sheetActions}>
              <PrimaryButton
                label="GOT IT"
                onPress={() => {
                  setShowHelp(false);
                  onTutorialDone();
                }}
              />
            </View>
          </View>
        </View>
      ) : null}

      {paused ? (
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Paused</Text>
            <Text style={styles.helpLine}>
              {progress + '% of this floor restored. Your tiles are kept.'}
            </Text>
            <View style={styles.sheetActions}>
              <PrimaryButton label="CONTINUE" onPress={() => setPaused(false)} />
              <SecondaryButton
                label="SAVE & MAP"
                onPress={() => {
                  setPaused(false);
                  onHome();
                }}
                style={styles.pauseSecondary}
              />
              <SecondaryButton label="SETTINGS" onPress={onSettings} style={styles.pauseSecondary} />
            </View>
          </View>
        </View>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  tileCount: {
    paddingHorizontal: GUTTER,
    paddingTop: 10,
  },
  tileCountText: {
    ...theme.typography.caption,
    textTransform: 'none',
    fontSize: 13,
    letterSpacing: 0.2,
    color: theme.colors.textMuted,
  },
  boardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: GUTTER,
    paddingTop: 8,
    paddingBottom: TRAY_RESERVED,
  },
  trayWrap: {
    position: 'absolute',
    left: GUTTER,
    right: GUTTER,
    bottom: TRAY_BOTTOM_OFFSET,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34,16,22,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: GUTTER,
  },
  sheet: {
    width: '100%',
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.stone,
    borderWidth: 1,
    borderColor: 'rgba(232,221,196,0.25)',
    padding: 20,
    paddingBottom: 20 + BOTTOM_INSET,
    ...theme.shadows.card,
  },
  sheetTitle: {
    ...theme.typography.section,
    color: theme.colors.textPrimary,
    marginBottom: 10,
  },
  helpLine: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  sheetActions: {
    marginTop: 14,
    gap: 10,
  },
  pauseSecondary: {
    width: '100%',
  },
});
