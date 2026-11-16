export type PigmentId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type Pigment = {
  id: PigmentId;
  name: string;
  hex: string;
  /** Label colour that stays readable on top of `hex`. */
  label: string;
};

export type MotifRole =
  | 'ground'
  | 'body'
  | 'outline'
  | 'light'
  | 'leaf'
  | 'detail'
  | 'dark'
  | 'glint';

export type Shape =
  | { k: 'ellipse'; cx: number; cy: number; rx: number; ry: number; rot?: number; c: MotifRole }
  | { k: 'ring'; cx: number; cy: number; r: number; w: number; a0?: number; a1?: number; c: MotifRole }
  | { k: 'poly'; pts: number[][]; c: MotifRole }
  | { k: 'rect'; x0: number; y0: number; x1: number; y1: number; c: MotifRole }
  | { k: 'diamond'; cx: number; cy: number; r: number; c: MotifRole }
  | { k: 'line'; pts: number[][]; w: number; c: MotifRole }
  | { k: 'wave'; cy: number; amp: number; period: number; phase: number; w: number; c: MotifRole };

export type Motif = { id: number; name: string; shapes: Shape[] };

export type Placement = { cx: number; cy: number; size: number; motif?: number };

export type Composition = {
  tier: number;
  name: string;
  cols: number;
  rows: number;
  maxPigment: PigmentId;
  placements: Placement[];
};

export type Floor = {
  id: number;
  title: string;
  villaId: number;
  roomId: string;
  tier: number;
  motif: number;
  cols: number;
  rows: number;
  total: number;
};

export type Room = { id: string; name: string; villaId: number; floorIds: number[] };

export type Villa = {
  id: number;
  name: string;
  short: string;
  roomIds: string[];
  floorIds: number[];
  unlocksAfter: number;
};

export type Puzzle = {
  floorId: number;
  cols: number;
  rows: number;
  total: number;
  /** target pigment number per cell, row-major */
  target: Uint8Array;
  /** region id per cell */
  regionOf: Int32Array;
  /** cell count per region */
  regionSize: Int32Array;
  regionCount: number;
  /** pigment numbers actually present, ascending */
  pigments: PigmentId[];
  /** total cells per pigment */
  countByPigment: Record<number, number>;
};

export type CameraMode = 'fit' | 'detail';
export type InputMode = 'paint' | 'move';

export type Camera = {
  mode: CameraMode;
  cell: number;
  tx: number;
  ty: number;
};

export type RegionEvent = {
  pigment: PigmentId;
  cells: number;
  regionsDone: number;
  totalRegions: number;
  progress: number;
};
