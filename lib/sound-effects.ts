/**
 * Web Audio API Sound Effects & Haptic Engine
 * Synthesizes pure procedural audio with zero bundle weight and zero network assets.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Snappy Apple-style micro-click for buttons and cart additions
 */
export function playMicroClickSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;

    // Fast frequency sweep down
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.035);

    // Exponential gain decay
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);

    triggerHaptic('light');
  } catch {
    // Ignore audio play errors
  }
}

/**
 * Mechanical latch & harmonic digital chime for credential vault unlock
 */
export function playCredentialUnlockSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // 1. Initial mechanical tumbler click
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(320, now);
    clickOsc.frequency.exponentialRampToValueAtTime(80, now + 0.04);
    clickGain.gain.setValueAtTime(0.3, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.045);

    // 2. Uplifting digital harmonic chime
    const tone1 = ctx.createOscillator();
    const tone2 = ctx.createOscillator();
    const toneGain = ctx.createGain();

    tone1.type = 'sine';
    tone2.type = 'sine';

    tone1.frequency.setValueAtTime(587.33, now + 0.03); // D5
    tone2.frequency.setValueAtTime(880.00, now + 0.03); // A5

    toneGain.gain.setValueAtTime(0.001, now);
    toneGain.gain.setValueAtTime(0.28, now + 0.035);
    toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    tone1.connect(toneGain);
    tone2.connect(toneGain);
    toneGain.connect(ctx.destination);

    tone1.start(now + 0.03);
    tone2.start(now + 0.03);
    tone1.stop(now + 0.3);
    tone2.stop(now + 0.3);

    triggerHaptic('success');
  } catch {
    // Ignore audio play errors
  }
}

/**
 * High-clarity soft ding chime on incoming or sent chat messages
 */
export function playMessageDingSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    // Pleasant high major harmonic interval
    osc1.frequency.setValueAtTime(880, now); // A5
    osc2.frequency.setValueAtTime(1318.51, now); // E6

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.36);
    osc2.stop(now + 0.36);

    triggerHaptic('medium');
  } catch {
    // Ignore audio play errors
  }
}

/**
 * Mobile vibration haptic feedback
 */
export function triggerHaptic(type: 'light' | 'medium' | 'success' = 'light') {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate?.(12);
        break;
      case 'medium':
        navigator.vibrate?.(25);
        break;
      case 'success':
        navigator.vibrate?.([15, 40, 20]);
        break;
    }
  } catch {
    // Ignore vibration errors
  }
}
