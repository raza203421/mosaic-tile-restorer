import type { Motif, MotifRole, Shape } from './types';

/**
 * Deterministic normalised artwork definitions.
 * Every motif lives in a local unit square, origin top-left, and is sampled at
 * cell centres — no randomness, no colour inference from raster art.
 */

const D2R = Math.PI / 180;

function polyInset(pts: number[][], inset: number): number[][] {
  let cx = 0;
  let cy = 0;
  for (const p of pts) {
    cx += p[0];
    cy += p[1];
  }
  cx /= pts.length;
  cy /= pts.length;
  return pts.map(p => {
    const dx = p[0] - cx;
    const dy = p[1] - cy;
    const len = Math.hypot(dx, dy) || 1;
    const k = Math.max(0, (len - inset) / len);
    return [cx + dx * k, cy + dy * k];
  });
}

function sunMedallion(): Shape[] {
  const s: Shape[] = [];
  for (let i = 0; i < 12; i++) {
    const a = i * 30 * D2R;
    s.push({
      k: 'line',
      pts: [
        [0.5 + 0.28 * Math.cos(a), 0.5 + 0.28 * Math.sin(a)],
        [0.5 + 0.43 * Math.cos(a), 0.5 + 0.43 * Math.sin(a)],
      ],
      w: 0.06,
      c: 'light',
    });
  }
  s.push({ k: 'ellipse', cx: 0.5, cy: 0.5, rx: 0.29, ry: 0.29, c: 'outline' });
  s.push({ k: 'ellipse', cx: 0.5, cy: 0.5, rx: 0.24, ry: 0.24, c: 'body' });
  s.push({ k: 'ellipse', cx: 0.5, cy: 0.5, rx: 0.09, ry: 0.09, c: 'light' });
  return s;
}

function rosette(): Shape[] {
  const s: Shape[] = [];
  for (let i = 0; i < 8; i++) {
    const a = i * 45;
    const r = a * D2R;
    s.push({
      k: 'ellipse',
      cx: 0.5 + 0.22 * Math.cos(r),
      cy: 0.5 + 0.22 * Math.sin(r),
      rx: 0.21,
      ry: 0.09,
      rot: a,
      c: 'body',
    });
  }
  s.push({ k: 'ellipse', cx: 0.5, cy: 0.5, rx: 0.13, ry: 0.13, c: 'light' });
  s.push({ k: 'ellipse', cx: 0.5, cy: 0.5, rx: 0.05, ry: 0.05, c: 'outline' });
  return s;
}

function steppedDiamond(): Shape[] {
  const s: Shape[] = [
    { k: 'diamond', cx: 0.5, cy: 0.5, r: 0.44, c: 'outline' },
    { k: 'diamond', cx: 0.5, cy: 0.5, r: 0.33, c: 'body' },
    { k: 'diamond', cx: 0.5, cy: 0.5, r: 0.22, c: 'light' },
    { k: 'diamond', cx: 0.5, cy: 0.5, r: 0.1, c: 'detail' },
  ];
  const tips = [
    [0.5, 0.06],
    [0.94, 0.5],
    [0.5, 0.94],
    [0.06, 0.5],
  ];
  for (const t of tips) {
    s.push({
      k: 'rect',
      x0: t[0] - 0.05,
      y0: t[1] - 0.05,
      x1: t[0] + 0.05,
      y1: t[1] + 0.05,
      c: 'ground',
    });
  }
  return s;
}

function laurelWreath(): Shape[] {
  const s: Shape[] = [
    { k: 'ring', cx: 0.5, cy: 0.5, r: 0.29, w: 0.035, a0: 35, a1: 325, c: 'dark' },
  ];
  for (let i = 0; i < 12; i++) {
    const a = 35 + ((325 - 35) * i) / 11;
    const r = a * D2R;
    s.push({
      k: 'ellipse',
      cx: 0.5 + 0.29 * Math.cos(r),
      cy: 0.5 + 0.29 * Math.sin(r),
      rx: 0.1,
      ry: 0.045,
      rot: a + 125,
      c: 'leaf',
    });
  }
  s.push({ k: 'diamond', cx: 0.5, cy: 0.8, r: 0.09, c: 'light' });
  return s;
}

function amphora(): Shape[] {
  const vessel = [
    [0.38, 0.18],
    [0.62, 0.18],
    [0.59, 0.33],
    [0.73, 0.51],
    [0.65, 0.79],
    [0.57, 0.85],
    [0.43, 0.85],
    [0.35, 0.79],
    [0.27, 0.51],
    [0.41, 0.33],
  ];
  return [
    { k: 'ring', cx: 0.29, cy: 0.4, r: 0.15, w: 0.045, c: 'outline' },
    { k: 'ring', cx: 0.71, cy: 0.4, r: 0.15, w: 0.045, c: 'outline' },
    { k: 'poly', pts: vessel, c: 'outline' },
    { k: 'poly', pts: polyInset(vessel, 0.035), c: 'body' },
    { k: 'rect', x0: 0.3, y0: 0.48, x1: 0.7, y1: 0.57, c: 'light' },
    { k: 'poly', pts: polyInset(vessel, 0.08), c: 'body' },
    { k: 'rect', x0: 0.37, y0: 0.85, x1: 0.63, y1: 0.9, c: 'detail' },
  ];
}

function riverFish(): Shape[] {
  return [
    { k: 'poly', pts: [[0.73, 0.5], [0.95, 0.29], [0.95, 0.71]], c: 'outline' },
    { k: 'ellipse', cx: 0.48, cy: 0.5, rx: 0.3, ry: 0.17, c: 'body' },
    { k: 'poly', pts: [[0.4, 0.37], [0.53, 0.19], [0.62, 0.4]], c: 'light' },
    { k: 'rect', x0: 0.43, y0: 0.37, x1: 0.475, y1: 0.64, c: 'detail' },
    { k: 'rect', x0: 0.56, y0: 0.37, x1: 0.605, y1: 0.64, c: 'detail' },
    { k: 'ellipse', cx: 0.27, cy: 0.46, rx: 0.045, ry: 0.045, c: 'ground' },
    { k: 'ellipse', cx: 0.27, cy: 0.46, rx: 0.022, ry: 0.022, c: 'dark' },
  ];
}

function dolphin(): Shape[] {
  const body = [
    [0.08, 0.54],
    [0.2, 0.39],
    [0.39, 0.28],
    [0.54, 0.29],
    [0.6, 0.15],
    [0.65, 0.34],
    [0.79, 0.43],
    [0.88, 0.56],
    [0.97, 0.49],
    [0.93, 0.64],
    [0.82, 0.7],
    [0.75, 0.59],
    [0.55, 0.48],
    [0.39, 0.49],
    [0.3, 0.61],
    [0.22, 0.6],
    [0.28, 0.48],
  ];
  return [
    { k: 'poly', pts: body, c: 'outline' },
    { k: 'ellipse', cx: 0.51, cy: 0.42, rx: 0.19, ry: 0.05, rot: -12, c: 'light' },
    { k: 'ellipse', cx: 0.23, cy: 0.45, rx: 0.028, ry: 0.028, c: 'glint' },
    { k: 'wave', cy: 0.82, amp: 0.05, period: 0.5, phase: 0, w: 0.05, c: 'body' },
  ];
}

function doves(): Shape[] {
  const s: Shape[] = [
    { k: 'ellipse', cx: 0.32, cy: 0.6, rx: 0.2, ry: 0.13, c: 'body' },
    { k: 'ellipse', cx: 0.68, cy: 0.6, rx: 0.2, ry: 0.13, c: 'body' },
    { k: 'ellipse', cx: 0.32, cy: 0.47, rx: 0.08, ry: 0.23, rot: -25, c: 'light' },
    { k: 'ellipse', cx: 0.68, cy: 0.47, rx: 0.08, ry: 0.23, rot: 25, c: 'light' },
    { k: 'ellipse', cx: 0.43, cy: 0.42, rx: 0.09, ry: 0.09, c: 'body' },
    { k: 'ellipse', cx: 0.57, cy: 0.42, rx: 0.09, ry: 0.09, c: 'body' },
    { k: 'poly', pts: [[0.47, 0.4], [0.53, 0.4], [0.5, 0.47]], c: 'outline' },
    { k: 'ellipse', cx: 0.4, cy: 0.4, rx: 0.022, ry: 0.022, c: 'dark' },
    { k: 'ellipse', cx: 0.6, cy: 0.4, rx: 0.022, ry: 0.022, c: 'dark' },
    { k: 'line', pts: [[0.19, 0.8], [0.81, 0.8]], w: 0.035, c: 'dark' },
  ];
  for (let i = 0; i < 4; i++) {
    s.push({
      k: 'ellipse',
      cx: 0.26 + i * 0.16,
      cy: 0.76,
      rx: 0.07,
      ry: 0.035,
      rot: i % 2 === 0 ? -30 : 30,
      c: 'leaf',
    });
  }
  return s;
}

function lyre(): Shape[] {
  const s: Shape[] = [
    {
      k: 'line',
      pts: [
        [0.23, 0.18],
        [0.23, 0.67],
        [0.33, 0.82],
        [0.67, 0.82],
        [0.77, 0.67],
        [0.77, 0.18],
      ],
      w: 0.1,
      c: 'outline',
    },
    { k: 'line', pts: [[0.21, 0.23], [0.79, 0.23]], w: 0.09, c: 'body' },
  ];
  for (let i = 0; i < 5; i++) {
    const x = 0.34 + i * 0.08;
    s.push({ k: 'line', pts: [[x, 0.27], [x, 0.73]], w: 0.025, c: 'light' });
  }
  s.push({ k: 'rect', x0: 0.35, y0: 0.82, x1: 0.65, y1: 0.89, c: 'detail' });
  return s;
}

function waveKnot(): Shape[] {
  return [
    { k: 'wave', cy: 0.38, amp: 0.12, period: 0.5, phase: 0, w: 0.1, c: 'outline' },
    { k: 'wave', cy: 0.62, amp: 0.12, period: 0.5, phase: 0.25, w: 0.1, c: 'outline' },
    { k: 'wave', cy: 0.38, amp: 0.12, period: 0.5, phase: 0, w: 0.035, c: 'light' },
    { k: 'wave', cy: 0.62, amp: 0.12, period: 0.5, phase: 0.25, w: 0.035, c: 'light' },
    { k: 'ellipse', cx: 0.25, cy: 0.5, rx: 0.07, ry: 0.07, c: 'body' },
    { k: 'ellipse', cx: 0.75, cy: 0.5, rx: 0.07, ry: 0.07, c: 'body' },
    { k: 'ellipse', cx: 0.25, cy: 0.5, rx: 0.025, ry: 0.025, c: 'glint' },
    { k: 'ellipse', cx: 0.75, cy: 0.5, rx: 0.025, ry: 0.025, c: 'glint' },
  ];
}

export const MOTIFS: Motif[] = [
  { id: 1, name: 'Sun Medallion', shapes: sunMedallion() },
  { id: 2, name: 'Eight-Petal Rosette', shapes: rosette() },
  { id: 3, name: 'Stepped Diamond', shapes: steppedDiamond() },
  { id: 4, name: 'Laurel Wreath', shapes: laurelWreath() },
  { id: 5, name: 'Amphora', shapes: amphora() },
  { id: 6, name: 'River Fish', shapes: riverFish() },
  { id: 7, name: 'Leaping Dolphin', shapes: dolphin() },
  { id: 8, name: 'Paired Doves', shapes: doves() },
  { id: 9, name: 'Stone Lyre', shapes: lyre() },
  { id: 10, name: 'Wave Knot', shapes: waveKnot() },
];

// ---------------------------------------------------------------- hit tests

function inEllipse(u: number, v: number, s: Extract<Shape, {k: 'ellipse'}>): boolean {
  let dx = u - s.cx;
  let dy = v - s.cy;
  if (s.rot) {
    const a = -s.rot * D2R;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    const nx = dx * c - dy * sn;
    const ny = dx * sn + dy * c;
    dx = nx;
    dy = ny;
  }
  return (dx * dx) / (s.rx * s.rx) + (dy * dy) / (s.ry * s.ry) <= 1;
}

function inRing(u: number, v: number, s: Extract<Shape, {k: 'ring'}>): boolean {
  const dx = u - s.cx;
  const dy = v - s.cy;
  const d = Math.hypot(dx, dy);
  if (Math.abs(d - s.r) > s.w / 2) {
    return false;
  }
  if (s.a0 === undefined || s.a1 === undefined) {
    return true;
  }
  const ang = (Math.atan2(dy, dx) / D2R + 360) % 360;
  return ang >= s.a0 && ang <= s.a1;
}

function inPoly(u: number, v: number, pts: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0];
    const yi = pts[i][1];
    const xj = pts[j][0];
    const yj = pts[j][1];
    const hit = yi > v !== yj > v && u < ((xj - xi) * (v - yi)) / (yj - yi) + xi;
    if (hit) {
      inside = !inside;
    }
  }
  return inside;
}

function distToSeg(u: number, v: number, ax: number, ay: number, bx: number, by: number): number {
  const vx = bx - ax;
  const vy = by - ay;
  const len2 = vx * vx + vy * vy;
  let t = len2 === 0 ? 0 : ((u - ax) * vx + (v - ay) * vy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(u - (ax + vx * t), v - (ay + vy * t));
}

function inLine(u: number, v: number, s: Extract<Shape, {k: 'line'}>): boolean {
  for (let i = 0; i < s.pts.length - 1; i++) {
    const a = s.pts[i];
    const b = s.pts[i + 1];
    if (distToSeg(u, v, a[0], a[1], b[0], b[1]) <= s.w / 2) {
      return true;
    }
  }
  return false;
}

function inWave(u: number, v: number, s: Extract<Shape, {k: 'wave'}>): boolean {
  const y = s.cy + s.amp * Math.sin((2 * Math.PI * (u - s.phase)) / s.period);
  return Math.abs(v - y) <= s.w / 2;
}

/** Sample a motif at a normalised point; `null` when nothing covers it. */
export function sampleMotif(shapes: Shape[], u: number, v: number): MotifRole | null {
  let hit: MotifRole | null = null;
  for (let i = 0; i < shapes.length; i++) {
    const s = shapes[i];
    let ok = false;
    switch (s.k) {
      case 'ellipse':
        ok = inEllipse(u, v, s);
        break;
      case 'ring':
        ok = inRing(u, v, s);
        break;
      case 'poly':
        ok = inPoly(u, v, s.pts);
        break;
      case 'rect':
        ok = u >= s.x0 && u <= s.x1 && v >= s.y0 && v <= s.y1;
        break;
      case 'diamond':
        ok = Math.abs(u - s.cx) + Math.abs(v - s.cy) <= s.r;
        break;
      case 'line':
        ok = inLine(u, v, s);
        break;
      case 'wave':
        ok = inWave(u, v, s);
        break;
      default:
        ok = false;
    }
    if (ok) {
      hit = s.c;
    }
  }
  return hit;
}
