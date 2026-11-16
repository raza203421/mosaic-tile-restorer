import { BOARD_FRAME, BOARD_MAX_W } from '../constants/config';

export type BoardMetrics = {
  /** outer size of the decorative stone frame */
  outerW: number;
  outerH: number;
  /** clipping viewport inside the frame */
  innerW: number;
  innerH: number;
};

/**
 * The frame's own padding + border is subtracted before any cell maths, so
 * tiles can never extend past the rounded stone edge.
 */
export function boardMetrics(availW: number, availH: number): BoardMetrics {
  const outerW = Math.floor(Math.max(120, Math.min(availW, BOARD_MAX_W)));
  const outerH = Math.floor(Math.max(120, Math.min(availH, outerW * 1.2)));
  return {
    outerW,
    outerH,
    innerW: outerW - 2 * BOARD_FRAME,
    innerH: outerH - 2 * BOARD_FRAME,
  };
}

export function fitCellSize(m: BoardMetrics, cols: number, rows: number): number {
  return Math.max(2, Math.floor(Math.min(m.innerW / cols, m.innerH / rows)));
}

export function clampTranslate(gridSize: number, viewport: number, value: number): number {
  if (gridSize <= viewport) {
    return Math.round((viewport - gridSize) / 2);
  }
  return Math.round(Math.max(viewport - gridSize, Math.min(0, value)));
}

export function centerTranslate(
  centerCells: number,
  cell: number,
  viewport: number,
  gridSize: number,
): number {
  return clampTranslate(gridSize, viewport, viewport / 2 - (centerCells + 0.5) * cell);
}

export function cellAtPoint(
  x: number,
  y: number,
  cell: number,
  tx: number,
  ty: number,
  cols: number,
  rows: number,
): number {
  const col = Math.floor((x - tx) / cell);
  const row = Math.floor((y - ty) / cell);
  if (col < 0 || row < 0 || col >= cols || row >= rows) {
    return -1;
  }
  return row * cols + col;
}

export type VisibleRange = { c0: number; c1: number; r0: number; r1: number };

export function visibleRange(
  m: BoardMetrics,
  cell: number,
  tx: number,
  ty: number,
  cols: number,
  rows: number,
): VisibleRange {
  const c0 = Math.max(0, Math.floor(-tx / cell));
  const c1 = Math.min(cols - 1, Math.floor((-tx + m.innerW) / cell));
  const r0 = Math.max(0, Math.floor(-ty / cell));
  const r1 = Math.min(rows - 1, Math.floor((-ty + m.innerH) / cell));
  return { c0, c1, r0, r1 };
}
