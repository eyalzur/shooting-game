import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants';

interface Props {
  event: { level: number; id: number } | null;
}

const VISIBLE_MS = 1300;

export default function LevelUpBanner({ event }: Props) {
  const [shown, setShown] = useState<{ level: number; id: number } | null>(null);
  const burst = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!event) return;
    setShown(event);
    burst.setValue(0);
    textScale.setValue(0.4);
    textOpacity.setValue(0);

    Animated.timing(burst, {
      toValue: 1,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.parallel([
        Animated.spring(textScale, {
          toValue: 1,
          friction: 4.5,
          tension: 180,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(450),
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShown(null), VISIBLE_MS);
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [event, burst, textScale, textOpacity]);

  if (!shown) return null;

  const burstScale = burst.interpolate({ inputRange: [0, 1], outputRange: [0.2, 3] });
  const burstOpacity = burst.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.burst,
            { opacity: burstOpacity, transform: [{ scale: burstScale }] },
          ]}
        />
        <Animated.View
          style={{ opacity: textOpacity, transform: [{ scale: textScale }] }}
        >
          <Text style={styles.label}>LEVEL UP</Text>
          <Text style={styles.number}>{shown.level + 1}</Text>
        </Animated.View>
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
  burst: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.cyan,
    shadowColor: COLORS.cyan,
    shadowOpacity: 1,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 0 },
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 4,
    textAlign: 'center',
    textShadowColor: COLORS.purple,
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 0 },
  },
  number: {
    color: COLORS.textPrimary,
    fontSize: 88,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: COLORS.cyan,
    textShadowRadius: 30,
    textShadowOffset: { width: 0, height: 0 },
  },
});
