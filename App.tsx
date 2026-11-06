import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import SplashScreen from './src/components/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import { SPLASH_MIN_DURATION_MS } from './src/constants';
import { getBestScore, saveBestScore } from './src/utils/storage';

type Phase = 'splash' | 'home' | 'playing';

export default function App() {
  const [phase, setPhase] = useState<Phase>('splash');
  const [bestScore, setBestScore] = useState(0);
  const [lastScore, setLastScore] = useState<number | null>(null);

  useEffect(() => {
    setBestScore(getBestScore());
    const timer = setTimeout(() => setPhase('home'), SPLASH_MIN_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  const handleExit = (finalScore: number) => {
    setLastScore(finalScore);
    if (finalScore > bestScore) {
      setBestScore(finalScore);
      saveBestScore(finalScore);
    }
    setPhase('home');
  };

  return (
    <View style={{ flex: 1 }}>
      {phase === 'splash' && <SplashScreen />}
      {phase === 'home' && (
        <HomeScreen bestScore={bestScore} lastScore={lastScore} onStart={() => setPhase('playing')} />
      )}
      {phase === 'playing' && <GameScreen onExit={handleExit} />}
      <StatusBar style="light" />
    </View>
  );
}
