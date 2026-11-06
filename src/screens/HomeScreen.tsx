import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Starfield from '../components/Starfield';
import { COLORS, GAME_NAME } from '../constants';

interface Props {
  bestScore: number;
  lastScore: number | null;
  onStart: () => void;
}

export default function HomeScreen({ bestScore, lastScore, onStart }: Props) {
  const { width, height } = useWindowDimensions();
  const pressScale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(pressScale, { toValue: 0.92, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () =>
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  return (
    <View style={[styles.container, { width, height }]}>
      <Starfield width={width} height={height} level={0} />

      <Text style={styles.title}>{GAME_NAME}</Text>
      <Text style={styles.subtitle}>Take aim. Hold your ground.</Text>

      <View style={styles.scoreBoard}>
        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>BEST</Text>
          <Text style={styles.scoreValue}>{bestScore}</Text>
        </View>
        {lastScore !== null && (
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreLabel}>LAST RUN</Text>
            <Text style={styles.scoreValueSecondary}>{lastScore}</Text>
          </View>
        )}
      </View>

      <Pressable onPress={onStart} onPressIn={onPressIn} onPressOut={onPressOut}>
        <Animated.View style={[styles.startButton, { transform: [{ scale: pressScale }] }]}>
          <Text style={styles.startLabel}>START GAME</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 40,
    fontWeight: 'bold',
    letterSpacing: 3,
    textShadowColor: COLORS.purple,
    textShadowRadius: 24,
    textShadowOffset: { width: 0, height: 0 },
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  scoreBoard: {
    flexDirection: 'row',
    gap: 36,
    marginTop: 44,
    marginBottom: 44,
  },
  scoreBlock: {
    alignItems: 'center',
  },
  scoreLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 4,
  },
  scoreValue: {
    color: COLORS.textPrimary,
    fontSize: 34,
    fontWeight: 'bold',
    textShadowColor: COLORS.cyan,
    textShadowRadius: 16,
    textShadowOffset: { width: 0, height: 0 },
  },
  scoreValueSecondary: {
    color: COLORS.textPrimary,
    fontSize: 26,
    fontWeight: '600',
    opacity: 0.85,
  },
  startButton: {
    paddingVertical: 18,
    paddingHorizontal: 52,
    borderRadius: 32,
    backgroundColor: 'rgba(90,216,255,0.14)',
    borderWidth: 1.5,
    borderColor: COLORS.cyan,
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.8,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
  },
  startLabel: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 3,
    textShadowColor: COLORS.cyan,
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 0 },
  },
});
