import { StyleSheet, Text, View } from 'react-native';
import { COLORS, CURRENCY_ICON, PICKUP_SIZE } from '../constants';
import { PickupState } from '../types';

interface Props {
  pickup: PickupState;
}

export const PICKUP_ICONS: Record<PickupState['kind'], string> = {
  score: '⭐',
  rapidFire: '⚡',
  spreadShot: '🔱',
  bomb: '💣',
  magnet: '🧲',
  currency: CURRENCY_ICON,
  giant: '🪐',
  homing: '🎯',
  gravityWell: '🌀',
};

// Deliberately distinct from the fixed lane colors (pink/purple/cyan) a
// target star is drawn in, so a falling pickup never reads as "the same
// color" as a star already on screen.
export const PICKUP_TINTS: Record<PickupState['kind'], string> = {
  score: COLORS.gold,
  rapidFire: COLORS.green,
  spreadShot: COLORS.orange,
  bomb: COLORS.red,
  magnet: COLORS.blue,
  currency: COLORS.starlight,
  giant: COLORS.stone,
  homing: COLORS.purple,
  gravityWell: COLORS.indigo,
};

// Falls from a broken target, position driven entirely by the game loop
// (same plain left/top pattern as Bullet) — no animation of its own needed
// beyond that fall.
export default function Pickup({ pickup }: Props) {
  const tint = PICKUP_TINTS[pickup.kind];
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
      <Text style={styles.icon}>{PICKUP_ICONS[pickup.kind]}</Text>
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
