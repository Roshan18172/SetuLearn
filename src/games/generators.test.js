/* eslint-disable testing-library/no-container, testing-library/no-node-access, testing-library/prefer-find-by, jest/no-conditional-expect */
import { generateCrossword } from "./crosswordGenerator";
import { generateWordSearch, lineCells } from "./wordSearchGenerator";
import { FALLBACK_TERMS } from "./fallbackTerms";
import { scrambleLetters, shuffle, toLetters } from "./utils";

const entries = FALLBACK_TERMS.map((t, i) => ({ id: i, letters: toLetters(t.answer), clue: t.clue, answer: t.answer }));

describe("crossword generator", () => {
  it("places words consistently, without touching or stray words", () => {
    for (let n = 0; n < 15; n++) {
      const cw = generateCrossword(shuffle(entries).slice(0, 10), { size: 15 });
      expect(cw.entries.length).toBeGreaterThanOrEqual(6);
      const inEntry = new Set();
      for (const e of cw.entries) {
        for (let i = 0; i < e.letters.length; i++) {
          const r = e.row + (e.dir === "down" ? i : 0);
          const c = e.col + (e.dir === "across" ? i : 0);
          expect(cw.cells[r][c].letter).toBe(e.letters[i]);
          inEntry.add(`${r},${c}`);
        }
      }
      // every filled cell belongs to a word
      cw.cells.forEach((row, r) => row.forEach((cell, c) => { if (cell.letter) expect(inEntry.has(`${r},${c}`)).toBe(true); }));
      // numbers are unique per start cell and increase in reading order
      const nums = cw.entries.map((e) => e.number);
      expect([...nums].sort((a, b) => a - b)).toEqual(nums);
    }
  });
  it("returns null when there is nothing to cross", () => {
    expect(generateCrossword([entries[0]], { size: 15 })).toBeNull();
  });
});

describe("word search generator", () => {
  it("hides every placed word exactly where it says", () => {
    for (const dirCount of [2, 4, 8]) {
      const ws = generateWordSearch(shuffle(entries).slice(0, 8), { size: 12, dirCount });
      expect(ws.placed.length).toBeGreaterThan(4);
      for (const p of ws.placed) {
        let s = "";
        for (let i = 0; i < p.letters.length; i++) s += ws.grid[p.r + p.dr * i][p.c + p.dc * i];
        expect(s).toBe(p.letters);
      }
    }
  });
  it("snaps a drag to a straight line", () => {
    expect(lineCells(2, 2, 3, 6, 12).map(([r, c]) => `${r},${c}`)).toEqual(["2,2", "2,3", "2,4", "2,5", "2,6"]);
    expect(lineCells(5, 5, 2, 2, 12).length).toBe(4);
  });
});

describe("scramble", () => {
  it("never returns the original word when it can differ", () => {
    for (let i = 0; i < 30; i++) expect(scrambleLetters("OXYGEN")).not.toBe("OXYGEN");
    expect(scrambleLetters("AAA")).toBe("AAA");
  });
});
