import { StyleSheet, View } from 'react-native';
import { BULLET_SIZE } from '../constants';
import { BulletState } from '../types';

export default function Bullet({ bullet }: { bullet: BulletState }) {
  return (
    <View
      style={[
        styles.bullet,
        { left: bullet.x - BULLET_SIZE.width / 2, top: bullet.y - BULLET_SIZE.height / 2 },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  bullet: {
    position: 'absolute',
    width: BULLET_SIZE.width,
    height: BULLET_SIZE.height,
    borderRadius: BULLET_SIZE.width / 2,
    backgroundColor: '#fff176',
  },
});
