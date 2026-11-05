import { useEffect, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Bullet from '../components/Bullet';
import Player from '../components/Player';
import Target from '../components/Target';
import {
  BULLET_SPEED,
  CONTROLS_HEIGHT,
  HIT_BAND,
  LANES,
  MAX_BULLETS,
  PLAYER_BOTTOM_MARGIN,
  PLAYER_SIZE,
  PLAYER_SPEED,
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
  const playAreaHeight = height - TOP_BAR_HEIGHT - CONTROLS_HEIGHT;
  const playerY = playAreaHeight - PLAYER_BOTTOM_MARGIN;

  const idCounterRef = useRef(LANES.length);
  const moveDirRef = useRef<-1 | 0 | 1>(0);
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

      // Player movement.
      if (moveDirRef.current !== 0) {
        const next = playerXRef.current + moveDirRef.current * PLAYER_SPEED * dt;
        playerXRef.current = Math.min(
          Math.max(next, PLAYER_SIZE / 2),
          width - PLAYER_SIZE / 2
        );
      }

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

      setPlayerX(playerXRef.current);
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

  const startMove = (dir: -1 | 1) => () => {
    moveDirRef.current = dir;
  };
  const stopMove = (dir: -1 | 1) => () => {
    if (moveDirRef.current === dir) moveDirRef.current = 0;
  };

  // Swipe left/right on the play area to move the player; a quick tap that
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
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>

      <View
        style={[styles.playArea, { height: playAreaHeight }]}
        {...panResponder.panHandlers}
      >
        {targets.map((t, i) => (
          <Target key={t.id} target={t} lane={LANES[t.laneIndex]} laneY={laneYs[i]} />
        ))}
        {bullets.map((b) => (
          <Bullet key={b.id} bullet={b} />
        ))}
        <Player x={playerX} y={playerY} />
      </View>

      <View style={styles.controls}>
        <Pressable
          onPressIn={startMove(-1)}
          onPressOut={stopMove(-1)}
          style={styles.controlButton}
        >
          <Text style={styles.controlText}>◀</Text>
        </Pressable>
        <Pressable onPress={fire} style={[styles.controlButton, styles.fireButton]}>
          <Text style={styles.controlText}>FIRE</Text>
        </Pressable>
        <Pressable
          onPressIn={startMove(1)}
          onPressOut={stopMove(1)}
          style={styles.controlButton}
        >
          <Text style={styles.controlText}>▶</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  topBar: {
    height: TOP_BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2733',
  },
  scoreText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  playArea: {
    backgroundColor: '#152238',
    overflow: 'hidden',
  },
  controls: {
    height: CONTROLS_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: '#0d1117',
    borderTopWidth: 1,
    borderTopColor: '#1f2733',
  },
  controlButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#263445',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireButton: {
    backgroundColor: '#d64545',
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  controlText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
