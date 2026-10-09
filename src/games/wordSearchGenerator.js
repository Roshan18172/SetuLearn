import { shuffle } from "./utils";

const ALL_DIRS = [
  [0, 1], [1, 0], [1, 1], [-1, 1], // right, down, down-right, up-right
  [0, -1], [-1, 0], [-1, -1], [1, -1], // and their reverses
];

/**
 * Hide words in a size x size letter grid.
 * @param entries   [{ id, letters, ... }]
 * @param dirCount  4 = forwards only, 8 = also backwards
 * @returns { size, grid, placed: [{ ...entry, r, c, dr, dc }], skipped }
 */
export function generateWordSearch(entries, { size = 12, dirCount = 4 } = {}) {
  const dirs = ALL_DIRS.slice(0, dirCount);
  const grid = Array.from({ length: size }, () => Array(size).fill(""));
  const placed = [];
  let skipped = 0;

  const fits = (letters, r, c, dr, dc) => {
    for (let i = 0; i < letters.length; i++) {
      const rr = r + dr * i, cc = c + dc * i;
      if (rr < 0 || cc < 0 || rr >= size || cc >= size) return false;
      if (grid[rr][cc] && grid[rr][cc] !== letters[i]) return false;
    }
    return true;
  };

  const sorted = [...entries].filter((e) => e.letters.length <= size).sort((a, b) => b.letters.length - a.letters.length);
  for (const e of sorted) {
    let done = false;
    for (let t = 0; t < 250 && !done; t++) {
      const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      if (!fits(e.letters, r, c, dr, dc)) continue;
      for (let i = 0; i < e.letters.length; i++) grid[r + dr * i][c + dc * i] = e.letters[i];
      placed.push({ ...e, r, c, dr, dc });
      done = true;
    }
    if (!done) skipped++;
  }

  // fill the gaps; favour letters used by the words so the grid looks natural
  const pool = (placed.map((p) => p.letters).join("") + "ETAOINSHRDLUCMFWYPBGVKQXJZ").split("");
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (!grid[r][c]) grid[r][c] = shuffle(pool)[0];

  return { size, grid, placed: placed.sort((a, b) => a.letters.localeCompare(b.letters)), skipped };
}

/** Cells on the straight line from (r1,c1) towards (r2,c2), snapped to the nearest of 8 directions. */
export function lineCells(r1, c1, r2, c2, size) {
  const dr = r2 - r1, dc = c2 - c1;
  if (dr === 0 && dc === 0) return [[r1, c1]];
  const angle = Math.atan2(dr, dc); // radians
  const step = Math.round(angle / (Math.PI / 4)); // -4..4
  const dirR = Math.round(Math.sin(step * (Math.PI / 4)));
  const dirC = Math.round(Math.cos(step * (Math.PI / 4)));
  const len = Math.max(Math.abs(dr), Math.abs(dc));
  const cells = [];
  for (let i = 0; i <= len; i++) {
    const rr = r1 + dirR * i, cc = c1 + dirC * i;
    if (rr < 0 || cc < 0 || rr >= size || cc >= size) break;
    cells.push([rr, cc]);
  }
  return cells;
}
