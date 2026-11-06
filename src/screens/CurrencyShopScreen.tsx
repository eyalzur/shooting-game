import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import PressableScale from '../components/PressableScale';
import Starfield from '../components/Starfield';
import { COLORS, CURRENCY_ICON, CURRENCY_NAME, CURRENCY_PACKS } from '../constants';
import { playPurchase, playUiTap } from '../utils/sound';

interface Props {
  currency: number;
  onBuyPack: (amount: number) => void;
  onBack: () => void;
}

export default function CurrencyShopScreen({ currency, onBuyPack, onBack }: Props) {
  const { width, height } = useWindowDimensions();

  return (
    <View style={[styles.container, { width, height }]}>
      <Starfield width={width} height={height} level={0} />

      <PressableScale
        onPress={() => {
          playUiTap();
          onBack();
        }}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>⟵ SHOP</Text>
      </PressableScale>

      <Text style={styles.title}>GET {CURRENCY_NAME.toUpperCase()}</Text>
      <View style={styles.balance}>
        <Text style={styles.balanceIcon}>{CURRENCY_ICON}</Text>
        <Text style={styles.balanceValue}>{currency}</Text>
      </View>
      <Text style={styles.note}>Placeholder packs — tapping grants Stardust directly, no payment.</Text>

      <View style={styles.packStack}>
        {CURRENCY_PACKS.map((pack) => (
          <View key={pack.id} style={styles.card}>
            <View style={styles.cardIconWrap}>
              <Text style={styles.cardIcon}>{pack.icon}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardName}>{pack.name}</Text>
              <Text style={styles.cardAmount}>
                {CURRENCY_ICON} {pack.amount}
              </Text>
            </View>
            <PressableScale
              onPress={() => {
                playPurchase();
                onBuyPack(pack.amount);
              }}
              scaleTo={0.96}
              style={styles.buyButton}
            >
              <Text style={styles.buyButtonText}>{pack.priceLabel}</Text>
            </PressableScale>
          </View>
        ))}
      </View>
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
  backButton: {
    position: 'absolute',
    top: 54,
    left: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(138,92,255,0.14)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backButtonText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textShadowColor: COLORS.gold,
    textShadowRadius: 20,
    textShadowOffset: { width: 0, height: 0 },
  },
  balance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  balanceIcon: {
    fontSize: 18,
  },
  balanceValue: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: COLORS.purple,
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 0 },
  },
  note: {
    color: COLORS.textSecondary,
    fontSize: 10.5,
    marginTop: 10,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 36,
  },
  packStack: {
    gap: 14,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(16,12,38,0.65)',
    gap: 14,
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,210,90,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 22,
  },
  cardBody: {
    flex: 1,
  },
  cardName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cardAmount: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  buyButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255,210,90,0.14)',
  },
  buyButtonText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
  },
});
