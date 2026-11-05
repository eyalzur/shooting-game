import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Bullet from '../components/Bullet';
import Player from '../components/Player';
import Starfield from '../components/Starfield';
import Target from '../components/Target';
import {
  BULLET_SPEED,
  COLORS,
  HIT_BAND,
  LANES,
  MAX_BULLETS,
  PLAYER_BOTTOM_MARGIN,
  PLAYER_SIZE,
  RESPAWN_DELAY_MS,
  TAP_MAX_DISTANCE,
  TAP_MAX_DURATION_MS,
} from '../constants';
import { BulletState, TargetState } from '../types';

const TOP_BAR_HEIGHT = 56;

function randomXForLane(laneIndex: number, width: number) {
  const size = LANES[laneIndex].size;
  const min = size / 2;
  const max = width - size / 2;
  return min + Math.random() * (max - min);
}

function makeInitialTargets(width: number): TargetState[] {
  return LANES.map((_, laneIndex) => ({
    id: laneIndex,
    laneIndex,
    x: randomXForLane(laneIndex, width),
    dir: Math.random() < 0.5 ? 1 : -1,
    hitAt: null,
  }));
}

export default function GameScreen() {
  const { width, height } = useWindowDimensions();
  const playAreaHeight = height - TOP_BAR_HEIGHT;
  const playerY = playAreaHeight - PLAYER_BOTTOM_MARGIN;

  const idCounterRef = useRef(LANES.length);
  const playerXRef = useRef(width / 2);
  const targetsRef = useRef<TargetState[]>(makeInitialTargets(width));
  const bulletsRef = useRef<BulletState[]>([]);
  const scoreRef = useRef(0);
  const lastTsRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const [playerX, setPlayerX] = useState(playerXRef.current);
  const [targets, setTargets] = useState(targetsRef.current);
  const [bullets, setBullets] = useState(bulletsRef.current);
  const [score, setScore] = useState(0);

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
      targetsRef.current = targetsRef.current.map((t) => {
        if (t.hitAt !== null) {
          if (now - t.hitAt > RESPAWN_DELAY_MS) {
            return {
              ...t,
              hitAt: null,
              x: randomXForLane(t.laneIndex, width),
              dir: Math.random() < 0.5 ? 1 : -1,
            };
          }
          return t;
        }
        const lane = LANES[t.laneIndex];
        const min = lane.size / 2;
        const max = width - lane.size / 2;
        let nextX = t.x + t.dir * lane.speed * dt;
        let nextDir = t.dir;
        if (nextX < min) {
          nextX = min;
          nextDir = 1;
        } else if (nextX > max) {
          nextX = max;
          nextDir = -1;
        }
        return { ...t, x: nextX, dir: nextDir };
      });

      // Bullets: move up, drop once off-screen.
      bulletsRef.current = bulletsRef.current
        .map((b) => ({ ...b, y: b.y - BULLET_SPEED * dt }))
        .filter((b) => b.y > -20);

      // Collisions: a live bullet entering a lane's hit band near a live target.
      const remainingBullets: BulletState[] = [];
      for (const b of bulletsRef.current) {
        let hitSomething = false;
        for (const t of targetsRef.current) {
          if (t.hitAt !== null) continue;
          const lane = LANES[t.laneIndex];
          const laneY = lane.y * playAreaHeight;
          if (
            Math.abs(b.y - laneY) <= HIT_BAND &&
            Math.abs(b.x - t.x) <= lane.size / 2
          ) {
            t.hitAt = now;
            scoreRef.current += lane.points;
            hitSomething = true;
            break;
          }
        }
        if (!hitSomething) remainingBullets.push(b);
      }
      bulletsRef.current = remainingBullets;

      setTargets(targetsRef.current);
      setBullets(bulletsRef.current);
      setScore(scoreRef.current);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [width, playAreaHeight]);

  const fire = () => {
    if (bulletsRef.current.length >= MAX_BULLETS) return;
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
  // barely moves fires instead, so moving never also triggers a shot.
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const dragBaseXRef = useRef(0);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        touchStartRef.current = {
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
          t: Date.now(),
        };
        dragBaseXRef.current = playerXRef.current;
      },
      onPanResponderMove: (_evt, gestureState) => {
        const next = dragBaseXRef.current + gestureState.dx;
        playerXRef.current = Math.min(
          Math.max(next, PLAYER_SIZE / 2),
          width - PLAYER_SIZE / 2
        );
        setPlayerX(playerXRef.current);
      },
      onPanResponderRelease: (_evt, gestureState) => {
        const start = touchStartRef.current;
        touchStartRef.current = null;
        const distance = Math.hypot(gestureState.dx, gestureState.dy);
        const duration = start ? Date.now() - start.t : Infinity;
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
      <View style={styles.topBar}>
        <Text style={styles.scoreLabel}>SCORE</Text>
        <Text style={styles.scoreText}>{score}</Text>
      </View>

      <View
        style={[styles.playArea, { height: playAreaHeight }, webTouchStyle]}
        {...panResponder.panHandlers}
      >
        <Starfield width={width} height={playAreaHeight} />
        {targets.map((t, i) => (
          <Target key={t.id} target={t} lane={LANES[t.laneIndex]} laneY={laneYs[i]} />
        ))}
        {bullets.map((b) => (
          <Bullet key={b.id} bullet={b} />
        ))}
        <Player x={playerX} y={playerY} />
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
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.panel,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  scoreLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    letterSpacing: 2,
  },
  scoreText: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: COLORS.cyan,
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 0 },
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
