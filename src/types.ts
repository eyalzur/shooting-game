export interface LaneConfig {
  /** Vertical position of the lane as a fraction of the play area height (0 = top/far, 1 = bottom/near). */
  y: number;
  /** Target diameter in px. */
  size: number;
  /** Horizontal speed range in px/sec; a target picks a new speed in this range each bounce. */
  minSpeed: number;
  maxSpeed: number;
  /** Points awarded for hitting a target in this lane. */
  points: number;
  color: string;
}

export interface TargetState {
  id: number;
  laneIndex: number;
  x: number;
  dir: 1 | -1;
  /** Current speed in px/sec, re-rolled within the lane's range on each wall bounce. */
  speed: number;
  /** Rotation phase in [0, 1), advanced every tick by the game loop (not a standalone animation). */
  spin: number;
  /** Set when hit, used to play a brief explosion + respawn-wait animation. */
  hitAt: number | null;
  /** Randomized respawn wait in ms, rolled fresh at the moment of the hit. */
  respawnDelay: number;
  /** Color of whoever's bullet hit it, so the explosion reads as "who scored this". */
  hitColor: string | null;
  /** Bumped every time the target bounces off a side wall, so a component can watch it and flash. */
  bounceId: number;
  /** Which explosion animation plays on this hit — rolled fresh each time, for variety. */
  explosionVariant: number;
  /** A rare "golden" variant worth double points — rolled fresh on spawn/respawn. */
  isGolden: boolean;
}

export type PickupKind = 'score' | 'rapidFire' | 'spreadShot' | 'bomb' | 'magnet' | 'currency' | 'giant' | 'homing';

/** A bonus item that falls from a broken target; collect it by brushing the cannon against it. */
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
  /** Whose shot this is — decides who gets credited on a hit. */
  owner: 'player' | 'bot';
  /** Tint for a bot's shot, so it reads as visibly different from the player's. */
  color?: string;
  /** How many more targets this bullet can punch through after its next
   * hit (Piercing Rounds) — undefined/0 means it's destroyed on hit, same
   * as before the upgrade existed. */
  pierce?: number;
  /** Steers toward the nearest live target each tick instead of flying
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

export type GameMode = 'solo' | 'vs';

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

export interface BotConfig {
  name: string;
  color: string;
  /** How fast the bot's cannon chases the nearest live target, px/sec. */
  trackSpeed: number;
  /** Max aim wobble amplitude in px — larger means less precise. */
  aimJitter: number;
  fireIntervalMs: number;
}
