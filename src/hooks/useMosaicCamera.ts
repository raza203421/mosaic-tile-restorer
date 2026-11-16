import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { DETAIL_CELL_SIZES } from '../constants/config';
import type { BoardMetrics } from '../utils/geometry';
import { clampTranslate, fitCellSize } from '../utils/geometry';

const DETAIL_STEPS = [...DETAIL_CELL_SIZES];
const INNER_MARGIN = 24;

/**
 * Fit overview plus 48/64/96 dp detail steps with a clamped translation, so the
 * mosaic never floats away from its frame. Live panning drives an Animated
 * transform (never layout props); the committed value feeds label culling.
 */
export function useMosaicCamera(
  metrics: BoardMetrics,
  cols: number,
  rows: number,
  reduceMotion: boolean,
) {
  const fitCell = useMemo(() => fitCellSize(metrics, cols, rows), [metrics, cols, rows]);

  const [step, setStep] = useState(0);
  const cell = step === 0 ? fitCell : DETAIL_STEPS[step - 1];
  const gridW = cell * cols;
  const gridH = cell * rows;

  const [tx, setTx] = useState(() => clampTranslate(fitCell * cols, metrics.innerW, 0));
  const [ty, setTy] = useState(() => clampTranslate(fitCell * rows, metrics.innerH, 0));

  const pan = useRef(new Animated.ValueXY({ x: tx, y: ty })).current;
  const live = useRef({ x: tx, y: ty });

  const apply = useCallback(
    (nx: number, ny: number, animate: boolean) => {
      live.current = { x: nx, y: ny };
      setTx(nx);
      setTy(ny);
      if (animate && !reduceMotion) {
        Animated.timing(pan, {
          toValue: { x: nx, y: ny },
          duration: 180,
          useNativeDriver: true,
        }).start();
      } else {
        pan.stopAnimation();
        pan.setValue({ x: nx, y: ny });
      }
    },
    [pan, reduceMotion],
  );

  /** Centre `index` using an explicit cell size, so zoom steps anchor correctly. */
  const centerWith = useCallback(
    (index: number, cellSize: number, animate: boolean) => {
      const gw = cellSize * cols;
      const gh = cellSize * rows;
      const col = index % cols;
      const row = Math.floor(index / cols);
      apply(
        clampTranslate(gw, metrics.innerW, metrics.innerW / 2 - (col + 0.5) * cellSize),
        clampTranslate(gh, metrics.innerH, metrics.innerH / 2 - (row + 0.5) * cellSize),
        animate,
      );
    },
    [apply, cols, rows, metrics.innerH, metrics.innerW],
  );

  const centerOn = useCallback(
    (index: number, animate = true) => centerWith(index, cell, animate),
    [cell, centerWith],
  );

  // Keep the translation legal whenever the grid or the viewport changes.
  useEffect(() => {
    apply(
      clampTranslate(gridW, metrics.innerW, live.current.x),
      clampTranslate(gridH, metrics.innerH, live.current.y),
      false,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridW, gridH, metrics.innerW, metrics.innerH]);

  const dragFrom = useRef({ x: 0, y: 0 });

  const beginDrag = useCallback(() => {
    dragFrom.current = { ...live.current };
  }, []);

  const dragBy = useCallback(
    (dx: number, dy: number) => {
      const nx = clampTranslate(gridW, metrics.innerW, dragFrom.current.x + dx);
      const ny = clampTranslate(gridH, metrics.innerH, dragFrom.current.y + dy);
      live.current = { x: nx, y: ny };
      pan.setValue({ x: nx, y: ny });
    },
    [gridH, gridW, metrics.innerH, metrics.innerW, pan],
  );

  const endDrag = useCallback(() => {
    setTx(live.current.x);
    setTy(live.current.y);
  }, []);

  const ensureVisible = useCallback(
    (index: number) => {
      if (index < 0) {
        return;
      }
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = col * cell + live.current.x;
      const y = row * cell + live.current.y;
      const outside =
        x < INNER_MARGIN ||
        y < INNER_MARGIN ||
        x + cell > metrics.innerW - INNER_MARGIN ||
        y + cell > metrics.innerH - INNER_MARGIN;
      if (outside) {
        centerWith(index, cell, true);
      }
    },
    [cell, centerWith, cols, metrics.innerH, metrics.innerW],
  );

  const goToStep = useCallback(
    (next: number, anchor: number) => {
      const clamped = Math.max(0, Math.min(DETAIL_STEPS.length, next));
      if (clamped === step) {
        return;
      }
      setStep(clamped);
      const nextCell = clamped === 0 ? fitCell : DETAIL_STEPS[clamped - 1];
      centerWith(anchor >= 0 ? anchor : 0, nextCell, false);
    },
    [centerWith, fitCell, step],
  );

  const zoomIn = useCallback((anchor: number) => goToStep(step + 1, anchor), [goToStep, step]);
  const zoomOut = useCallback((anchor: number) => goToStep(step - 1, anchor), [goToStep, step]);
  const toFit = useCallback(() => goToStep(0, 0), [goToStep]);
  const enterDetail = useCallback(
    (anchor: number) => {
      if (step === 0) {
        goToStep(1, anchor);
      } else {
        centerWith(anchor, cell, true);
      }
    },
    [cell, centerWith, goToStep, step],
  );

  return {
    mode: (step === 0 ? 'fit' : 'detail') as 'fit' | 'detail',
    step,
    cell,
    gridW,
    gridH,
    tx,
    ty,
    pan,
    canZoomIn: step < DETAIL_STEPS.length,
    canZoomOut: step > 0,
    beginDrag,
    dragBy,
    endDrag,
    centerOn,
    ensureVisible,
    zoomIn,
    zoomOut,
    toFit,
    enterDetail,
  };
}
