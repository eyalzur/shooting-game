import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Player from '../components/Player';
import PressableScale from '../components/PressableScale';
import Starfield from '../components/Starfield';
import { COLORS, CURRENCY_ICON, PLAYER_SIZE, SHOP_CATEGORIES, SHOP_ITEMS } from '../constants';
import { UpgradeId } from '../types';
import { playUiTap } from '../utils/sound';

interface Props {
  ownedUpgrades: UpgradeId[];
  onOpenShop: () => void;
  onResetInventory: () => void;
  onBack: () => void;
}

const RESET_CONFIRM_WINDOW_MS = 3000;

const AVATAR_BOX = 140;

// A read-only build sheet for the cannon — this game's only "character" —
// so upgrades bought in the Shop have a place that shows the whole build
// at a glance instead of just a quiet badge. Pulls straight from the same
// SHOP_ITEMS catalog, so a new shop item shows up here automatically.
export default function PlayerScreen({ ownedUpgrades, onOpenShop, onResetInventory, onBack }: Props) {
  const { width, height } = useWindowDimensions();
  const ownedCount = SHOP_ITEMS.filter((item) => ownedUpgrades.includes(item.id)).length;
  const [confirmingReset, setConfirmingReset] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleResetPress = () => {
    playUiTap();
    if (!confirmingReset) {
      setConfirmingReset(true);
      resetTimerRef.current = setTimeout(() => setConfirmingReset(false), RESET_CONFIRM_WINDOW_MS);
      return;
    }
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    setConfirmingReset(false);
    onResetInventory();
  };

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

      <Text style={styles.title}>PLAYER</Text>
      <Text style={styles.subtitle}>
        {ownedCount}/{SHOP_ITEMS.length} UPGRADES EQUIPPED
      </Text>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.avatarBox}>
        <View style={styles.avatarGlow} />
        <Player x={AVATAR_BOX / 2} y={AVATAR_BOX / 2 + PLAYER_SIZE / 4} />
      </View>

      <View style={styles.statList}>
        {SHOP_ITEMS.map((item) => {
          const level = ownedUpgrades.filter((owned) => owned === item.id).length;
          const owned = level > 0;
          const maxLevel = item.prices.length;
          const maxed = level >= maxLevel;
          const category = SHOP_CATEGORIES.find((c) => c.id === item.category)!;
          return (
            <View
              key={item.id}
              style={[
                styles.statRow,
                owned && styles.statRowOwned,
                { borderLeftWidth: 4, borderLeftColor: category.color },
              ]}
            >
              <View style={[styles.statIconWrap, owned && styles.statIconWrapOwned]}>
                <Text style={styles.statIcon}>{item.icon}</Text>
              </View>
              <View style={styles.statBody}>
                <View style={styles.statNameRow}>
                  <Text style={styles.statName}>{item.name}</Text>
                  <View style={[styles.categoryTag, { borderColor: `${category.color}66` }]}>
                    <Text style={styles.categoryTagIcon}>{category.icon}</Text>
                  </View>
                  {maxLevel > 1 && (
                    <Text style={styles.statLevel}>
                      Lv {level}/{maxLevel}
                    </Text>
                  )}
                </View>
                <Text style={styles.statDesc}>{item.description}</Text>
              </View>
              {!owned ? (
                <Text style={styles.statLocked}>
                  🔒 {CURRENCY_ICON}
                  {item.prices[0]}
                </Text>
              ) : maxed ? (
                <Text style={styles.statOwned}>✓</Text>
              ) : (
                <Text style={styles.statPartial}>
                  ✓ {CURRENCY_ICON}
                  {item.prices[level]}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      <PressableScale
        onPress={() => {
          playUiTap();
          onOpenShop();
        }}
        style={styles.shopButton}
      >
        <Text style={styles.shopButtonText}>🛠️ OPEN SHOP</Text>
      </PressableScale>

      <PressableScale
        onPress={handleResetPress}
        style={[styles.resetButton, confirmingReset && styles.resetButtonConfirming]}
      >
        <Text style={[styles.resetButtonText, confirmingReset && styles.resetButtonTextConfirming]}>
          {confirmingReset ? '⚠️ TAP AGAIN TO CONFIRM' : '🗑️ RESET INVENTORY'}
        </Text>
      </PressableScale>
      </ScrollView>
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
    textShadowColor: COLORS.blue,
    textShadowRadius: 20,
    textShadowOffset: { width: 0, height: 0 },
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    letterSpacing: 1.5,
    marginTop: 6,
  },
  scroll: {
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  avatarBox: {
    width: AVATAR_BOX,
    height: AVATAR_BOX,
    marginTop: 18,
    marginBottom: 20,
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
    opacity: 0.14,
    shadowColor: COLORS.blue,
    shadowOpacity: 1,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 0 },
  },
  statList: {
    gap: 12,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(16,12,38,0.5)',
    gap: 14,
    opacity: 0.75,
  },
  statRowOwned: {
    borderColor: COLORS.blue,
    backgroundColor: 'rgba(77,155,255,0.1)',
    opacity: 1,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(154,143,194,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconWrapOwned: {
    backgroundColor: 'rgba(90,216,255,0.14)',
  },
  statIcon: {
    fontSize: 18,
  },
  statBody: {
    flex: 1,
  },
  statNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statLevel: {
    color: COLORS.cyan,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  categoryTag: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTagIcon: {
    fontSize: 9,
  },
  statDesc: {
    color: COLORS.textSecondary,
    fontSize: 10.5,
    marginTop: 3,
    lineHeight: 14,
  },
  statOwned: {
    color: COLORS.blue,
    fontSize: 20,
    fontWeight: 'bold',
  },
  statPartial: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: '700',
  },
  statLocked: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  shopButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.purple,
    backgroundColor: 'rgba(138,92,255,0.12)',
  },
  shopButtonText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  resetButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(154,143,194,0.3)',
    backgroundColor: 'transparent',
  },
  resetButtonConfirming: {
    borderColor: COLORS.red,
    backgroundColor: 'rgba(255,82,82,0.12)',
  },
  resetButtonText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resetButtonTextConfirming: {
    color: COLORS.red,
  },
});
