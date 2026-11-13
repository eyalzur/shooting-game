import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import PressableScale from '../components/PressableScale';
import Starfield from '../components/Starfield';
import { APP_VERSION, COLORS, CURRENCY_ICON, GAME_NAME } from '../constants';
import { playUiTap } from '../utils/sound';

interface Props {
  bestScore: number;
  lastScore: number | null;
  onStartSolo: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
  currency: number;
  onOpenShop: () => void;
  onOpenPlayer: () => void;
  onOpenChangelog: () => void;
}

function MenuButton({
  label,
  variant,
  onPress,
}: {
  label: string;
  variant: 'primary' | 'secondary';
  onPress: () => void;
}) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(pressScale, { toValue: 0.92, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () =>
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View
        style={[
          styles.button,
          variant === 'secondary' && styles.buttonSecondary,
          { transform: [{ scale: pressScale }] },
        ]}
      >
        <Text style={[styles.buttonLabel, variant === 'secondary' && styles.buttonLabelSecondary]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function HomeScreen({
  bestScore,
  lastScore,
  onStartSolo,
  soundOn,
  onToggleSound,
  currency,
  onOpenShop,
  onOpenPlayer,
  onOpenChangelog,
}: Props) {
  const { width, height } = useWindowDimensions();

  return (
    <View style={[styles.container, { width, height }]}>
      <Starfield width={width} height={height} level={0} />

      <PressableScale
        onPress={() => {
          playUiTap();
          onOpenChangelog();
        }}
        style={styles.versionButton}
        scaleTo={0.9}
      >
        <Text style={styles.versionButtonText}>📜 v{APP_VERSION}</Text>
      </PressableScale>

      <PressableScale
        onPress={() => {
          onToggleSound();
          if (!soundOn) playUiTap();
        }}
        style={styles.soundButton}
      >
        <Text style={styles.soundButtonText}>{soundOn ? '🔊 SOUND' : '🔇 MUTED'}</Text>
      </PressableScale>

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

      <View style={styles.buttonStack}>
        <MenuButton
          label="SINGLE PLAYER"
          variant="primary"
          onPress={() => {
            playUiTap();
            onStartSolo();
          }}
        />
      </View>

      <View style={[styles.dock, { width }]}>
        <PressableScale
          onPress={() => {
            playUiTap();
            onOpenPlayer();
          }}
          style={styles.dockHalf}
          scaleTo={0.97}
        >
          <Text style={styles.dockIcon}>🚀</Text>
          <Text style={styles.dockLabel}>PLAYER</Text>
        </PressableScale>
        <View style={styles.dockDivider} />
        <PressableScale
          onPress={() => {
            playUiTap();
            onOpenShop();
          }}
          style={styles.dockHalf}
          scaleTo={0.97}
        >
          <Text style={styles.dockIcon}>🛠️</Text>
          <Text style={styles.dockLabel}>SHOP</Text>
          <Text style={styles.dockCurrency}>
            {CURRENCY_ICON} {currency}
          </Text>
        </PressableScale>
      </View>
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
  soundButton: {
    position: 'absolute',
    top: 54,
    right: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(138,92,255,0.14)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  soundButtonText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  dock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 64,
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: 'rgba(16,12,38,0.85)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  dockHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dockDivider: {
    width: 1,
    marginVertical: 14,
    backgroundColor: COLORS.border,
  },
  dockIcon: {
    fontSize: 18,
  },
  dockLabel: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  dockCurrency: {
    color: COLORS.purple,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 2,
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
  versionButton: {
    position: 'absolute',
    top: 54,
    left: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(90,216,255,0.1)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  versionButtonText: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: '600',
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
  buttonStack: {
    gap: 16,
    alignItems: 'center',
  },
  button: {
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
    minWidth: 260,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'rgba(255,92,179,0.1)',
    borderColor: COLORS.pink,
    shadowColor: COLORS.pink,
  },
  buttonLabel: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 3,
    textShadowColor: COLORS.cyan,
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 0 },
  },
  buttonLabelSecondary: {
    fontSize: 15,
    textShadowColor: COLORS.pink,
  },
});
