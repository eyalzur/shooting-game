import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { BULLET_SIZE, BULLET_SPIN_MS, COLORS } from '../constants';
import { BulletState } from '../types';

export default function Bullet({ bullet }: { bullet: BulletState }) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: BULLET_SPIN_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const tint = bullet.color;
  const glowSize = BULLET_SIZE * 1.8;

  return (
    <View style={{ position: 'absolute', left: bullet.x, top: bullet.y }}>
      {tint && (
        <View
          style={[
            styles.glow,
            {
              left: -glowSize / 2,
              top: -glowSize / 2,
              width: glowSize,
              height: glowSize,
              borderRadius: glowSize / 2,
              backgroundColor: tint,
              shadowColor: tint,
            },
          ]}
        />
      )}
      <Animated.View
        style={[
          styles.stone,
          {
            left: -BULLET_SIZE / 2,
            top: -BULLET_SIZE / 2,
            borderColor: tint ?? COLORS.stoneDark,
            transform: [{ rotate }],
          },
        ]}
      >
        <Animated.View style={[styles.crater, styles.craterA]} />
        <Animated.View style={[styles.crater, styles.craterB]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    opacity: 0.45,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  stone: {
    position: 'absolute',
    width: BULLET_SIZE,
    height: BULLET_SIZE,
    borderRadius: BULLET_SIZE * 0.35,
    backgroundColor: COLORS.stone,
    borderWidth: 1,
    borderColor: COLORS.stoneDark,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  crater: {
    position: 'absolute',
    borderRadius: 99,
    backgroundColor: COLORS.stoneDark,
    opacity: 0.6,
  },
  craterA: {
    width: BULLET_SIZE * 0.3,
    height: BULLET_SIZE * 0.3,
    top: BULLET_SIZE * 0.15,
    left: BULLET_SIZE * 0.18,
  },
  craterB: {
    width: BULLET_SIZE * 0.22,
    height: BULLET_SIZE * 0.22,
    bottom: BULLET_SIZE * 0.12,
    right: BULLET_SIZE * 0.15,
  },
});
