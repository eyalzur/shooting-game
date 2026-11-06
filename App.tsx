import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './src/components/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import BotSelectScreen from './src/screens/BotSelectScreen';
import GameScreen from './src/screens/GameScreen';
import { SPLASH_MIN_DURATION_MS, VS_MATCH_MS } from './src/constants';
import { getBestScore, saveBestScore } from './src/utils/storage';
import { BotConfig, GameMode } from './src/types';

type Phase = 'splash' | 'home' | 'botSelect' | 'playing';

export default function App() {
  const [phase, setPhase] = useState<Phase>('splash');
  const [bestScore, setBestScore] = useState(0);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [mode, setMode] = useState<GameMode>('solo');
  const [bot, setBot] = useState<BotConfig | null>(null);
  const [matchMs, setMatchMs] = useState(VS_MATCH_MS);
  const [runId, setRunId] = useState(0);

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

  const startSolo = () => {
    setMode('solo');
    setBot(null);
    setRunId((r) => r + 1);
    setPhase('playing');
  };

  const selectBot = (chosen: BotConfig, chosenMatchMs: number) => {
    setMode('vs');
    setBot(chosen);
    setMatchMs(chosenMatchMs);
    setRunId((r) => r + 1);
    setPhase('playing');
  };

  const playAgain = () => setRunId((r) => r + 1);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        {phase === 'splash' && <SplashScreen />}
        {phase === 'home' && (
          <HomeScreen
            bestScore={bestScore}
            lastScore={lastScore}
            onStartSolo={startSolo}
            onStartVs={() => setPhase('botSelect')}
          />
        )}
        {phase === 'botSelect' && (
          <BotSelectScreen onSelect={selectBot} onBack={() => setPhase('home')} />
        )}
        {phase === 'playing' && (
          <GameScreen
            key={runId}
            mode={mode}
            bot={bot ?? undefined}
            matchMs={matchMs}
            onExit={handleExit}
            onPlayAgain={playAgain}
          />
        )}
        <StatusBar style="light" />
      </View>
    </SafeAreaProvider>
  );
}
