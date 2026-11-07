import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import PressableScale from '../components/PressableScale';
import Starfield from '../components/Starfield';
import { COLORS, CURRENCY_ICON, CURRENCY_NAME, SHOP_ITEMS } from '../constants';
import { ShopItemDef, UpgradeId } from '../types';
import { playPurchase, playUiTap } from '../utils/sound';

interface Props {
  currency: number;
  ownedUpgrades: UpgradeId[];
  onPurchase: (id: UpgradeId) => void;
  onOpenCurrencyShop: () => void;
  onBack: () => void;
}

function ShopItemCard({
  item,
  level,
  currency,
  onBuy,
}: {
  item: ShopItemDef;
  level: number;
  currency: number;
  onBuy: () => void;
}) {
  const maxLevel = item.prices.length;
  const maxed = level >= maxLevel;
  const nextPrice = item.prices[level];
  const affordable = !maxed && currency >= nextPrice;

  return (
    <View style={styles.card}>
      <View style={styles.cardIconWrap}>
        <Text style={styles.cardIcon}>{item.icon}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardNameRow}>
          <Text style={styles.cardName}>{item.name}</Text>
          {maxLevel > 1 && (
            <Text style={styles.cardLevel}>
              Lv {level}/{maxLevel}
            </Text>
          )}
        </View>
        <Text style={styles.cardDesc}>{item.description}</Text>
      </View>
      <PressableScale
        onPress={onBuy}
        disabled={maxed || !affordable}
        scaleTo={0.96}
        style={[styles.buyButton, maxed && styles.buyButtonOwned, !maxed && !affordable && styles.buyButtonDisabled]}
      >
        <Text style={styles.buyButtonText}>{maxed ? 'MAXED' : `${CURRENCY_ICON} ${nextPrice}`}</Text>
      </PressableScale>
    </View>
  );
}

export default function ShopScreen({ currency, ownedUpgrades, onPurchase, onOpenCurrencyShop, onBack }: Props) {
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
        <Text style={styles.backButtonText}>⟵ HOME</Text>
      </PressableScale>

      <Text style={styles.title}>SHOP</Text>

      <View style={styles.balance}>
        <Text style={styles.balanceIcon}>{CURRENCY_ICON}</Text>
        <Text style={styles.balanceValue}>{currency}</Text>
        <Text style={styles.balanceLabel}>{CURRENCY_NAME.toUpperCase()}</Text>
      </View>

      <PressableScale
        onPress={() => {
          playUiTap();
          onOpenCurrencyShop();
        }}
        style={styles.getMoreButton}
        scaleTo={0.94}
      >
        <Text style={styles.getMoreButtonText}>💰 GET MORE {CURRENCY_ICON}</Text>
      </PressableScale>

      <View style={styles.itemStack}>
        {SHOP_ITEMS.map((item) => (
          <ShopItemCard
            key={item.id}
            item={item}
            level={ownedUpgrades.filter((owned) => owned === item.id).length}
            currency={currency}
            onBuy={() => {
              playPurchase();
              onPurchase(item.id);
            }}
          />
        ))}
      </View>

      <Text style={styles.comingSoon}>More upgrades coming soon.</Text>
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
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 2,
    textShadowColor: COLORS.purple,
    textShadowRadius: 20,
    textShadowOffset: { width: 0, height: 0 },
  },
  balance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 28,
    marginBottom: 14,
  },
  getMoreButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,210,90,0.4)',
    backgroundColor: 'rgba(255,210,90,0.1)',
    marginBottom: 24,
  },
  getMoreButtonText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
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
  balanceLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    letterSpacing: 1.5,
    marginLeft: 2,
  },
  itemStack: {
    gap: 12,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(16,12,38,0.65)',
    gap: 14,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(90,216,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 20,
  },
  cardBody: {
    flex: 1,
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cardLevel: {
    color: COLORS.cyan,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardDesc: {
    color: COLORS.textSecondary,
    fontSize: 10.5,
    marginTop: 3,
    lineHeight: 14,
  },
  buyButton: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.cyan,
    backgroundColor: 'rgba(90,216,255,0.14)',
  },
  buyButtonOwned: {
    borderColor: COLORS.textSecondary,
    backgroundColor: 'transparent',
  },
  buyButtonDisabled: {
    borderColor: 'rgba(154,143,194,0.3)',
    backgroundColor: 'transparent',
    opacity: 0.5,
  },
  buyButtonText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  comingSoon: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 20,
    letterSpacing: 0.5,
  },
});
