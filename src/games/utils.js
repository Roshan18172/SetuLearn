export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const pick = (arr, n) => shuffle(arr).slice(0, n);

/** "New Delhi!" -> "NEWDELHI" */
export const toLetters = (s) => String(s).toUpperCase().replace(/[^A-Z]/g, "");

/** Title-case answers coming from lower-case option text, keep acronyms. */
export const prettyAnswer = (s) =>
  String(s)
    .trim()
    .split(/\s+/)
    .map((w) => (w === w.toUpperCase() && w.length <= 5 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");

/** Scramble the letters so the result never equals the original (when possible). */
export const scrambleLetters = (letters) => {
  const chars = letters.split("");
  if (new Set(chars).size < 2) return letters;
  let out = letters;
  for (let i = 0; i < 20 && out === letters; i++) out = shuffle(chars).join("");
  return out;
};

export const formatTime = (sec) => {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

// ---- best scores (kept in this browser only) ----
const KEY = "setulearn_game_scores_v1";

export const readScores = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
};

/** Returns { best, isNewBest, plays }. */
export const saveScore = (gameId, score) => {
  const all = readScores();
  const prev = all[gameId] || { best: 0, plays: 0 };
  const isNewBest = score > prev.best;
  all[gameId] = { best: Math.max(prev.best, score), plays: prev.plays + 1, last: score };
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* private mode / storage full: scores just won't persist */
  }
  return { best: all[gameId].best, isNewBest, plays: all[gameId].plays };
};
