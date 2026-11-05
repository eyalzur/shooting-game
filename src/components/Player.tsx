import { StyleSheet, Text, View } from 'react-native';
import { PLAYER_SIZE } from '../constants';

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
      <Text style={styles.icon}>🧍</Text>
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
  icon: {
    fontSize: PLAYER_SIZE * 0.8,
  },
});
