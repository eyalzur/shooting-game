import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants';

export interface CountdownEvent {
  id: number;
  value: number;
}

interface Props {
  event: CountdownEvent | null;
}

const VISIBLE_MS = 820;
const POP_MS = 130;
const HOLD_MS = 280;
const SHATTER_MS = VISIBLE_MS - POP_MS - HOLD_MS;

// Particle angles for the shatter — not evenly spaced, so the debris reads
// as a number breaking apart rather than a tidy ring of confetti.
const SHARD_ANGLES_DEG = [8, 47, 79, 121, 158, 194, 226, 251, 289, 313, 341, 100];

// One-shot pulse for each marked second of the match countdown (10, 5, 3,
// 2, 1): the number pops in, holds, then shatters into particles instead of
// just fading — a "gamey", sci-fi beat to match the Orbitron display font.
export default function CountdownPulse({ event }: Props) {
  const [shown, setShown] = useState<CountdownEvent | null>(null);
  const scale = useRef(new Animated.Value(0.4)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const shatter = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!event) return;
    setShown(event);
    scale.setValue(0.4);
    opacity.setValue(0);
    shatter.setValue(0);

    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 4, tension: 220, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: POP_MS, useNativeDriver: true }),
      ]),
      Animated.delay(HOLD_MS),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: SHATTER_MS * 0.55, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.25, duration: SHATTER_MS, useNativeDriver: true }),
        Animated.timing(shatter, { toValue: 1, duration: SHATTER_MS, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
    ]).start();

    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShown(null), VISIBLE_MS);
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [event, scale, opacity, shatter]);

  if (!shown) return null;

  const urgent = shown.value <= 3;
  const tint = urgent ? COLORS.red : COLORS.cyan;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.center}>
        {SHARD_ANGLES_DEG.map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const dist = 44 + (i % 4) * 16;
          const translateX = shatter.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(rad) * dist] });
          const translateY = shatter.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(rad) * dist] });
          const drop = shatter.interpolate({ inputRange: [0, 1], outputRange: [0, 18 + (i % 3) * 10] });
          const shardOpacity = shatter.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] });
          const shardScale = shatter.interpolate({ inputRange: [0, 1], outputRange: [1, 0.2] });
          return (
            <Animated.View
              key={angle}
              style={[
                styles.shard,
                {
                  backgroundColor: tint,
                  shadowColor: tint,
                  opacity: shardOpacity,
                  transform: [
                    { translateX },
                    { translateY },
                    { translateY: drop },
                    { rotate: `${angle * 4}deg` },
                    { scale: shardScale },
                  ],
                },
              ]}
            />
          );
        })}
        <Animated.Text
          style={[
            styles.number,
            { color: tint, textShadowColor: tint, opacity, transform: [{ scale }] },
          ]}
        >
          {shown.value}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontSize: 118,
    fontFamily: 'Orbitron, "Arial Narrow", sans-serif',
    fontWeight: '900',
    letterSpacing: -2,
    textShadowRadius: 36,
    textShadowOffset: { width: 0, height: 0 },
  },
  shard: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 2,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
});
