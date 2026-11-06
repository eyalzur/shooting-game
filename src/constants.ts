import { ChangelogEntry, CurrencyPackDef, LaneConfig, ShopItemDef } from './types';

export const GAME_NAME = 'Nova Strike';

export const SPLASH_MIN_DURATION_MS = 1500;

// Newest first. APP_VERSION is derived from the top entry so the two can
// never drift out of sync — bump the game by adding a new entry here, not
// by editing a version string somewhere else.
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.7.0',
    date: '2026-11-07',
    icon: '💣',
    title: 'Two new pickups: Nova Bomb & Magnet',
    bullets: [
      'Nova Bomb: clears every live target on screen at once, full score for each.',
      "Magnet: pickups drift toward your cannon for a few seconds — can't miss the catch.",
      'Pickups drop a bit more often overall.',
    ],
  },
  {
    version: '1.6.0',
    date: '2026-11-07',
    icon: '🔱',
    title: 'Spread Shot & Extra Chamber',
    bullets: [
      'New Spread Shot upgrade: every shot fires a 3-way fan — one straight, two angled.',
      'New Extra Chamber upgrade: one more fire charge in the clip.',
      'Spread Shot is also a mid-match pickup (temporary); beats Double Shot when both are active.',
    ],
  },
  {
    version: '1.5.0',
    date: '2026-11-07',
    icon: '🗂️',
    title: 'Player profile & patch notes',
    bullets: [
      'New PLAYER screen: a build sheet showing every upgrade, owned or locked.',
      "You're looking at it — a changelog screen, reachable from Home.",
    ],
  },
  {
    version: '1.4.0',
    date: '2026-11-06',
    icon: '🛒',
    title: 'The shop opens',
    bullets: [
      'Renamed Strafe Strike → Nova Strike.',
      'Stardust currency: earned from pickups and vs-bot wins, kept even if you lose.',
      'Shop upgrades: Double Shot, Swift Cannon (move speed), Hot Rounds (bullet speed).',
      'A big lightning banner when rapid fire kicks in, plus press feedback on every button.',
    ],
  },
  {
    version: '1.3.0',
    date: '2026-11-06',
    icon: '✨',
    title: 'Enhancements',
    bullets: [
      'Golden stars worth double score.',
      'Pickups fall from broken targets: bonus score, rapid fire, or Stardust.',
    ],
  },
  {
    version: '1.2.0',
    date: '2026-11-06',
    icon: '👆',
    title: 'Touch controls',
    bullets: [
      'Tap to fire in place — the cannon stays put.',
      'Hold or drag to slide the cannon to your finger instead.',
    ],
  },
  {
    version: '1.1.0',
    date: '2026-11-06',
    icon: '💥',
    title: 'Explosions, sound, a real icon',
    bullets: [
      'Three explosion styles: burst, shatter, implode.',
      'Sound effects and music, with an on/off toggle.',
      'A new home-screen icon.',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-11-05',
    icon: '🎯',
    title: 'Nova Strike launches',
    bullets: [
      'Spinning star targets across three lanes.',
      'Single Player and VS Robo Player modes.',
      'Difficulty climbs the longer you keep landing hits.',
    ],
  },
];
export const APP_VERSION = CHANGELOG[0].version;

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
  // Team colors: the player is always blue, the robot opponent always red —
  // used for cannons, bullets, and hit/explosion effects so it's instantly
  // clear whose shot did what.
  blue: '#4d9bff',
  red: '#ff5252',
  redLight: '#ff8a80',
  redDark: '#d32f2f',
  // Win/lose mood colors for the match result screen.
  gold: '#ffd25a',
  sad: '#7a6878',
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
export const PLAYER_SLIDE_MIN_MS = 70;
export const PLAYER_SLIDE_MAX_MS = 220;

export const BULLET_SIZE = 18; // spinning stone diameter, px
export const BULLET_SPEED = 640; // px/sec, upward
export const BULLET_SPIN_MS = 550; // ms per full rotation
export const MAX_BULLETS = 6;

export const HIT_BAND = 26; // px tolerance around a lane's y for collision
// A hit target explodes, then waits a randomized stretch before respawning —
// never the same rhythm twice.
export const RESPAWN_MIN_MS = 500;
export const RESPAWN_MAX_MS = 1300;
export const EXPLOSION_MS = 420;
// A target flashes bright and pops slightly every time it bounces off a
// side wall — a small finite animation, never a loop.
export const BOUNCE_FLASH_MS = 220;
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
export const TAP_MAX_DURATION_MS = 200;

// Match length is picked once, at the home screen, before either mode —
// solo or vs. null means no timer: play until you tap Home (solo's
// original endless mode).
export const DURATION_OPTIONS: { label: string; ms: number | null }[] = [
  { label: '30s', ms: 30000 },
  { label: '1m', ms: 60000 },
  { label: '2m', ms: 120000 },
  { label: '∞', ms: null },
];

// VS mode: a timed (or untimed) match against a simulated "robo player"
// opponent, picked at the start, playing on the SAME board as the player —
// same targets, same bottom row, both cannons visibly moving and firing at
// the same time. The bot isn't a dice roll: it physically tracks the
// nearest live target and fires at its own real x position, so misses
// happen because its aim or reflexes are worse, same as a real player
// would miss.
export const BOT_LEVELS = [
  { name: 'Rookie', color: COLORS.redLight, trackSpeed: 100, aimJitter: 46, fireIntervalMs: 1500 },
  { name: 'Veteran', color: COLORS.red, trackSpeed: 170, aimJitter: 22, fireIntervalMs: 1150 },
  { name: 'Ace', color: COLORS.redDark, trackSpeed: 250, aimJitter: 8, fireIntervalMs: 850 },
];
// How fast the bot's aim wobbles via a random walk (px/sec of drift), on
// top of its per-level aimJitter amplitude — keeps its aim visibly unsteady
// rather than snapping to a fixed offset.
export const BOT_JITTER_WALK_SPEED = 70;

// Enhancements: rare bonus mechanics layered on the base game — golden
// double-score stars, and pickups that sometimes fall from a broken target
// for the player to catch. Everything here is gated behind
// ENHANCEMENTS_ENABLED, so the whole set can be switched off in one place
// later without touching game-loop logic.
export const ENHANCEMENTS_ENABLED = true;
export const GOLDEN_STAR_CHANCE = 0.15;
export const GOLDEN_SCORE_MULTIPLIER = 2;
export const PICKUP_DROP_CHANCE = 0.35;
// Of the pickups that do drop, these five chances decide the kind — the
// remaining share is a flat score bonus.
export const PICKUP_CURRENCY_CHANCE = 0.25;
export const PICKUP_RAPID_CHANCE = 0.15;
export const PICKUP_SPREAD_CHANCE = 0.15;
export const PICKUP_BOMB_CHANCE = 0.12;
export const PICKUP_MAGNET_CHANCE = 0.13;
export const PICKUP_FALL_SPEED = 170; // px/sec
export const PICKUP_SIZE = 26;
export const PICKUP_SCORE_MIN = 10;
export const PICKUP_SCORE_MAX = 25;
export const PICKUP_RAPID_DURATION_MS = 7000;
export const PICKUP_SPREAD_DURATION_MS = 7000;
export const PICKUP_CURRENCY_MIN = 5;
export const PICKUP_CURRENCY_MAX = 15;
// Magnet: while active, every pickup on screen drifts horizontally toward
// the cannon's x as it falls, instead of dropping straight down — makes
// catching trivial for a few seconds.
export const PICKUP_MAGNET_DURATION_MS = 6000;
export const PICKUP_MAGNET_PULL_SPEED = 260; // px/sec

// Spread shot: instead of one straight bullet, fires three — a center shot
// plus two angled side shots. Bullets carry a unit direction (BulletState
// dirX/dirY) multiplied by the shared bullet speed each tick, so an angled
// bullet ramps up with difficulty/Hot Rounds exactly like a straight one.
export const SPREAD_ANGLE_DEG = 16;
// +1 fire charge in the clip (2 -> 3).
export const EXTRA_CHARGE_BONUS = 1;

// Stardust: the shop currency. Earned mid-match from currency pickups, and
// as a reward for winning a vs-bot match — kept permanently either way,
// through a loss, a tab close, whatever.
export const CURRENCY_NAME = 'Stardust';
export const CURRENCY_ICON = '✨';
export const WIN_CURRENCY_REWARD = 25;

// Currency packs — a cosmetic "buy Stardust" store, built to look and feel
// like a real purchase flow (pack cards + a price tag). No payment is ever
// processed and nothing talks to the App Store / Play Store — this is a
// web PWA with no store distribution anyway. Tapping a pack hands over
// `amount` Stardust immediately, same as any other earned Stardust.
export const CURRENCY_PACKS: CurrencyPackDef[] = [
  { id: 'small', icon: '🎁', name: 'SMALL PACK', amount: 100, priceLabel: '$0.99' },
  { id: 'medium', icon: '💎', name: 'MEDIUM PACK', amount: 300, priceLabel: '$2.99' },
  { id: 'large', icon: '👑', name: 'LARGE PACK', amount: 750, priceLabel: '$5.99' },
];

// Shop catalog — the player's cannon is the "avatar" here (this game has no
// other character art), so every upgrade is framed as modifying it. Owned
// upgrades are stored as a plain id list (see storage.ts), so adding a new
// row here is enough to make it purchasable; GameScreen reads ids it
// recognizes and ignores the rest.
export const MOVE_SPEED_UPGRADE_MULT = 1.6;
export const BULLET_SPEED_UPGRADE_MULT = 1.35;

export const SHOP_ITEMS: ShopItemDef[] = [
  {
    id: 'doubleShot',
    icon: '⚡',
    name: 'DOUBLE SHOT',
    description: 'Every shot fires as a pair, permanently. Same charge cost.',
    price: 150,
  },
  {
    id: 'moveSpeed',
    icon: '🏎️',
    name: 'SWIFT CANNON',
    description: 'Slides to your hold spot noticeably faster.',
    price: 100,
  },
  {
    id: 'bulletSpeed',
    icon: '🔥',
    name: 'HOT ROUNDS',
    description: 'Shots fly faster, so they reach targets sooner.',
    price: 120,
  },
  {
    id: 'spreadShot',
    icon: '🔱',
    name: 'SPREAD SHOT',
    description: 'Every shot fires a 3-way fan instead of one, permanently. Same charge cost.',
    price: 180,
  },
  {
    id: 'extraCharge',
    icon: '🔋',
    name: 'EXTRA CHAMBER',
    description: 'One more fire charge in the clip — 3 instead of 2.',
    price: 130,
  },
];
