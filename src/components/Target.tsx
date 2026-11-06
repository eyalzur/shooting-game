import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { STAR_SPIN_MS } from '../constants';
import { LaneConfig, TargetState } from '../types';

interface Props {
  target: TargetState;
  lane: LaneConfig;
  laneY: number;
}

export default function Target({ target, lane, laneY }: Props) {
  const isHit = target.hitAt !== null;
  const glowSize = lane.size * 1.9;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: STAR_SPIN_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotateBack = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] });

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
        opacity: isHit ? 0.2 : 1,
        transform: [{ scale: isHit ? 1.5 : 1 }],
      }}
    >
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
      <Animated.View
        style={[
          styles.spikeSet,
          { width: lane.size * 1.6, height: lane.size * 1.6, transform: [{ rotate }] },
        ]}
      >
        <View style={[styles.spike, styles.spikeV, { backgroundColor: lane.color }]} />
        <View style={[styles.spike, styles.spikeH, { backgroundColor: lane.color }]} />
      </Animated.View>
      <Animated.View
        style={[
          styles.spikeSet,
          { width: lane.size * 1.3, height: lane.size * 1.3, transform: [{ rotate: rotateBack }] },
        ]}
      >
        <View style={[styles.spike, styles.spikeDiagA, { backgroundColor: lane.color }]} />
        <View style={[styles.spike, styles.spikeDiagB, { backgroundColor: lane.color }]} />
      </Animated.View>
      <View
        style={[
          styles.core,
          {
            width: lane.size,
            height: lane.size,
            borderRadius: lane.size / 2,
            backgroundColor: lane.color,
            shadowColor: lane.color,
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
