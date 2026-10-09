import { shuffle } from "./utils";

const DOWN = "down";
const ACROSS = "across";

function canPlace(grid, dirs, size, word, r, c, dir) {
  const dr = dir === DOWN ? 1 : 0;
  const dc = dir === ACROSS ? 1 : 0;
  const endR = r + dr * (word.length - 1);
  const endC = c + dc * (word.length - 1);
  if (r < 0 || c < 0 || endR >= size || endC >= size) return false;

  // cells just before and after the word must be empty
  const br = r - dr, bc = c - dc, ar = endR + dr, ac = endC + dc;
  if (br >= 0 && bc >= 0 && grid[br][bc]) return false;
  if (ar < size && ac < size && grid[ar][ac]) return false;

  let crossings = 0;
  for (let i = 0; i < word.length; i++) {
    const rr = r + dr * i;
    const cc = c + dc * i;
    const cell = grid[rr][cc];
    if (cell) {
      if (cell !== word[i]) return false;
      // must cross a word going the other way, never run along one
      if (dirs[rr][cc] !== (dir === ACROSS ? DOWN : ACROSS)) return false;
      crossings++;
    } else {
      // side neighbours must be empty, otherwise two words would touch
      const s1r = rr + dc, s1c = cc + dr, s2r = rr - dc, s2c = cc - dr;
      if (s1r < size && s1c < size && grid[s1r][s1c]) return false;
      if (s2r >= 0 && s2c >= 0 && grid[s2r][s2c]) return false;
    }
  }
  return crossings > 0 ? crossings : -1; // -1: valid but touches nothing (only used for the first word)
}

function attempt(words, size) {
  const grid = Array.from({ length: size }, () => Array(size).fill(null));
  const dirs = Array.from({ length: size }, () => Array(size).fill(null));
  const placed = [];

  const put = (w, r, c, dir) => {
    const dr = dir === DOWN ? 1 : 0;
    const dc = dir === ACROSS ? 1 : 0;
    for (let i = 0; i < w.letters.length; i++) {
      grid[r + dr * i][c + dc * i] = w.letters[i];
      dirs[r + dr * i][c + dc * i] = dirs[r + dr * i][c + dc * i] ? "both" : dir;
    }
    placed.push({ ...w, row: r, col: c, dir });
  };

  const [first, ...rest] = words;
  const startC = Math.max(0, Math.floor((size - first.letters.length) / 2));
  put(first, Math.floor(size / 2), startC, ACROSS);

  for (const w of rest) {
    let best = [];
    let bestScore = 0;
    for (const p of placed) {
      const nd = p.dir === ACROSS ? DOWN : ACROSS;
      for (let i = 0; i < p.letters.length; i++) {
        // board position of letter i of the already-placed word
        const pr = p.row + (p.dir === DOWN ? i : 0);
        const pc = p.col + (p.dir === ACROSS ? i : 0);
        for (let j = 0; j < w.letters.length; j++) {
          if (p.letters[i] !== w.letters[j]) continue;
          // start of the new word so that its letter j lands on (pr, pc)
          const sr = pr - (nd === DOWN ? j : 0);
          const sc = pc - (nd === ACROSS ? j : 0);
          const score = canPlace(grid, dirs, size, w.letters, sr, sc, nd);
          if (score > 0) {
            if (score > bestScore) { best = [[sr, sc, nd]]; bestScore = score; }
            else if (score === bestScore) best.push([sr, sc, nd]);
          }
        }
      }
    }
    if (best.length) {
      const [r, c, dir] = best[Math.floor(Math.random() * best.length)];
      put(w, r, c, dir);
    }
  }
  return { grid, placed };
}

/**
 * Build a crossword from word entries ({ id, letters, clue, answer }).
 * Tries many random orders and keeps the layout that fits the most words.
 */
export function generateCrossword(entries, { size = 15, attempts = 80 } = {}) {
  const usable = entries.filter((e) => e.letters.length >= 3 && e.letters.length <= size);
  if (usable.length < 2) return null;

  let best = null;
  for (let i = 0; i < attempts; i++) {
    // longest words first tends to give a better skeleton; shuffle among equal lengths
    const ordered = shuffle(usable).sort((a, b) => b.letters.length - a.letters.length + (Math.random() - 0.5) * 3);
    const res = attempt(ordered, size);
    if (!best || res.placed.length > best.placed.length) best = res;
    if (best.placed.length === usable.length) break;
  }

  // trim to the bounding box
  let minR = size, minC = size, maxR = 0, maxC = 0;
  for (const p of best.placed) {
    const dr = p.dir === DOWN ? 1 : 0;
    const dc = p.dir === ACROSS ? 1 : 0;
    minR = Math.min(minR, p.row); minC = Math.min(minC, p.col);
    maxR = Math.max(maxR, p.row + dr * (p.letters.length - 1));
    maxC = Math.max(maxC, p.col + dc * (p.letters.length - 1));
  }
  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;
  const cells = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({ letter: best.grid[r + minR][c + minC], number: null }))
  );

  // number the starts in reading order
  const entriesOut = best.placed.map((p) => ({ ...p, row: p.row - minR, col: p.col - minC }));
  let n = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const starts = entriesOut.filter((e) => e.row === r && e.col === c);
      if (!starts.length) continue;
      n++;
      cells[r][c].number = n;
      for (const e of starts) e.number = n;
    }
  }
  entriesOut.sort((a, b) => a.number - b.number);
  return { rows, cols, cells, entries: entriesOut, skipped: usable.length - entriesOut.length };
}
