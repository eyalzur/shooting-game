import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import PressableScale from '../components/PressableScale';
import Starfield from '../components/Starfield';
import { BOT_LEVELS, COLORS } from '../constants';
import { BotConfig } from '../types';
import { playUiTap } from '../utils/sound';

interface Props {
  onSelect: (bot: BotConfig) => void;
  onBack: () => void;
}

const BLURB = ['Easy — still learning to aim.', 'Steady hands, fires often.', 'Rarely misses. Good luck.'];

function BotCard({ bot, blurb, onPress }: { bot: BotConfig; blurb: string; onPress: () => void }) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(pressScale, { toValue: 0.95, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () =>
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View
        style={[
          styles.card,
          { borderColor: bot.color, shadowColor: bot.color, transform: [{ scale: pressScale }] },
        ]}
      >
        <View style={[styles.dot, { backgroundColor: bot.color, shadowColor: bot.color }]} />
        <Text style={[styles.cardName, { textShadowColor: bot.color }]}>{bot.name}</Text>
        <Text style={styles.cardBlurb}>{blurb}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function BotSelectScreen({ onSelect, onBack }: Props) {
  const { width, height } = useWindowDimensions();

  return (
    <View style={[styles.container, { width, height }]}>
      <Starfield width={width} height={height} level={0} />

      <PressableScale
        onPress={() => {
          playUiTap();
          onBack();
        }}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>⟵ HOME</Text>
      </PressableScale>

      <Text style={styles.title}>CHOOSE YOUR OPPONENT</Text>
      <Text style={styles.subtitle}>Same screen, same clock. Highest score when time's up wins.</Text>

      <View style={styles.cardStack}>
        {BOT_LEVELS.map((bot, i) => (
          <BotCard
            key={bot.name}
            bot={bot}
            blurb={BLURB[i]}
            onPress={() => {
              playUiTap();
              onSelect(bot);
            }}
          />
        ))}
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
  backButton: {
    position: 'absolute',
    top: 54,
    left: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(138,92,255,0.14)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backButtonText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2,
    textShadowColor: COLORS.purple,
    textShadowRadius: 18,
    textShadowOffset: { width: 0, height: 0 },
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 8,
    marginBottom: 28,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  cardStack: {
    gap: 16,
    alignItems: 'center',
  },
  card: {
    width: 260,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: 'rgba(16,12,38,0.65)',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    alignItems: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    marginBottom: 8,
  },
  cardName: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 0 },
  },
  cardBlurb: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 6,
  },
});
