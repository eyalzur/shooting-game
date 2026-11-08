import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants';

export interface PurchaseBurstEvent {
  id: number;
  icon: string;
  title: string;
  sub: string;
  color: string;
}

interface Props {
  event: PurchaseBurstEvent | null;
}

const VISIBLE_MS = 1400;
const CONFETTI_ANGLES_DEG = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
const CONFETTI_COLORS = [COLORS.gold, COLORS.cyan, COLORS.pink, COLORS.purple, COLORS.green, COLORS.orange];

// A big, unmissable one-shot celebration for a shop purchase — a wide color
// burst, a ring of confetti dots flying outward, and the item's own icon
// popping in with a bounce. Same finite burst-and-fade pattern as
// LevelUpBanner/PowerUpBanner, just richer, since a purchase should feel
// like a reward, not just a successful tap.
export default function PurchaseBurst({ event }: Props) {
  const [shown, setShown] = useState<PurchaseBurstEvent | null>(null);
  const scrim = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const confetti = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!event) return;
    setShown(event);
    scrim.setValue(0);
    burst.setValue(0);
    ring.setValue(0);
    iconScale.setValue(0.3);
    iconOpacity.setValue(0);
    confetti.setValue(0);

    Animated.sequence([
      Animated.timing(scrim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.delay(VISIBLE_MS - 150 - 300),
      Animated.timing(scrim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();

    Animated.timing(burst, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.timing(ring, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    Animated.timing(confetti, {
      toValue: 1,
      duration: 1100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.parallel([
        Animated.spring(iconScale, { toValue: 1, friction: 4, tension: 190, useNativeDriver: true }),
        Animated.timing(iconOpacity, { toValue: 1, duration: 160, useNativeDriver: true }),
      ]),
      Animated.delay(400),
      Animated.timing(iconOpacity, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();

    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShown(null), VISIBLE_MS);
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [event, scrim, burst, ring, iconScale, iconOpacity, confetti]);

  if (!shown) return null;
  const content = shown;

  const burstScale = burst.interpolate({ inputRange: [0, 1], outputRange: [0.2, 4] });
  const burstOpacity = burst.interpolate({ inputRange: [0, 1], outputRange: [0.85, 0] });
  const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [0.3, 2.6] });
  const ringOpacity = ring.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.9, 0] });
  const iconRotate = iconScale.interpolate({ inputRange: [0, 1], outputRange: ['-18deg', '0deg'] });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, { opacity: scrim }]} />
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.burst,
            { backgroundColor: content.color, shadowColor: content.color, opacity: burstOpacity, transform: [{ scale: burstScale }] },
          ]}
        />
        <Animated.View
          style={[styles.ring, { borderColor: content.color, opacity: ringOpacity, transform: [{ scale: ringScale }] }]}
        />
        {CONFETTI_ANGLES_DEG.map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const dist = 170 + (i % 3) * 40;
          const translateX = confetti.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(rad) * dist] });
          const translateY = confetti.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(rad) * dist] });
          const pieceOpacity = confetti.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 1, 0] });
          const pieceColor = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
          return (
            <Animated.View
              key={angle}
              style={[
                styles.confettiPiece,
                {
                  backgroundColor: pieceColor,
                  shadowColor: pieceColor,
                  opacity: pieceOpacity,
                  transform: [{ translateX }, { translateY }, { rotate: `${angle + i * 40}deg` }],
                },
              ]}
            />
          );
        })}
        <Animated.View
          style={[
            styles.card,
            { borderColor: content.color, opacity: iconOpacity, transform: [{ scale: iconScale }, { rotate: iconRotate }] },
          ]}
        >
          <Text style={[styles.icon, { textShadowColor: content.color }]}>{content.icon}</Text>
          <Text style={styles.label}>PURCHASED!</Text>
          <Text style={[styles.title, { textShadowColor: content.color }]}>{content.title}</Text>
          {!!content.sub && <Text style={styles.sub}>{content.sub}</Text>}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    backgroundColor: 'rgba(5,3,15,0.86)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  burst: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    shadowOpacity: 1,
    shadowRadius: 70,
    shadowOffset: { width: 0, height: 0 },
  },
  ring: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
  },
  confettiPiece: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 2,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  // A near-opaque card behind the text, not just the global scrim — so the
  // celebration always reads as its own floating object with a clean edge,
  // instead of bare glowing text that can blend into whatever's still
  // faintly visible through the scrim as it fades.
  card: {
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 30,
    borderRadius: 24,
    borderWidth: 2,
    backgroundColor: 'rgba(10,7,26,0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  icon: {
    fontSize: 64,
    textShadowRadius: 30,
    textShadowOffset: { width: 0, height: 0 },
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: 6,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 2,
    textShadowRadius: 20,
    textShadowOffset: { width: 0, height: 0 },
  },
  sub: {
    color: COLORS.textSecondary,
    fontSize: 13,
    letterSpacing: 1,
    marginTop: 4,
  },
});
