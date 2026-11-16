import type { PigmentId, Puzzle } from './types';

/** Tiles of each pigment that are still empty. */
export function remainingByPigment(puzzle: Puzzle, placed: Uint8Array): Record<number, number> {
  const out: Record<number, number> = {};
  for (const p of puzzle.pigments) {
    out[p] = 0;
  }
  for (let i = 0; i < puzzle.total; i++) {
    if (!placed[i]) {
      out[puzzle.target[i]] = (out[puzzle.target[i]] ?? 0) + 1;
    }
  }
  return out;
}

export function placedCount(placed: Uint8Array): number {
  let n = 0;
  for (let i = 0; i < placed.length; i++) {
    if (placed[i]) {
      n++;
    }
  }
  return n;
}

export function progressPercent(placed: Uint8Array, total: number): number {
  const n = placedCount(placed);
  if (n >= total) {
    return 100;
  }
  return Math.floor((100 * n) / total);
}

/**
 * Row-major cycle through empty cells of `pigment`, starting after `after`
 * and wrapping exactly once. Returns -1 when the pigment is finished.
 */
export function nextEmptyCell(
  puzzle: Puzzle,
  placed: Uint8Array,
  pigment: number,
  after: number,
): number {
  const total = puzzle.total;
  for (let step = 1; step <= total; step++) {
    const i = (after + step + total) % total;
    if (!placed[i] && puzzle.target[i] === pigment) {
      return i;
    }
  }
  return -1;
}

export function firstEmptyCell(puzzle: Puzzle, placed: Uint8Array, pigment: number): number {
  for (let i = 0; i < puzzle.total; i++) {
    if (!placed[i] && puzzle.target[i] === pigment) {
      return i;
    }
  }
  return -1;
}

/** Lowest numbered pigment that still has empty tiles, or null when finished. */
export function lowestUnfinishedPigment(puzzle: Puzzle, placed: Uint8Array): PigmentId | null {
  const remaining = remainingByPigment(puzzle, placed);
  for (const p of puzzle.pigments) {
    if (remaining[p] > 0) {
      return p;
    }
  }
  return null;
}

export function isRegionComplete(puzzle: Puzzle, placed: Uint8Array, regionId: number): boolean {
  for (let i = 0; i < puzzle.total; i++) {
    if (puzzle.regionOf[i] === regionId && !placed[i]) {
      return false;
    }
  }
  return true;
}

export function regionsDoneCount(puzzle: Puzzle, placed: Uint8Array): number {
  const open = new Uint8Array(puzzle.regionCount);
  for (let i = 0; i < puzzle.total; i++) {
    if (!placed[i]) {
      open[puzzle.regionOf[i]] = 1;
    }
  }
  let done = 0;
  for (let r = 0; r < puzzle.regionCount; r++) {
    if (!open[r]) {
      done++;
    }
  }
  return done;
}

export function cellOf(puzzle: Puzzle, col: number, row: number): number {
  return row * puzzle.cols + col;
}

export function colOf(puzzle: Puzzle, index: number): number {
  return index % puzzle.cols;
}

export function rowOf(puzzle: Puzzle, index: number): number {
  return Math.floor(index / puzzle.cols);
}
