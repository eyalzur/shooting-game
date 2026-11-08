import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import PressableScale from '../components/PressableScale';
import PurchaseBurst, { PurchaseBurstEvent } from '../components/PurchaseBurst';
import Starfield from '../components/Starfield';
import { COLORS, CURRENCY_ICON, CURRENCY_NAME, SHOP_CATEGORIES, SHOP_ITEMS } from '../constants';
import { ShopCategory, ShopItemDef, UpgradeId } from '../types';
import { shadeColor } from '../utils/color';
import { playPurchase, playUiTap } from '../utils/sound';

// Every category already owns a hue (weapon=red, ability=pink, movement=
// green, luck=gold), so "can't afford" needs a fifth, distinct color or it
// blends straight into whichever category happens to be red/orange-ish.
// Not blue either — that's the player's own team color everywhere else in
// the game (cannon, bullets, score), so it reads as "you/your team", not
// "locked". Cyan isn't claimed by any category or team color (it is also
// the "GOOD VALUE" tier label's color, but that's a separate badge, not a
// state, so the two never need to disagree on the same card).
const UNAFFORDABLE_COLOR = COLORS.cyan;
const UNAFFORDABLE_TEXT_COLOR = shadeColor(COLORS.cyan, 25);

interface Props {
  currency: number;
  ownedUpgrades: UpgradeId[];
  onPurchase: (id: UpgradeId) => void;
  onOpenCurrencyShop: () => void;
  onBack: () => void;
}

// A cheap pick, a mid one, and a third priced close to the mid one but a
// clearly bigger jump — the classic "look how much more the third gets you"
// shape. Picked purely by price (cheapest 3 not-yet-maxed purchases), the
// tier badges below are what sell the shape, not a hand-scored "value".
const SUGGESTION_TIERS = [
  { label: 'CHEAP PICK', icon: '🪙', color: COLORS.textSecondary },
  { label: 'GOOD VALUE', icon: '⚖️', color: COLORS.cyan },
  { label: 'BEST VALUE', icon: '🔥', color: COLORS.gold },
];

function pickSuggestions(items: ShopItemDef[], ownedUpgrades: UpgradeId[], count: number) {
  return items
    .map((item) => {
      const level = ownedUpgrades.filter((owned) => owned === item.id).length;
      return level >= item.prices.length ? null : { item, level, nextPrice: item.prices[level] };
    })
    .filter((x): x is { item: ShopItemDef; level: number; nextPrice: number } => x !== null)
    .sort((a, b) => a.nextPrice - b.nextPrice)
    .slice(0, count);
}

function SuggestionCard({
  item,
  level,
  currency,
  tier,
  categoryColor,
  onBuy,
}: {
  item: ShopItemDef;
  level: number;
  currency: number;
  tier: { label: string; icon: string; color: string };
  categoryColor: string;
  onBuy: () => void;
}) {
  const nextPrice = item.prices[level];
  const affordable = currency >= nextPrice;

  return (
    <PressableScale
      onPress={() => {
        if (affordable) onBuy();
      }}
      scaleTo={0.95}
      style={[styles.suggestCard, !affordable && styles.suggestCardDisabled]}
    >
      <Text style={[styles.suggestTier, { color: tier.color }]} numberOfLines={1}>
        {tier.icon} {tier.label}
      </Text>
      <View
        style={[
          styles.suggestIconWrap,
          { backgroundColor: `${categoryColor}26`, borderColor: `${categoryColor}55` },
        ]}
      >
        <Text style={styles.suggestIcon}>{item.icon}</Text>
      </View>
      <Text style={styles.suggestName} numberOfLines={2}>
        {item.name}
      </Text>
      <View
        style={[
          styles.suggestPriceTag,
          affordable
            ? { borderColor: categoryColor, backgroundColor: `${categoryColor}40` }
            : styles.suggestPriceTagDisabled,
        ]}
      >
        <Text
          style={[styles.suggestPriceText, !affordable && styles.suggestPriceTextDisabled]}
          numberOfLines={1}
        >
          {nextPrice}
        </Text>
      </View>
    </PressableScale>
  );
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
  const nowStat = item.statAt(level);
  const nextStat = !maxed ? item.statAt(level + 1) : null;

  return (
    <PressableScale
      onPress={() => {
        if (!maxed && affordable) onBuy();
      }}
      scaleTo={0.97}
      style={styles.card}
    >
      <View style={[styles.cardIconWrap, { backgroundColor: `${accentColor}26`, borderColor: `${accentColor}55` }]}>
        <Text style={styles.cardIcon}>{item.icon}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardNameRow}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.name}
          </Text>
          {maxLevel > 1 && (
            <Text style={[styles.cardLevel, { color: accentColor }]}>
              Lv {level}/{maxLevel}
            </Text>
          )}
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statNow, { color: accentColor }]}>{nowStat}</Text>
          {nextStat && (
            <>
              <Text style={styles.statArrow}>→</Text>
              <Text style={styles.statNext}>{nextStat}</Text>
            </>
          )}
          {maxed && <Text style={[styles.statMaxTag, { color: COLORS.green }]}>MAX</Text>}
        </View>
      </View>
      <View
        style={[
          styles.buyButton,
          { borderColor: accentColor, backgroundColor: `${accentColor}40` },
          maxed && styles.buyButtonOwned,
          !maxed && !affordable && styles.buyButtonDisabled,
        ]}
      >
        <Text
          style={[
            styles.buyButtonText,
            maxed && styles.buyButtonTextOwned,
            !maxed && !affordable && styles.buyButtonTextDisabled,
          ]}
          numberOfLines={1}
        >
          {maxed ? 'MAX' : nextPrice}
        </Text>
      </View>
    </PressableScale>
  );
}

function CategoryIconButton({
  category,
  active,
  onPress,
}: {
  category: (typeof SHOP_CATEGORIES)[number];
  active: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale onPress={onPress} scaleTo={0.92} style={styles.categoryIconWrap}>
      <View
        style={[
          styles.categoryIconCircle,
          {
            borderColor: active ? category.color : `${category.color}55`,
            backgroundColor: active ? `${category.color}33` : `${category.color}14`,
          },
        ]}
      >
        <Text style={styles.categoryIconEmoji}>{category.icon}</Text>
      </View>
      <Text
        style={[styles.categoryIconLabel, { color: active ? category.color : COLORS.textSecondary }]}
        numberOfLines={1}
      >
        {category.label}
      </Text>
    </PressableScale>
  );
}

export default function ShopScreen({ currency, ownedUpgrades, onPurchase, onOpenCurrencyShop, onBack }: Props) {
  const { width, height } = useWindowDimensions();
  const [burstEvent, setBurstEvent] = useState<PurchaseBurstEvent | null>(null);
  const burstIdRef = useRef(0);
  const [openCategoryId, setOpenCategoryId] = useState<ShopCategory | null>(null);
  const openCategory = openCategoryId ? SHOP_CATEGORIES.find((c) => c.id === openCategoryId)! : null;

  const goBack = () => {
    playUiTap();
    if (openCategory) setOpenCategoryId(null);
    else onBack();
  };

  const handleBuy = (item: ShopItemDef, level: number, categoryColor: string) => {
    playPurchase();
    onPurchase(item.id);
    burstIdRef.current += 1;
    const nextLevel = level + 1;
    setBurstEvent({
      id: burstIdRef.current,
      icon: item.icon,
      title: item.name,
      sub: item.prices.length > 1 ? `LEVEL ${nextLevel}` : 'EQUIPPED',
      color: categoryColor,
    });
  };

  const globalSuggestions = pickSuggestions(SHOP_ITEMS, ownedUpgrades, 3);
  const categoryItems = openCategory ? SHOP_ITEMS.filter((item) => item.category === openCategory.id) : [];

  return (
    <Pressable style={[styles.container, { width, height }]} onPress={goBack}>
      <Starfield width={width} height={height} level={0} />

      <PressableScale onPress={goBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>{openCategory ? '⟵ SHOP' : '⟵ HOME'}</Text>
      </PressableScale>

      <Text style={styles.title}>{openCategory ? openCategory.label : 'SHOP'}</Text>

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

      <View style={styles.categoryRow}>
        {SHOP_CATEGORIES.map((category) => (
          <CategoryIconButton
            key={category.id}
            category={category}
            active={openCategoryId === category.id}
            onPress={() => {
              playUiTap();
              setOpenCategoryId((prev) => (prev === category.id ? null : category.id));
            }}
          />
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!openCategory ? (
          globalSuggestions.length > 0 && (
            <View style={styles.suggestBlock}>
              <Text style={styles.suggestHeading}>SUGGESTED FOR YOU</Text>
              <View style={styles.suggestRow}>
                {globalSuggestions.map(({ item, level }, i) => {
                  const category = SHOP_CATEGORIES.find((c) => c.id === item.category)!;
                  return (
                    <SuggestionCard
                      key={item.id}
                      item={item}
                      level={level}
                      currency={currency}
                      tier={SUGGESTION_TIERS[i]}
                      categoryColor={category.color}
                      onBuy={() => handleBuy(item, level, category.color)}
                    />
                  );
                })}
              </View>
            </View>
          )
        ) : (
          <View style={styles.itemStack}>
            {categoryItems.map((item) => {
              const level = ownedUpgrades.filter((owned) => owned === item.id).length;
              return (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  level={level}
                  currency={currency}
                  accentColor={openCategory.color}
                  onBuy={() => handleBuy(item, level, openCategory.color)}
                />
              );
            })}
          </View>
        )}
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
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 58,
    textShadowColor: COLORS.purple,
    textShadowRadius: 20,
    textShadowOffset: { width: 0, height: 0 },
  },
  balance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    marginBottom: 8,
  },
  getMoreButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,210,90,0.4)',
    backgroundColor: 'rgba(255,210,90,0.1)',
    marginBottom: 10,
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
  suggestBlock: {
    width: '100%',
    maxWidth: 360,
    marginBottom: 16,
  },
  suggestHeading: {
    color: COLORS.textSecondary,
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  suggestRow: {
    flexDirection: 'row',
    gap: 10,
  },
  suggestCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(16,12,38,0.65)',
  },
  suggestCardDisabled: {
    borderColor: UNAFFORDABLE_COLOR,
    backgroundColor: `${UNAFFORDABLE_COLOR}1f`,
  },
  suggestTier: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  suggestIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestIcon: {
    fontSize: 18,
  },
  suggestName: {
    color: COLORS.textPrimary,
    fontSize: 10.5,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
    height: 26,
  },
  suggestPriceTag: {
    marginTop: 8,
    minWidth: 44,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  suggestPriceText: {
    color: COLORS.textPrimary,
    fontSize: 11.5,
    fontWeight: 'bold',
  },
  suggestPriceTagDisabled: {
    borderColor: UNAFFORDABLE_COLOR,
    backgroundColor: `${UNAFFORDABLE_COLOR}40`,
  },
  suggestPriceTextDisabled: {
    color: UNAFFORDABLE_TEXT_COLOR,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 320,
    gap: 22,
    marginBottom: 14,
  },
  categoryIconWrap: {
    alignItems: 'center',
    width: 56,
  },
  categoryIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconEmoji: {
    fontSize: 22,
  },
  categoryIconLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  itemStack: {
    gap: 9,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    height: 72,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(16,12,38,0.65)',
    gap: 12,
  },
  cardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 16,
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
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cardLevel: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  statNow: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  statArrow: {
    color: COLORS.textSecondary,
    fontSize: 9.5,
  },
  statNext: {
    color: COLORS.textPrimary,
    fontSize: 10.5,
    fontWeight: '800',
  },
  statMaxTag: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1,
  },
  buyButton: {
    width: 56,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
  },
  buyButtonOwned: {
    borderColor: COLORS.green,
    backgroundColor: 'rgba(92,255,157,0.3)',
  },
  buyButtonDisabled: {
    borderColor: UNAFFORDABLE_COLOR,
    backgroundColor: `${UNAFFORDABLE_COLOR}40`,
  },
  buyButtonText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  buyButtonTextOwned: {
    color: COLORS.green,
  },
  buyButtonTextDisabled: {
    color: UNAFFORDABLE_TEXT_COLOR,
  },
});
