import { Animated, StyleSheet, View } from 'react-native';
import { COLORS, PLAYER_SIZE } from '../constants';

interface Props {
  x: number | Animated.Value;
  y: number;
  color?: string;
}

// No avatar, no character — just the point the shots come from: a glowing
// cannon tip. Color defaults to the player's blue; a bot opponent passes
// its own red so both cannons read as clearly different on one board.
// x is positioned via transform (not left) so the live player's slide
// animation can drive it as an Animated.Value while the bot keeps using a
// plain number.
export default function Player({ x, y, color = COLORS.blue }: Props) {
  const translateX = typeof x === 'number' ? x - PLAYER_SIZE / 2 : Animated.subtract(x, PLAYER_SIZE / 2);
  return (
    <Animated.View
      style={[
        styles.wrap,
        { top: y - PLAYER_SIZE / 2, transform: [{ translateX }] },
      ]}
    >
      <View style={[styles.glow, { backgroundColor: color, shadowColor: color }]} />
      <View style={[styles.base, { backgroundColor: color }]} />
      <View style={[styles.tip, { borderBottomColor: color, shadowColor: color }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  glow: {
    position: 'absolute',
    width: PLAYER_SIZE * 0.8,
    height: PLAYER_SIZE * 0.8,
    borderRadius: PLAYER_SIZE / 2,
    opacity: 0.3,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  base: {
    position: 'absolute',
    bottom: 2,
    width: PLAYER_SIZE * 0.5,
    height: 8,
    borderRadius: 4,
    opacity: 0.9,
  },
  tip: {
    position: 'absolute',
    bottom: 8,
    width: 0,
    height: 0,
    borderLeftWidth: PLAYER_SIZE * 0.18,
    borderRightWidth: PLAYER_SIZE * 0.18,
    borderBottomWidth: PLAYER_SIZE * 0.42,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
});
