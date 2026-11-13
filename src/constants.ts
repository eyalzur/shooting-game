import { AccuracyTierDef, ChangelogEntry, CurrencyPackDef, PlanetTierConfig, ShopCategory, ShopItemDef } from './types';

export const GAME_NAME = 'Orbit Breaker';

export const SPLASH_MIN_DURATION_MS = 1500;

// Newest first. APP_VERSION is derived from the top entry so the two can
// never drift out of sync — bump the game by adding a new entry here, not
// by editing a version string somewhere else.
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.21.0',
    date: '2026-11-13',
    icon: '🛡️',
    title: 'A whole new way to play: defend your core',
    bullets: [
      'Planets now drift in from the edges toward your own cannon instead of just bouncing sideways in fixed lanes.',
      'Shoot one down and it breaks into 2-4 debris chunks that scatter on their own — finish them off for a bonus, or let them go and hope they miss.',
      'Your cannon has a 5-point shield: anything that reaches it costs a point, and the match ends when it runs out. No more countdown timer.',
      "The old screen-clearing bomb pickup is renamed Core Pulse.",
      'VS Robo Player is on hold while it gets redesigned around this new core-defense loop — back soon.',
    ],
  },
  {
    version: '1.20.0',
    date: '2026-11-13',
    icon: '🛰️',
    title: 'Nova Strike is now Orbit Breaker',
    bullets: [
      'New name, new look on the way — the core-defense redesign lands in the next update.',
    ],
  },
  {
    version: '1.19.0',
    date: '2026-11-12',
    icon: '⏳',
    title: 'Result buttons wait a beat before they\'re clickable',
    bullets: [
      'PLAY AGAIN and HOME now stay dimmed and unpressable for a couple seconds after the win/lose panel appears, so a tap already in flight when the match ends can\'t accidentally trigger one.',
    ],
  },
  {
    version: '1.18.1',
    date: '2026-11-08',
    icon: '🌍',
    title: 'Planets always read as a solid ball, never a thin disc',
    bullets: [
      "Rotating the flat planet shape in 3D could briefly flatten it into a sliver at some spin angles — now the outer silhouette stays a perfect sphere, and the spin instead plays out as craters and surface lines sweeping across the ball, like watching a real globe turn.",
    ],
  },
  {
    version: '1.18.0',
    date: '2026-11-08',
    icon: '🪐',
    title: 'Targets are spinning planets again, not pointed stars',
    bullets: [
      'The 5-pointed-star shape from last update wasn\'t what was meant — targets are back to round, gradient-shaded little worlds (moon/Mars/Saturn-style), with surface patches and a sunlit highlight for real depth, still tumbling in true 3D.',
    ],
  },
  {
    version: '1.17.2',
    date: '2026-11-08',
    icon: '⏸️',
    title: 'The scene freezes when a match ends',
    bullets: [
      'Targets and bullets used to keep moving behind the win/lose panel, which could let a gesture that was already in progress right as the clock hit zero sneak in a stray shot or move. Everything now freezes the instant the match ends, and the result panel is the only thing that can respond to a tap.',
    ],
  },
  {
    version: '1.17.1',
    date: '2026-11-08',
    icon: '🛍️',
    title: 'Purchase celebration reads cleaner as it fades',
    bullets: [
      'The "Purchased!" text now sits on its own solid card instead of floating bare over the dimming background, and fully fades out before the backdrop starts to clear — no more a moment where the text looked like it was part of the screen underneath.',
    ],
  },
  {
    version: '1.17.0',
    date: '2026-11-08',
    icon: '📐',
    title: 'Shop buttons are bolder, categories fit without scrolling',
    bullets: [
      'Buy buttons now carry a real tinted background in every state (affordable, maxed, can\'t afford) — not just a border — so they\'re noticeable at a glance.',
      'Each category list is redesigned to fit on one screen — smaller item cards, descriptions trimmed, the redundant per-category "Suggested" row removed (the Shop home\'s Suggested row already covers that). No more scrolling to see what a category offers.',
    ],
  },
  {
    version: '1.16.2',
    date: '2026-11-07',
    icon: '🩵',
    title: '"Can\'t afford" switched from blue to cyan',
    bullets: [
      'Blue is the player\'s own team color everywhere else in the game (cannon, bullets, score), so using it for "can\'t afford yet" read as a mismatch. It\'s cyan now instead — still distinct from every category color, without the team-color mix-up.',
    ],
  },
  {
    version: '1.16.0',
    date: '2026-11-07',
    icon: '🚀',
    title: 'The ship and the stars got real artwork',
    bullets: [
      'The cannon is now a hand-drawn fighter ship — nose, swept wings, twin tail fins, cockpit glass, gradient-shaded hull and engine glow — instead of a flat triangle.',
      'Targets are proper 5-pointed stars with gradient shading and a cast-shadow twin for real depth, still tumbling in true 3D (rotateY) rather than spinning flat.',
    ],
  },
  {
    version: '1.15.2',
    date: '2026-11-07',
    icon: '🎨',
    title: 'Shop buy buttons now show real color, not just gray',
    bullets: [
      'Maxed items are green, items you can\'t afford yet are red — instead of both just looking dimmed gray like before.',
    ],
  },
  {
    version: '1.15.1',
    date: '2026-11-07',
    icon: '🧭',
    title: 'Shop fits on one screen now',
    bullets: [
      'Categories are a small, always-visible icon row above the suggestions, not big tiles — tap one to switch straight to it, tap it again to go back to the overview.',
      'The Shop home screen (categories + suggestions) now fits in view without scrolling.',
    ],
  },
  {
    version: '1.15.0',
    date: '2026-11-07',
    icon: '🗺️',
    title: 'Shop redesigned around categories and suggestions',
    bullets: [
      'Shop now opens on 4 category tiles instead of one long list — tap one to drill into just that category, with a back arrow to return.',
      'A "Suggested for you" row of 3 picks leads both the Shop home and every category: a cheap pick, a good-value pick, and a best-value pick priced close to the middle one.',
      'Buying directly from a suggestion card works the same as buying from the full list.',
    ],
  },
  {
    version: '1.14.2',
    date: '2026-11-07',
    icon: '📏',
    title: 'Shop cards are all the same height now',
    bullets: [
      'Every Shop item card is now a fixed, identical size — descriptions trimmed to fit cleanly instead of pushing some cards taller than others.',
    ],
  },
  {
    version: '1.14.1',
    date: '2026-11-07',
    icon: '🔘',
    title: 'Purchase buttons made uniform',
    bullets: [
      'Every buy button in the Shop and Stardust packs is now the same fixed size, with shorter text ("190" / "MAX" instead of a Stardust icon plus "MAXED") so prices line up cleanly no matter how many digits.',
    ],
  },
  {
    version: '1.14.0',
    date: '2026-11-07',
    icon: '🆕',
    title: 'Four new upgrades: Piercing Rounds, Homing Shot, Wide Stance, Second Wind',
    bullets: [
      'Piercing Rounds (Firepower): shots punch through to the target behind — one level, one target deeper.',
      'Homing Shot (Abilities): bullets curve toward the nearest live target for the first 15s of every match, same as Double Shot and Spread Shot.',
      'Wide Stance (Movement): a permanently wider catch radius, no pickup needed — stacks with Growth.',
      'Second Wind (Luck): a pickup you miss refunds a little Stardust instead of just being gone, up to the owned number of times per match.',
      'New Homing pickup (🎯) drops from broken targets alongside the others.',
    ],
  },
  {
    version: '1.13.6',
    date: '2026-11-07',
    icon: '🔍',
    title: 'Tap a Player badge to see its real status',
    bullets: [
      'Tapping any badge on the Player screen now opens its status — level dots and number, full description, current effect vs. next level, and the price to unlock or upgrade it.',
    ],
  },
  {
    version: '1.13.5',
    date: '2026-11-07',
    icon: '🗂️',
    title: 'Player screen laid out as a compact grid',
    bullets: [
      'Categories now sit two to a row in the middle of the screen instead of one long scrolling list — smaller avatar, smaller badges, the whole build fits at a glance.',
    ],
  },
  {
    version: '1.13.4',
    date: '2026-11-07',
    icon: '🐛',
    title: 'Fixed: tapping a maxed Shop item closed the Shop',
    bullets: [
      'Tapping a maxed-out or unaffordable item used to fall through to the screen behind it and back out to Home. It now just does nothing, as it should.',
    ],
  },
  {
    version: '1.13.3',
    date: '2026-11-07',
    icon: '🧲',
    title: 'Magnet pulls pickups in twice as fast',
    bullets: [
      'While Magnet is active, every falling pickup drops twice as fast toward you, on top of the horizontal pull — a real speed boost, not just a nudge sideways.',
    ],
  },
  {
    version: '1.13.2',
    date: '2026-11-07',
    icon: '📐',
    title: 'Shop shows the real numbers behind every upgrade',
    bullets: [
      'Every Shop item now shows its actual effect as a number — bullet speed multiplier, move speed multiplier, charge count, drop-chance percent, size multiplier, growth seconds — current value and what the next level gets you.',
    ],
  },
  {
    version: '1.13.1',
    date: '2026-11-07',
    icon: '🧿',
    title: 'Player screen redesigned as an icon loadout',
    bullets: [
      'Player now shows a compact grid of icon badges grouped by category instead of full text cards — bright and colored when owned, dimmed with a lock when not.',
      'Level shows as small dots under the icon, no more "Lv 2/3" text.',
    ],
  },
  {
    version: '1.13.0',
    date: '2026-11-07',
    icon: '🍀',
    title: 'Shop categories, a Luck upgrade, and tap-to-go-back',
    bullets: [
      'New Lucky Strikes upgrade: better odds that breaking a target drops a pickup.',
      'Shop and Player screens now group upgrades by category — Firepower, Abilities, Movement, Luck — shown a different way on each screen.',
      'Tapping anywhere outside a button now backs out to the previous screen, on every menu.',
      'The purchase celebration now dims the background behind it instead of floating over bare screen.',
      'The countdown pulse uses a blocky sci-fi font and shatters into particles instead of just fading.',
    ],
  },
  {
    version: '1.12.0',
    date: '2026-11-07',
    icon: '⏳',
    title: 'Countdown pulse and a cleaner ability stack',
    bullets: [
      'A big number pulses on screen as the match clock hits 10, 5, 3, 2, 1.',
      'Active ability badges (Double Shot, Spread Shot, Magnet, Growth) moved off the top bar to a stacked list on the left side of the play area, each with its own countdown.',
    ],
  },
  {
    version: '1.11.0',
    date: '2026-11-07',
    icon: '🪐',
    title: 'Growth pickup, a bigger result screen, and a round of balance fixes',
    bullets: [
      'New Growth pickup: grows the cannon for a few seconds, making the next pickups easier to catch.',
      'Two new upgrades — Colossus Core (bigger growth, capped well short of double) and Lasting Growth (longer).',
      'Targets now spin in real 3D, not a flat pinwheel — and pickup colors no longer repeat a star’s lane color.',
      'Result screen overhaul: a big animated Stardust counter, a clearly labeled Accuracy badge (that mystery leaf is gone), and a breakdown of targets hit and every pickup collected.',
      'Buttons have a punchier press animation, and buying something now gets a real celebration — burst, confetti, the works.',
      'Double Shot + Spread Shot together now fire as a quick 3-pulse ripple instead of all 6 bullets at once.',
      'Spread Shot fan narrowed further.',
      'Magnet pulls pickups in faster.',
      'Every Shop and Stardust pack card is tappable anywhere on it, not just the price.',
      'Player screen has a Reset Inventory button (upgrades only — currency and best score untouched).',
    ],
  },
  {
    version: '1.10.0',
    date: '2026-11-07',
    icon: '📈',
    title: 'Shop items can now be upgraded',
    bullets: [
      'Swift Cannon, Hot Rounds, and Extra Chamber now have 3 levels each — buy again for a bigger effect at a higher price.',
      'Shop and Player screens show your current level and the price for the next one.',
      'Ability badges in the top bar now show just the icon and seconds, no label.',
      'A pickup for a power you already have stacks onto the remaining time instead of being wasted.',
    ],
  },
  {
    version: '1.9.0',
    date: '2026-11-07',
    icon: '⏳',
    title: 'Double Shot & Spread Shot are no longer forever',
    bullets: [
      "Owning Double Shot or Spread Shot now activates it for the first 15s of every match, not the whole match — same window every time.",
      'Catching the matching pickup mid-match extends your remaining window instead of restarting it short.',
      'Swift Cannon, Hot Rounds, and Extra Chamber are unaffected — still permanent.',
    ],
  },
  {
    version: '1.8.0',
    date: '2026-11-07',
    icon: '🎯',
    title: 'Marksmanship stat & balance pass',
    bullets: [
      'New Marksmanship stat on the result screen — a rank plus a Stardust bonus scaled by accuracy (always something if you landed a hit).',
      'Active ability badges moved to their own row in the top bar, so they can no longer get crowded off a narrow screen.',
      'Spread Shot narrowed — the 3-way fan was too wide.',
    ],
  },
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
  // Pickup-only accents — deliberately not reused from the lane or team
  // colors above, so a falling pickup never reads as "the same color" as a
  // star or cannon already on screen.
  green: '#5cff9d',
  orange: '#ff9d5c',
  starlight: '#d9d4ff',
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

// Planet tiers, picked at random per spawn instead of tied to a fixed row —
// a big/slow/high-value planet is just as likely to show up as a
// small/fast/low-value one. Same size/speed/points/color shape the old fixed
// lanes used, just no longer positional.
export const PLANET_TIERS: PlanetTierConfig[] = [
  { size: 46, minSpeed: 60, maxSpeed: 85, points: 30, color: COLORS.pink },
  { size: 34, minSpeed: 80, maxSpeed: 105, points: 20, color: COLORS.purple },
  { size: 24, minSpeed: 100, maxSpeed: 130, points: 10, color: COLORS.cyan },
];

// Difficulty climbs with total planets destroyed: every DIFFICULTY_STEP_HITS
// hits, newly-spawned planets get a bit faster, smaller, and more erratic
// (wider speed range), spawn more often, and bullets get a bit faster too.
// Misses don't cost a level — they just don't add to it — so a long survival
// run keeps climbing as long as the player keeps landing shots, all the way
// up to DIFFICULTY_MAX_LEVEL. Only new spawns are affected; a planet already
// in flight keeps the speed/size it was given at spawn.
export const DIFFICULTY_STEP_HITS = 3;
export const DIFFICULTY_SPEED_STEP = 0.1; // +10% speed per level
export const DIFFICULTY_SIZE_STEP = 0.05; // -5% size per level
export const DIFFICULTY_RANGE_STEP = 0.12; // +12% min/max speed spread per level
export const DIFFICULTY_MAX_LEVEL = 24;
export const DIFFICULTY_MIN_SIZE_MULTIPLIER = 0.4;
export const BULLET_SPEED_STEP = 0.04; // +4% bullet speed per level
export const BULLET_SPEED_MAX_MULTIPLIER = 1.8;

// Core-defense spawn/movement tuning. A planet's initial heading is offset
// from the straight bearing to the core by a random angle, then gradually
// corrected back in every tick at PLANET_TURN_RATE — slower than a homing
// bullet's turn rate, so the path reads as a gentle incoming arc rather than
// an instant snap-to-target missile.
export const PLANET_TURN_RATE = 0.8; // (unit-vector fraction)/sec
export const PLANET_SPAWN_ANGLE_OFFSET = 0.6; // radians, ± at spawn
export const MAX_LIVE_PLANETS = 6;
export const PLANET_SPAWN_BASE_MS = 1300;
export const PLANET_SPAWN_MIN_MS = 500;
export const PLANET_SPAWN_STEP = 0.035; // -3.5% spawn interval per difficulty level

// A shot planet breaks into 2-4 debris chunks that scatter on their own
// momentum (no steering, unlike a planet) — they can still reach the core,
// or be shot down for a smaller bonus, but don't fragment further.
export const DEBRIS_COUNT_MIN = 2;
export const DEBRIS_COUNT_MAX = 4;
export const DEBRIS_SIZE = 10;
export const DEBRIS_SPEED_MIN = 90;
export const DEBRIS_SPEED_MAX = 190;
export const DEBRIS_POINTS = 5;
export const DEBRIS_LIFETIME_MS = 4000; // despawns on its own if it never reaches the core or screen edge
export const DEBRIS_POP_MS = 220; // shot-debris pop animation duration, shared with Debris.tsx

// Bullet-vs-planet/debris collision is a circle test now (nothing is
// lane-locked any more) — this is forgiveness added on top of the target's
// own radius, not a hard requirement for a pixel-perfect overlap.
export const BULLET_HIT_PAD = 12;

// The core is the player's own cannon — there's no separate sprite for it.
// Any planet or debris chunk that gets within its own radius + the cannon's
// radius (+ a little forgiveness) costs one shield point and is removed.
// Shield hitting 0 ends the match — the sole end condition.
export const SHIELD_MAX = 5;
export const CORE_HIT_PAD = 2;

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

// A hit planet explodes, then waits a randomized stretch before it's
// actually removed from play — just long enough for the explosion
// animation to read, never the same rhythm twice.
export const DESPAWN_MIN_MS = 500;
export const DESPAWN_MAX_MS = 1300;
export const EXPLOSION_MS = 420;
// How long a "+N" score popup floats up and fades before it's removed.
export const SCORE_POPUP_MS = 900;

// Planets are spinning spheres; rotation is driven by the main game loop
// (TargetState.spin), not a standalone Animated loop, so it can never
// desync or stall independently of the rest of the game.
export const PLANET_SPIN_MS = 4200;

// Fire cooldown: the player has a small pool of charges, each shot spends
// one, and charges regen over time — so taps burst a couple of shots then
// have to wait, instead of spamming freely. Recharge speeds up with level,
// making it an upgradeable stat (groundwork for multiplayer loadouts later).
export const FIRE_MAX_CHARGES = 3;
export const FIRE_RECHARGE_MS = 650; // ms per charge at level 0
export const FIRE_RECHARGE_MIN_MS = 280; // fastest recharge, at max level
export const FIRE_RECHARGE_STEP = 0.035; // -3.5% recharge time per level

// Fire-feel feedback: a quick cannon recoil kick and muzzle flash on every
// shot, and a brief screen shake on a solid planet hit — pure juice, no
// effect on hitboxes or scoring.
export const RECOIL_KICK_PX = 7;
export const RECOIL_KICK_MS = 90;
export const MUZZLE_FLASH_MS = 90;
export const HIT_SHAKE_PX = 5;
export const HIT_SHAKE_MS = 90;

// A touch counts as "fire" only if it barely moved and was quick, so a
// swipe-to-move gesture never also fires a shot.
export const TAP_MAX_DISTANCE = 18; // px
export const TAP_MAX_DURATION_MS = 200;

// VS mode is being redesigned as a separate follow-up (rival cores, each
// with its own shield) — BOT_LEVELS is unused by GameScreen right now, kept
// only so BotSelectScreen.tsx still compiles standalone.
export const BOT_LEVELS = [
  { name: 'Rookie', color: COLORS.redLight, trackSpeed: 100, aimJitter: 46, fireIntervalMs: 1500 },
  { name: 'Veteran', color: COLORS.red, trackSpeed: 170, aimJitter: 22, fireIntervalMs: 1150 },
  { name: 'Ace', color: COLORS.redDark, trackSpeed: 250, aimJitter: 8, fireIntervalMs: 850 },
];

// Enhancements: rare bonus mechanics layered on the base game — golden
// double-score stars, and pickups that sometimes fall from a broken target
// for the player to catch. Everything here is gated behind
// ENHANCEMENTS_ENABLED, so the whole set can be switched off in one place
// later without touching game-loop logic.
export const ENHANCEMENTS_ENABLED = true;
export const GOLDEN_STAR_CHANCE = 0.15;
export const GOLDEN_SCORE_MULTIPLIER = 2;
export const PICKUP_DROP_CHANCE = 0.35;
// Lucky Strikes upgrade: added on top of PICKUP_DROP_CHANCE per level,
// capped well short of a guaranteed drop so there's still some luck to it.
export const PICKUP_CHANCE_UPGRADE_BONUS = [0.1, 0.18, 0.28];
// Of the pickups that do drop, these chances decide the kind — the
// remaining share is a flat score bonus.
export const PICKUP_CURRENCY_CHANCE = 0.25;
export const PICKUP_RAPID_CHANCE = 0.15;
export const PICKUP_SPREAD_CHANCE = 0.15;
export const PICKUP_BOMB_CHANCE = 0.12;
export const PICKUP_MAGNET_CHANCE = 0.13;
export const PICKUP_GIANT_CHANCE = 0.1;
export const PICKUP_HOMING_CHANCE = 0.08;
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
export const PICKUP_MAGNET_PULL_SPEED = 420; // px/sec
export const PICKUP_MAGNET_FALL_MULTIPLIER = 2; // falls twice as fast while active

// Giant: while active, the cannon itself grows, widening its catch radius
// so the pickups that follow are easier to grab. The size upgrade only
// raises the ceiling as far as GIANT_SIZE_MULTS goes — capped well short of
// double, so the cannon never swallows the lane.
export const GIANT_BASE_SIZE_MULT = 1.3;
export const GIANT_BASE_DURATION_MS = 5000;
export const GIANT_SIZE_MULTS = [1.4, 1.5, 1.6];
export const GIANT_DURATION_BONUS_MS = [2000, 4000, 6000];

// Homing Shot: while active, every bullet the player fires curves toward
// the nearest live target instead of flying straight — HOMING_TURN_RATE is
// how fast it can turn, in (unit-vector fraction)/sec.
export const PICKUP_HOMING_DURATION_MS = 6000;
export const HOMING_TURN_RATE = 5;

// Piercing Rounds: a bullet survives its first N hits instead of dying on
// the first one, punching through to the target behind it in the same lane.
export const PIERCE_EXTRA_HITS = [1, 2, 3];

// Wide Stance: a flat, permanent px bonus added to the cannon's catch
// radius (on top of PLAYER_SIZE, and still multiplied by Giant if that's
// also active) — unlike Giant, it's always on, no pickup needed.
export const WIDE_STANCE_SIZE_BONUS = [8, 16, 24];

// Second Wind: when a pickup falls off the bottom uncaught, refund a small
// flat amount of Stardust instead — up to this many times per match. Not a
// pickup itself, just a passive safety net against a bad catch.
export const SECOND_WIND_REFUND = 8;

// Spread shot: instead of one straight bullet, fires three — a center shot
// plus two angled side shots. Bullets carry a unit direction (BulletState
// dirX/dirY) multiplied by the shared bullet speed each tick, so an angled
// bullet ramps up with difficulty/Hot Rounds exactly like a straight one.
export const SPREAD_ANGLE_DEG = 5;

// When Double Shot and Spread Shot are both active, the 6 bullets fire as a
// 3-pulse ripple (straight pair, then left pair, then right pair) spaced by
// this many ms, instead of all leaving at once.
export const COMBO_STAGGER_MS = 70;

// Stardust: the shop currency. Earned mid-match from currency pickups and
// the end-of-match accuracy bonus — kept permanently, through a loss, a tab
// close, whatever.
export const CURRENCY_NAME = 'Stardust';
export const CURRENCY_ICON = '✨';

// Marksmanship: an end-of-match accuracy stat (player bullets landed ÷
// player bullets fired) with a Stardust bonus — scaled by accuracy, but
// never zero as long as at least one shot landed. Tiers are cosmetic rank
// flavor on top of the raw percentage, checked high-to-low.
export const ACCURACY_BONUS_MAX = 40;
export const ACCURACY_BONUS_MIN = 5;
export const ACCURACY_TIERS: AccuracyTierDef[] = [
  { min: 0.9, label: 'DEADEYE', icon: '🎯' },
  { min: 0.7, label: 'SHARPSHOOTER', icon: '🔫' },
  { min: 0.5, label: 'MARKSMAN', icon: '🏹' },
  { min: 0.25, label: 'GUNNER', icon: '💥' },
  { min: 0, label: 'ROOKIE', icon: '🌱' },
];

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
// upgrades are stored as a plain id list (see storage.ts) that allows
// duplicate entries — level = how many times that id appears — so adding a
// new row here is enough to make it purchasable; GameScreen reads ids it
// recognizes and ignores the rest.
//
// Three items level up (index = level - 1, so [a,b,c] is the value at
// levels 1/2/3); Double Shot and Spread Shot stay single-level — their
// "more power" axis is the owned-window duration, already settled.
export const MOVE_SPEED_UPGRADE_MULTS = [1.3, 1.6, 2.0];
export const BULLET_SPEED_UPGRADE_MULTS = [1.2, 1.35, 1.55];
export const EXTRA_CHARGE_BONUSES = [1, 2, 3];

// Double Shot and Spread Shot are no longer "forever" once bought — owning
// one activates it for a flat window at the start of every match, the
// same every time (not a cumulative or per-purchase thing). A mid-match
// pickup of the same kind stacks on top of whatever's left of that window.
// Swift Cannon / Hot Rounds / Extra Chamber stay permanent — only the
// fire-pattern upgrades were the "too strong all match" problem.
export const OWNED_FIRE_PATTERN_WINDOW_MS = 15000;

// Metadata for each ShopCategory, in display order — Shop and Player screens
// both iterate this to group items the same way, so the two screens read as
// the same taxonomy even though they present it differently.
export const SHOP_CATEGORIES: { id: ShopCategory; icon: string; label: string; color: string }[] = [
  { id: 'weapon', icon: '🔫', label: 'FIREPOWER', color: COLORS.red },
  { id: 'ability', icon: '✨', label: 'ABILITIES', color: COLORS.pink },
  { id: 'movement', icon: '💨', label: 'MOVEMENT', color: COLORS.green },
  { id: 'luck', icon: '🍀', label: 'LUCK', color: COLORS.gold },
];

export const SHOP_ITEMS: ShopItemDef[] = [
  {
    id: 'bulletSpeed',
    icon: '🔥',
    name: 'HOT ROUNDS',
    description: 'Shots fly faster, reaching targets sooner.',
    category: 'weapon',
    prices: [120, 190, 280],
    statAt: (level) => `×${(level > 0 ? BULLET_SPEED_UPGRADE_MULTS[level - 1] : 1).toFixed(2)} speed`,
  },
  {
    id: 'extraCharge',
    icon: '🔋',
    name: 'EXTRA CHAMBER',
    description: 'One more fire charge in the clip per level.',
    category: 'weapon',
    prices: [130, 220, 340],
    statAt: (level) => `${FIRE_MAX_CHARGES + (level > 0 ? EXTRA_CHARGE_BONUSES[level - 1] : 0)} charges`,
  },
  {
    id: 'piercing',
    icon: '⚔️',
    name: 'PIERCING ROUNDS',
    description: 'Shots punch through to the debris behind it.',
    category: 'weapon',
    prices: [140, 230, 350],
    statAt: (level) => `${1 + level} target${level > 0 ? 's' : ''}/shot`,
  },
  {
    id: 'doubleShot',
    icon: '⚡',
    name: 'DOUBLE SHOT',
    description: `Fires as a pair for the match's first ${OWNED_FIRE_PATTERN_WINDOW_MS / 1000}s.`,
    category: 'ability',
    prices: [150],
    statAt: (level) => (level > 0 ? '2 bullets' : '1 bullet'),
  },
  {
    id: 'spreadShot',
    icon: '🔱',
    name: 'SPREAD SHOT',
    description: `Fires a 3-way fan for the match's first ${OWNED_FIRE_PATTERN_WINDOW_MS / 1000}s.`,
    category: 'ability',
    prices: [180],
    statAt: (level) => (level > 0 ? `3-way ±${SPREAD_ANGLE_DEG}°` : '1 bullet'),
  },
  {
    id: 'homingShot',
    icon: '🎯',
    name: 'HOMING SHOT',
    description: `Bullets curve toward the nearest target for the match's first ${OWNED_FIRE_PATTERN_WINDOW_MS / 1000}s.`,
    category: 'ability',
    prices: [200],
    statAt: (level) => (level > 0 ? 'bullets home in' : 'straight shots'),
  },
  {
    id: 'moveSpeed',
    icon: '🏎️',
    name: 'SWIFT CANNON',
    description: 'Slides to your hold spot faster.',
    category: 'movement',
    prices: [100, 170, 260],
    statAt: (level) => `×${(level > 0 ? MOVE_SPEED_UPGRADE_MULTS[level - 1] : 1).toFixed(1)} speed`,
  },
  {
    id: 'wideStance',
    icon: '🦾',
    name: 'WIDE STANCE',
    description: 'A permanently wider catch radius.',
    category: 'movement',
    prices: [110, 190, 280],
    statAt: (level) => `+${level > 0 ? WIDE_STANCE_SIZE_BONUS[level - 1] : 0}px catch`,
  },
  {
    id: 'pickupChance',
    icon: '🎲',
    name: 'LUCKY STRIKES',
    description: 'Better odds a broken target drops a pickup.',
    category: 'luck',
    prices: [160, 260, 400],
    statAt: (level) =>
      `${Math.round((PICKUP_DROP_CHANCE + (level > 0 ? PICKUP_CHANCE_UPGRADE_BONUS[level - 1] : 0)) * 100)}% drop`,
  },
  {
    id: 'giantSize',
    icon: '🪐',
    name: 'COLOSSUS CORE',
    description: 'Growth pickups grow the cannon bigger.',
    category: 'luck',
    prices: [140, 230, 350],
    statAt: (level) => `×${(level > 0 ? GIANT_SIZE_MULTS[level - 1] : GIANT_BASE_SIZE_MULT).toFixed(1)} size`,
  },
  {
    id: 'giantDuration',
    icon: '⏱️',
    name: 'LASTING GROWTH',
    description: 'Growth pickups last longer before shrinking back.',
    category: 'luck',
    prices: [110, 180, 270],
    statAt: (level) =>
      `${(GIANT_BASE_DURATION_MS + (level > 0 ? GIANT_DURATION_BONUS_MS[level - 1] : 0)) / 1000}s growth`,
  },
  {
    id: 'secondWind',
    icon: '🌬️',
    name: 'SECOND WIND',
    description: `A missed pickup refunds ${SECOND_WIND_REFUND} Stardust instead.`,
    category: 'luck',
    prices: [150, 240, 370],
    statAt: (level) => `${level} refund${level === 1 ? '' : 's'}`,
  },
];
