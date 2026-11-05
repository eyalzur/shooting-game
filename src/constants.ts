import { LaneConfig } from './types';

export const GAME_NAME = 'Strafe Strike';

export const SPLASH_MIN_DURATION_MS = 1500;

// Lanes ordered far -> near. Far targets are smaller and faster (harder to
// hit, and the bullet also takes longer to reach them). Tune freely later.
export const LANES: LaneConfig[] = [
  { y: 0.12, size: 34, speed: 150, points: 30, color: '#ff5252' },
  { y: 0.32, size: 46, speed: 110, points: 20, color: '#ffb300' },
  { y: 0.52, size: 60, speed: 80, points: 10, color: '#4caf50' },
];

export const PLAYER_SIZE = 56;
export const PLAYER_SPEED = 260; // px/sec
export const PLAYER_BOTTOM_MARGIN = 24;

export const BULLET_SIZE = { width: 6, height: 16 };
export const BULLET_SPEED = 520; // px/sec, upward
export const MAX_BULLETS = 6;

export const HIT_BAND = 26; // px tolerance around a lane's y for collision
export const RESPAWN_DELAY_MS = 450;
export const HIT_FLASH_MS = 180;

export const CONTROLS_HEIGHT = 120;
