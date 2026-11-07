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

const VISIBLE_MS = 700;

// One-shot pulse for each marked second of the match countdown (10, 5, 3,
// 2, 1) — same burst-and-fade shape as LevelUpBanner, but short and sharp
// since a new one can land every second near the end of the match.
export default function CountdownPulse({ event }: Props) {
  const [shown, setShown] = useState<CountdownEvent | null>(null);
  const scale = useRef(new Animated.Value(0.4)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!event) return;
    setShown(event);
    scale.setValue(0.4);
    opacity.setValue(0);

    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]),
      Animated.delay(280),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.3, duration: 220, useNativeDriver: true }),
      ]),
    ]).start();

    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShown(null), VISIBLE_MS);
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [event, scale, opacity]);

  if (!shown) return null;

  const urgent = shown.value <= 3;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.center}>
        <Animated.Text
          style={[
            styles.number,
            urgent && styles.numberUrgent,
            { opacity, transform: [{ scale }] },
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
    color: COLORS.textPrimary,
    fontSize: 110,
    fontWeight: 'bold',
    textShadowColor: COLORS.cyan,
    textShadowRadius: 34,
    textShadowOffset: { width: 0, height: 0 },
  },
  numberUrgent: {
    color: COLORS.red,
    textShadowColor: COLORS.red,
  },
});
