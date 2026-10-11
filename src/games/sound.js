/** Tiny WebAudio sound effects (no audio files). Muted state is remembered in this browser. */
const KEY = "setulearn_game_sound_v1";
let ctx = null;

export const isMuted = () => {
  try { return localStorage.getItem(KEY) === "off"; } catch { return false; }
};
export const setMuted = (muted) => {
  try { localStorage.setItem(KEY, muted ? "off" : "on"); } catch { /* ignore */ }
};

const TONES = {
  correct: [[660, 0.09], [880, 0.14]],
  wrong: [[220, 0.16], [165, 0.2]],
  win: [[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.26]],
  click: [[500, 0.04]],
};

export function playSound(name) {
  if (isMuted()) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx ||= new AC();
    if (ctx.state === "suspended") ctx.resume();
    let t = ctx.currentTime;
    for (const [freq, dur] of TONES[name] || []) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = name === "wrong" ? "sawtooth" : "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
      t += dur;
    }
  } catch {
    /* audio is a bonus: never break the game */
  }
}
