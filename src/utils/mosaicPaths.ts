import type { Puzzle } from '../game/types';

function rect(x: number, y: number, w: number, h: number): string {
  return 'M' + x + ' ' + y + 'h' + w + 'v' + h + 'h' + -w + 'z';
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * One path per pigment for every placed tile — the whole board draws as a
 * handful of SVG nodes instead of thousands of views.
 */
export function placedPaths(
  puzzle: Puzzle,
  placed: Uint8Array,
  cell: number,
  gap: number,
): Array<{ pigment: number; d: string }> {
  const buckets = new Map<number, string[]>();
  const size = r2(Math.max(1, cell - gap));
  for (let i = 0; i < puzzle.total; i++) {
    if (!placed[i]) {
      continue;
    }
    const p = puzzle.target[i];
    const row = Math.floor(i / puzzle.cols);
    const col = i - row * puzzle.cols;
    const d = rect(r2(col * cell + gap / 2), r2(row * cell + gap / 2), size, size);
    const list = buckets.get(p);
    if (list) {
      list.push(d);
    } else {
      buckets.set(p, [d]);
    }
  }
  return Array.from(buckets.entries())
    .map(([pigment, parts]) => ({ pigment, d: parts.join('') }))
    .sort((a, b) => a.pigment - b.pigment);
}

/** Thin grout separators; decorative only, hit boxes never change. */
export function groutPath(cols: number, rows: number, cell: number): string {
  const parts: string[] = [];
  const w = cols * cell;
  const h = rows * cell;
  for (let c = 1; c < cols; c++) {
    parts.push('M' + r2(c * cell) + ' 0V' + r2(h));
  }
  for (let r = 1; r < rows; r++) {
    parts.push('M0 ' + r2(r * cell) + 'H' + r2(w));
  }
  return parts.join('');
}

/** Outline of the selected pigment's remaining tiles inside the visible range. */
export function hintPath(
  puzzle: Puzzle,
  placed: Uint8Array,
  pigmentId: number,
  cell: number,
  c0: number,
  c1: number,
  r0: number,
  r1: number,
): string {
  const parts: string[] = [];
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      const i = r * puzzle.cols + c;
      if (!placed[i] && puzzle.target[i] === pigmentId) {
        parts.push(rect(r2(c * cell + 1.5), r2(r * cell + 1.5), r2(cell - 3), r2(cell - 3)));
      }
    }
  }
  return parts.join('');
}
