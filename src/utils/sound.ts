// All audio is synthesized with the Web Audio API — this ships as a web PWA,
// so there's no asset pipeline for sound files, and procedural blips/pads
// fit the retro-arcade look better than canned samples anyway.
//
// Browsers block audio until a user gesture; every call here lazily
// creates/resumes the shared AudioContext, which is safe to call repeatedly
// and always happens as a result of the player tapping something.

type Ctx = AudioContext;

let ctx: Ctx | null = null;
let enabled = true;
let musicStopFn: (() => void) | null = null;
let noiseBuffer: AudioBuffer | null = null;

function getCtx(): Ctx | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

export function setSoundEnabled(next: boolean) {
  enabled = next;
  if (!next) stopMusic();
}

export function isSoundEnabled() {
  return enabled;
}

function getNoiseBuffer(c: Ctx): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const length = c.sampleRate; // 1 second, reused with varying playback duration
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  noiseBuffer = buffer;
  return buffer;
}

interface ToneOpts {
  duration: number;
  type?: OscillatorType;
  gainPeak?: number;
  delay?: number;
  freqEnd?: number;
  attack?: number;
}

function tone(freq: number, opts: ToneOpts) {
  const c = getCtx();
  if (!c || !enabled) return;
  const { duration, type = 'sine', gainPeak = 0.18, delay = 0, freqEnd, attack = 0.008 } = opts;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (freqEnd !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), t0 + duration);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(gainPeak, t0 + attack);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

interface NoiseOpts {
  duration: number;
  filterStart: number;
  filterEnd: number;
  gainPeak?: number;
  delay?: number;
  type?: BiquadFilterType;
}

function noiseBurst(opts: NoiseOpts) {
  const c = getCtx();
  if (!c || !enabled) return;
  const { duration, filterStart, filterEnd, gainPeak = 0.22, delay = 0, type = 'lowpass' } = opts;
  const t0 = c.currentTime + delay;
  const src = c.createBufferSource();
  src.buffer = getNoiseBuffer(c);
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.frequency.setValueAtTime(filterStart, t0);
  filter.frequency.exponentialRampToValueAtTime(Math.max(filterEnd, 20), t0 + duration);
  const gain = c.createGain();
  gain.gain.setValueAtTime(gainPeak, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  src.start(t0);
  src.stop(t0 + duration + 0.02);
}

export function playShoot() {
  tone(520, { duration: 0.1, type: 'square', gainPeak: 0.1, freqEnd: 880 });
}

export function playBounce() {
  tone(700, { duration: 0.05, type: 'sine', gainPeak: 0.06, freqEnd: 500 });
}

// Three flavors matching the three explosion visuals — burst, shatter, implode.
export function playHit(variant: number) {
  const v = variant % 3;
  if (v === 0) {
    noiseBurst({ duration: 0.28, filterStart: 3200, filterEnd: 200, gainPeak: 0.24 });
    tone(140, { duration: 0.2, type: 'sine', gainPeak: 0.12, freqEnd: 60 });
  } else if (v === 1) {
    noiseBurst({ duration: 0.16, filterStart: 5200, filterEnd: 1800, gainPeak: 0.18, type: 'bandpass' });
    [1800, 2400, 3000].forEach((f, i) => tone(f, { duration: 0.06, type: 'triangle', gainPeak: 0.08, delay: i * 0.02 }));
  } else {
    tone(900, { duration: 0.3, type: 'sine', gainPeak: 0.14, freqEnd: 90 });
    noiseBurst({ duration: 0.22, filterStart: 400, filterEnd: 2600, gainPeak: 0.1 });
  }
}

// A bright triad layered on top of playHit when a golden double-score star
// goes down, so the bonus reads as a bonus even with eyes off the score.
export function playGolden() {
  [784, 988, 1175].forEach((f, i) => tone(f, { duration: 0.12, type: 'triangle', gainPeak: 0.12, delay: i * 0.05 }));
}

export function playPickup(
  kind: 'score' | 'rapidFire' | 'spreadShot' | 'bomb' | 'magnet' | 'currency' | 'giant' | 'homing',
) {
  if (kind === 'homing') {
    // A quick two-note lock-on blip, distinct from rapidFire's three-note chirp.
    [880, 1318].forEach((f, i) => tone(f, { duration: 0.09, type: 'triangle', gainPeak: 0.1, delay: i * 0.06 }));
  } else if (kind === 'giant') {
    // A low, swelling rise — the cannon puffing up, not darting like Magnet's sweep.
    tone(130, { duration: 0.35, type: 'sine', gainPeak: 0.16, freqEnd: 220 });
  } else if (kind === 'rapidFire') {
    [660, 990, 1320].forEach((f, i) => tone(f, { duration: 0.08, type: 'square', gainPeak: 0.1, delay: i * 0.04 }));
  } else if (kind === 'spreadShot') {
    // Three tones fired together, fanning outward in pitch — echoes the
    // 3-way bullet fan it grants.
    [740, 988, 1320].forEach((f) => tone(f, { duration: 0.12, type: 'sawtooth', gainPeak: 0.07 }));
  } else if (kind === 'bomb') {
    playBomb();
  } else if (kind === 'magnet') {
    // A rising sweep — things pulling inward toward the cannon.
    tone(220, { duration: 0.3, type: 'sine', gainPeak: 0.1, freqEnd: 660 });
  } else if (kind === 'currency') {
    [1175, 1568].forEach((f, i) => tone(f, { duration: 0.1, type: 'sine', gainPeak: 0.1, delay: i * 0.05 }));
  } else {
    tone(1046, { duration: 0.14, type: 'sine', gainPeak: 0.12, freqEnd: 1568 });
  }
}

// A big simultaneous boom for the bomb pickup clearing every live target —
// deeper and louder than a single playHit, since several targets go down
// at once.
export function playBomb() {
  noiseBurst({ duration: 0.4, filterStart: 3800, filterEnd: 150, gainPeak: 0.3 });
  tone(90, { duration: 0.35, type: 'sine', gainPeak: 0.18, freqEnd: 40 });
  tone(180, { duration: 0.25, type: 'triangle', gainPeak: 0.12, freqEnd: 70, delay: 0.03 });
}

// A shop purchase — a little richer than a UI tap, confirms the spend went
// through.
export function playPurchase() {
  [659, 988, 1319].forEach((f, i) => tone(f, { duration: 0.1, type: 'triangle', gainPeak: 0.13, delay: i * 0.06 }));
}

export function playLevelUp() {
  [523, 659, 784].forEach((f, i) => tone(f, { duration: 0.16, type: 'triangle', gainPeak: 0.14, delay: i * 0.08 }));
}

export function playWin() {
  [523, 659, 784, 1047].forEach((f, i) =>
    tone(f, { duration: 0.22, type: 'triangle', gainPeak: 0.16, delay: i * 0.1 })
  );
}

export function playLose() {
  [392, 330, 262].forEach((f, i) => tone(f, { duration: 0.32, type: 'sine', gainPeak: 0.14, delay: i * 0.15 }));
}

export function playDraw() {
  tone(440, { duration: 0.3, type: 'sine', gainPeak: 0.12 });
}

export function playTimeUp() {
  [660, 440].forEach((f, i) => tone(f, { duration: 0.22, type: 'triangle', gainPeak: 0.12, delay: i * 0.12 }));
}

export function playUiTap() {
  tone(880, { duration: 0.04, type: 'square', gainPeak: 0.05 });
}

// A quiet looping ambient pad + slow arpeggio, started while playing and
// stopped on exit. Scheduled one note at a time via setTimeout rather than
// a tight audio-clock loop — ambient background music doesn't need
// sample-accurate timing, and this can't drift into a stuck state since
// each call either reschedules itself or is cancelled outright.
const MUSIC_NOTES = [196, 233, 294, 349, 294, 233]; // G3 pentatonic-ish wander
const MUSIC_NOTE_MS = 950;

export function startMusic() {
  if (!enabled || musicStopFn) return;
  let stopped = false;
  let i = 0;
  const playNext = () => {
    if (stopped) return;
    tone(MUSIC_NOTES[i % MUSIC_NOTES.length], { duration: 1.6, type: 'sine', gainPeak: 0.045, attack: 0.3 });
    tone(MUSIC_NOTES[i % MUSIC_NOTES.length] / 2, { duration: 1.8, type: 'sine', gainPeak: 0.03, attack: 0.4 });
    i += 1;
    timer = setTimeout(playNext, MUSIC_NOTE_MS);
  };
  let timer = setTimeout(playNext, 0);
  musicStopFn = () => {
    stopped = true;
    clearTimeout(timer);
  };
}

export function stopMusic() {
  musicStopFn?.();
  musicStopFn = null;
}
