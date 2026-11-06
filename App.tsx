import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './src/components/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import BotSelectScreen from './src/screens/BotSelectScreen';
import GameScreen from './src/screens/GameScreen';
import ShopScreen from './src/screens/ShopScreen';
import { SHOP_DOUBLE_SHOT_PRICE, SPLASH_MIN_DURATION_MS } from './src/constants';
import {
  getBestScore,
  getCurrency,
  getOwnsDoubleShot,
  getSoundEnabledPref,
  saveBestScore,
  saveCurrency,
  saveOwnsDoubleShot,
  saveSoundEnabledPref,
} from './src/utils/storage';
import { setSoundEnabled } from './src/utils/sound';
import { BotConfig, GameMode } from './src/types';

type Phase = 'splash' | 'home' | 'botSelect' | 'playing' | 'shop';

export default function App() {
  const [phase, setPhase] = useState<Phase>('splash');
  const [bestScore, setBestScore] = useState(0);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [mode, setMode] = useState<GameMode>('solo');
  const [bot, setBot] = useState<BotConfig | null>(null);
  const [matchMs, setMatchMs] = useState<number | null>(null);
  const [runId, setRunId] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [currency, setCurrency] = useState(0);
  const [ownsDoubleShot, setOwnsDoubleShot] = useState(false);

  useEffect(() => {
    setBestScore(getBestScore());
    setCurrency(getCurrency());
    setOwnsDoubleShot(getOwnsDoubleShot());
    const pref = getSoundEnabledPref();
    setSoundOn(pref);
    setSoundEnabled(pref);
    const timer = setTimeout(() => setPhase('home'), SPLASH_MIN_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    saveSoundEnabledPref(next);
  };

  // Stardust is saved the instant it's earned (mid-match pickup or a vs
  // win), not just at match end, so it's kept even if the player loses,
  // quits mid-match, or closes the tab.
  const earnCurrency = (amount: number) => {
    setCurrency((prev) => {
      const next = prev + amount;
      saveCurrency(next);
      return next;
    });
  };

  const purchaseDoubleShot = () => {
    setCurrency((prev) => {
      if (ownsDoubleShot || prev < SHOP_DOUBLE_SHOT_PRICE) return prev;
      const next = prev - SHOP_DOUBLE_SHOT_PRICE;
      saveCurrency(next);
      setOwnsDoubleShot(true);
      saveOwnsDoubleShot(true);
      return next;
    });
  };

  const handleExit = (finalScore: number) => {
    setLastScore(finalScore);
    if (finalScore > bestScore) {
      setBestScore(finalScore);
      saveBestScore(finalScore);
    }
    setPhase('home');
  };

  const startSolo = (chosenMatchMs: number | null) => {
    setMode('solo');
    setBot(null);
    setMatchMs(chosenMatchMs);
    setRunId((r) => r + 1);
    setPhase('playing');
  };

  const goToBotSelect = (chosenMatchMs: number | null) => {
    setMatchMs(chosenMatchMs);
    setPhase('botSelect');
  };

  const selectBot = (chosen: BotConfig) => {
    setMode('vs');
    setBot(chosen);
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
            onStartVs={goToBotSelect}
            soundOn={soundOn}
            onToggleSound={toggleSound}
            currency={currency}
            onOpenShop={() => setPhase('shop')}
          />
        )}
        {phase === 'botSelect' && (
          <BotSelectScreen onSelect={selectBot} onBack={() => setPhase('home')} />
        )}
        {phase === 'shop' && (
          <ShopScreen
            currency={currency}
            ownsDoubleShot={ownsDoubleShot}
            price={SHOP_DOUBLE_SHOT_PRICE}
            onPurchaseDoubleShot={purchaseDoubleShot}
            onBack={() => setPhase('home')}
          />
        )}
        {phase === 'playing' && (
          <GameScreen
            key={runId}
            mode={mode}
            bot={bot ?? undefined}
            matchMs={matchMs}
            onExit={handleExit}
            onPlayAgain={playAgain}
            soundOn={soundOn}
            onToggleSound={toggleSound}
            ownsDoubleShot={ownsDoubleShot}
            onEarnCurrency={earnCurrency}
          />
        )}
        <StatusBar style="light" />
      </View>
    </SafeAreaProvider>
  );
}
