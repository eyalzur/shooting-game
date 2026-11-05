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
  { y: 0.12, size: 60, speed: 150, points: 30, color: COLORS.pink },
  { y: 0.32, size: 46, speed: 110, points: 20, color: COLORS.purple },
  { y: 0.52, size: 34, speed: 80, points: 10, color: COLORS.cyan },
];

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
export const TAP_MAX_DISTANCE = 12; // px
export const TAP_MAX_DURATION_MS = 250;
