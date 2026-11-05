import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import SplashScreen from './src/components/SplashScreen';
import GameScreen from './src/screens/GameScreen';
import { SPLASH_MIN_DURATION_MS } from './src/constants';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_MIN_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {showSplash ? <SplashScreen /> : <GameScreen />}
      <StatusBar style="light" />
    </View>
  );
}
