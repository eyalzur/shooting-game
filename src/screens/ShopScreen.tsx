import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import PressableScale from '../components/PressableScale';
import PurchaseBurst, { PurchaseBurstEvent } from '../components/PurchaseBurst';
import Starfield from '../components/Starfield';
import { COLORS, CURRENCY_ICON, CURRENCY_NAME, SHOP_CATEGORIES, SHOP_ITEMS } from '../constants';
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
  accentColor,
  onBuy,
}: {
  item: ShopItemDef;
  level: number;
  currency: number;
  accentColor: string;
  onBuy: () => void;
}) {
  const maxLevel = item.prices.length;
  const maxed = level >= maxLevel;
  const nextPrice = item.prices[level];
  const affordable = !maxed && currency >= nextPrice;

  return (
    <PressableScale onPress={onBuy} disabled={maxed || !affordable} scaleTo={0.97} style={styles.card}>
      <View style={[styles.cardIconWrap, { backgroundColor: `${accentColor}26`, borderColor: `${accentColor}55` }]}>
        <Text style={styles.cardIcon}>{item.icon}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardNameRow}>
          <Text style={styles.cardName}>{item.name}</Text>
          {maxLevel > 1 && (
            <Text style={[styles.cardLevel, { color: accentColor }]}>
              Lv {level}/{maxLevel}
            </Text>
          )}
        </View>
        <Text style={styles.cardDesc}>{item.description}</Text>
      </View>
      <View
        style={[
          styles.buyButton,
          { borderColor: accentColor, backgroundColor: `${accentColor}26` },
          maxed && styles.buyButtonOwned,
          !maxed && !affordable && styles.buyButtonDisabled,
        ]}
      >
        <Text style={styles.buyButtonText}>{maxed ? 'MAXED' : `${CURRENCY_ICON} ${nextPrice}`}</Text>
      </View>
    </PressableScale>
  );
}

export default function ShopScreen({ currency, ownedUpgrades, onPurchase, onOpenCurrencyShop, onBack }: Props) {
  const { width, height } = useWindowDimensions();
  const [burstEvent, setBurstEvent] = useState<PurchaseBurstEvent | null>(null);
  const burstIdRef = useRef(0);

  return (
    <Pressable
      style={[styles.container, { width, height }]}
      onPress={() => {
        playUiTap();
        onBack();
      }}
    >
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

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {SHOP_CATEGORIES.map((category) => {
          const items = SHOP_ITEMS.filter((item) => item.category === category.id);
          if (items.length === 0) return null;
          return (
            <View key={category.id} style={styles.categoryBlock}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[styles.categoryLabel, { color: category.color }]}>{category.label}</Text>
                <View style={[styles.categoryLine, { backgroundColor: `${category.color}40` }]} />
              </View>
              <View style={styles.itemStack}>
                {items.map((item) => {
                  const level = ownedUpgrades.filter((owned) => owned === item.id).length;
                  return (
                    <ShopItemCard
                      key={item.id}
                      item={item}
                      level={level}
                      currency={currency}
                      accentColor={category.color}
                      onBuy={() => {
                        playPurchase();
                        onPurchase(item.id);
                        burstIdRef.current += 1;
                        const nextLevel = level + 1;
                        setBurstEvent({
                          id: burstIdRef.current,
                          icon: item.icon,
                          title: item.name,
                          sub: item.prices.length > 1 ? `LEVEL ${nextLevel}` : 'EQUIPPED',
                          color: category.color,
                        });
                      }}
                    />
                  );
                })}
              </View>
            </View>
          );
        })}
        <Text style={styles.comingSoon}>More upgrades coming soon.</Text>
      </ScrollView>
      <PurchaseBurst event={burstEvent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 54,
    left: 20,
    zIndex: 1,
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
    marginTop: 64,
    textShadowColor: COLORS.purple,
    textShadowRadius: 20,
    textShadowOffset: { width: 0, height: 0 },
  },
  balance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    marginBottom: 14,
  },
  getMoreButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,210,90,0.4)',
    backgroundColor: 'rgba(255,210,90,0.1)',
    marginBottom: 16,
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
  scroll: {
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  categoryBlock: {
    width: '100%',
    maxWidth: 360,
    marginBottom: 18,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 10,
  },
  categoryIcon: {
    fontSize: 13,
  },
  categoryLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 2,
  },
  categoryLine: {
    flex: 1,
    height: 1.5,
    borderRadius: 1,
    marginLeft: 4,
  },
  itemStack: {
    gap: 12,
    alignItems: 'center',
    width: '100%',
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
    borderWidth: 1,
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
    marginTop: 4,
    letterSpacing: 0.5,
  },
});
