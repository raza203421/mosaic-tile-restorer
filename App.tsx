import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ArtworkScreen from './src/screens/ArtworkScreen';
import GameOverScreen from './src/screens/GameOverScreen';
import GameScreen from './src/screens/GameScreen';
import LoaderScreen from './src/screens/LoaderScreen';
import MenuScreen from './src/screens/MenuScreen';
import MuseumScreen from './src/screens/MuseumScreen';
import RegionDoneScreen from './src/screens/RegionDoneScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { theme } from './src/constants/theme';
import { roomById, roomsOfVilla } from './src/game/catalog';
import type { Progress, Settings } from './src/game/progression';
import {
  loadRecord,
  nextAvailableFloor,
  saveRecord,
  selectionFor,
} from './src/game/progression';
import type { RegionEvent } from './src/game/types';

type Screen =
  | 'loader'
  | 'menu'
  | 'game'
  | 'regiondone'
  | 'gameover'
  | 'museum'
  | 'artwork'
  | 'settings';

type Caller = 'menu' | 'game' | 'gameover' | 'museum';

export default function App() {
  const [screen, setScreen] = useState<Screen>('loader');
  const [progress, setProgress] = useState<Progress>(() => loadRecord());
  const [gameKey, setGameKey] = useState(0);
  const [regionEvent, setRegionEvent] = useState<RegionEvent | null>(null);
  const [finishedFloor, setFinishedFloor] = useState(1);
  const [artworkFloor, setArtworkFloor] = useState(1);
  const [artworkCaller, setArtworkCaller] = useState<Caller>('museum');
  const [settingsCaller, setSettingsCaller] = useState<Caller>('menu');

  useEffect(() => {
    saveRecord(progress);
  }, [progress]);

  const { selection, settings, completed } = progress;

  const patch = useCallback((next: Partial<Progress>) => {
    setProgress(prev => ({ ...prev, ...next }));
  }, []);

  // ------------------------------------------------------------- selection

  const selectVilla = useCallback(
    (villaId: number) => {
      const room = roomsOfVilla(villaId)[0];
      patch({ selection: { villaId, roomId: room.id, floorId: room.floorIds[0] } });
    },
    [patch],
  );

  const selectRoom = useCallback(
    (roomId: string) => {
      const room = roomById(roomId);
      patch({ selection: { villaId: room.villaId, roomId, floorId: room.floorIds[0] } });
    },
    [patch],
  );

  const selectFloor = useCallback(
    (floorId: number) => {
      patch({ selection: selectionFor(floorId) });
    },
    [patch],
  );

  // ----------------------------------------------------------- transitions

  const startGame = useCallback(() => {
    setGameKey(k => k + 1);
    setScreen('game');
  }, []);

  const handleRegionDone = useCallback((event: RegionEvent) => {
    setRegionEvent(event);
    setScreen('regiondone');
  }, []);

  const handleGameOver = useCallback(() => {
    const floorId = selection.floorId;
    setFinishedFloor(floorId);
    setProgress(prev => {
      if (prev.completed.indexOf(floorId) !== -1) {
        return prev;
      }
      return { ...prev, completed: [...prev.completed, floorId].sort((a, b) => a - b) };
    });
    setScreen('gameover');
  }, [selection.floorId]);

  const nextFloorId = useMemo(() => {
    const completedWith = completed.indexOf(finishedFloor) === -1
      ? [...completed, finishedFloor]
      : completed;
    return nextAvailableFloor(completedWith);
  }, [completed, finishedFloor]);

  const goNextFloor = useCallback(() => {
    if (nextFloorId) {
      patch({ selection: selectionFor(nextFloorId) });
      setGameKey(k => k + 1);
      setScreen('game');
    } else {
      setScreen('museum');
    }
  }, [nextFloorId, patch]);

  const playAgain = useCallback(() => {
    patch({ selection: selectionFor(finishedFloor) });
    setGameKey(k => k + 1);
    setScreen('game');
  }, [finishedFloor, patch]);

  const openSettings = useCallback((caller: Caller) => {
    setSettingsCaller(caller);
    setScreen('settings');
  }, []);

  const openArtwork = useCallback((floorId: number, caller: Caller) => {
    setArtworkFloor(floorId);
    setArtworkCaller(caller);
    setScreen('artwork');
  }, []);

  const changeSettings = useCallback(
    (next: Settings) => {
      patch({ settings: next });
    },
    [patch],
  );

  const gameActive =
    screen === 'game' ||
    screen === 'regiondone' ||
    (screen === 'settings' && settingsCaller === 'game');

  return (
    <View style={styles.root}>
      {screen === 'loader' ? (
        <LoaderScreen onDone={() => setScreen('menu')} reduceMotion={settings.reduceMotion} />
      ) : null}

      {screen === 'menu' ? (
        <MenuScreen
          completed={completed}
          selection={selection}
          onSelectVilla={selectVilla}
          onSelectRoom={selectRoom}
          onSelectFloor={selectFloor}
          onStart={startGame}
          onMuseum={() => setScreen('museum')}
          onSettings={() => openSettings('menu')}
        />
      ) : null}

      {gameActive ? (
        <GameScreen
          key={gameKey}
          floorId={selection.floorId}
          settings={settings}
          tutorialSeen={progress.tutorialSeen}
          onTutorialDone={() => patch({ tutorialSeen: true })}
          onHome={() => setScreen('menu')}
          onSettings={() => openSettings('game')}
          onRegionDone={handleRegionDone}
          onGameOver={handleGameOver}
        />
      ) : null}

      {screen === 'gameover' ? (
        <GameOverScreen
          floorId={finishedFloor}
          completedCount={completed.length}
          nextFloorId={nextFloorId}
          reduceMotion={settings.reduceMotion}
          onNextFloor={goNextFloor}
          onPlayAgain={playAgain}
          onMenu={() => setScreen('menu')}
          onArtwork={() => openArtwork(finishedFloor, 'gameover')}
        />
      ) : null}

      {screen === 'museum' ? (
        <MuseumScreen
          completed={completed}
          onBack={() => setScreen('menu')}
          onOpenArtwork={floorId => openArtwork(floorId, 'museum')}
          onFocusFloor={floorId => {
            selectFloor(floorId);
            setScreen('menu');
          }}
          onStartRestoring={() => setScreen('menu')}
        />
      ) : null}

      {screen === 'artwork' ? (
        <ArtworkScreen
          floorId={artworkFloor}
          reduceMotion={settings.reduceMotion}
          onBack={() => setScreen(artworkCaller === 'gameover' ? 'gameover' : 'museum')}
        />
      ) : null}

      {screen === 'regiondone' && regionEvent ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <RegionDoneScreen
            event={regionEvent}
            reduceMotion={settings.reduceMotion}
            onContinue={() => setScreen('game')}
          />
        </View>
      ) : null}

      {screen === 'settings' ? (
        <View style={StyleSheet.absoluteFill}>
          <SettingsScreen
            settings={settings}
            onChange={changeSettings}
            onBack={() => setScreen(settingsCaller === 'game' ? 'game' : settingsCaller)}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
