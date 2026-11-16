import { MOTIFS } from './motifs';
import type { Composition, Floor, Pigment, PigmentId, Placement, Room, Villa } from './types';

/** The eight clue pigments are fixed identifiers — number first, colour second. */
export const PIGMENTS: Pigment[] = [
  { id: 1, name: 'Limestone', hex: '#E8DDC4', label: '#221016' },
  { id: 2, name: 'Ochre', hex: '#D9B36C', label: '#221016' },
  { id: 3, name: 'Terracotta', hex: '#D97B4D', label: '#221016' },
  { id: 4, name: 'Lapis', hex: '#355C9A', label: '#F0E9EC' },
  { id: 5, name: 'Olive', hex: '#7FA46B', label: '#221016' },
  { id: 6, name: 'Rose', hex: '#AB2A58', label: '#F0E9EC' },
  { id: 7, name: 'Dark Stone', hex: '#592C26', label: '#F0E9EC' },
  { id: 8, name: 'Chalk', hex: '#FAF5EC', label: '#221016' },
];

export function pigment(id: number): Pigment {
  return PIGMENTS[Math.max(0, Math.min(7, id - 1))];
}

/**
 * Seven composition tiers. Grid sizes stay inside the renderable budget
 * (MAX_TILES) so the whole board draws as a handful of batched SVG paths.
 */
const TIERS: Array<{
  name: string;
  cols: number;
  rows: number;
  maxPigment: PigmentId;
  placements: Placement[];
}> = [
  {
    name: 'Foundation',
    cols: 14,
    rows: 14,
    maxPigment: 4,
    placements: [{ cx: 0.5, cy: 0.5, size: 0.92 }],
  },
  {
    name: 'Bordered',
    cols: 18,
    rows: 22,
    maxPigment: 5,
    placements: [
      { cx: 0.5, cy: 0.5, size: 0.86 },
      { cx: 0.14, cy: 0.14, size: 0.18, motif: 3 },
      { cx: 0.86, cy: 0.14, size: 0.18, motif: 3 },
      { cx: 0.14, cy: 0.86, size: 0.18, motif: 3 },
      { cx: 0.86, cy: 0.86, size: 0.18, motif: 3 },
    ],
  },
  {
    name: 'Twin Panels',
    cols: 20,
    rows: 24,
    maxPigment: 6,
    placements: [
      { cx: 0.5, cy: 0.26, size: 0.46 },
      { cx: 0.5, cy: 0.74, size: 0.46 },
    ],
  },
  {
    name: 'Corner Rosettes',
    cols: 22,
    rows: 26,
    maxPigment: 6,
    placements: [
      { cx: 0.5, cy: 0.5, size: 0.66 },
      { cx: 0.13, cy: 0.13, size: 0.22, motif: 2 },
      { cx: 0.87, cy: 0.13, size: 0.22, motif: 2 },
      { cx: 0.13, cy: 0.87, size: 0.22, motif: 2 },
      { cx: 0.87, cy: 0.87, size: 0.22, motif: 2 },
    ],
  },
  {
    name: 'Garden Frieze',
    cols: 24,
    rows: 30,
    maxPigment: 7,
    placements: [
      { cx: 0.5, cy: 0.5, size: 0.7 },
      { cx: 0.12, cy: 0.25, size: 0.14, motif: 3 },
      { cx: 0.12, cy: 0.5, size: 0.14, motif: 3 },
      { cx: 0.12, cy: 0.75, size: 0.14, motif: 3 },
      { cx: 0.88, cy: 0.25, size: 0.14, motif: 3 },
      { cx: 0.88, cy: 0.5, size: 0.14, motif: 3 },
      { cx: 0.88, cy: 0.75, size: 0.14, motif: 3 },
    ],
  },
  {
    name: 'Triptych',
    cols: 26,
    rows: 32,
    maxPigment: 8,
    placements: [
      { cx: 0.27, cy: 0.27, size: 0.4 },
      { cx: 0.73, cy: 0.27, size: 0.4 },
      { cx: 0.5, cy: 0.72, size: 0.56 },
    ],
  },
  {
    name: 'Grand Floor',
    cols: 28,
    rows: 36,
    maxPigment: 8,
    placements: [
      { cx: 0.5, cy: 0.5, size: 0.6 },
      { cx: 0.5, cy: 0.13, size: 0.24, motif: 2 },
      { cx: 0.5, cy: 0.87, size: 0.24, motif: 2 },
      { cx: 0.13, cy: 0.5, size: 0.2, motif: 6 },
      { cx: 0.87, cy: 0.5, size: 0.2, motif: 6 },
    ],
  },
];

export function compositionFor(floorId: number): Composition {
  const tierIndex = Math.min(6, Math.floor((floorId - 1) / 10));
  const t = TIERS[tierIndex];
  return {
    tier: tierIndex + 1,
    name: t.name,
    cols: t.cols,
    rows: t.rows,
    maxPigment: t.maxPigment,
    placements: t.placements,
  };
}

export function motifFor(floorId: number): number {
  return ((floorId - 1) % 10) + 1;
}

// ------------------------------------------------------------------ content

type RoomSeed = { id: string; name: string; villaId: number; from: number; to: number };

const ROOM_SEEDS: RoomSeed[] = [
  { id: 'sun-foyer', name: 'Foyer', villaId: 1, from: 1, to: 6 },
  { id: 'sun-courtyard', name: 'Courtyard', villaId: 1, from: 7, to: 12 },
  { id: 'sun-dining', name: 'Dining Hall', villaId: 1, from: 13, to: 18 },
  { id: 'sun-atrium', name: 'Atrium', villaId: 1, from: 19, to: 24 },
  { id: 'vines-vestibule', name: 'Vestibule', villaId: 2, from: 25, to: 30 },
  { id: 'vines-peristyle', name: 'Peristyle', villaId: 2, from: 31, to: 36 },
  { id: 'vines-banquet', name: 'Banquet Room', villaId: 2, from: 37, to: 42 },
  { id: 'vines-garden', name: 'Garden Walk', villaId: 2, from: 43, to: 48 },
  { id: 'tides-entrance', name: 'Entrance', villaId: 3, from: 49, to: 54 },
  { id: 'tides-pool', name: 'Pool Court', villaId: 3, from: 55, to: 60 },
  { id: 'tides-gallery', name: 'Gallery', villaId: 3, from: 61, to: 65 },
  { id: 'tides-sea', name: 'Sea Hall', villaId: 3, from: 66, to: 70 },
];

function range(from: number, to: number): number[] {
  const out: number[] = [];
  for (let i = from; i <= to; i++) {
    out.push(i);
  }
  return out;
}

export const ROOMS: Room[] = ROOM_SEEDS.map(r => ({
  id: r.id,
  name: r.name,
  villaId: r.villaId,
  floorIds: range(r.from, r.to),
}));

export const VILLAS: Villa[] = [
  {
    id: 1,
    name: 'Villa of the Sun',
    short: 'Sun',
    roomIds: ROOMS.filter(r => r.villaId === 1).map(r => r.id),
    floorIds: range(1, 24),
    unlocksAfter: 0,
  },
  {
    id: 2,
    name: 'Villa of Vines',
    short: 'Vines',
    roomIds: ROOMS.filter(r => r.villaId === 2).map(r => r.id),
    floorIds: range(25, 48),
    unlocksAfter: 24,
  },
  {
    id: 3,
    name: 'Villa of Tides',
    short: 'Tides',
    roomIds: ROOMS.filter(r => r.villaId === 3).map(r => r.id),
    floorIds: range(49, 70),
    unlocksAfter: 48,
  },
];

export const FLOORS: Floor[] = (() => {
  const out: Floor[] = [];
  for (const room of ROOMS) {
    for (const id of room.floorIds) {
      const comp = compositionFor(id);
      const motif = motifFor(id);
      out.push({
        id,
        title: comp.name + ' ' + MOTIFS[motif - 1].name,
        villaId: room.villaId,
        roomId: room.id,
        tier: comp.tier,
        motif,
        cols: comp.cols,
        rows: comp.rows,
        total: comp.cols * comp.rows,
      });
    }
  }
  return out.sort((a, b) => a.id - b.id);
})();

export function floorById(id: number): Floor {
  return FLOORS[Math.max(0, Math.min(FLOORS.length - 1, id - 1))];
}

export function roomById(id: string): Room {
  return ROOMS.find(r => r.id === id) ?? ROOMS[0];
}

export function villaById(id: number): Villa {
  return VILLAS.find(v => v.id === id) ?? VILLAS[0];
}

export function roomsOfVilla(villaId: number): Room[] {
  return ROOMS.filter(r => r.villaId === villaId);
}
