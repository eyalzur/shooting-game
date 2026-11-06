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
