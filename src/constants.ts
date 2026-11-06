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
  stone: '#a89a85',
  stoneDark: '#5f5346',
};

// Lanes ordered far -> near. Far targets are bigger (easier to see at
// distance, offsetting the longer bullet travel time) but move faster and
// score more; near targets are smaller, slower, and worth less. Each target
// re-rolls its speed within [minSpeed, maxSpeed] every time it bounces off a
// wall, so movement isn't perfectly uniform even within one lane.
export const LANES: LaneConfig[] = [
  { y: 0.12, size: 46, minSpeed: 100, maxSpeed: 140, points: 30, color: COLORS.pink },
  { y: 0.32, size: 34, minSpeed: 80, maxSpeed: 110, points: 20, color: COLORS.purple },
  { y: 0.52, size: 24, minSpeed: 58, maxSpeed: 82, points: 10, color: COLORS.cyan },
];

// Difficulty climbs with total hits landed: every DIFFICULTY_STEP_HITS hits,
// targets get a bit faster, smaller, and more erratic (wider speed range), and
// bullets get a bit faster too. Misses don't cost a level — they just don't
// add to it — so a long session keeps climbing as long as the player keeps
// landing shots, all the way up to DIFFICULTY_MAX_LEVEL.
export const DIFFICULTY_STEP_HITS = 3;
export const DIFFICULTY_SPEED_STEP = 0.1; // +10% speed per level
export const DIFFICULTY_SIZE_STEP = 0.05; // -5% size per level
export const DIFFICULTY_RANGE_STEP = 0.12; // +12% min/max speed spread per level
export const DIFFICULTY_MAX_LEVEL = 24;
export const DIFFICULTY_MIN_SIZE_MULTIPLIER = 0.4;
export const BULLET_SPEED_STEP = 0.04; // +4% bullet speed per level
export const BULLET_SPEED_MAX_MULTIPLIER = 1.8;

// Background theme cycles through these every few levels so leveling up
// visibly changes the scene, not just the numbers.
export const LEVEL_THEMES = [
  { nebula: ['#8a5cff', '#ff5cb3', '#5ad8ff'], moon: '#d8d2ff' },
  { nebula: ['#ff5cb3', '#ff9c5a', '#5ad8ff'], moon: '#ffd8c2' },
  { nebula: ['#5ad8ff', '#5affb0', '#8a5cff'], moon: '#c2fff0' },
  { nebula: ['#ff5a5a', '#ff5cb3', '#ffd25a'], moon: '#ffd2d2' },
];
export const LEVELS_PER_THEME = 3;

export const PLAYER_SIZE = 56;
export const PLAYER_SPEED = 260; // px/sec
export const PLAYER_BOTTOM_MARGIN = 24;

export const BULLET_SIZE = 18; // spinning stone diameter, px
export const BULLET_SPEED = 640; // px/sec, upward
export const BULLET_SPIN_MS = 550; // ms per full rotation
export const MAX_BULLETS = 6;

export const HIT_BAND = 26; // px tolerance around a lane's y for collision
export const RESPAWN_DELAY_MS = 450;
export const HIT_FLASH_MS = 180;

// Targets are spinning stars; one spike layer per direction so it doesn't
// read as a flat clock hand.
export const STAR_SPIN_MS = 4200;

// Fire cooldown: the player has a small pool of charges, each shot spends
// one, and charges regen over time — so taps burst a few shots then wait,
// instead of spamming freely. Recharge speeds up with level, making it an
// upgradeable stat (groundwork for multiplayer loadouts later).
export const FIRE_MAX_CHARGES = 3;
export const FIRE_RECHARGE_MS = 650; // ms per charge at level 0
export const FIRE_RECHARGE_MIN_MS = 220; // fastest recharge, at max level
export const FIRE_RECHARGE_STEP = 0.045; // -4.5% recharge time per level

// A touch counts as "fire" only if it barely moved and was quick, so a
// swipe-to-move gesture never also fires a shot.
export const TAP_MAX_DISTANCE = 18; // px
export const TAP_MAX_DURATION_MS = 250;
