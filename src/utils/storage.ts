import { UpgradeId } from '../types';

// Best score persistence. This ships as a web PWA, so localStorage is the
// natural fit — guarded for environments where it's unavailable (private
// browsing, SSR, etc).
const BEST_SCORE_KEY = 'strafe-strike-best-score';

export function getBestScore(): number {
  try {
    const raw = window.localStorage.getItem(BEST_SCORE_KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export function saveBestScore(score: number): void {
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(score));
  } catch {
    // ignore — best score just won't persist this session
  }
}

const SOUND_ENABLED_KEY = 'strafe-strike-sound-enabled';

export function getSoundEnabledPref(): boolean {
  try {
    const raw = window.localStorage.getItem(SOUND_ENABLED_KEY);
    return raw === null ? true : raw === '1';
  } catch {
    return true;
  }
}

export function saveSoundEnabledPref(on: boolean): void {
  try {
    window.localStorage.setItem(SOUND_ENABLED_KEY, on ? '1' : '0');
  } catch {
    // ignore — preference just won't persist this session
  }
}

// Stardust balance — earned mid-match or on a vs-bot win, kept regardless
// of how the match ends.
const CURRENCY_KEY = 'strafe-strike-currency';

export function getCurrency(): number {
  try {
    const raw = window.localStorage.getItem(CURRENCY_KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export function saveCurrency(amount: number): void {
  try {
    window.localStorage.setItem(CURRENCY_KEY, String(amount));
  } catch {
    // ignore — balance just won't persist this session
  }
}

// Owned shop upgrades, as a plain id list — one key for the whole set so a
// new shop item never needs a new storage key.
const OWNED_UPGRADES_KEY = 'strafe-strike-owned-upgrades';
// Superseded by OWNED_UPGRADES_KEY; only read once, to migrate an existing
// player's earlier Double Shot purchase into the new list.
const LEGACY_OWNS_DOUBLE_SHOT_KEY = 'strafe-strike-owns-double-shot';

export function getOwnedUpgrades(): UpgradeId[] {
  try {
    const raw = window.localStorage.getItem(OWNED_UPGRADES_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
    if (window.localStorage.getItem(LEGACY_OWNS_DOUBLE_SHOT_KEY) === '1') {
      const migrated: UpgradeId[] = ['doubleShot'];
      saveOwnedUpgrades(migrated);
      return migrated;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveOwnedUpgrades(ids: UpgradeId[]): void {
  try {
    window.localStorage.setItem(OWNED_UPGRADES_KEY, JSON.stringify(ids));
  } catch {
    // ignore — purchases just won't persist this session
  }
}
