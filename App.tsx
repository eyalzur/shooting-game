import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, User } from 'firebase/auth';
import SplashScreen from './src/components/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import BotSelectScreen from './src/screens/BotSelectScreen';
import GameScreen from './src/screens/GameScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import ShopScreen from './src/screens/ShopScreen';
import CurrencyShopScreen from './src/screens/CurrencyShopScreen';
import VersionLogScreen from './src/screens/VersionLogScreen';
import { SHOP_ITEMS, SPLASH_MIN_DURATION_MS } from './src/constants';
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
import { fetchCloudProgress, pushCloudProgress } from './src/utils/cloudSave';
import { firebaseConfigured, getFirebaseAuth } from './src/utils/firebase';
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
  const [user, setUser] = useState<User | null>(null);
  // Snapshot of the three cloud-synced fields, kept current every render —
  // only read at the moment a brand-new account's first sign-in needs to
  // seed the cloud doc from whatever's on this device right now.
  const progressRef = useRef({ bestScore, currency, ownedUpgrades });
  progressRef.current = { bestScore, currency, ownedUpgrades };

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

  // Google sign-in syncs progress to Firestore so it follows the player
  // across devices — entirely optional, local play is unaffected either
  // way. Only wired up once Firebase is actually configured (see
  // firebase.ts), so a deploy before that's done behaves exactly like the
  // no-login build it replaces.
  useEffect(() => {
    if (!firebaseConfigured) return;
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) return;
      const cloud = await fetchCloudProgress(nextUser.uid);
      if (cloud) {
        // An existing cloud profile wins outright over whatever's on this
        // browser — the common case is returning to a known device, or
        // signing into an account already used elsewhere.
        setBestScore(cloud.bestScore);
        saveBestScore(cloud.bestScore);
        setCurrency(cloud.currency);
        saveCurrency(cloud.currency);
        setOwnedUpgrades(cloud.ownedUpgrades);
        saveOwnedUpgrades(cloud.ownedUpgrades);
      } else {
        // Brand-new account: seed the cloud doc from this device's current
        // progress instead of starting it empty.
        pushCloudProgress(nextUser.uid, progressRef.current);
      }
    });
    return unsubscribe;
  }, []);

  const signIn = () => {
    if (!firebaseConfigured) return;
    signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider()).catch(() => {
      // ignore — popup closed/blocked, user stays signed out
    });
  };

  const signOutUser = () => {
    if (!firebaseConfigured) return;
    firebaseSignOut(getFirebaseAuth()).catch(() => {});
  };

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
      if (user) pushCloudProgress(user.uid, { ...progressRef.current, currency: next });
      return next;
    });
  };

  // Owning an upgrade is just how many times its id appears in the list —
  // the price for the *next* level is prices[currentLevel]; once the list
  // is exhausted (level === prices.length) it's maxed and can't be bought
  // again.
  const purchaseUpgrade = (id: UpgradeId) => {
    const item = SHOP_ITEMS.find((i) => i.id === id);
    if (!item) return;
    const level = ownedUpgrades.filter((owned) => owned === id).length;
    if (level >= item.prices.length) return;
    const price = item.prices[level];
    setCurrency((prev) => {
      if (prev < price) return prev;
      const next = prev - price;
      saveCurrency(next);
      setOwnedUpgrades((prevOwned) => {
        const nextOwned = [...prevOwned, id];
        saveOwnedUpgrades(nextOwned);
        if (user) pushCloudProgress(user.uid, { ...progressRef.current, currency: next, ownedUpgrades: nextOwned });
        return nextOwned;
      });
      return next;
    });
  };

  const resetInventory = () => {
    setOwnedUpgrades([]);
    saveOwnedUpgrades([]);
    if (user) pushCloudProgress(user.uid, { ...progressRef.current, ownedUpgrades: [] });
  };

  const handleExit = (finalScore: number) => {
    setLastScore(finalScore);
    if (finalScore > bestScore) {
      setBestScore(finalScore);
      saveBestScore(finalScore);
      if (user) pushCloudProgress(user.uid, { ...progressRef.current, bestScore: finalScore });
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
            onResetInventory={resetInventory}
            onBack={() => setPhase('home')}
            firebaseConfigured={firebaseConfigured}
            user={user}
            onSignIn={signIn}
            onSignOut={signOutUser}
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
