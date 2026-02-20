let AC: AudioContext | null = null;

function getAC(): AudioContext {
  if (!AC) AC = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (AC!.state === 'suspended') AC!.resume();
  return AC!;
}

function playTone(freq: number, type: OscillatorType, dur: number, vol = 0.15, fe?: number) {
  try {
    const ac = getAC();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.connect(g);
    g.connect(ac.destination);
    o.type = type;
    o.frequency.setValueAtTime(freq, ac.currentTime);
    if (fe) o.frequency.exponentialRampToValueAtTime(fe, ac.currentTime + dur);
    g.gain.setValueAtTime(vol, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    o.start();
    o.stop(ac.currentTime + dur);
  } catch (e) {
    console.warn('Audio error:', e);
  }
}

function playNoise(dur: number, vol = 0.15, freq = 600) {
  try {
    const ac = getAC();
    const sz = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, sz, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < sz; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource();
    const f = ac.createBiquadFilter();
    const g = ac.createGain();
    src.buffer = buf;
    f.type = 'bandpass';
    f.frequency.value = freq;
    f.Q.value = 1.5;
    g.gain.setValueAtTime(vol, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    src.connect(f);
    f.connect(g);
    g.connect(ac.destination);
    src.start();
    src.stop(ac.currentTime + dur);
  } catch (e) {
    console.warn('Audio error:', e);
  }
}

export const SFX = {
  fire: () => playTone(520, 'square', 0.08, 0.12, 200),
  laser: () => playTone(180, 'sawtooth', 0.04, 0.05, 160),
  hit: () => {
    playNoise(0.1, 0.2, 600);
    playTone(120, 'sine', 0.08, 0.08, 60);
  },
  bump: () => {
    playNoise(0.18, 0.28, 250);
    playTone(70, 'sine', 0.12, 0.14, 40);
  },
  explode: () => {
    playNoise(0.5, 0.35, 180);
    playTone(80, 'sawtooth', 0.35, 0.15, 28);
  },
  special: () => {
    playTone(300, 'sine', 0.05, 0.1, 600);
    playTone(600, 'sine', 0.12, 0.08, 1200);
  },
  shield: () => playTone(900, 'sine', 0.06, 0.08, 600),
  mine: () => playTone(200, 'sawtooth', 0.08, 0.12, 80),
  nova: () => {
    playNoise(0.6, 0.3, 380);
    playTone(150, 'sine', 0.5, 0.15, 48);
  },
  select: () => playTone(440, 'sine', 0.06, 0.1, 880),
  start: () => {
    setTimeout(() => playTone(300, 'sine', 0.15, 0.18), 0);
    setTimeout(() => playTone(450, 'sine', 0.15, 0.18), 100);
    setTimeout(() => playTone(700, 'sine', 0.15, 0.18), 200);
  },
  win: () => {
    const freqs = [400, 500, 600, 800];
    for (let i = 0; i < freqs.length; i++) {
      ((f, t) => {
        setTimeout(() => playTone(f, 'sine', 0.25, 0.18), t);
      })(freqs[i], i * 150);
    }
  },
};
