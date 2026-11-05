import { StyleSheet, View } from 'react-native';
import { COLORS, PLAYER_SIZE } from '../constants';

interface Props {
  x: number;
  y: number;
}

// No avatar, no character — just the point the shots come from: a glowing
// cannon tip under your finger.
export default function Player({ x, y }: Props) {
  return (
    <View
      style={[
        styles.wrap,
        { left: x - PLAYER_SIZE / 2, top: y - PLAYER_SIZE / 2 },
      ]}
    >
      <View style={styles.glow} />
      <View style={styles.base} />
      <View style={styles.tip} />
    </View>
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
    backgroundColor: COLORS.cyan,
    opacity: 0.3,
    shadowColor: COLORS.cyan,
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
    backgroundColor: COLORS.cyan,
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
    borderBottomColor: COLORS.cyan,
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
});
