import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { EXPLOSION_MS } from '../constants';
import { LaneConfig, TargetState } from '../types';

interface Props {
  target: TargetState;
  lane: LaneConfig;
  laneY: number;
}

const SPARK_ANGLES_DEG = [0, 60, 120, 180, 240, 300];

export default function Target({ target, lane, laneY }: Props) {
  const isHit = target.hitAt !== null;
  const glowSize = lane.size * 1.9;

  // One-shot explosion burst, triggered on the instant a hit lands. It's a
  // finite animation (not a loop), so it can't drift or stall the way an
  // always-running per-target loop could.
  const explode = useRef(new Animated.Value(0)).current;
  const prevHitAt = useRef<number | null>(null);
  useEffect(() => {
    if (target.hitAt !== null && target.hitAt !== prevHitAt.current) {
      explode.setValue(0);
      Animated.timing(explode, {
        toValue: 1,
        duration: EXPLOSION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
    prevHitAt.current = target.hitAt;
  }, [target.hitAt, explode]);

  // Rotation is computed straight from the target's own spin phase, which
  // the main game loop advances every tick — no independent animation clock
  // to fall out of sync or silently stop.
  const rotate = `${target.spin * 360}deg`;
  const rotateBack = `${-target.spin * 360}deg`;

  const sparkOpacity = explode.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] });
  const coreOpacity = explode.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const coreScale = explode.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
  const ringScale = explode.interpolate({ inputRange: [0, 1], outputRange: [0.4, 2.6] });
  const ringOpacity = explode.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] });

  return (
    <View
      style={{
        position: 'absolute',
        left: target.x - glowSize / 2,
        top: laneY - glowSize / 2,
        width: glowSize,
        height: glowSize,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isHit && (
        <>
          <Animated.View
            style={[
              styles.ring,
              {
                width: glowSize,
                height: glowSize,
                borderRadius: glowSize / 2,
                borderColor: lane.color,
                opacity: ringOpacity,
                transform: [{ scale: ringScale }],
              },
            ]}
          />
          {SPARK_ANGLES_DEG.map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const dist = glowSize * 0.7;
            const translateX = explode.interpolate({
              inputRange: [0, 1],
              outputRange: [0, Math.cos(rad) * dist],
            });
            const translateY = explode.interpolate({
              inputRange: [0, 1],
              outputRange: [0, Math.sin(rad) * dist],
            });
            return (
              <Animated.View
                key={angle}
                style={[
                  styles.spark,
                  {
                    backgroundColor: lane.color,
                    shadowColor: lane.color,
                    opacity: sparkOpacity,
                    transform: [{ translateX }, { translateY }],
                  },
                ]}
              />
            );
          })}
        </>
      )}

      {!isHit && (
        <>
          <View
            style={[
              styles.glow,
              {
                width: glowSize,
                height: glowSize,
                borderRadius: glowSize / 2,
                backgroundColor: lane.color,
                shadowColor: lane.color,
              },
            ]}
          />
          <View
            style={[
              styles.spikeSet,
              { width: lane.size * 1.6, height: lane.size * 1.6, transform: [{ rotate }] },
            ]}
          >
            <View style={[styles.spike, styles.spikeV, { backgroundColor: lane.color }]} />
            <View style={[styles.spike, styles.spikeH, { backgroundColor: lane.color }]} />
          </View>
          <View
            style={[
              styles.spikeSet,
              { width: lane.size * 1.3, height: lane.size * 1.3, transform: [{ rotate: rotateBack }] },
            ]}
          >
            <View style={[styles.spike, styles.spikeDiagA, { backgroundColor: lane.color }]} />
            <View style={[styles.spike, styles.spikeDiagB, { backgroundColor: lane.color }]} />
          </View>
        </>
      )}

      <Animated.View
        style={[
          styles.core,
          {
            width: lane.size,
            height: lane.size,
            borderRadius: lane.size / 2,
            backgroundColor: lane.color,
            shadowColor: lane.color,
            opacity: isHit ? coreOpacity : 1,
            transform: [{ scale: isHit ? coreScale : 1 }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    opacity: 0.22,
    shadowOpacity: 1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
  },
  spark: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  spikeSet: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spike: {
    position: 'absolute',
    opacity: 0.55,
    borderRadius: 2,
  },
  spikeV: {
    width: 3,
    height: '100%',
  },
  spikeH: {
    width: '100%',
    height: 3,
  },
  spikeDiagA: {
    width: 2,
    height: '100%',
    transform: [{ rotate: '45deg' }],
  },
  spikeDiagB: {
    width: 2,
    height: '100%',
    transform: [{ rotate: '-45deg' }],
  },
  core: {
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
});
