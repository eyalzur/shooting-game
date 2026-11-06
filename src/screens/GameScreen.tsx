import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Bullet from '../components/Bullet';
import LevelUpBanner from '../components/LevelUpBanner';
import Player from '../components/Player';
import ScorePopup from '../components/ScorePopup';
import Starfield from '../components/Starfield';
import Target from '../components/Target';
import {
  BULLET_SPEED,
  BULLET_SPEED_MAX_MULTIPLIER,
  BULLET_SPEED_STEP,
  COLORS,
  DIFFICULTY_MAX_LEVEL,
  DIFFICULTY_MIN_SIZE_MULTIPLIER,
  DIFFICULTY_RANGE_STEP,
  DIFFICULTY_SIZE_STEP,
  DIFFICULTY_SPEED_STEP,
  DIFFICULTY_STEP_HITS,
  FIRE_MAX_CHARGES,
  FIRE_RECHARGE_MIN_MS,
  FIRE_RECHARGE_MS,
  FIRE_RECHARGE_STEP,
  HIT_BAND,
  LANES,
  MAX_BULLETS,
  PLAYER_BOTTOM_MARGIN,
  PLAYER_SIZE,
  RESPAWN_MAX_MS,
  RESPAWN_MIN_MS,
  SCORE_POPUP_MS,
  STAR_SPIN_MS,
  TAP_MAX_DISTANCE,
  TAP_MAX_DURATION_MS,
} from '../constants';
import { BulletState, LaneConfig, ScorePopupState, TargetState } from '../types';

const TOP_BAR_HEIGHT = 56;

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

function getEffectiveBulletSpeed(level: number) {
  const mul = Math.min(BULLET_SPEED_MAX_MULTIPLIER, 1 + level * BULLET_SPEED_STEP);
  return BULLET_SPEED * mul;
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

function makeInitialTargets(lanes: LaneConfig[], width: number): TargetState[] {
  return lanes.map((lane, laneIndex) => ({
    id: laneIndex,
    laneIndex,
    x: randomXForLane(lane.size, width),
    dir: Math.random() < 0.5 ? 1 : -1,
    speed: randomSpeedForLane(lane),
    spin: Math.random(),
    hitAt: null,
    respawnDelay: 0,
  }));
}

interface Props {
  onExit: (finalScore: number) => void;
}

export default function GameScreen({ onExit }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const topBarHeight = TOP_BAR_HEIGHT + insets.top;
  const playAreaHeight = height - topBarHeight;
  const playerY = playAreaHeight - PLAYER_BOTTOM_MARGIN;

  const idCounterRef = useRef(LANES.length);
  const playerXRef = useRef(width / 2);
  const targetsRef = useRef<TargetState[]>(makeInitialTargets(LANES, width));
  const bulletsRef = useRef<BulletState[]>([]);
  const popupsRef = useRef<ScorePopupState[]>([]);
  const scoreRef = useRef(0);
  const displayScoreRef = useRef(0);
  const hitsRef = useRef(0);
  const difficultyLevelRef = useRef(0);
  const emittedLevelRef = useRef(0);
  const effectiveLanesRef = useRef<LaneConfig[]>(LANES);
  const lastTsRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const chargesRef = useRef(FIRE_MAX_CHARGES);

  const [playerX, setPlayerX] = useState(playerXRef.current);
  const [targets, setTargets] = useState(targetsRef.current);
  const [bullets, setBullets] = useState(bulletsRef.current);
  const [popups, setPopups] = useState(popupsRef.current);
  const [displayScore, setDisplayScore] = useState(0);
  const [difficultyLevel, setDifficultyLevel] = useState(0);
  const [charges, setCharges] = useState(chargesRef.current);
  const [levelUpEvent, setLevelUpEvent] = useState<{ level: number; id: number } | null>(null);
  const levelUpIdRef = useRef(0);
  const scorePulse = useRef(new Animated.Value(1)).current;
  const triggerScorePulse = () => {
    scorePulse.setValue(1);
    Animated.sequence([
      Animated.timing(scorePulse, { toValue: 1.4, duration: 110, useNativeDriver: true }),
      Animated.spring(scorePulse, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

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
  }, [width]);

  useEffect(() => {
    const tick = (ts: number) => {
      const last = lastTsRef.current ?? ts;
      const dt = Math.min((ts - last) / 1000, 0.05); // clamp dt for tab-switch pauses
      lastTsRef.current = ts;

      // Targets: bounce within lane bounds, or wait to respawn after a hit.
      const now = Date.now();
      const lanes = effectiveLanesRef.current;
      targetsRef.current = targetsRef.current.map((t) => {
        if (t.hitAt !== null) {
          if (now - t.hitAt > t.respawnDelay) {
            const lane = lanes[t.laneIndex];
            return {
              ...t,
              hitAt: null,
              x: randomXForLane(lane.size, width),
              dir: Math.random() < 0.5 ? 1 : -1,
              speed: randomSpeedForLane(lane),
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
        if (nextX < min) {
          nextX = min;
          nextDir = 1;
          nextSpeed = randomSpeedForLane(lane);
        } else if (nextX > max) {
          nextX = max;
          nextDir = -1;
          nextSpeed = randomSpeedForLane(lane);
        }
        // Spin is driven here, by the same clock as everything else, so it
        // can never stall independently of the rest of the game.
        const nextSpin = (t.spin + dt / (STAR_SPIN_MS / 1000)) % 1;
        return { ...t, x: nextX, dir: nextDir, speed: nextSpeed, spin: nextSpin };
      });

      // Bullets: move up, drop once off-screen. Speed ramps with level too.
      const bulletSpeed = getEffectiveBulletSpeed(difficultyLevelRef.current);
      bulletsRef.current = bulletsRef.current
        .map((b) => ({ ...b, y: b.y - bulletSpeed * dt }))
        .filter((b) => b.y > -20);

      // Collisions: a live bullet entering a lane's hit band near a live target.
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
            scoreRef.current += lane.points;
            hitsRef.current += 1;
            popupsRef.current = [
              ...popupsRef.current,
              {
                id: ++idCounterRef.current,
                x: t.x,
                y: laneY,
                value: lane.points,
                color: lane.color,
                createdAt: now,
              },
            ];
            triggerScorePulse();
            hitSomething = true;
            break;
          }
        }
        if (!hitSomething) remainingBullets.push(b);
      }
      bulletsRef.current = remainingBullets;

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
        }
      }

      // Recharge fire charges over time; speeds up with level.
      const rechargeMs = getEffectiveRechargeMs(difficultyLevelRef.current);
      chargesRef.current = Math.min(
        FIRE_MAX_CHARGES,
        chargesRef.current + dt / (rechargeMs / 1000)
      );

      // Score counts up toward its true value instead of jumping, and score
      // popups expire after their float-up animation finishes.
      const scoreDiff = scoreRef.current - displayScoreRef.current;
      displayScoreRef.current =
        Math.abs(scoreDiff) < 0.5 ? scoreRef.current : displayScoreRef.current + scoreDiff * Math.min(1, dt * 8);
      popupsRef.current = popupsRef.current.filter((p) => now - p.createdAt < SCORE_POPUP_MS);

      setTargets(targetsRef.current);
      setBullets(bulletsRef.current);
      setPopups(popupsRef.current);
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
    if (bulletsRef.current.length >= MAX_BULLETS) return;
    chargesRef.current -= 1;
    setCharges(chargesRef.current);
    bulletsRef.current = [
      ...bulletsRef.current,
      {
        id: ++idCounterRef.current,
        x: playerXRef.current,
        y: playerY - PLAYER_SIZE / 2,
      },
    ];
    setBullets(bulletsRef.current);
  };

  // Swipe left/right anywhere on screen to move the player; a quick tap that
  // barely moves fires on release — and only on release, never mid-gesture.
  // Distances are measured from raw touch coordinates (not PanResponder's
  // own gestureState.dx/dy), which reports unreliably on some mobile
  // browsers and was causing swipes to misfire as taps.
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const dragBaseXRef = useRef(0);
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
        dragBaseXRef.current = playerXRef.current;
      },
      onPanResponderMove: (evt) => {
        const start = touchStartRef.current;
        if (!start) return;
        const dx = evt.nativeEvent.pageX - start.x;
        const next = dragBaseXRef.current + dx;
        playerXRef.current = Math.min(
          Math.max(next, PLAYER_SIZE / 2),
          width - PLAYER_SIZE / 2
        );
        setPlayerX(playerXRef.current);
      },
      onPanResponderRelease: (evt) => {
        const start = touchStartRef.current;
        touchStartRef.current = null;
        if (!start) return;
        const dx = evt.nativeEvent.pageX - start.x;
        const dy = evt.nativeEvent.pageY - start.y;
        const distance = Math.hypot(dx, dy);
        const duration = Date.now() - start.t;
        if (distance < TAP_MAX_DISTANCE && duration < TAP_MAX_DURATION_MS) {
          fire();
        }
      },
    })
  ).current;

  const laneYs = useMemo(
    () => LANES.map((lane) => lane.y * playAreaHeight),
    [playAreaHeight]
  );

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { height: topBarHeight, paddingTop: insets.top }]}>
        <Pressable onPress={() => onExit(scoreRef.current)} style={styles.homeButton}>
          <Text style={styles.homeButtonText}>⟵ HOME</Text>
        </Pressable>
        <View style={styles.statsRow}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Animated.Text style={[styles.scoreText, { transform: [{ scale: scorePulse }] }]}>
            {displayScore}
          </Animated.Text>
          <Text style={styles.levelLabel}>LEVEL {difficultyLevel + 1}</Text>
          <View style={styles.chargeRow}>
            {Array.from({ length: FIRE_MAX_CHARGES }, (_, i) => (
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
        {popups.map((p) => (
          <ScorePopup key={p.id} popup={p} />
        ))}
        <Player x={playerX} y={playerY} />
        <LevelUpBanner event={levelUpEvent} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    height: TOP_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
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
    textShadowColor: COLORS.cyan,
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 0 },
  },
  chargeRow: {
    flexDirection: 'row',
    gap: 5,
    marginLeft: 16,
  },
  chargePip: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.cyan,
    shadowColor: COLORS.cyan,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  playArea: {
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
});

// Web-only CSS that stops mobile browsers from treating the drag as a page
// scroll/swipe, so the swipe-to-move gesture is captured instead. Not part
// of React Native's ViewStyle type, so it's applied as a separate style.
const webTouchStyle: any = { touchAction: 'none', userSelect: 'none' };
