import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Player from '../components/Player';
import PressableScale from '../components/PressableScale';
import Starfield from '../components/Starfield';
import { COLORS, CURRENCY_ICON, CURRENCY_NAME, PLAYER_SIZE, SHOP_ITEMS } from '../constants';
import { ShopItemDef, UpgradeId } from '../types';
import { playPurchase, playUiTap } from '../utils/sound';

interface Props {
  currency: number;
  ownedUpgrades: UpgradeId[];
  onPurchase: (id: UpgradeId, price: number) => void;
  onBack: () => void;
}

const AVATAR_BOX = 120;

function ShopItemCard({
  item,
  owned,
  affordable,
  onBuy,
}: {
  item: ShopItemDef;
  owned: boolean;
  affordable: boolean;
  onBuy: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardIconWrap}>
        <Text style={styles.cardIcon}>{item.icon}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardDesc}>{item.description}</Text>
      </View>
      <PressableScale
        onPress={onBuy}
        disabled={owned || !affordable}
        scaleTo={0.96}
        style={[styles.buyButton, owned && styles.buyButtonOwned, !owned && !affordable && styles.buyButtonDisabled]}
      >
        <Text style={styles.buyButtonText}>{owned ? 'OWNED' : `${CURRENCY_ICON} ${item.price}`}</Text>
      </PressableScale>
    </View>
  );
}

// The cannon doubles as the player's "avatar" — this game has no other
// character art — so the shop opens on a preview of it plus a strip of
// badges for whatever's equipped, before the purchasable list.
export default function ShopScreen({ currency, ownedUpgrades, onPurchase, onBack }: Props) {
  const { width, height } = useWindowDimensions();
  const owned = SHOP_ITEMS.filter((item) => ownedUpgrades.includes(item.id));

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

      <View style={styles.avatarBox}>
        <View style={styles.avatarGlow} />
        <Player x={AVATAR_BOX / 2} y={AVATAR_BOX / 2 + PLAYER_SIZE / 4} />
      </View>

      <View style={styles.badgeRow}>
        {owned.length === 0 ? (
          <Text style={styles.badgeEmpty}>No upgrades equipped yet</Text>
        ) : (
          owned.map((item) => (
            <View key={item.id} style={styles.badge}>
              <Text style={styles.badgeIcon}>{item.icon}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.balance}>
        <Text style={styles.balanceIcon}>{CURRENCY_ICON}</Text>
        <Text style={styles.balanceValue}>{currency}</Text>
        <Text style={styles.balanceLabel}>{CURRENCY_NAME.toUpperCase()}</Text>
      </View>

      <View style={styles.itemStack}>
        {SHOP_ITEMS.map((item) => (
          <ShopItemCard
            key={item.id}
            item={item}
            owned={ownedUpgrades.includes(item.id)}
            affordable={currency >= item.price}
            onBuy={() => {
              playPurchase();
              onPurchase(item.id, item.price);
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
  avatarBox: {
    width: AVATAR_BOX,
    height: AVATAR_BOX,
    marginTop: 14,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlow: {
    position: 'absolute',
    width: AVATAR_BOX,
    height: AVATAR_BOX,
    borderRadius: AVATAR_BOX / 2,
    backgroundColor: COLORS.blue,
    opacity: 0.12,
    shadowColor: COLORS.blue,
    shadowOpacity: 1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    minHeight: 30,
    alignItems: 'center',
  },
  badgeEmpty: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(16,12,38,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    fontSize: 14,
  },
  balance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    marginBottom: 22,
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
  cardName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
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
