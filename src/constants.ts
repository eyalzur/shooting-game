import { LaneConfig } from './types';

export const GAME_NAME = 'Strafe Strike';

export const SPLASH_MIN_DURATION_MS = 1500;

export const COLORS = {
  background: '#05030f',
  panel: 'rgba(16,12,38,0.65)',
  border: 'rgba(138,92,255,0.35)',
  textPrimary: '#f4f1ff',
  textSecondary: '#9a8fc2',
  cyan: '#5ad8ff',
  purple: '#8a5cff',
  pink: '#ff5cb3',
};

// Lanes ordered far -> near. Far targets are bigger (easier to see at
// distance, offsetting the longer bullet travel time) but move faster and
// score more; near targets are smaller, slower, and worth less. Tune freely.
export const LANES: LaneConfig[] = [
  { y: 0.12, size: 46, speed: 190, points: 30, color: COLORS.pink },
  { y: 0.32, size: 34, speed: 150, points: 20, color: COLORS.purple },
  { y: 0.52, size: 24, speed: 110, points: 10, color: COLORS.cyan },
];

// Difficulty ramps with hits landed, not time, and steps up gradually: every
// DIFFICULTY_STEP_HITS hits, targets get a bit faster and a bit smaller,
// capped so it never becomes impossible.
export const DIFFICULTY_STEP_HITS = 4;
export const DIFFICULTY_SPEED_STEP = 0.12; // +12% speed per step
export const DIFFICULTY_SIZE_STEP = 0.07; // -7% size per step
export const DIFFICULTY_MAX_LEVEL = 10;
export const DIFFICULTY_MIN_SIZE_MULTIPLIER = 0.55;

export const PLAYER_SIZE = 56;
export const PLAYER_SPEED = 260; // px/sec
export const PLAYER_BOTTOM_MARGIN = 24;

export const BULLET_SIZE = { width: 5, height: 20 };
export const BULLET_SPEED = 520; // px/sec, upward
export const MAX_BULLETS = 6;

export const HIT_BAND = 26; // px tolerance around a lane's y for collision
export const RESPAWN_DELAY_MS = 450;
export const HIT_FLASH_MS = 180;

// A touch counts as "fire" only if it barely moved and was quick, so a
// swipe-to-move gesture never also fires a shot.
export const TAP_MAX_DISTANCE = 18; // px
export const TAP_MAX_DURATION_MS = 250;
