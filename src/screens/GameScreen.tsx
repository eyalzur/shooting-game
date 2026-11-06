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
  BOT_JITTER_WALK_SPEED,
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
  VS_MATCH_MS,
} from '../constants';
import { BotConfig, BulletState, GameMode, LaneConfig, ScorePopupState, TargetState } from '../types';

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
    const nextSpin = (t.spin + dt / (STAR_SPIN_MS / 1000)) % 1;
    return { ...t, x: nextX, dir: nextDir, speed: nextSpeed, spin: nextSpin };
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
    respawnDelay: 0,
  }));
}

interface Props {
  mode?: GameMode;
  bot?: BotConfig;
  matchMs?: number;
  onExit: (finalScore: number) => void;
  onPlayAgain?: () => void;
}

export default function GameScreen({ mode = 'solo', bot, matchMs = VS_MATCH_MS, onExit, onPlayAgain }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const topBarHeight = TOP_BAR_HEIGHT + insets.top;
  const playAreaHeight = height - topBarHeight;
  const isVsBot = mode === 'vs' && !!bot;
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
  const scoreRef = useRef(0);
  const displayScoreRef = useRef(0);
  const hitsRef = useRef(0);
  const difficultyLevelRef = useRef(0);
  const emittedLevelRef = useRef(0);
  const effectiveLanesRef = useRef<LaneConfig[]>(LANES);
  const lastTsRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const chargesRef = useRef(FIRE_MAX_CHARGES);

  // VS mode: a bot opponent sharing the player's board and clock.
  const matchStartRef = useRef(Date.now());
  const matchOverRef = useRef(false);
  const botScoreRef = useRef(0);
  const botDisplayScoreRef = useRef(0);
  const botNextShotAtRef = useRef(matchStartRef.current + (bot?.fireIntervalMs ?? 0) * (0.4 + Math.random() * 0.4));

  const [playerX, setPlayerX] = useState(playerXRef.current);
  const [botX, setBotX] = useState(botXRef.current);
  const [targets, setTargets] = useState(targetsRef.current);
  const [bullets, setBullets] = useState(bulletsRef.current);
  const [popups, setPopups] = useState(popupsRef.current);
  const [displayScore, setDisplayScore] = useState(0);
  const [botDisplayScore, setBotDisplayScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(Math.ceil(matchMs / 1000));
  const [matchOver, setMatchOver] = useState(false);
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

      // VS mode match timer — once it hits zero, scoring freezes for both
      // sides but the scene keeps animating behind the result overlay.
      let timeLeftMs = matchMs;
      if (isVsBot) {
        timeLeftMs = Math.max(0, matchMs - (now - matchStartRef.current));
        if (timeLeftMs <= 0 && !matchOverRef.current) {
          matchOverRef.current = true;
          setMatchOver(true);
        }
      }
      targetsRef.current = advanceTargets(targetsRef.current, lanes, width, dt, now);

      // Bullets: move up, drop once off-screen. Speed ramps with level too.
      const bulletSpeed = getEffectiveBulletSpeed(difficultyLevelRef.current);
      bulletsRef.current = bulletsRef.current
        .map((b) => ({ ...b, y: b.y - bulletSpeed * dt }))
        .filter((b) => b.y > -20);

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
            if (!matchOverRef.current) {
              if (b.owner === 'player') {
                scoreRef.current += lane.points;
                hitsRef.current += 1;
                popupsRef.current = [
                  ...popupsRef.current,
                  { id: ++idCounterRef.current, x: t.x, y: laneY, value: lane.points, color: lane.color, createdAt: now },
                ];
                triggerScorePulse();
              } else if (bot) {
                botScoreRef.current += lane.points;
                popupsRef.current = [
                  ...popupsRef.current,
                  { id: ++idCounterRef.current, x: t.x, y: laneY, value: lane.points, color: bot.color, createdAt: now },
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
            { id: ++idCounterRef.current, x: botXRef.current, y: playerY - PLAYER_SIZE / 2, owner: 'bot', color: bot.color },
          ];
          botNextShotAtRef.current = now + bot.fireIntervalMs * (0.75 + Math.random() * 0.5);
        }

        const botDiff = botScoreRef.current - botDisplayScoreRef.current;
        botDisplayScoreRef.current =
          Math.abs(botDiff) < 0.5 ? botScoreRef.current : botDisplayScoreRef.current + botDiff * Math.min(1, dt * 8);
        setBotDisplayScore(Math.round(botDisplayScoreRef.current));
        setTimeLeft(Math.ceil(timeLeftMs / 1000));
      }

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
    if (bulletsRef.current.filter((b) => b.owner === 'player').length >= MAX_BULLETS) return;
    chargesRef.current -= 1;
    setCharges(chargesRef.current);
    bulletsRef.current = [
      ...bulletsRef.current,
      {
        id: ++idCounterRef.current,
        x: playerXRef.current,
        y: playerY - PLAYER_SIZE / 2,
        owner: 'player',
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
          <Text style={styles.scoreLabel}>{isVsBot ? 'YOU' : 'SCORE'}</Text>
          <Animated.Text style={[styles.scoreText, { transform: [{ scale: scorePulse }] }]}>
            {displayScore}
          </Animated.Text>
          {isVsBot && bot ? (
            <>
              <Text style={styles.levelLabel}>⏱ {timeLeft}s</Text>
              <Text style={[styles.levelLabel, { color: bot.color }]}>
                {bot.name.toUpperCase()} {botDisplayScore}
              </Text>
            </>
          ) : (
            <Text style={styles.levelLabel}>LEVEL {difficultyLevel + 1}</Text>
          )}
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
          {popups.map((p) => (
            <ScorePopup key={p.id} popup={p} />
          ))}
          {isVsBot && bot && <Player x={botX} y={playerY} color={bot.color} />}
          <Player x={playerX} y={playerY} />
          <LevelUpBanner event={levelUpEvent} />
        </View>

        {isVsBot && matchOver && bot && (
          <View style={styles.resultOverlay}>
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>
                {scoreRef.current > botScoreRef.current
                  ? 'YOU WIN!'
                  : scoreRef.current < botScoreRef.current
                    ? `${bot.name.toUpperCase()} WINS`
                    : 'DRAW'}
              </Text>
              <View style={styles.resultScores}>
                <View style={styles.resultScoreBlock}>
                  <Text style={styles.resultLabel}>YOU</Text>
                  <Text style={styles.resultValue}>{scoreRef.current}</Text>
                </View>
                <View style={styles.resultScoreBlock}>
                  <Text style={styles.resultLabel}>{bot.name.toUpperCase()}</Text>
                  <Text style={[styles.resultValue, { color: bot.color, textShadowColor: bot.color }]}>
                    {botScoreRef.current}
                  </Text>
                </View>
              </View>
              <View style={styles.resultButtons}>
                <Pressable onPress={onPlayAgain} style={styles.resultButtonPrimary}>
                  <Text style={styles.resultButtonText}>PLAY AGAIN</Text>
                </Pressable>
                <Pressable onPress={() => onExit(scoreRef.current)} style={styles.resultButtonSecondary}>
                  <Text style={styles.resultButtonText}>HOME</Text>
                </Pressable>
              </View>
            </View>
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
  resultTitle: {
    color: COLORS.textPrimary,
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textShadowColor: COLORS.cyan,
    textShadowRadius: 18,
    textShadowOffset: { width: 0, height: 0 },
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
    textShadowColor: COLORS.cyan,
    textShadowRadius: 14,
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
