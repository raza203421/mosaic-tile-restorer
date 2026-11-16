import { Dimensions } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export { SCREEN_W, SCREEN_H };

/** Splash duration — exactly 8000 ms (pipeline screenshot window depends on it). */
export const LOADER_DURATION_MS = 8000;
export const LOADER_PROGRESS_MS = 7800;

/** Safe top clearance under the Android status bar. */
export const TOP_INSET = 44;
export const HEADER_CONTENT_H = 72;
export const BOTTOM_INSET = 16;
export const GUTTER = 16;

/** Board frame: 6 dp inner padding + 2 dp mineral border. */
export const BOARD_PAD = 6;
export const BOARD_BORDER = 2;
export const BOARD_FRAME = BOARD_PAD + BOARD_BORDER; // 8
export const BOARD_MAX_W = Math.min(SCREEN_W - 32, 380);

/** Floating palette tray (G2 layout). */
export const TRAY_H = 216;
export const TRAY_BOTTOM_OFFSET = 24;
export const TRAY_GAP = 12;
export const TRAY_RESERVED = TRAY_H + TRAY_BOTTOM_OFFSET + TRAY_GAP;

/** Camera. */
export const DETAIL_CELL_SIZES = [48, 64, 96] as const;
export const MIN_DETAIL_CELL = 48;
export const TAP_SLOP = 8;

/** Content. */
export const TOTAL_FLOORS = 70;
export const MAX_TILES = 1008;
export const SAVE_DEBOUNCE_MS = 250;

/** Feedback timings. */
export const MISMATCH_MS = 1000;
export const REGION_SHEET_AUTO_MS = 1100;

export const BUTTON_H = 56;
export const SECONDARY_H = 48;
export const TOUCH_MIN = 48;
export const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };
