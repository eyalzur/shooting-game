import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { GAME_NAME } from '../constants';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎯</Text>
      <Text style={styles.title}>{GAME_NAME}</Text>
      <Text style={styles.subtitle}>Take aim. Hold your ground.</Text>
      <ActivityIndicator color="#fff" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101522',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#9aa4b2',
    fontSize: 14,
    marginTop: 8,
  },
  spinner: {
    marginTop: 28,
  },
});
