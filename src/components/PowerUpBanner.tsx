import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants';

export type PowerUpKind = 'rapidFire' | 'spreadShot' | 'bomb' | 'magnet';

interface Props {
  event: { id: number; kind: PowerUpKind } | null;
}

const VISIBLE_MS = 1000;

const CONTENT: Record<PowerUpKind, { icon: string; label: string; sub: string; color: string }> = {
  rapidFire: { icon: '⚡', label: 'RAPID FIRE', sub: 'DOUBLE SHOTS', color: COLORS.cyan },
  spreadShot: { icon: '🔱', label: 'SPREAD SHOT', sub: '3-WAY FAN', color: COLORS.pink },
  bomb: { icon: '💣', label: 'NOVA BOMB', sub: 'TARGETS CLEARED', color: COLORS.red },
  magnet: { icon: '🧲', label: 'MAGNET', sub: 'PICKUPS DRAWN IN', color: COLORS.blue },
};

// Big, impossible-to-miss, one-shot — the same finite burst-and-fade pattern
// as LevelUpBanner, triggered the instant a rapid-fire or spread-shot
// pickup is caught, so the change in how shots work has a moment on
// screen, not just a quiet top-bar badge.
export default function PowerUpBanner({ event }: Props) {
  const [shown, setShown] = useState<{ id: number; kind: PowerUpKind } | null>(null);
  const burst = useRef(new Animated.Value(0)).current;
  const boltScale = useRef(new Animated.Value(0)).current;
  const boltOpacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!event) return;
    setShown(event);
    burst.setValue(0);
    boltScale.setValue(0.3);
    boltOpacity.setValue(0);

    Animated.timing(burst, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.parallel([
        Animated.spring(boltScale, {
          toValue: 1,
          friction: 4,
          tension: 200,
          useNativeDriver: true,
        }),
        Animated.timing(boltOpacity, {
          toValue: 1,
          duration: 140,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(350),
      Animated.timing(boltOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShown(null), VISIBLE_MS);
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [event, burst, boltScale, boltOpacity]);

  if (!shown) return null;
  const content = CONTENT[shown.kind];

  const burstScale = burst.interpolate({ inputRange: [0, 1], outputRange: [0.2, 3.2] });
  const burstOpacity = burst.interpolate({ inputRange: [0, 1], outputRange: [0.75, 0] });
  const boltRotate = boltScale.interpolate({ inputRange: [0, 1], outputRange: ['-12deg', '0deg'] });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.burst,
            { backgroundColor: content.color, shadowColor: content.color, opacity: burstOpacity, transform: [{ scale: burstScale }] },
          ]}
        />
        <Animated.View
          style={{
            opacity: boltOpacity,
            transform: [{ scale: boltScale }, { rotate: boltRotate }],
            alignItems: 'center',
          }}
        >
          <Text style={[styles.bolt, { textShadowColor: content.color }]}>{content.icon}</Text>
          <Text style={[styles.label, { textShadowColor: content.color }]}>{content.label}</Text>
          <Text style={styles.sub}>{content.sub}</Text>
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
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.cyan,
    shadowColor: COLORS.cyan,
    shadowOpacity: 1,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 0 },
  },
  bolt: {
    fontSize: 72,
    textShadowColor: COLORS.cyan,
    textShadowRadius: 30,
    textShadowOffset: { width: 0, height: 0 },
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 30,
    fontWeight: 'bold',
    letterSpacing: 3,
    textAlign: 'center',
    marginTop: 4,
    textShadowColor: COLORS.cyan,
    textShadowRadius: 24,
    textShadowOffset: { width: 0, height: 0 },
  },
  sub: {
    color: COLORS.textSecondary,
    fontSize: 13,
    letterSpacing: 2,
    marginTop: 2,
  },
});
