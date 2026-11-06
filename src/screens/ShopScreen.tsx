import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Starfield from '../components/Starfield';
import { COLORS, CURRENCY_ICON, CURRENCY_NAME } from '../constants';
import { playPurchase, playUiTap } from '../utils/sound';

interface Props {
  currency: number;
  ownsDoubleShot: boolean;
  price: number;
  onPurchaseDoubleShot: () => void;
  onBack: () => void;
}

function ShopItem({
  icon,
  name,
  description,
  price,
  owned,
  affordable,
  onBuy,
}: {
  icon: string;
  name: string;
  description: string;
  price: number;
  owned: boolean;
  affordable: boolean;
  onBuy: () => void;
}) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    !owned && affordable && Animated.spring(pressScale, { toValue: 0.96, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () =>
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  return (
    <View style={styles.card}>
      <View style={styles.cardIconWrap}>
        <Text style={styles.cardIcon}>{icon}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{name}</Text>
        <Text style={styles.cardDesc}>{description}</Text>
      </View>
      <Pressable
        onPress={owned || !affordable ? undefined : onBuy}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={owned || !affordable}
      >
        <Animated.View
          style={[
            styles.buyButton,
            owned && styles.buyButtonOwned,
            !owned && !affordable && styles.buyButtonDisabled,
            { transform: [{ scale: pressScale }] },
          ]}
        >
          <Text style={styles.buyButtonText}>
            {owned ? 'OWNED' : `${CURRENCY_ICON} ${price}`}
          </Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

export default function ShopScreen({ currency, ownsDoubleShot, price, onPurchaseDoubleShot, onBack }: Props) {
  const { width, height } = useWindowDimensions();

  return (
    <View style={[styles.container, { width, height }]}>
      <Starfield width={width} height={height} level={0} />

      <Pressable
        onPress={() => {
          playUiTap();
          onBack();
        }}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>⟵ HOME</Text>
      </Pressable>

      <Text style={styles.title}>SHOP</Text>
      <View style={styles.balance}>
        <Text style={styles.balanceIcon}>{CURRENCY_ICON}</Text>
        <Text style={styles.balanceValue}>{currency}</Text>
        <Text style={styles.balanceLabel}>{CURRENCY_NAME.toUpperCase()}</Text>
      </View>

      <View style={styles.itemStack}>
        <ShopItem
          icon="⚡"
          name="DOUBLE SHOT"
          description="Every shot fires as a pair, permanently. Same charge cost."
          price={price}
          owned={ownsDoubleShot}
          affordable={currency >= price}
          onBuy={() => {
            playPurchase();
            onPurchaseDoubleShot();
          }}
        />
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
    fontSize: 28,
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
    marginTop: 10,
    marginBottom: 36,
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
    backgroundColor: 'rgba(90,216,255,0.14)',
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
  cardDesc: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
  buyButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
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
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  comingSoon: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 28,
    letterSpacing: 0.5,
  },
});
