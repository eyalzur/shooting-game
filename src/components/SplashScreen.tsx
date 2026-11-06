import { StyleSheet, Text, View, ActivityIndicator, useWindowDimensions } from 'react-native';
import { COLORS, GAME_NAME } from '../constants';
import Starfield from './Starfield';

export default function SplashScreen() {
  const { width, height } = useWindowDimensions();

  return (
    <View style={[styles.container, { width, height }]}>
      <Starfield width={width} height={height} />
      <Text style={styles.emoji}>🌌</Text>
      <Text style={styles.title}>{GAME_NAME}</Text>
      <Text style={styles.subtitle}>Take aim. Hold your ground.</Text>
      <ActivityIndicator color={COLORS.cyan} style={styles.spinner} />
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
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 2,
    textShadowColor: COLORS.purple,
    textShadowRadius: 20,
    textShadowOffset: { width: 0, height: 0 },
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  spinner: {
    marginTop: 28,
  },
});
