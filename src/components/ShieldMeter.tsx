import { StyleSheet, View } from 'react-native';
import { COLORS, SHIELD_MAX } from '../constants';

interface Props {
  shield: number;
}

// The core's remaining shield, as a row of pips — same pip-row pattern as
// the fire charge indicator, just themed cyan so it doesn't read as "ammo."
// Lost points go dim instead of disappearing, so the total (and how close
// to zero it's gotten) stays visible at a glance.
export default function ShieldMeter({ shield }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: SHIELD_MAX }, (_, i) => (
        <View key={i} style={[styles.pip, i < shield ? styles.pipFull : styles.pipEmpty]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 5,
    marginLeft: 16,
  },
  pip: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pipFull: {
    backgroundColor: COLORS.cyan,
    shadowColor: COLORS.cyan,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  pipEmpty: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});
