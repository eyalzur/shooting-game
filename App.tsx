import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './src/components/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import BotSelectScreen from './src/screens/BotSelectScreen';
import GameScreen from './src/screens/GameScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import ShopScreen from './src/screens/ShopScreen';
import CurrencyShopScreen from './src/screens/CurrencyShopScreen';
import VersionLogScreen from './src/screens/VersionLogScreen';
import { SPLASH_MIN_DURATION_MS } from './src/constants';
import {
  getBestScore,
  getCurrency,
  getOwnedUpgrades,
  getSoundEnabledPref,
  saveBestScore,
  saveCurrency,
  saveOwnedUpgrades,
  saveSoundEnabledPref,
} from './src/utils/storage';
import { setSoundEnabled } from './src/utils/sound';
import { BotConfig, GameMode, UpgradeId } from './src/types';

type Phase = 'splash' | 'home' | 'botSelect' | 'playing' | 'shop' | 'currencyShop' | 'player' | 'changelog';

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
  const [ownedUpgrades, setOwnedUpgrades] = useState<UpgradeId[]>([]);

  useEffect(() => {
    setBestScore(getBestScore());
    setCurrency(getCurrency());
    setOwnedUpgrades(getOwnedUpgrades());
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

  const purchaseUpgrade = (id: UpgradeId, price: number) => {
    setCurrency((prev) => {
      if (ownedUpgrades.includes(id) || prev < price) return prev;
      const next = prev - price;
      saveCurrency(next);
      setOwnedUpgrades((prevOwned) => {
        const nextOwned = [...prevOwned, id];
        saveOwnedUpgrades(nextOwned);
        return nextOwned;
      });
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
            onOpenPlayer={() => setPhase('player')}
            onOpenChangelog={() => setPhase('changelog')}
          />
        )}
        {phase === 'botSelect' && (
          <BotSelectScreen onSelect={selectBot} onBack={() => setPhase('home')} />
        )}
        {phase === 'shop' && (
          <ShopScreen
            currency={currency}
            ownedUpgrades={ownedUpgrades}
            onPurchase={purchaseUpgrade}
            onOpenCurrencyShop={() => setPhase('currencyShop')}
            onBack={() => setPhase('home')}
          />
        )}
        {phase === 'currencyShop' && (
          <CurrencyShopScreen currency={currency} onBuyPack={earnCurrency} onBack={() => setPhase('shop')} />
        )}
        {phase === 'player' && (
          <PlayerScreen
            ownedUpgrades={ownedUpgrades}
            onOpenShop={() => setPhase('shop')}
            onBack={() => setPhase('home')}
          />
        )}
        {phase === 'changelog' && <VersionLogScreen onBack={() => setPhase('home')} />}
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
            ownedUpgrades={ownedUpgrades}
            onEarnCurrency={earnCurrency}
          />
        )}
        <StatusBar style="light" />
      </View>
    </SafeAreaProvider>
  );
}
