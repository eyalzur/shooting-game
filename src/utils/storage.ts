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
