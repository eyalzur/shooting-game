export interface PlanetTierConfig {
  /** Planet diameter in px. */
  size: number;
  /** Speed range in px/sec toward the core; a planet picks one speed at spawn and keeps it. */
  minSpeed: number;
  maxSpeed: number;
  /** Points awarded for destroying a planet of this tier. */
  points: number;
  color: string;
}

export interface TargetState {
  id: number;
  x: number;
  y: number;
  /** Unit heading, corrected toward the core a little every tick (see
   * PLANET_TURN_RATE) rather than snapping straight at it — a spawn-time
   * random offset from the true bearing plus that gradual correction is
   * what reads as a curving approach instead of a straight dive. */
  dirX: number;
  dirY: number;
  /** Speed in px/sec, fixed for this planet's lifetime (rolled at spawn). */
  speed: number;
  size: number;
  color: string;
  points: number;
  /** Rotation phase in [0, 1), advanced every tick by the game loop (not a standalone animation). */
  spin: number;
  /** Set when hit, used to play a brief explosion before the planet is removed. */
  hitAt: number | null;
  /** Randomized wait in ms between the hit and the planet actually being
   * removed — just long enough for the explosion animation to play. */
  despawnDelay: number;
  /** Color of whoever's bullet hit it, so the explosion reads as "who scored this". */
  hitColor: string | null;
  /** Which explosion animation plays on this hit — rolled fresh each time, for variety. */
  explosionVariant: number;
  /** A rare "golden" variant worth double points — rolled fresh on spawn. */
  isGolden: boolean;
}

/** A small chunk a planet breaks into when shot — scatters on its own
 * momentum (no steering, unlike a planet), and can itself reach the core or
 * be shot down for a smaller bonus. One-shot: it doesn't fragment further. */
export interface DebrisState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  createdAt: number;
  /** Set when shot, for a brief pop animation before removal; null while live. */
  poppedAt: number | null;
}

export type PickupKind = 'score' | 'rapidFire' | 'spreadShot' | 'bomb' | 'magnet' | 'currency' | 'giant' | 'homing';

/** A bonus item that falls from a broken planet; collect it by brushing the cannon against it. */
export interface PickupState {
  id: number;
  x: number;
  y: number;
  kind: PickupKind;
  /** Bonus score for 'score', Stardust amount for 'currency'; unused otherwise. */
  value: number;
}

export interface BulletState {
  id: number;
  x: number;
  y: number;
  /** Unit direction the bullet travels in; multiplied by the current bullet
   * speed each tick. {0,-1} is straight up — angled bullets (spread shot)
   * use a tilted unit vector instead. */
  dirX: number;
  dirY: number;
  /** Tint for the bullet's glow — always the player's blue right now, kept
   * as a field (rather than a hardcoded constant in Bullet.tsx) since a
   * rival-mode bullet will need its own color again later. */
  color?: string;
  /** How many more targets this bullet can punch through after its next
   * hit (Piercing Rounds) — undefined/0 means it's destroyed on hit, same
   * as before the upgrade existed. */
  pierce?: number;
  /** Steers toward the nearest live planet each tick instead of flying
   * straight (Homing Shot), set at spawn from whether the window was
   * active then — a bullet's homing never turns on mid-flight. */
  homing?: boolean;
}

export interface ScorePopupState {
  id: number;
  x: number;
  y: number;
  value: number;
  color: string;
  createdAt: number;
}

/** A permanent shop upgrade, identified by id — the owned set is what's persisted. */
export type UpgradeId =
  | 'doubleShot'
  | 'moveSpeed'
  | 'bulletSpeed'
  | 'spreadShot'
  | 'extraCharge'
  | 'giantSize'
  | 'giantDuration'
  | 'pickupChance'
  | 'piercing'
  | 'homingShot'
  | 'wideStance'
  | 'secondWind';

/** Groups shop items by what they affect, so the Shop and Player screens can
 * present "a weapon upgrade" differently from "a luck upgrade" instead of
 * one undifferentiated list. */
export type ShopCategory = 'weapon' | 'ability' | 'movement' | 'luck';

export interface ShopItemDef {
  id: UpgradeId;
  icon: string;
  name: string;
  description: string;
  category: ShopCategory;
  /** Price for each level, index 0 = level 1. Most items have just one —
   * a single-entry array is just a regular one-time purchase. */
  prices: number[];
  /** The item's real, computed effect at a given owned level (0 = not
   * owned / baseline) — e.g. "×1.3 move speed" or "45% drop chance" — so
   * the Shop can show what a purchase actually does instead of just a
   * level count. */
  statAt: (level: number) => string;
}

/** A cosmetic Stardust pack — priceLabel is display-only text (e.g. "$0.99");
 * no payment is ever processed. Tapping grants `amount` Stardust directly. */
export interface CurrencyPackDef {
  id: string;
  icon: string;
  name: string;
  amount: number;
  priceLabel: string;
}

/** A rank bracket for the end-of-match Marksmanship stat — tiers are
 * checked high-to-low, first `min` the accuracy clears wins. */
export interface AccuracyTierDef {
  min: number;
  label: string;
  icon: string;
}

/** One release note on the changelog screen. icon is a big emoji shown like
 * an illustration (this project has no image-asset pipeline), not just a
 * bullet marker. */
export interface ChangelogEntry {
  version: string;
  date: string;
  icon: string;
  title: string;
  bullets: string[];
}

/** Unused by any screen right now — vs-bot mode is being redesigned
 * (rival cores, each with its own shield) as a separate follow-up task.
 * Kept so BotSelectScreen.tsx still compiles standalone rather than being
 * deleted outright. */
export type GameMode = 'solo' | 'vs';

export interface BotConfig {
  name: string;
  color: string;
  /** How fast the bot's cannon chases the nearest live target, px/sec. */
  trackSpeed: number;
  /** Max aim wobble amplitude in px — larger means less precise. */
  aimJitter: number;
  fireIntervalMs: number;
}
