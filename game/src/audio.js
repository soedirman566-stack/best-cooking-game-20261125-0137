// audio.js — every sound in Sizzle & Serve is synthesized with WebAudio
// oscillators, so the game needs no audio files and loads nothing.
// The context is created lazily on the first user gesture (browsers refuse
// audio before one), and every effect is a short envelope-shaped blip.

let context = null;

function audioContext() {
  if (context === null) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  if (context.state === 'suspended') context.resume();
  return context;
}

// One tone: frequency glides from `from` to `to` over `seconds`.
function tone(from, to, seconds, type, volume, when = 0) {
  const ctx = audioContext();
  if (!ctx) return;
  const start = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, start);
  osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), start + seconds);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + seconds + 0.05);
}

export const sfx = {
  // A soft plop when an ingredient lands on the plate.
  place() { tone(300, 140, 0.09, 'sine', 0.22); },
  // The bright ding of a finished stack.
  ready() { tone(880, 880, 0.1, 'triangle', 0.2); tone(1318, 1318, 0.16, 'triangle', 0.2, 0.09); },
  // The till's little arpeggio when a dish is served.
  serve() { tone(659, 659, 0.08, 'square', 0.1); tone(880, 880, 0.08, 'square', 0.1, 0.07); tone(1174, 1174, 0.14, 'square', 0.1, 0.14); },
  // A low buzz when the wrong ingredient is picked.
  wrong() { tone(160, 90, 0.22, 'sawtooth', 0.16); },
  // A falling whistle when an order's timer runs out.
  expire() { tone(700, 180, 0.35, 'sine', 0.2); },
  // A click for buttons and ticket selection.
  click() { tone(520, 420, 0.05, 'sine', 0.12); },
  // Three descending notes for the game-over sting.
  gameover() { tone(392, 392, 0.16, 'triangle', 0.2); tone(330, 330, 0.16, 'triangle', 0.2, 0.15); tone(262, 262, 0.3, 'triangle', 0.2, 0.3); },
};
