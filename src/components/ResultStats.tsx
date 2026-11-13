import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PICKUP_ICONS, PICKUP_TINTS } from './Pickup';
import { AccuracyTierDef, PickupKind } from '../types';
import { COLORS, CURRENCY_ICON, CURRENCY_NAME } from '../constants';

interface Props {
  shotsHit: number;
  shotsFired: number;
  tier: AccuracyTierDef;
  targetsHit: number;
  bestCombo: number;
  currencyEarned: number;
  pickupCounts: Partial<Record<PickupKind, number>>;
}

const COUNT_UP_MS = 900;

// Ticks a number up from 0 to `value` once, on mount — a plain rAF tween
// driving a text state, not an Animated.Value, since what's rendered is
// formatted text (with a "+" prefix), not something Animated can interpolate.
function CountUp({ value, style, prefix = '' }: { value: number; style: object; prefix?: string }) {
  const [shown, setShown] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / COUNT_UP_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(eased * value));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  return (
    <Text style={style}>
      {prefix}
      {shown}
    </Text>
  );
}

// The end-of-match stat block: a big, unmissable Stardust total, a clearly
// labeled Accuracy badge (the tier icon alone used to read as a stray
// emoji), and a row of chips for what actually happened this match —
// targets destroyed and every pickup kind caught, so a win feels detailed,
// not just a bare number.
export default function ResultStats({
  shotsHit,
  shotsFired,
  tier,
  targetsHit,
  bestCombo,
  currencyEarned,
  pickupCounts,
}: Props) {
  const accuracyPct = shotsFired > 0 ? Math.round((shotsHit / shotsFired) * 100) : 0;
  const pickupEntries = (Object.entries(pickupCounts) as [PickupKind, number][]).filter(([, n]) => n > 0);

  return (
    <View style={styles.wrap}>
      {currencyEarned > 0 && (
        <View style={styles.stardustBox}>
          <Text style={styles.stardustIcon}>{CURRENCY_ICON}</Text>
          <CountUp value={currencyEarned} style={styles.stardustValue} prefix="+" />
          <Text style={styles.stardustLabel}>{CURRENCY_NAME.toUpperCase()} EARNED</Text>
        </View>
      )}

      {shotsFired > 0 && (
        <View style={styles.accuracyRow}>
          <View style={styles.accuracyBadge}>
            <Text style={styles.accuracyIcon}>{tier.icon}</Text>
          </View>
          <View>
            <Text style={styles.accuracyCaption}>ACCURACY</Text>
            <Text style={styles.accuracyValue}>
              {accuracyPct}% · {tier.label}
            </Text>
          </View>
        </View>
      )}

      {(targetsHit > 0 || bestCombo >= 2 || pickupEntries.length > 0) && (
        <View style={styles.statsRow}>
          {targetsHit > 0 && (
            <View style={styles.statChip}>
              <Text style={styles.statChipIcon}>🎯</Text>
              <Text style={styles.statChipValue}>{targetsHit}</Text>
            </View>
          )}
          {bestCombo >= 2 && (
            <View style={[styles.statChip, { borderColor: COLORS.orange }]}>
              <Text style={styles.statChipIcon}>🔥</Text>
              <Text style={styles.statChipValue}>×{bestCombo}</Text>
            </View>
          )}
          {pickupEntries.map(([kind, n]) => (
            <View key={kind} style={[styles.statChip, { borderColor: PICKUP_TINTS[kind] }]}>
              <Text style={styles.statChipIcon}>{PICKUP_ICONS[kind]}</Text>
              <Text style={styles.statChipValue}>×{n}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    width: '100%',
    gap: 12,
    marginTop: 4,
    marginBottom: 20,
  },
  stardustBox: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,210,90,0.5)',
    backgroundColor: 'rgba(255,210,90,0.1)',
  },
  stardustIcon: {
    fontSize: 20,
  },
  stardustValue: {
    color: COLORS.gold,
    fontSize: 36,
    fontWeight: 'bold',
    textShadowColor: COLORS.gold,
    textShadowRadius: 16,
    textShadowOffset: { width: 0, height: 0 },
  },
  stardustLabel: {
    color: COLORS.textSecondary,
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  accuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  accuracyBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(90,216,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accuracyIcon: {
    fontSize: 18,
  },
  accuracyCaption: {
    color: COLORS.textSecondary,
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  accuracyValue: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 10,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(16,12,38,0.5)',
  },
  statChipIcon: {
    fontSize: 12,
  },
  statChipValue: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
});
