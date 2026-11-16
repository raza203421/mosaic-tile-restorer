import { FLOORS, ROOMS, VILLAS, floorById, roomById } from './catalog';
import { TOTAL_FLOORS } from '../constants/config';

/**
 * Sequential unlocks derive from the set of completed floor ids — there is no
 * spendable counter, currency or random reward anywhere in the app.
 */

export type Settings = {
  gridLines: boolean;
  sound: boolean;
  reduceMotion: boolean;
};

export type Selection = { villaId: number; roomId: string; floorId: number };

export type Progress = {
  completed: number[];
  selection: Selection;
  settings: Settings;
  tutorialSeen: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  gridLines: true,
  sound: true,
  reduceMotion: false,
};

export const DEFAULT_PROGRESS: Progress = {
  completed: [],
  selection: { villaId: 1, roomId: ROOMS[0].id, floorId: 1 },
  settings: DEFAULT_SETTINGS,
  tutorialSeen: false,
};

/**
 * App-private, in-memory record. It keeps a valid snapshot across screen
 * transitions and fast refresh without pulling in a storage dependency.
 */
let record: Progress = { ...DEFAULT_PROGRESS, completed: [] };

export function loadRecord(): Progress {
  return {
    completed: [...record.completed],
    selection: { ...record.selection },
    settings: { ...record.settings },
    tutorialSeen: record.tutorialSeen,
  };
}

export function saveRecord(next: Progress): void {
  const valid = next.completed.filter(id => id >= 1 && id <= TOTAL_FLOORS);
  record = {
    completed: Array.from(new Set(valid)).sort((a, b) => a - b),
    selection: { ...next.selection },
    settings: { ...next.settings },
    tutorialSeen: next.tutorialSeen,
  };
}

export function isFloorUnlocked(floorId: number, completed: number[]): boolean {
  if (floorId <= 1) {
    return true;
  }
  return completed.indexOf(floorId - 1) !== -1;
}

export function isVillaUnlocked(villaId: number, completed: number[]): boolean {
  const villa = VILLAS.find(v => v.id === villaId);
  if (!villa || villa.unlocksAfter === 0) {
    return true;
  }
  return completed.indexOf(villa.unlocksAfter) !== -1;
}

export function isRoomUnlocked(roomId: string, completed: number[]): boolean {
  const room = roomById(roomId);
  return isFloorUnlocked(room.floorIds[0], completed);
}

export function highestUnlockedFloor(completed: number[]): number {
  let best = 1;
  for (let id = 1; id <= TOTAL_FLOORS; id++) {
    if (isFloorUnlocked(id, completed)) {
      best = id;
    }
  }
  return best;
}

/** The next incomplete floor the player may open, or null when all are done. */
export function nextAvailableFloor(completed: number[]): number | null {
  for (let id = 1; id <= TOTAL_FLOORS; id++) {
    if (isFloorUnlocked(id, completed) && completed.indexOf(id) === -1) {
      return id;
    }
  }
  return null;
}

export function selectionFor(floorId: number): Selection {
  const floor = floorById(floorId);
  return { villaId: floor.villaId, roomId: floor.roomId, floorId: floor.id };
}

export function restoredInVilla(villaId: number, completed: number[]): number {
  return completed.filter(id => floorById(id).villaId === villaId).length;
}

export function floorsOfRoom(roomId: string) {
  return roomById(roomId).floorIds.map(id => FLOORS[id - 1]);
}
