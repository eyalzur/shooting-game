import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Player from '../components/Player';
import PressableScale from '../components/PressableScale';
import Starfield from '../components/Starfield';
import { COLORS, PLAYER_SIZE, SHOP_CATEGORIES, SHOP_ITEMS } from '../constants';
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

      <View style={styles.categoryGrid}>
        {SHOP_CATEGORIES.map((category) => {
          const items = SHOP_ITEMS.filter((item) => item.category === category.id);
          if (items.length === 0) return null;
          return (
            <View key={category.id} style={styles.categoryGroup}>
              <View style={styles.categoryGroupHeader}>
                <Text style={styles.categoryGroupIcon}>{category.icon}</Text>
                <Text style={[styles.categoryGroupLabel, { color: category.color }]}>{category.label}</Text>
              </View>
              <View style={styles.badgeRow}>
                {items.map((item) => {
                  const level = ownedUpgrades.filter((owned) => owned === item.id).length;
                  const owned = level > 0;
                  const maxLevel = item.prices.length;
                  return (
                    <View key={item.id} style={styles.badgeWrap}>
                      <View
                        style={[
                          styles.badge,
                          {
                            borderColor: owned ? category.color : 'rgba(154,143,194,0.25)',
                            backgroundColor: owned ? `${category.color}22` : 'rgba(16,12,38,0.5)',
                            opacity: owned ? 1 : 0.4,
                          },
                        ]}
                      >
                        <Text style={styles.badgeIcon}>{item.icon}</Text>
                      </View>
                      {!owned && (
                        <View style={styles.badgeCorner}>
                          <Text style={styles.badgeCornerText}>🔒</Text>
                        </View>
                      )}
                      {owned && maxLevel === 1 && (
                        <View style={[styles.badgeCorner, { backgroundColor: category.color }]}>
                          <Text style={styles.badgeCornerCheck}>✓</Text>
                        </View>
                      )}
                      {maxLevel > 1 && (
                        <View style={styles.dotsRow}>
                          {Array.from({ length: maxLevel }, (_, i) => (
                            <View
                              key={i}
                              style={[
                                styles.dot,
                                {
                                  backgroundColor: i < level ? category.color : 'rgba(154,143,194,0.3)',
                                },
                              ]}
                            />
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
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
  categoryGrid: {
    gap: 22,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    paddingHorizontal: 24,
  },
  categoryGroup: {
    width: '100%',
  },
  categoryGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  categoryGroupIcon: {
    fontSize: 12,
  },
  categoryGroupLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  badgeWrap: {
    alignItems: 'center',
    width: 56,
    position: 'relative',
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    fontSize: 24,
  },
  badgeCorner: {
    position: 'absolute',
    top: -4,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCornerText: {
    fontSize: 8,
  },
  badgeCornerCheck: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
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
