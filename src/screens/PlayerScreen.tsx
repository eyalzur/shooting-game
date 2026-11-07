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

const AVATAR_BOX = 92;

// A read-only build sheet for the cannon — this game's only "character" —
// so upgrades bought in the Shop have a place that shows the whole build
// at a glance instead of just a quiet badge. Pulls straight from the same
// SHOP_ITEMS catalog, so a new shop item shows up here automatically.
export default function PlayerScreen({ ownedUpgrades, onOpenShop, onResetInventory, onBack }: Props) {
  const { width, height } = useWindowDimensions();
  const ownedCount = SHOP_ITEMS.filter((item) => ownedUpgrades.includes(item.id)).length;
  const [confirmingReset, setConfirmingReset] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedId, setSelectedId] = useState<UpgradeId | null>(null);
  const selectedItem = SHOP_ITEMS.find((item) => item.id === selectedId) ?? null;
  const selectedCategory = selectedItem ? SHOP_CATEGORIES.find((c) => c.id === selectedItem.category)! : null;
  const selectedLevel = selectedItem ? ownedUpgrades.filter((owned) => owned === selectedItem.id).length : 0;

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
                <Text style={[styles.categoryGroupLabel, { color: category.color }]} numberOfLines={1}>
                  {category.label}
                </Text>
              </View>
              <View style={styles.badgeRow}>
                {items.map((item) => {
                  const level = ownedUpgrades.filter((owned) => owned === item.id).length;
                  const owned = level > 0;
                  const maxLevel = item.prices.length;
                  return (
                    <PressableScale
                      key={item.id}
                      onPress={() => {
                        playUiTap();
                        setSelectedId(item.id);
                      }}
                      scaleTo={0.9}
                      style={styles.badgeWrap}
                    >
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
                    </PressableScale>
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

      {selectedItem && selectedCategory && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Pressable style={[StyleSheet.absoluteFill, styles.detailScrim]} onPress={() => setSelectedId(null)} />
          <View style={styles.detailCenter} pointerEvents="box-none">
            <PressableScale onPress={() => {}} scaleTo={1} style={styles.detailCard}>
              <PressableScale
                onPress={() => {
                  playUiTap();
                  setSelectedId(null);
                }}
                style={styles.detailClose}
              >
                <Text style={styles.detailCloseText}>✕</Text>
              </PressableScale>

              <View
                style={[
                  styles.detailIconWrap,
                  {
                    borderColor: selectedLevel > 0 ? selectedCategory.color : 'rgba(154,143,194,0.25)',
                    backgroundColor: selectedLevel > 0 ? `${selectedCategory.color}22` : 'rgba(16,12,38,0.5)',
                  },
                ]}
              >
                <Text style={styles.detailIcon}>{selectedItem.icon}</Text>
              </View>
              <Text style={styles.detailName}>{selectedItem.name}</Text>
              <View style={[styles.detailCategoryTag, { borderColor: `${selectedCategory.color}66` }]}>
                <Text style={styles.detailCategoryIcon}>{selectedCategory.icon}</Text>
                <Text style={[styles.detailCategoryText, { color: selectedCategory.color }]}>
                  {selectedCategory.label}
                </Text>
              </View>

              {selectedItem.prices.length > 1 && (
                <View style={styles.detailDotsRow}>
                  {Array.from({ length: selectedItem.prices.length }, (_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.detailDot,
                        { backgroundColor: i < selectedLevel ? selectedCategory.color : 'rgba(154,143,194,0.3)' },
                      ]}
                    />
                  ))}
                  <Text style={styles.detailLevelText}>
                    LEVEL {selectedLevel}/{selectedItem.prices.length}
                  </Text>
                </View>
              )}

              <Text style={styles.detailDesc}>{selectedItem.description}</Text>

              <View style={styles.detailStatRow}>
                <Text style={[styles.detailStatNow, { color: selectedCategory.color }]}>
                  {selectedItem.statAt(selectedLevel)}
                </Text>
                {selectedLevel < selectedItem.prices.length && (
                  <>
                    <Text style={styles.detailStatArrow}>→</Text>
                    <Text style={styles.detailStatNext}>{selectedItem.statAt(selectedLevel + 1)}</Text>
                  </>
                )}
              </View>

              {selectedLevel >= selectedItem.prices.length ? (
                <Text style={[styles.detailPriceTag, { color: selectedCategory.color }]}>MAX LEVEL</Text>
              ) : (
                <Text style={styles.detailPriceTag}>
                  {selectedLevel === 0 ? 'UNLOCK FOR' : 'NEXT LEVEL'} {CURRENCY_ICON}
                  {selectedItem.prices[selectedLevel]}
                </Text>
              )}
            </PressableScale>
          </View>
        </View>
      )}
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
    paddingBottom: 32,
  },
  avatarBox: {
    width: AVATAR_BOX,
    height: AVATAR_BOX,
    marginTop: 10,
    marginBottom: 14,
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
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 0 },
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    rowGap: 20,
    columnGap: 10,
    width: '100%',
    maxWidth: 360,
    paddingHorizontal: 16,
  },
  categoryGroup: {
    width: 150,
    alignItems: 'center',
  },
  categoryGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginBottom: 10,
  },
  categoryGroupIcon: {
    fontSize: 11,
  },
  categoryGroupLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  badgeWrap: {
    alignItems: 'center',
    width: 48,
    position: 'relative',
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    fontSize: 20,
  },
  badgeCorner: {
    position: 'absolute',
    top: -4,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCornerText: {
    fontSize: 7,
  },
  badgeCornerCheck: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  shopButton: {
    marginTop: 20,
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
  detailScrim: {
    backgroundColor: 'rgba(5,3,15,0.82)',
  },
  detailCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  detailCard: {
    width: '100%',
    maxWidth: 320,
    padding: 24,
    paddingTop: 30,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(16,12,38,0.95)',
    alignItems: 'center',
  },
  detailClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(154,143,194,0.14)',
  },
  detailCloseText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  detailIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    fontSize: 30,
  },
  detailName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
  },
  detailCategoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  detailCategoryIcon: {
    fontSize: 10,
  },
  detailCategoryText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  detailDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 14,
  },
  detailDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  detailLevelText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: 4,
  },
  detailDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 14,
  },
  detailStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 14,
  },
  detailStatNow: {
    fontSize: 13,
    fontWeight: '800',
  },
  detailStatArrow: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  detailStatNext: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  detailPriceTag: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 16,
  },
});
