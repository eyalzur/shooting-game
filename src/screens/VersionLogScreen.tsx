import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import PressableScale from '../components/PressableScale';
import Starfield from '../components/Starfield';
import { APP_VERSION, CHANGELOG, COLORS } from '../constants';
import { playUiTap } from '../utils/sound';

interface Props {
  onBack: () => void;
}

export default function VersionLogScreen({ onBack }: Props) {
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

      <Text style={styles.title}>WHAT'S NEW</Text>
      <Text style={styles.subtitle}>v{APP_VERSION}</Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {CHANGELOG.map((entry) => (
          <View key={entry.version} style={styles.entry}>
            <View style={styles.entryIconWrap}>
              <Text style={styles.entryIcon}>{entry.icon}</Text>
            </View>
            <View style={styles.entryBody}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryVersion}>v{entry.version}</Text>
                <Text style={styles.entryDate}>{entry.date}</Text>
              </View>
              <Text style={styles.entryTitle}>{entry.title}</Text>
              {entry.bullets.map((bullet, i) => (
                <Text key={i} style={styles.entryBullet}>
                  · {bullet}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
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
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 100,
    textShadowColor: COLORS.cyan,
    textShadowRadius: 20,
    textShadowOffset: { width: 0, height: 0 },
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    letterSpacing: 1,
    marginTop: 6,
    marginBottom: 18,
  },
  scroll: {
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 14,
  },
  entry: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 400,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(16,12,38,0.6)',
    gap: 14,
  },
  entryIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(90,216,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryIcon: {
    fontSize: 22,
  },
  entryBody: {
    flex: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  entryVersion: {
    color: COLORS.cyan,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  entryDate: {
    color: COLORS.textSecondary,
    fontSize: 10.5,
  },
  entryTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 3,
    marginBottom: 6,
  },
  entryBullet: {
    color: COLORS.textSecondary,
    fontSize: 11.5,
    lineHeight: 17,
  },
});
