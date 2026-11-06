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

// Background theme changes every level so leveling up visibly changes the
// scene, not just the numbers. Nebula positions/sizes also drift per theme
// (see Starfield), so it's not just a recolor each time.
export const LEVEL_THEMES = [
  { nebula: ['#8a5cff', '#ff5cb3', '#5ad8ff'], moon: '#d8d2ff' },
  { nebula: ['#ff5cb3', '#ff9c5a', '#5ad8ff'], moon: '#ffd8c2' },
  { nebula: ['#5ad8ff', '#5affb0', '#8a5cff'], moon: '#c2fff0' },
  { nebula: ['#ff5a5a', '#ff5cb3', '#ffd25a'], moon: '#ffd2d2' },
  { nebula: ['#5affb0', '#5ad8ff', '#ff5cb3'], moon: '#c2ffd8' },
  { nebula: ['#ff9c5a', '#8a5cff', '#5affb0'], moon: '#ffe0c2' },
  { nebula: ['#5ad8ff', '#ffd25a', '#ff5a5a'], moon: '#c2e8ff' },
  { nebula: ['#ff5cb3', '#5affb0', '#ffd25a'], moon: '#ffd2ec' },
];
export const LEVELS_PER_THEME = 1;

export const PLAYER_SIZE = 56;
export const PLAYER_SPEED = 260; // px/sec
export const PLAYER_BOTTOM_MARGIN = 24;

export const BULLET_SIZE = 18; // spinning stone diameter, px
export const BULLET_SPEED = 640; // px/sec, upward
export const BULLET_SPIN_MS = 550; // ms per full rotation
export const MAX_BULLETS = 6;

export const HIT_BAND = 26; // px tolerance around a lane's y for collision
// A hit target explodes, then waits a randomized stretch before respawning —
// never the same rhythm twice.
export const RESPAWN_MIN_MS = 500;
export const RESPAWN_MAX_MS = 1300;
export const HIT_FLASH_MS = 180;
export const EXPLOSION_MS = 420;
// How long a "+N" score popup floats up and fades before it's removed.
export const SCORE_POPUP_MS = 900;

// Targets are spinning stars; rotation is driven by the main game loop
// (TargetState.spin), not a standalone Animated loop, so it can never
// desync or stall independently of the rest of the game.
export const STAR_SPIN_MS = 4200;

// Fire cooldown: the player has a small pool of charges, each shot spends
// one, and charges regen over time — so taps burst a couple of shots then
// have to wait, instead of spamming freely. Recharge speeds up with level,
// making it an upgradeable stat (groundwork for multiplayer loadouts later).
export const FIRE_MAX_CHARGES = 2;
export const FIRE_RECHARGE_MS = 1000; // ms per charge at level 0
export const FIRE_RECHARGE_MIN_MS = 360; // fastest recharge, at max level
export const FIRE_RECHARGE_STEP = 0.035; // -3.5% recharge time per level

// A touch counts as "fire" only if it barely moved and was quick, so a
// swipe-to-move gesture never also fires a shot.
export const TAP_MAX_DISTANCE = 18; // px
export const TAP_MAX_DURATION_MS = 250;

// VS mode: a timed match against a simulated "robo player" opponent, picked
// at the start, playing side by side on the same screen at the same time
// (not a turn-based "wait for the bot" mode). The bot has its own small
// mini-arena with its own live targets, so it's visibly playing in
// real time — it just rolls for a hit on its own interval rather than
// simulating real bullet physics, simple and easy to balance by level.
export const VS_MATCH_MS = 60000;
export const VS_DURATION_OPTIONS = [30000, 60000, 90000];
export const BOT_LEVELS = [
  { name: 'Rookie', hitChance: 0.3, fireIntervalMs: 1700, color: COLORS.cyan },
  { name: 'Veteran', hitChance: 0.5, fireIntervalMs: 1250, color: COLORS.purple },
  { name: 'Ace', hitChance: 0.7, fireIntervalMs: 900, color: COLORS.pink },
];
export const BOT_AREA_RATIO = 0.34; // fraction of the play area given to the bot's mini-arena
export const BOT_LANE_SIZE_SCALE = 0.65; // bot targets render smaller, it's a mini-arena
