import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MISMATCH_MS } from '../constants/config';
import { pigment } from '../game/catalog';
import { buildPuzzle, emptyPlaced } from '../game/puzzles';
import {
  firstEmptyCell,
  isRegionComplete,
  lowestUnfinishedPigment,
  nextEmptyCell,
  placedCount,
  progressPercent,
  regionsDoneCount,
  remainingByPigment,
} from '../game/restoration';
import type { PigmentId, RegionEvent } from '../game/types';

type Options = {
  onRegionDone: (event: RegionEvent) => void;
  onFloorComplete: () => void;
};

/**
 * Owns one floor's restoration session: placed bits, selected pigment, focus,
 * undo history and the gentle mismatch notice. There is no lose state and a
 * wrong pigment never changes a tile, a count or the undo history.
 */
export function useRestorationSession(floorId: number, options: Options) {
  const puzzle = useMemo(() => buildPuzzle(floorId), [floorId]);

  const [placed, setPlaced] = useState<Uint8Array>(() => emptyPlaced(puzzle));
  const [selected, setSelected] = useState<PigmentId>(puzzle.pigments[0]);
  const [focus, setFocus] = useState<number>(() =>
    firstEmptyCell(puzzle, emptyPlaced(puzzle), puzzle.pigments[0]),
  );
  const [history, setHistory] = useState<number[]>([]);
  const [notice, setNotice] = useState('');

  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbacks = useRef(options);
  callbacks.current = options;

  useEffect(
    () => () => {
      if (noticeTimer.current) {
        clearTimeout(noticeTimer.current);
      }
    },
    [],
  );

  const flashNotice = useCallback((text: string) => {
    setNotice(text);
    if (noticeTimer.current) {
      clearTimeout(noticeTimer.current);
    }
    noticeTimer.current = setTimeout(() => setNotice(''), MISMATCH_MS);
  }, []);

  const remaining = useMemo(() => remainingByPigment(puzzle, placed), [puzzle, placed]);
  const done = useMemo(() => placedCount(placed), [placed]);
  const progress = useMemo(() => progressPercent(placed, puzzle.total), [placed, puzzle.total]);
  const regionsDone = useMemo(() => regionsDoneCount(puzzle, placed), [puzzle, placed]);

  /**
   * Set one stored bit and raise the resulting events. `nextFocus` is where the
   * caller wants the focus when nothing more interesting happens.
   */
  const commit = useCallback(
    (index: number, want: number, nextFocus: number) => {
      const next = Uint8Array.from(placed);
      next[index] = 1;
      setPlaced(next);
      setHistory(h => [...h, index]);
      setNotice('');

      if (placedCount(next) >= puzzle.total) {
        setFocus(index);
        callbacks.current.onFloorComplete();
        return;
      }

      const regionId = puzzle.regionOf[index];
      const regionJustDone = isRegionComplete(puzzle, next, regionId);

      const left = remainingByPigment(puzzle, next);
      if (left[want] === 0) {
        const nextPigment = lowestUnfinishedPigment(puzzle, next);
        if (nextPigment) {
          setSelected(nextPigment);
          const cell = firstEmptyCell(puzzle, next, nextPigment);
          setFocus(cell >= 0 ? cell : index);
          flashNotice(
            pigment(want).name + ' complete, now ' + nextPigment + ' ' + pigment(nextPigment).name,
          );
        } else {
          setFocus(index);
        }
      } else {
        const target = nextFocus >= 0 && !next[nextFocus] ? nextFocus : index;
        setFocus(target);
      }

      if (regionJustDone) {
        callbacks.current.onRegionDone({
          pigment: want as PigmentId,
          cells: puzzle.regionSize[regionId],
          regionsDone: regionsDoneCount(puzzle, next),
          totalRegions: puzzle.regionCount,
          progress: progressPercent(next, puzzle.total),
        });
      }
    },
    [flashNotice, placed, puzzle],
  );

  const selectPigment = useCallback(
    (id: PigmentId) => {
      setSelected(id);
      const next = firstEmptyCell(puzzle, placed, id);
      if (next >= 0) {
        setFocus(next);
      }
    },
    [puzzle, placed],
  );

  /** Direct tile tap: the camera stays still and only this cell can change. */
  const place = useCallback(
    (index: number): boolean => {
      if (index < 0 || index >= puzzle.total) {
        return false;
      }
      if (placed[index]) {
        setFocus(index);
        return false;
      }
      const want = puzzle.target[index];
      if (want !== selected) {
        flashNotice('This tile needs ' + want + ' ' + pigment(want).name);
        setFocus(index);
        return false;
      }
      commit(index, want, index);
      return true;
    },
    [commit, flashNotice, placed, puzzle, selected],
  );

  /** Guided action: places the focused tile and advances to the next one. */
  const placeFocused = useCallback((): boolean => {
    if (focus < 0) {
      return false;
    }
    if (placed[focus]) {
      const cell = nextEmptyCell(puzzle, placed, selected, focus);
      if (cell >= 0) {
        setFocus(cell);
      }
      return false;
    }
    const want = puzzle.target[focus];
    if (want !== selected) {
      setSelected(want as PigmentId);
    }
    commit(focus, want, nextEmptyCell(puzzle, placed, want, focus));
    return true;
  }, [commit, focus, placed, puzzle, selected]);

  /** Row-major cycle through the selected pigment's remaining tiles. */
  const focusNext = useCallback((): number => {
    let cell = nextEmptyCell(puzzle, placed, selected, focus);
    if (cell < 0) {
      const nextPigment = lowestUnfinishedPigment(puzzle, placed);
      if (!nextPigment) {
        return -1;
      }
      setSelected(nextPigment);
      cell = firstEmptyCell(puzzle, placed, nextPigment);
    }
    if (cell >= 0) {
      setFocus(cell);
    }
    return cell;
  }, [focus, placed, puzzle, selected]);

  const undo = useCallback(() => {
    if (!history.length) {
      return;
    }
    const last = history[history.length - 1];
    const next = Uint8Array.from(placed);
    next[last] = 0;
    setPlaced(next);
    setHistory(history.slice(0, -1));
    setFocus(last);
    setSelected(puzzle.target[last] as PigmentId);
    setNotice('');
  }, [history, placed, puzzle]);

  const focusDescription = useMemo(() => {
    if (focus < 0) {
      return 'Floor restored';
    }
    const clue = puzzle.target[focus];
    return (
      'Tile ' +
      (focus + 1) +
      ' of ' +
      puzzle.total +
      ' / ' +
      clue +
      ' ' +
      pigment(clue).name +
      ' / ' +
      (placed[focus] ? 'placed' : 'empty')
    );
  }, [focus, placed, puzzle]);

  return {
    puzzle,
    placed,
    selected,
    focus,
    notice,
    remaining,
    done,
    progress,
    regionsDone,
    canUndo: history.length > 0,
    focusDescription,
    selectPigment,
    place,
    placeFocused,
    focusNext,
    undo,
  };
}
