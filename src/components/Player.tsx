import { StyleSheet, Text, View } from 'react-native';
import { COLORS, PLAYER_SIZE } from '../constants';

interface Props {
  x: number;
  y: number;
}

export default function Player({ x, y }: Props) {
  return (
    <View
      style={[
        styles.player,
        { left: x - PLAYER_SIZE / 2, top: y - PLAYER_SIZE / 2 },
      ]}
    >
      <View style={styles.glow} />
      <Text style={styles.icon}>🧑‍🚀</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  player: {
    position: 'absolute',
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: PLAYER_SIZE * 0.9,
    height: PLAYER_SIZE * 0.9,
    borderRadius: PLAYER_SIZE / 2,
    backgroundColor: COLORS.cyan,
    opacity: 0.25,
    shadowColor: COLORS.cyan,
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  icon: {
    fontSize: PLAYER_SIZE * 0.8,
  },
});
