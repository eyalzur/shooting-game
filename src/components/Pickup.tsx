import { StyleSheet, Text, View } from 'react-native';
import { COLORS, CURRENCY_ICON, PICKUP_SIZE } from '../constants';
import { PickupState } from '../types';

interface Props {
  pickup: PickupState;
}

const ICONS: Record<PickupState['kind'], string> = {
  score: '⭐',
  rapidFire: '⚡',
  spreadShot: '🔱',
  currency: CURRENCY_ICON,
};

const TINTS: Record<PickupState['kind'], string> = {
  score: COLORS.gold,
  rapidFire: COLORS.cyan,
  spreadShot: COLORS.pink,
  currency: COLORS.purple,
};

// Falls from a broken target, position driven entirely by the game loop
// (same plain left/top pattern as Bullet) — no animation of its own needed
// beyond that fall.
export default function Pickup({ pickup }: Props) {
  const tint = TINTS[pickup.kind];
  return (
    <View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          left: pickup.x - PICKUP_SIZE / 2,
          top: pickup.y - PICKUP_SIZE / 2,
          width: PICKUP_SIZE,
          height: PICKUP_SIZE,
          borderRadius: PICKUP_SIZE / 2,
          borderColor: tint,
          shadowColor: tint,
        },
      ]}
    >
      <Text style={styles.icon}>{ICONS[pickup.kind]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    borderWidth: 1.5,
    backgroundColor: 'rgba(16,12,38,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  icon: {
    fontSize: 14,
  },
});
