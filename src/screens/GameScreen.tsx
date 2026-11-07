import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, PanResponder, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Bullet from '../components/Bullet';
import LevelUpBanner from '../components/LevelUpBanner';
import Pickup from '../components/Pickup';
import PowerUpBanner, { PowerUpKind } from '../components/PowerUpBanner';
import PressableScale from '../components/PressableScale';
import Player from '../components/Player';
import ScorePopup from '../components/ScorePopup';
import Starfield from '../components/Starfield';
import Target from '../components/Target';
import {
  ACCURACY_BONUS_MAX,
  ACCURACY_BONUS_MIN,
  ACCURACY_TIERS,
  BOT_JITTER_WALK_SPEED,
  BULLET_SPEED,
  BULLET_SPEED_MAX_MULTIPLIER,
  BULLET_SPEED_STEP,
  BULLET_SPEED_UPGRADE_MULT,
  COLORS,
  CURRENCY_ICON,
  CURRENCY_NAME,
  DIFFICULTY_MAX_LEVEL,
  DIFFICULTY_MIN_SIZE_MULTIPLIER,
  DIFFICULTY_RANGE_STEP,
  DIFFICULTY_SIZE_STEP,
  DIFFICULTY_SPEED_STEP,
  DIFFICULTY_STEP_HITS,
  ENHANCEMENTS_ENABLED,
  EXTRA_CHARGE_BONUS,
  FIRE_MAX_CHARGES,
  FIRE_RECHARGE_MIN_MS,
  FIRE_RECHARGE_MS,
  FIRE_RECHARGE_STEP,
  GOLDEN_SCORE_MULTIPLIER,
  GOLDEN_STAR_CHANCE,
  HIT_BAND,
  LANES,
  MAX_BULLETS,
  MOVE_SPEED_UPGRADE_MULT,
  PICKUP_BOMB_CHANCE,
  PICKUP_CURRENCY_CHANCE,
  PICKUP_CURRENCY_MAX,
  PICKUP_CURRENCY_MIN,
  PICKUP_DROP_CHANCE,
  PICKUP_FALL_SPEED,
  PICKUP_MAGNET_CHANCE,
  PICKUP_MAGNET_DURATION_MS,
  PICKUP_MAGNET_PULL_SPEED,
  PICKUP_RAPID_CHANCE,
  PICKUP_RAPID_DURATION_MS,
  PICKUP_SCORE_MAX,
  PICKUP_SCORE_MIN,
  PICKUP_SIZE,
  PICKUP_SPREAD_CHANCE,
  PICKUP_SPREAD_DURATION_MS,
  PLAYER_BOTTOM_MARGIN,
  PLAYER_SIZE,
  PLAYER_SPEED,
  PLAYER_SLIDE_MIN_MS,
  PLAYER_SLIDE_MAX_MS,
  RESPAWN_MAX_MS,
  RESPAWN_MIN_MS,
  SCORE_POPUP_MS,
  SPREAD_ANGLE_DEG,
  STAR_SPIN_MS,
  TAP_MAX_DISTANCE,
  TAP_MAX_DURATION_MS,
  WIN_CURRENCY_REWARD,
} from '../constants';
import { BotConfig, BulletState, GameMode, LaneConfig, PickupKind, PickupState, ScorePopupState, TargetState, UpgradeId } from '../types';
import { playDraw, playGolden, playHit, playLevelUp, playLose, playPickup, playShoot, playTimeUp, playUiTap, playWin, startMusic, stopMusic } from '../utils/sound';

const TOP_BAR_HEIGHT = 56;
const STATUS_BAR_HEIGHT = 30;

// Targets get a bit faster, smaller, and more erratic every
// DIFFICULTY_STEP_HITS hits, capped at DIFFICULTY_MAX_LEVEL so it ramps up
// without becoming impossible. The min/max speed range widens with level too,
// so bounces become less predictable as the player improves.
function getEffectiveLanes(level: number): LaneConfig[] {
  const speedMul = 1 + level * DIFFICULTY_SPEED_STEP;
  const sizeMul = Math.max(DIFFICULTY_MIN_SIZE_MULTIPLIER, 1 - level * DIFFICULTY_SIZE_STEP);
  const rangeMul = 1 + level * DIFFICULTY_RANGE_STEP;
  return LANES.map((lane) => {
    const baseMin = lane.minSpeed * speedMul;
    const baseMax = lane.maxSpeed * speedMul;
    const center = (baseMin + baseMax) / 2;
    const half = ((baseMax - baseMin) / 2) * rangeMul;
    return {
      ...lane,
      size: lane.size * sizeMul,
      minSpeed: center - half,
      maxSpeed: center + half,
    };
  });
}

function getEffectiveBulletSpeed(level: number, ownsBulletSpeed: boolean) {
  const mul = Math.min(BULLET_SPEED_MAX_MULTIPLIER, 1 + level * BULLET_SPEED_STEP);
  return BULLET_SPEED * mul * (ownsBulletSpeed ? BULLET_SPEED_UPGRADE_MULT : 1);
}

function getEffectiveRechargeMs(level: number) {
  return Math.max(FIRE_RECHARGE_MIN_MS, FIRE_RECHARGE_MS * (1 - level * FIRE_RECHARGE_STEP));
}

function randomXForLane(size: number, width: number) {
  const min = size / 2;
  const max = width - size / 2;
  return min + Math.random() * (max - min);
}

function randomSpeedForLane(lane: LaneConfig) {
  return lane.minSpeed + Math.random() * (lane.maxSpeed - lane.minSpeed);
}

function randomRespawnDelay() {
  return RESPAWN_MIN_MS + Math.random() * (RESPAWN_MAX_MS - RESPAWN_MIN_MS);
}

// Weighted pick of a pickup kind — ordered list of [chance, kind], tried in
// order against one roll; whatever's left over (doesn't need to sum to 1)
// falls through to a flat score bonus. Adding a new pickup kind is just a
// new row here.
const PICKUP_KIND_WEIGHTS: [number, PickupKind][] = [
  [PICKUP_CURRENCY_CHANCE, 'currency'],
  [PICKUP_RAPID_CHANCE, 'rapidFire'],
  [PICKUP_SPREAD_CHANCE, 'spreadShot'],
  [PICKUP_BOMB_CHANCE, 'bomb'],
  [PICKUP_MAGNET_CHANCE, 'magnet'],
];
function rollPickupKind(): PickupKind {
  const roll = Math.random();
  let cumulative = 0;
  for (const [chance, kind] of PICKUP_KIND_WEIGHTS) {
    cumulative += chance;
    if (roll < cumulative) return kind;
  }
  return 'score';
}

// ACCURACY_TIERS is ordered highest-min-first, so the first one the
// accuracy clears is the right rank.
function getAccuracyTier(accuracy: number) {
  return ACCURACY_TIERS.find((tier) => accuracy >= tier.min) ?? ACCURACY_TIERS[ACCURACY_TIERS.length - 1];
}

// Shared bounce/respawn/spin physics, used for both the player's targets
// and the bot's — same rules, just different lane sets.
function advanceTargets(targets: TargetState[], lanes: LaneConfig[], width: number, dt: number, now: number): TargetState[] {
  return targets.map((t) => {
    if (t.hitAt !== null) {
      if (now - t.hitAt > t.respawnDelay) {
        const lane = lanes[t.laneIndex];
        return {
          ...t,
          hitAt: null,
          hitColor: null,
          x: randomXForLane(lane.size, width),
          dir: Math.random() < 0.5 ? 1 : -1,
          speed: randomSpeedForLane(lane),
          isGolden: ENHANCEMENTS_ENABLED && Math.random() < GOLDEN_STAR_CHANCE,
        };
      }
      return t;
    }
    const lane = lanes[t.laneIndex];
    const min = lane.size / 2;
    const max = width - lane.size / 2;
    let nextX = t.x + t.dir * t.speed * dt;
    let nextDir = t.dir;
    let nextSpeed = t.speed;
    let nextBounceId = t.bounceId;
    if (nextX < min) {
      nextX = min;
      nextDir = 1;
      nextSpeed = randomSpeedForLane(lane);
      nextBounceId += 1;
    } else if (nextX > max) {
      nextX = max;
      nextDir = -1;
      nextSpeed = randomSpeedForLane(lane);
      nextBounceId += 1;
    }
    const nextSpin = (t.spin + dt / (STAR_SPIN_MS / 1000)) % 1;
    return { ...t, x: nextX, dir: nextDir, speed: nextSpeed, spin: nextSpin, bounceId: nextBounceId };
  });
}

function makeInitialTargets(lanes: LaneConfig[], width: number): TargetState[] {
  return lanes.map((lane, laneIndex) => ({
    id: laneIndex,
    laneIndex,
    x: randomXForLane(lane.size, width),
    dir: Math.random() < 0.5 ? 1 : -1,
    speed: randomSpeedForLane(lane),
    spin: Math.random(),
    hitAt: null,
    hitColor: null,
    respawnDelay: 0,
    bounceId: 0,
    explosionVariant: 0,
    isGolden: ENHANCEMENTS_ENABLED && Math.random() < GOLDEN_STAR_CHANCE,
  }));
}

interface Props {
  mode?: GameMode;
  bot?: BotConfig;
  /** Match length in ms, picked on the home screen; null means no timer — play until Home. */
  matchMs?: number | null;
  onExit: (finalScore: number) => void;
  onPlayAgain?: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
  /** Owned permanent shop upgrades; unrecognized ids are just ignored. */
  ownedUpgrades: UpgradeId[];
  onEarnCurrency: (amount: number) => void;
}

export default function GameScreen({
  mode = 'solo',
  bot,
  matchMs = null,
  onExit,
  onPlayAgain,
  soundOn,
  onToggleSound,
  ownedUpgrades,
  onEarnCurrency,
}: Props) {
  const ownsDoubleShot = ownedUpgrades.includes('doubleShot');
  const ownsMoveSpeed = ownedUpgrades.includes('moveSpeed');
  const ownsBulletSpeed = ownedUpgrades.includes('bulletSpeed');
  const ownsSpreadShot = ownedUpgrades.includes('spreadShot');
  const ownsExtraCharge = ownedUpgrades.includes('extraCharge');
  // Owned or not, this is the real cap for the lifetime of this match —
  // upgrades only change between matches (Shop isn't reachable mid-game).
  const maxCharges = FIRE_MAX_CHARGES + (ENHANCEMENTS_ENABLED && ownsExtraCharge ? EXTRA_CHARGE_BONUS : 0);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // A dedicated second row for ability badges — reserved space, not
  // overlaid on the score row, so a badge can never get crowded off the
  // edge of a narrow phone screen the way cramming it into one row did.
  const topBarHeight = TOP_BAR_HEIGHT + (ENHANCEMENTS_ENABLED ? STATUS_BAR_HEIGHT : 0) + insets.top;
  const playAreaHeight = height - topBarHeight;
  const isVsBot = mode === 'vs' && !!bot;
  const hasTimer = matchMs !== null;
  const playerY = playAreaHeight - PLAYER_BOTTOM_MARGIN;

  const idCounterRef = useRef(LANES.length);
  const playerXRef = useRef(width / 2);
  // Bot plays on the same board, same bottom row, same shared targets — it
  // just has its own cannon position that it moves on its own.
  const botXRef = useRef(width * 0.5);
  const botAimJitterRef = useRef(0);
  const targetsRef = useRef<TargetState[]>(makeInitialTargets(LANES, width));
  const bulletsRef = useRef<BulletState[]>([]);
  const popupsRef = useRef<ScorePopupState[]>([]);
  const pickupsRef = useRef<PickupState[]>([]);
  // Rapid-fire / spread-shot pickups: a timestamp each, not a bool, so they
  // just naturally expire — no separate timer to clear or leak on unmount.
  const rapidFireUntilRef = useRef(0);
  const spreadUntilRef = useRef(0);
  const magnetUntilRef = useRef(0);
  // Every Stardust source in a match — pickups now, whatever's added later
  // — should route through earnCurrency below so it's reflected both in the
  // persisted balance (via onEarnCurrency) and this match's own running
  // total, shown on the result screen.
  const matchCurrencyRef = useRef(0);
  const [matchCurrencyEarned, setMatchCurrencyEarned] = useState(0);
  const earnCurrency = (amount: number) => {
    matchCurrencyRef.current += amount;
    setMatchCurrencyEarned(matchCurrencyRef.current);
    onEarnCurrency(amount);
  };
  const scoreRef = useRef(0);
  // Marksmanship: player bullets fired vs. landed, for the end-of-match
  // accuracy stat and its Stardust bonus. Bomb-cleared targets don't count
  // as a "hit" here — no bullet, no shot.
  const shotsFiredRef = useRef(0);
  const shotsHitRef = useRef(0);
  const displayScoreRef = useRef(0);
  const hitsRef = useRef(0);
  const difficultyLevelRef = useRef(0);
  const emittedLevelRef = useRef(0);
  const effectiveLanesRef = useRef<LaneConfig[]>(LANES);
  const lastTsRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const chargesRef = useRef(maxCharges);

  // VS mode: a bot opponent sharing the player's board and clock.
  const matchStartRef = useRef(Date.now());
  const matchOverRef = useRef(false);
  const botScoreRef = useRef(0);
  const botDisplayScoreRef = useRef(0);
  const botNextShotAtRef = useRef(matchStartRef.current + (bot?.fireIntervalMs ?? 0) * (0.4 + Math.random() * 0.4));

  const playerXAnim = useRef(new Animated.Value(playerXRef.current)).current;
  const playerXAnimTargetRef = useRef(playerXRef.current);
  const [botX, setBotX] = useState(botXRef.current);
  const [targets, setTargets] = useState(targetsRef.current);
  const [bullets, setBullets] = useState(bulletsRef.current);
  const [popups, setPopups] = useState(popupsRef.current);
  const [pickups, setPickups] = useState(pickupsRef.current);
  const [rapidFireMsLeft, setRapidFireMsLeft] = useState(0);
  const [spreadMsLeft, setSpreadMsLeft] = useState(0);
  const [magnetMsLeft, setMagnetMsLeft] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [botDisplayScore, setBotDisplayScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(hasTimer ? Math.ceil(matchMs! / 1000) : 0);
  const [matchOver, setMatchOver] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState(0);
  const [charges, setCharges] = useState(chargesRef.current);
  const [levelUpEvent, setLevelUpEvent] = useState<{ level: number; id: number } | null>(null);
  const levelUpIdRef = useRef(0);
  const [powerUpEvent, setPowerUpEvent] = useState<{ id: number; kind: PowerUpKind } | null>(null);
  const powerUpIdRef = useRef(0);
  const scorePulse = useRef(new Animated.Value(1)).current;
  const triggerScorePulse = () => {
    scorePulse.setValue(1);
    Animated.sequence([
      Animated.timing(scorePulse, { toValue: 1.4, duration: 110, useNativeDriver: true }),
      Animated.spring(scorePulse, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  // Match result mood: a bouncy, bright entrance for a win, a slow heavy
  // settle for a loss, a plain fade for a draw — same card, different feel.
  const outcome: 'win' | 'lose' | 'draw' =
    scoreRef.current > botScoreRef.current ? 'win' : scoreRef.current < botScoreRef.current ? 'lose' : 'draw';
  const resultEnter = useRef(new Animated.Value(0)).current;
  const winBurst = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!matchOver) return;
    if (!isVsBot) {
      playTimeUp();
    } else if (outcome === 'win') {
      playWin();
      if (ENHANCEMENTS_ENABLED) earnCurrency(WIN_CURRENCY_REWARD);
    } else if (outcome === 'lose') {
      playLose();
    } else {
      playDraw();
    }
    // Marksmanship bonus: scales with accuracy, but landing even one shot
    // always earns at least the floor — accuracy is never a cliff down to
    // zero.
    if (ENHANCEMENTS_ENABLED && shotsHitRef.current > 0) {
      const accuracy = shotsHitRef.current / shotsFiredRef.current;
      earnCurrency(Math.max(ACCURACY_BONUS_MIN, Math.round(accuracy * ACCURACY_BONUS_MAX)));
    }
    resultEnter.setValue(0);
    if (outcome === 'win') {
      Animated.spring(resultEnter, { toValue: 1, friction: 5, tension: 110, useNativeDriver: true }).start();
      winBurst.setValue(0);
      Animated.timing(winBurst, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (outcome === 'lose') {
      Animated.timing(resultEnter, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(resultEnter, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchOver]);

  // difficultyLevelRef is the source of truth, advanced inside the game
  // loop; difficultyLevel state only mirrors it for rendering, so this must
  // not write back into the ref (it would clobber progress made in-between
  // this effect running and the last render).
  const effectiveLanes = useMemo(() => getEffectiveLanes(difficultyLevel), [difficultyLevel]);
  useEffect(() => {
    effectiveLanesRef.current = effectiveLanes;
  }, [effectiveLanes]);

  // Keep the player within bounds if the window resizes.
  useEffect(() => {
    playerXRef.current = Math.min(
      Math.max(playerXRef.current, PLAYER_SIZE / 2),
      width - PLAYER_SIZE / 2
    );
    playerXAnimTargetRef.current = playerXRef.current;
    playerXAnim.setValue(playerXRef.current);
  }, [width]);

  // Ambient music plays while actually in a match, stops the instant you
  // leave — toggling sound off mid-game stops it too, back on resumes it.
  useEffect(() => {
    if (soundOn) startMusic();
    else stopMusic();
    return () => stopMusic();
  }, [soundOn]);

  useEffect(() => {
    const tick = (ts: number) => {
      const last = lastTsRef.current ?? ts;
      const dt = Math.min((ts - last) / 1000, 0.05); // clamp dt for tab-switch pauses
      lastTsRef.current = ts;

      // Targets: bounce within lane bounds, or wait to respawn after a hit.
      const now = Date.now();
      const lanes = effectiveLanesRef.current;

      // Match timer (solo or vs) — once it hits zero, scoring freezes but
      // the scene keeps animating behind the result overlay.
      let timeLeftMs = Infinity;
      if (hasTimer) {
        timeLeftMs = Math.max(0, matchMs! - (now - matchStartRef.current));
        if (timeLeftMs <= 0 && !matchOverRef.current) {
          matchOverRef.current = true;
          setMatchOver(true);
        }
        setTimeLeft(Math.ceil(timeLeftMs / 1000));
      }
      targetsRef.current = advanceTargets(targetsRef.current, lanes, width, dt, now);

      // Bullets: move up, drop once off-screen. Speed ramps with level too.
      const bulletSpeed = getEffectiveBulletSpeed(difficultyLevelRef.current, ownsBulletSpeed);
      bulletsRef.current = bulletsRef.current
        .map((b) => ({ ...b, x: b.x + b.dirX * bulletSpeed * dt, y: b.y + b.dirY * bulletSpeed * dt }))
        .filter((b) => b.y > -20 && b.x > -20 && b.x < width + 20);

      // Collisions: a live bullet (either owner's) entering a lane's hit
      // band near a live target. Both player and bot shoot the same shared
      // targets, so whoever's bullet gets there first scores it.
      const remainingBullets: BulletState[] = [];
      for (const b of bulletsRef.current) {
        let hitSomething = false;
        for (const t of targetsRef.current) {
          if (t.hitAt !== null) continue;
          const lane = lanes[t.laneIndex];
          const laneY = lane.y * playAreaHeight;
          if (
            Math.abs(b.y - laneY) <= HIT_BAND &&
            Math.abs(b.x - t.x) <= lane.size / 2
          ) {
            t.hitAt = now;
            t.respawnDelay = randomRespawnDelay();
            t.hitColor = b.owner === 'player' ? COLORS.blue : bot?.color ?? COLORS.red;
            t.explosionVariant = Math.floor(Math.random() * 3);
            playHit(t.explosionVariant);
            if (t.isGolden) playGolden();
            if (!matchOverRef.current) {
              const gain = t.isGolden ? lane.points * GOLDEN_SCORE_MULTIPLIER : lane.points;
              if (b.owner === 'player') {
                scoreRef.current += gain;
                hitsRef.current += 1;
                shotsHitRef.current += 1;
                popupsRef.current = [
                  ...popupsRef.current,
                  { id: ++idCounterRef.current, x: t.x, y: laneY, value: gain, color: t.isGolden ? COLORS.gold : COLORS.blue, createdAt: now },
                ];
                triggerScorePulse();
                // A broken target sometimes drops something to catch — a
                // flat score bonus, a temporary fire-pattern or pull-in
                // power-up, a screen-clearing bomb, or Stardust.
                if (ENHANCEMENTS_ENABLED && Math.random() < PICKUP_DROP_CHANCE) {
                  const kind = rollPickupKind();
                  const value =
                    kind === 'score'
                      ? Math.round(PICKUP_SCORE_MIN + Math.random() * (PICKUP_SCORE_MAX - PICKUP_SCORE_MIN))
                      : kind === 'currency'
                        ? Math.round(PICKUP_CURRENCY_MIN + Math.random() * (PICKUP_CURRENCY_MAX - PICKUP_CURRENCY_MIN))
                        : 0;
                  pickupsRef.current = [...pickupsRef.current, { id: ++idCounterRef.current, x: t.x, y: laneY, kind, value }];
                }
              } else if (bot) {
                botScoreRef.current += gain;
                popupsRef.current = [
                  ...popupsRef.current,
                  { id: ++idCounterRef.current, x: t.x, y: laneY, value: gain, color: bot.color, createdAt: now },
                ];
              }
            }
            hitSomething = true;
            break;
          }
        }
        if (!hitSomething) remainingBullets.push(b);
      }
      bulletsRef.current = remainingBullets;

      // Pickups: fall straight down from where they dropped, or drift
      // toward the cannon's x too while Magnet is active. Brush the
      // player's cannon against one to collect it; miss the catch and it
      // falls off the bottom and is gone.
      if (ENHANCEMENTS_ENABLED) {
        const magnetActive = magnetUntilRef.current > now;
        const nextPickups: PickupState[] = [];
        for (const p of pickupsRef.current) {
          const nextY = p.y + PICKUP_FALL_SPEED * dt;
          let nextX = p.x;
          if (magnetActive) {
            const dx = playerXRef.current - p.x;
            const step = Math.min(Math.abs(dx), PICKUP_MAGNET_PULL_SPEED * dt);
            nextX = p.x + Math.sign(dx) * step;
          }
          const caught =
            !matchOverRef.current &&
            Math.abs(nextY - playerY) <= PLAYER_SIZE / 2 + PICKUP_SIZE / 2 &&
            Math.abs(nextX - playerXRef.current) <= PLAYER_SIZE / 2 + PICKUP_SIZE / 2;
          if (caught) {
            if (p.kind === 'score') {
              scoreRef.current += p.value;
              popupsRef.current = [
                ...popupsRef.current,
                { id: ++idCounterRef.current, x: p.x, y: playerY - PLAYER_SIZE, value: p.value, color: COLORS.gold, createdAt: now },
              ];
              triggerScorePulse();
            } else if (p.kind === 'currency') {
              earnCurrency(p.value);
              popupsRef.current = [
                ...popupsRef.current,
                { id: ++idCounterRef.current, x: p.x, y: playerY - PLAYER_SIZE, value: p.value, color: COLORS.purple, createdAt: now },
              ];
            } else if (p.kind === 'rapidFire') {
              rapidFireUntilRef.current = now + PICKUP_RAPID_DURATION_MS;
              powerUpIdRef.current += 1;
              setPowerUpEvent({ id: powerUpIdRef.current, kind: 'rapidFire' });
            } else if (p.kind === 'spreadShot') {
              spreadUntilRef.current = now + PICKUP_SPREAD_DURATION_MS;
              powerUpIdRef.current += 1;
              setPowerUpEvent({ id: powerUpIdRef.current, kind: 'spreadShot' });
            } else if (p.kind === 'magnet') {
              magnetUntilRef.current = now + PICKUP_MAGNET_DURATION_MS;
              powerUpIdRef.current += 1;
              setPowerUpEvent({ id: powerUpIdRef.current, kind: 'magnet' });
            } else {
              // Bomb: every live target goes down at once, same scoring and
              // explosion as a direct hit — just no chained pickup drops,
              // so one bomb can't cascade into another.
              for (const t of targetsRef.current) {
                if (t.hitAt !== null) continue;
                const lane = lanes[t.laneIndex];
                t.hitAt = now;
                t.respawnDelay = randomRespawnDelay();
                t.hitColor = COLORS.blue;
                t.explosionVariant = Math.floor(Math.random() * 3);
                if (!matchOverRef.current) {
                  const gain = t.isGolden ? lane.points * GOLDEN_SCORE_MULTIPLIER : lane.points;
                  scoreRef.current += gain;
                  hitsRef.current += 1;
                  popupsRef.current = [
                    ...popupsRef.current,
                    {
                      id: ++idCounterRef.current,
                      x: t.x,
                      y: lane.y * playAreaHeight,
                      value: gain,
                      color: t.isGolden ? COLORS.gold : COLORS.blue,
                      createdAt: now,
                    },
                  ];
                }
              }
              triggerScorePulse();
              powerUpIdRef.current += 1;
              setPowerUpEvent({ id: powerUpIdRef.current, kind: 'bomb' });
            }
            playPickup(p.kind);
            continue;
          }
          if (nextY > playAreaHeight + PICKUP_SIZE) continue;
          nextPickups.push({ ...p, x: nextX, y: nextY });
        }
        pickupsRef.current = nextPickups;
      }

      // Difficulty climbs with total hits landed and never drops — a miss
      // just doesn't add to it, so a long run keeps climbing.
      const newLevel = Math.min(
        DIFFICULTY_MAX_LEVEL,
        Math.floor(hitsRef.current / DIFFICULTY_STEP_HITS)
      );
      if (newLevel !== difficultyLevelRef.current) {
        difficultyLevelRef.current = newLevel;
      }
      if (difficultyLevelRef.current !== emittedLevelRef.current) {
        const leveledUp = difficultyLevelRef.current > emittedLevelRef.current;
        emittedLevelRef.current = difficultyLevelRef.current;
        setDifficultyLevel(difficultyLevelRef.current);
        if (leveledUp) {
          levelUpIdRef.current += 1;
          setLevelUpEvent({ level: difficultyLevelRef.current, id: levelUpIdRef.current });
          playLevelUp();
        }
      }

      // Recharge fire charges over time; speeds up with level.
      const rechargeMs = getEffectiveRechargeMs(difficultyLevelRef.current);
      chargesRef.current = Math.min(
        maxCharges,
        chargesRef.current + dt / (rechargeMs / 1000)
      );

      // Score counts up toward its true value instead of jumping, and score
      // popups expire after their float-up animation finishes.
      const scoreDiff = scoreRef.current - displayScoreRef.current;
      displayScoreRef.current =
        Math.abs(scoreDiff) < 0.5 ? scoreRef.current : displayScoreRef.current + scoreDiff * Math.min(1, dt * 8);

      // Bot opponent: physically tracks the nearest live target and fires
      // at its own real cannon position on the same shared board — misses
      // happen because its aim or reflexes are worse, not a coin flip.
      if (isVsBot && bot && !matchOverRef.current) {
        botAimJitterRef.current = Math.max(
          -bot.aimJitter,
          Math.min(bot.aimJitter, botAimJitterRef.current + (Math.random() - 0.5) * BOT_JITTER_WALK_SPEED * dt)
        );

        const liveTargets = targetsRef.current.filter((t) => t.hitAt === null);
        if (liveTargets.length) {
          let nearest = liveTargets[0];
          let nearestDist = Math.abs(nearest.x - botXRef.current);
          for (const t of liveTargets) {
            const d = Math.abs(t.x - botXRef.current);
            if (d < nearestDist) {
              nearest = t;
              nearestDist = d;
            }
          }
          // Lead the shot: aim at where the target will be by the time a
          // bullet fired now would reach its lane, not where it is right
          // now — otherwise every shot trails a moving target and misses.
          const nearestLane = lanes[nearest.laneIndex];
          const travelDist = Math.max(0, playerY - PLAYER_SIZE / 2 - nearestLane.y * playAreaHeight);
          const travelTime = travelDist / bulletSpeed;
          const predictedX = nearest.x + nearest.dir * nearest.speed * travelTime;
          const desiredX = Math.min(
            Math.max(predictedX + botAimJitterRef.current, PLAYER_SIZE / 2),
            width - PLAYER_SIZE / 2
          );
          const dx = desiredX - botXRef.current;
          const step = Math.min(Math.abs(dx), bot.trackSpeed * dt);
          botXRef.current += Math.sign(dx) * step;
        }
        setBotX(botXRef.current);

        if (
          now >= botNextShotAtRef.current &&
          bulletsRef.current.filter((b) => b.owner === 'bot').length < MAX_BULLETS
        ) {
          bulletsRef.current = [
            ...bulletsRef.current,
            { id: ++idCounterRef.current, x: botXRef.current, y: playerY - PLAYER_SIZE / 2, dirX: 0, dirY: -1, owner: 'bot', color: bot.color },
          ];
          playShoot();
          botNextShotAtRef.current = now + bot.fireIntervalMs * (0.75 + Math.random() * 0.5);
        }

        const botDiff = botScoreRef.current - botDisplayScoreRef.current;
        botDisplayScoreRef.current =
          Math.abs(botDiff) < 0.5 ? botScoreRef.current : botDisplayScoreRef.current + botDiff * Math.min(1, dt * 8);
        setBotDisplayScore(Math.round(botDisplayScoreRef.current));
      }

      popupsRef.current = popupsRef.current.filter((p) => now - p.createdAt < SCORE_POPUP_MS);

      setTargets(targetsRef.current);
      setBullets(bulletsRef.current);
      setPopups(popupsRef.current);
      setPickups(pickupsRef.current);
      setRapidFireMsLeft(Math.max(0, rapidFireUntilRef.current - now));
      setSpreadMsLeft(Math.max(0, spreadUntilRef.current - now));
      setMagnetMsLeft(Math.max(0, magnetUntilRef.current - now));
      setDisplayScore(Math.round(displayScoreRef.current));
      setCharges(chargesRef.current);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [width, playAreaHeight]);

  const fire = () => {
    if (chargesRef.current < 1) return;
    if (bulletsRef.current.filter((b) => b.owner === 'player').length >= MAX_BULLETS) return;
    chargesRef.current -= 1;
    setCharges(chargesRef.current);
    // One fire pattern applies at a time — spread beats double beats a
    // single straight shot — so owning or picking up more than one of
    // these never stacks into a wall of bullets. Same charge cost either way.
    const now = Date.now();
    const hasSpread = ENHANCEMENTS_ENABLED && (ownsSpreadShot || spreadUntilRef.current > now);
    const hasDouble = ENHANCEMENTS_ENABLED && (ownsDoubleShot || rapidFireUntilRef.current > now);
    let shots: { dx: number; dirX: number; dirY: number }[];
    if (hasSpread) {
      const rad = (SPREAD_ANGLE_DEG * Math.PI) / 180;
      shots = [
        { dx: 0, dirX: -Math.sin(rad), dirY: -Math.cos(rad) },
        { dx: 0, dirX: 0, dirY: -1 },
        { dx: 0, dirX: Math.sin(rad), dirY: -Math.cos(rad) },
      ];
    } else if (hasDouble) {
      shots = [
        { dx: -10, dirX: 0, dirY: -1 },
        { dx: 10, dirX: 0, dirY: -1 },
      ];
    } else {
      shots = [{ dx: 0, dirX: 0, dirY: -1 }];
    }
    bulletsRef.current = [
      ...bulletsRef.current,
      ...shots.map((s) => ({
        id: ++idCounterRef.current,
        x: playerXRef.current + s.dx,
        y: playerY - PLAYER_SIZE / 2,
        dirX: s.dirX,
        dirY: s.dirY,
        owner: 'player' as const,
        color: COLORS.blue,
      })),
    ];
    if (!matchOverRef.current) shotsFiredRef.current += shots.length;
    setBullets(bulletsRef.current);
    playShoot();
  };

  // A touch does one of two things, decided by how it ends: let go quickly
  // without dragging and it's a tap — fires in place, cannon doesn't move.
  // Hold it still past TAP_MAX_DURATION_MS and it becomes a hold — the
  // cannon eases over to that column (animateTo). Drag past TAP_MAX_DISTANCE
  // — whether that happens before or after the hold timer — and the cannon
  // instead tracks the finger 1:1 every move event (trackTo), no easing, so
  // it reads as the finger pushing it rather than chasing a series of little
  // slides. No shot fires either way. Which one it is isn't known at
  // touch-down, so a short timer plus a distance check upgrade a touch to
  // "hold" the moment either threshold is crossed; release before that and
  // it's still a tap. Distances are measured from raw touch coordinates (not
  // PanResponder's own gestureState.dx/dy), which reports unreliably on some
  // mobile browsers.
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const lastTouchXRef = useRef(0);
  const isHoldRef = useRef(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animateTo = (pageX: number) => {
    const clamped = Math.min(Math.max(pageX, PLAYER_SIZE / 2), width - PLAYER_SIZE / 2);
    playerXRef.current = clamped;
    const dist = Math.abs(clamped - playerXAnimTargetRef.current);
    playerXAnimTargetRef.current = clamped;
    const effectiveSpeed = ownsMoveSpeed ? PLAYER_SPEED * MOVE_SPEED_UPGRADE_MULT : PLAYER_SPEED;
    const duration = Math.min(
      PLAYER_SLIDE_MAX_MS,
      Math.max(PLAYER_SLIDE_MIN_MS, (dist / effectiveSpeed) * 1000)
    );
    Animated.timing(playerXAnim, {
      toValue: clamped,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };
  // setValue stops any in-flight animateTo slide and snaps straight to the
  // finger — used while actively dragging, so motion is 1:1 with the touch.
  const trackTo = (pageX: number) => {
    const clamped = Math.min(Math.max(pageX, PLAYER_SIZE / 2), width - PLAYER_SIZE / 2);
    playerXRef.current = clamped;
    playerXAnimTargetRef.current = clamped;
    playerXAnim.setValue(clamped);
  };
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, []);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt) => {
        touchStartRef.current = {
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
          t: Date.now(),
        };
        lastTouchXRef.current = evt.nativeEvent.pageX;
        isHoldRef.current = false;
        if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
        holdTimerRef.current = setTimeout(() => {
          isHoldRef.current = true;
          animateTo(lastTouchXRef.current);
        }, TAP_MAX_DURATION_MS);
      },
      onPanResponderMove: (evt) => {
        lastTouchXRef.current = evt.nativeEvent.pageX;
        const start = touchStartRef.current;
        if (!start) return;
        if (!isHoldRef.current) {
          const dx = evt.nativeEvent.pageX - start.x;
          const dy = evt.nativeEvent.pageY - start.y;
          if (Math.hypot(dx, dy) < TAP_MAX_DISTANCE) return;
          isHoldRef.current = true;
          if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
        }
        trackTo(evt.nativeEvent.pageX);
      },
      onPanResponderRelease: () => {
        if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
        const start = touchStartRef.current;
        touchStartRef.current = null;
        if (!start) return;
        if (!isHoldRef.current) fire();
        isHoldRef.current = false;
      },
    })
  ).current;

  const laneYs = useMemo(
    () => LANES.map((lane) => lane.y * playAreaHeight),
    [playAreaHeight]
  );

  return (
    <View style={styles.container}>
      <View style={[styles.topBarWrap, { height: topBarHeight, paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <PressableScale
            onPress={() => {
              playUiTap();
              onExit(scoreRef.current);
            }}
            style={styles.homeButton}
          >
            <Text style={styles.homeButtonText}>⟵ HOME</Text>
          </PressableScale>
          <PressableScale
            onPress={() => {
              onToggleSound();
              if (!soundOn) playUiTap();
            }}
            style={styles.soundToggle}
          >
            <Text style={styles.homeButtonText}>{soundOn ? '🔊' : '🔇'}</Text>
          </PressableScale>
          <View style={styles.statsRow}>
            <Text style={styles.scoreLabel}>{isVsBot ? 'YOU' : 'SCORE'}</Text>
            <Animated.Text style={[styles.scoreText, { transform: [{ scale: scorePulse }] }]}>
              {displayScore}
            </Animated.Text>
            {hasTimer && <Text style={styles.levelLabel}>⏱ {timeLeft}s</Text>}
            {isVsBot && bot ? (
              <Text style={[styles.levelLabel, { color: bot.color }]}>
                {bot.name.toUpperCase()} {botDisplayScore}
              </Text>
            ) : (
              <Text style={styles.levelLabel}>LEVEL {difficultyLevel + 1}</Text>
            )}
            <View style={styles.chargeRow}>
              {Array.from({ length: maxCharges }, (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.chargePip,
                    { opacity: Math.max(0.18, Math.min(1, charges - i)) },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
        {ENHANCEMENTS_ENABLED && (
          <View style={styles.statusBar}>
            {ownsSpreadShot ? (
              <Text style={styles.rapidBadge}>🔱×3 SPREAD</Text>
            ) : spreadMsLeft > 0 ? (
              <Text style={styles.rapidBadge}>🔱×3 SPREAD {Math.ceil(spreadMsLeft / 1000)}s</Text>
            ) : ownsDoubleShot ? (
              <Text style={styles.rapidBadge}>⚡×2 DOUBLE</Text>
            ) : (
              rapidFireMsLeft > 0 && (
                <Text style={styles.rapidBadge}>⚡×2 DOUBLE {Math.ceil(rapidFireMsLeft / 1000)}s</Text>
              )
            )}
            {magnetMsLeft > 0 && (
              <Text style={styles.magnetBadge}>🧲 MAGNET {Math.ceil(magnetMsLeft / 1000)}s</Text>
            )}
          </View>
        )}
      </View>

      <View style={{ height: playAreaHeight }}>
        <View
          style={[styles.playArea, { height: playAreaHeight }, webTouchStyle]}
          {...panResponder.panHandlers}
        >
          <Starfield width={width} height={playAreaHeight} level={difficultyLevel} />
          {targets.map((t, i) => (
            <Target key={t.id} target={t} lane={effectiveLanes[t.laneIndex]} laneY={laneYs[i]} />
          ))}
          {bullets.map((b) => (
            <Bullet key={b.id} bullet={b} />
          ))}
          {pickups.map((p) => (
            <Pickup key={p.id} pickup={p} />
          ))}
          {popups.map((p) => (
            <ScorePopup key={p.id} popup={p} />
          ))}
          {isVsBot && bot && <Player x={botX} y={playerY} color={bot.color} />}
          <Player x={playerXAnim} y={playerY} />
          <LevelUpBanner event={levelUpEvent} />
          <PowerUpBanner event={powerUpEvent} />
        </View>

        {!isVsBot && matchOver && (
          <View style={styles.resultOverlay}>
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>TIME'S UP</Text>
              <View style={styles.resultScores}>
                <View style={styles.resultScoreBlock}>
                  <Text style={styles.resultLabel}>SCORE</Text>
                  <Text style={styles.resultValue}>{scoreRef.current}</Text>
                </View>
              </View>
              {ENHANCEMENTS_ENABLED && shotsFiredRef.current > 0 && (
                <Text style={styles.resultAccuracy}>
                  {getAccuracyTier(shotsHitRef.current / shotsFiredRef.current).icon} MARKSMANSHIP{' '}
                  {Math.round((shotsHitRef.current / shotsFiredRef.current) * 100)}% ·{' '}
                  {getAccuracyTier(shotsHitRef.current / shotsFiredRef.current).label}
                </Text>
              )}
              {ENHANCEMENTS_ENABLED && matchCurrencyEarned > 0 && (
                <Text style={styles.resultCurrency}>
                  {CURRENCY_ICON} +{matchCurrencyEarned} {CURRENCY_NAME.toUpperCase()} EARNED
                </Text>
              )}
              <View style={styles.resultButtons}>
                <PressableScale
                  onPress={() => {
                    playUiTap();
                    onPlayAgain?.();
                  }}
                  style={styles.resultButtonPrimary}
                >
                  <Text style={styles.resultButtonText}>PLAY AGAIN</Text>
                </PressableScale>
                <PressableScale
                  onPress={() => {
                    playUiTap();
                    onExit(scoreRef.current);
                  }}
                  style={styles.resultButtonSecondary}
                >
                  <Text style={styles.resultButtonText}>HOME</Text>
                </PressableScale>
              </View>
            </View>
          </View>
        )}

        {isVsBot && matchOver && bot && (
          <View
            style={[
              styles.resultOverlay,
              outcome === 'lose' && styles.resultOverlayLose,
            ]}
          >
            {outcome === 'win' && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.winBurst,
                  {
                    opacity: winBurst.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.5, 0] }),
                    transform: [
                      { scale: winBurst.interpolate({ inputRange: [0, 1], outputRange: [0.3, 2.6] }) },
                    ],
                  },
                ]}
              />
            )}
            <Animated.View
              style={[
                styles.resultCard,
                outcome === 'win' && styles.resultCardWin,
                outcome === 'lose' && styles.resultCardLose,
                {
                  opacity: resultEnter,
                  transform: [
                    { scale: resultEnter.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
                    {
                      translateY: resultEnter.interpolate({
                        inputRange: [0, 1],
                        outputRange: outcome === 'lose' ? [-16, 0] : [18, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text
                style={[
                  styles.resultTitle,
                  outcome === 'win' && styles.resultTitleWin,
                  outcome === 'lose' && styles.resultTitleLose,
                ]}
              >
                {outcome === 'win' ? 'YOU WIN!' : outcome === 'lose' ? 'YOU LOSE' : 'DRAW'}
              </Text>
              <View style={styles.resultScores}>
                <View style={styles.resultScoreBlock}>
                  <Text style={styles.resultLabel}>YOU</Text>
                  <Text
                    style={[
                      styles.resultValue,
                      outcome === 'lose' && { opacity: 0.7, textShadowColor: 'transparent' },
                    ]}
                  >
                    {scoreRef.current}
                  </Text>
                </View>
                <View style={styles.resultScoreBlock}>
                  <Text style={styles.resultLabel}>{bot.name.toUpperCase()}</Text>
                  <Text style={[styles.resultValue, { color: bot.color, textShadowColor: bot.color }]}>
                    {botScoreRef.current}
                  </Text>
                </View>
              </View>
              {ENHANCEMENTS_ENABLED && shotsFiredRef.current > 0 && (
                <Text style={styles.resultAccuracy}>
                  {getAccuracyTier(shotsHitRef.current / shotsFiredRef.current).icon} MARKSMANSHIP{' '}
                  {Math.round((shotsHitRef.current / shotsFiredRef.current) * 100)}% ·{' '}
                  {getAccuracyTier(shotsHitRef.current / shotsFiredRef.current).label}
                </Text>
              )}
              {ENHANCEMENTS_ENABLED && matchCurrencyEarned > 0 && (
                <Text style={styles.resultCurrency}>
                  {CURRENCY_ICON} +{matchCurrencyEarned} {CURRENCY_NAME.toUpperCase()} EARNED
                </Text>
              )}
              <View style={styles.resultButtons}>
                <PressableScale
                  onPress={() => {
                    playUiTap();
                    onPlayAgain?.();
                  }}
                  style={styles.resultButtonPrimary}
                >
                  <Text style={styles.resultButtonText}>PLAY AGAIN</Text>
                </PressableScale>
                <PressableScale
                  onPress={() => {
                    playUiTap();
                    onExit(scoreRef.current);
                  }}
                  style={styles.resultButtonSecondary}
                >
                  <Text style={styles.resultButtonText}>HOME</Text>
                </PressableScale>
              </View>
            </Animated.View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBarWrap: {
    flexDirection: 'column',
    backgroundColor: COLORS.panel,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: COLORS.purple,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  topBar: {
    height: TOP_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  statusBar: {
    height: STATUS_BAR_HEIGHT,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 14,
  },
  homeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(138,92,255,0.14)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  homeButtonText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  soundToggle: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(138,92,255,0.14)',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginLeft: 8,
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 8,
  },
  scoreLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    letterSpacing: 2,
  },
  levelLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    letterSpacing: 1,
    marginLeft: 16,
  },
  scoreText: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: COLORS.blue,
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 0 },
  },
  chargeRow: {
    flexDirection: 'row',
    gap: 5,
    marginLeft: 16,
  },
  rapidBadge: {
    color: COLORS.cyan,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textShadowColor: COLORS.cyan,
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
  },
  magnetBadge: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textShadowColor: COLORS.blue,
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
  },
  chargePip: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.blue,
    shadowColor: COLORS.blue,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  playArea: {
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  resultOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5,3,15,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultOverlayLose: {
    backgroundColor: 'rgba(5,3,10,0.92)',
  },
  winBurst: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOpacity: 1,
    shadowRadius: 80,
    shadowOffset: { width: 0, height: 0 },
  },
  resultCard: {
    width: 280,
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  resultCardWin: {
    borderColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  resultCardLose: {
    borderColor: 'rgba(122,104,120,0.4)',
    backgroundColor: 'rgba(12,9,18,0.75)',
  },
  resultTitle: {
    color: COLORS.textPrimary,
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textShadowColor: COLORS.cyan,
    textShadowRadius: 18,
    textShadowOffset: { width: 0, height: 0 },
  },
  resultTitleWin: {
    textShadowColor: COLORS.gold,
    textShadowRadius: 26,
  },
  resultTitleLose: {
    color: COLORS.textSecondary,
    textShadowColor: COLORS.sad,
    textShadowRadius: 10,
  },
  resultScores: {
    flexDirection: 'row',
    gap: 36,
    marginTop: 24,
    marginBottom: 28,
  },
  resultScoreBlock: {
    alignItems: 'center',
  },
  resultLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  resultValue: {
    color: COLORS.textPrimary,
    fontSize: 30,
    fontWeight: 'bold',
    textShadowColor: COLORS.blue,
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 0 },
  },
  resultAccuracy: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: -16,
    marginBottom: 6,
    textAlign: 'center',
  },
  resultCurrency: {
    color: COLORS.purple,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 6,
    marginBottom: 20,
    textShadowColor: COLORS.purple,
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
  },
  resultButtons: {
    gap: 12,
    width: '100%',
  },
  resultButtonPrimary: {
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(90,216,255,0.14)',
    borderWidth: 1.5,
    borderColor: COLORS.cyan,
    alignItems: 'center',
  },
  resultButtonSecondary: {
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(138,92,255,0.1)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  resultButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
});

// Web-only CSS that stops mobile browsers from treating the drag as a page
// scroll/swipe, so the swipe-to-move gesture is captured instead. Not part
// of React Native's ViewStyle type, so it's applied as a separate style.
const webTouchStyle: any = { touchAction: 'none', userSelect: 'none' };
