import { compositionFor, floorById, motifFor } from './catalog';
import { MOTIFS, sampleMotif } from './motifs';
import type { MotifRole, PigmentId, Placement, Puzzle, Shape } from './types';

/**
 * Target grids are compiled once per floor from the normalised vector motifs.
 * Compilation is deterministic: the same floor id always yields the same clues.
 */

const cache = new Map<number, Puzzle>();

function roleToPigment(role: MotifRole, maxPigment: number): number {
  switch (role) {
    case 'ground':
      return 1;
    case 'light':
      return 2;
    case 'body':
      return 3;
    case 'outline':
      return 4;
    case 'leaf':
      return maxPigment >= 5 ? 5 : 2;
    case 'detail':
      return maxPigment >= 6 ? 6 : 3;
    case 'dark':
      return maxPigment >= 7 ? 7 : 4;
    case 'glint':
      return maxPigment >= 8 ? 8 : 1;
    default:
      return 1;
  }
}

function paintBands(target: Uint8Array, cols: number, rows: number, b: number): void {
  const run = 2 * b;
  for (let layer = 0; layer < 2 * b; layer++) {
    const a = layer < b ? 3 : 1;
    const z = layer < b ? 4 : 2;
    const x0 = layer;
    const y0 = layer;
    const x1 = cols - 1 - layer;
    const y1 = rows - 1 - layer;
    if (x1 < x0 || y1 < y0) {
      break;
    }
    const ring: number[] = [];
    for (let c = x0; c <= x1; c++) {
      ring.push(y0 * cols + c);
    }
    for (let r = y0 + 1; r <= y1; r++) {
      ring.push(r * cols + x1);
    }
    if (y1 > y0) {
      for (let c = x1 - 1; c >= x0; c--) {
        ring.push(y1 * cols + c);
      }
    }
    if (x1 > x0) {
      for (let r = y1 - 1; r > y0; r--) {
        ring.push(r * cols + x0);
      }
    }
    for (let k = 0; k < ring.length; k++) {
      target[ring[k]] = Math.floor(k / run) % 2 === 0 ? a : z;
    }
  }
}

type Box = { x: number; y: number; side: number };

function placeMotif(
  target: Uint8Array,
  cols: number,
  shapes: Shape[],
  box: Box,
  maxPigment: number,
  rows: number,
): void {
  const c0 = Math.max(0, Math.floor(box.x));
  const c1 = Math.min(cols - 1, Math.ceil(box.x + box.side));
  const r0 = Math.max(0, Math.floor(box.y));
  const r1 = Math.min(rows - 1, Math.ceil(box.y + box.side));
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      const u = (c + 0.5 - box.x) / box.side;
      const v = (r + 0.5 - box.y) / box.side;
      if (u < 0 || u > 1 || v < 0 || v > 1) {
        continue;
      }
      const role = sampleMotif(shapes, u, v);
      if (role) {
        target[r * cols + c] = roleToPigment(role, maxPigment);
      }
    }
  }
}

function frameBox(
  target: Uint8Array,
  cols: number,
  rows: number,
  box: Box,
  pigmentId: number,
  thickness: number,
): void {
  const c0 = Math.max(0, Math.round(box.x) - thickness);
  const c1 = Math.min(cols - 1, Math.round(box.x + box.side) + thickness - 1);
  const r0 = Math.max(0, Math.round(box.y) - thickness);
  const r1 = Math.min(rows - 1, Math.round(box.y + box.side) + thickness - 1);
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      const edge = r < r0 + thickness || r > r1 - thickness || c < c0 + thickness || c > c1 - thickness;
      if (edge) {
        target[r * cols + c] = pigmentId;
      }
    }
  }
}

function cornerGlints(
  target: Uint8Array,
  cols: number,
  rows: number,
  box: Box,
  pigmentId: number,
): void {
  const pts = [
    [Math.round(box.x) - 1, Math.round(box.y) - 1],
    [Math.round(box.x + box.side), Math.round(box.y) - 1],
    [Math.round(box.x) - 1, Math.round(box.y + box.side)],
    [Math.round(box.x + box.side), Math.round(box.y + box.side)],
  ];
  for (const [c, r] of pts) {
    if (c >= 0 && c < cols && r >= 0 && r < rows) {
      target[r * cols + c] = pigmentId;
    }
  }
}

function buildRegions(target: Uint8Array, cols: number, rows: number) {
  const total = cols * rows;
  const regionOf = new Int32Array(total).fill(-1);
  const sizes: number[] = [];
  const stack: number[] = [];
  let next = 0;
  for (let start = 0; start < total; start++) {
    if (regionOf[start] !== -1) {
      continue;
    }
    const value = target[start];
    const id = next++;
    let count = 0;
    stack.length = 0;
    stack.push(start);
    regionOf[start] = id;
    while (stack.length) {
      const i = stack.pop() as number;
      count++;
      const r = Math.floor(i / cols);
      const c = i - r * cols;
      if (c > 0) {
        const n = i - 1;
        if (regionOf[n] === -1 && target[n] === value) {
          regionOf[n] = id;
          stack.push(n);
        }
      }
      if (c < cols - 1) {
        const n = i + 1;
        if (regionOf[n] === -1 && target[n] === value) {
          regionOf[n] = id;
          stack.push(n);
        }
      }
      if (r > 0) {
        const n = i - cols;
        if (regionOf[n] === -1 && target[n] === value) {
          regionOf[n] = id;
          stack.push(n);
        }
      }
      if (r < rows - 1) {
        const n = i + cols;
        if (regionOf[n] === -1 && target[n] === value) {
          regionOf[n] = id;
          stack.push(n);
        }
      }
    }
    sizes.push(count);
  }
  return { regionOf, regionSize: Int32Array.from(sizes), regionCount: next };
}

export function buildPuzzle(floorId: number): Puzzle {
  const cached = cache.get(floorId);
  if (cached) {
    return cached;
  }

  const floor = floorById(floorId);
  const comp = compositionFor(floorId);
  const { cols, rows, maxPigment } = comp;
  const total = cols * rows;
  const target = new Uint8Array(total).fill(1);

  const b = Math.max(1, Math.floor(Math.min(cols, rows) / 20));
  paintBands(target, cols, rows, b);

  const innerX = 2 * b;
  const innerY = 2 * b;
  const innerW = cols - 4 * b;
  const innerH = rows - 4 * b;
  const shorter = Math.min(innerW, innerH);

  const boxes: Box[] = comp.placements.map((p: Placement) => {
    const side = Math.max(3, p.size * shorter);
    return {
      x: innerX + p.cx * innerW - side / 2,
      y: innerY + p.cy * innerH - side / 2,
      side,
    };
  });

  comp.placements.forEach((p, i) => {
    const motifId = p.motif ?? motifFor(floorId);
    placeMotif(target, cols, MOTIFS[motifId - 1].shapes, boxes[i], maxPigment, rows);
  });

  const main = boxes[0];
  if (comp.tier >= 3 && comp.tier <= 4) {
    frameBox(target, cols, rows, main, roleToPigment('detail', maxPigment), 1);
  } else if (comp.tier >= 5) {
    frameBox(target, cols, rows, main, roleToPigment('dark', maxPigment), 1);
  }
  if (comp.tier >= 6) {
    cornerGlints(target, cols, rows, main, roleToPigment('glint', maxPigment));
  }

  const countByPigment: Record<number, number> = {};
  for (let i = 0; i < total; i++) {
    const p = target[i];
    countByPigment[p] = (countByPigment[p] ?? 0) + 1;
  }
  const pigments = Object.keys(countByPigment)
    .map(Number)
    .sort((a, z) => a - z) as PigmentId[];

  const { regionOf, regionSize, regionCount } = buildRegions(target, cols, rows);

  const puzzle: Puzzle = {
    floorId: floor.id,
    cols,
    rows,
    total,
    target,
    regionOf,
    regionSize,
    regionCount,
    pigments,
    countByPigment,
  };
  cache.set(floorId, puzzle);
  return puzzle;
}

/** A fully restored bit array — used by the museum, thumbnails and artwork view. */
export function fullPlaced(puzzle: Puzzle): Uint8Array {
  return new Uint8Array(puzzle.total).fill(1);
}

export function emptyPlaced(puzzle: Puzzle): Uint8Array {
  return new Uint8Array(puzzle.total);
}
