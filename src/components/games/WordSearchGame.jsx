import { useEffect, useMemo, useRef, useState } from "react";
import { generateWordSearch, lineCells } from "../../games/wordSearchGenerator";
import { useElapsed } from "../../games/hooks";
import { formatTime, shuffle } from "../../games/utils";

const COLORS = 8; // matches .ws-found-0 ... .ws-found-7 in games.css

export default function WordSearchGame({ terms, level, onFinish, onQuit, source }) {
  const puzzle = useMemo(() => {
    const entries = shuffle(terms.filter((t) => t.letters.length >= 4 && t.letters.length <= level.size))
      .slice(0, level.words)
      .map((t, i) => ({ id: i, letters: t.letters, clue: t.clue, answer: t.answer }));
    return generateWordSearch(entries, { size: level.size, dirCount: level.dirCount });
  }, [terms, level]);

  const size = puzzle.size;
  const [found, setFound] = useState({}); // id -> color index
  const [selection, setSelection] = useState([]); // [[r,c], ...]
  const [flash, setFlash] = useState(null); // "r,c" hint cell
  const [bad, setBad] = useState(false);
  const [hints, setHints] = useState(0);
  const [done, setDone] = useState(false);
  const gridRef = useRef(null);
  const start = useRef(null);
  const elapsed = useElapsed(!done);

  const foundCells = useMemo(() => {
    const m = {};
    puzzle.placed.forEach((p) => {
      if (found[p.id] === undefined) return;
      for (let i = 0; i < p.letters.length; i++) m[`${p.r + p.dr * i},${p.c + p.dc * i}`] = found[p.id];
    });
    return m;
  }, [found, puzzle]);

  const cellAt = (e) => {
    const rect = gridRef.current.getBoundingClientRect();
    const c = Math.min(size - 1, Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * size)));
    const r = Math.min(size - 1, Math.max(0, Math.floor(((e.clientY - rect.top) / rect.height) * size)));
    return [r, c];
  };

  const onDown = (e) => {
    if (done) return;
    e.preventDefault();
    gridRef.current.setPointerCapture?.(e.pointerId);
    start.current = cellAt(e);
    setSelection([start.current]);
  };

  const onMove = (e) => {
    if (!start.current) return;
    const [r2, c2] = cellAt(e);
    setSelection(lineCells(start.current[0], start.current[1], r2, c2, size));
  };

  const finishRound = (foundMap, hintCount, all) => {
    const total = puzzle.placed.length;
    const count = Object.keys(foundMap).length;
    const allowance = total * 40;
    const bonus = all ? Math.min(300, Math.max(0, Math.round((allowance - elapsed) * 3))) : 0;
    const score = Math.max(0, count * 100 + bonus - hintCount * 40);
    onFinish({
      score,
      headline: all ? "Every word found!" : "Round over",
      stats: [
        { label: "Words found", value: `${count}/${total}` },
        { label: "Time", value: formatTime(elapsed) },
        { label: "Speed bonus", value: bonus },
        { label: "Hints used", value: hintCount },
      ],
    });
  };

  const onUp = () => {
    if (!start.current) return;
    const letters = selection.map(([r, c]) => puzzle.grid[r][c]).join("");
    const rev = [...letters].reverse().join("");
    start.current = null;
    const hit = puzzle.placed.find((p) => found[p.id] === undefined && (p.letters === letters || p.letters === rev));
    if (hit && letters.length > 1) {
      const next = { ...found, [hit.id]: Object.keys(found).length % COLORS };
      setFound(next);
      setSelection([]);
      if (Object.keys(next).length === puzzle.placed.length) {
        setDone(true);
        setTimeout(() => finishRound(next, hints, true), 900);
      }
    } else {
      if (selection.length > 1) {
        setBad(true);
        setTimeout(() => setBad(false), 350);
      }
      setTimeout(() => setSelection([]), 150);
    }
  };

  const hint = () => {
    const left = puzzle.placed.filter((p) => found[p.id] === undefined);
    if (!left.length) return;
    const p = left[Math.floor(Math.random() * left.length)];
    setFlash(`${p.r},${p.c}`);
    setHints((h) => h + 1);
    setTimeout(() => setFlash(null), 2200);
  };

  useEffect(() => {
    const up = () => start.current && onUp();
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }); // re-bound each render so onUp always sees the latest selection

  const selSet = new Set(selection.map(([r, c]) => `${r},${c}`));
  const foundCount = Object.keys(found).length;

  return (
    <div className="game-panel play-panel">
      <div className="hud">
        <span className="hud-pill">⏱ {formatTime(elapsed)}</span>
        <span className="hud-pill">🔎 {foundCount}/{puzzle.placed.length} found</span>
        {hints > 0 && <span className="hud-pill hud-warn">Hints −{hints * 40}</span>}
        <span className="hud-spacer" />
        <button className="game-ghost sm" onClick={onQuit}>Quit</button>
      </div>

      <div className="ws-layout">
        <div
          ref={gridRef}
          className={`ws-grid ${bad ? "ws-bad" : ""}`}
          style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, "--n": size }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          role="application"
          aria-label="Word search grid. Drag across letters to select a word."
        >
          {puzzle.grid.map((row, r) =>
            row.map((ch, c) => {
              const k = `${r},${c}`;
              const fc = foundCells[k];
              return (
                <div
                  key={k}
                  className={`ws-cell ${selSet.has(k) ? "ws-sel" : ""} ${fc !== undefined ? `ws-found ws-found-${fc}` : ""} ${flash === k ? "ws-flash" : ""}`}
                >
                  {ch}
                </div>
              );
            })
          )}
        </div>

        <aside className="ws-words" aria-label="Words to find">
          <h3>{level.clues ? "Find the word for each clue" : "Find these words"}</h3>
          <ul>
            {puzzle.placed.map((p) => {
              const isFound = found[p.id] !== undefined;
              return (
                <li key={p.id} className={isFound ? `ws-word-found ws-found-${found[p.id]}` : ""}>
                  {isFound ? "✔ " : ""}
                  {level.clues && !isFound ? <span>{p.clue} <em>({p.letters.length})</em></span> : <span>{p.answer}</span>}
                </li>
              );
            })}
          </ul>
        </aside>
      </div>

      <div className="game-actions">
        <button className="game-ghost" onClick={hint}>💡 Hint (−40)</button>
        <button className="game-start sm" onClick={() => { setDone(true); finishRound(found, hints, false); }}>Give up</button>
      </div>
      {puzzle.skipped > 0 && <p className="game-note">{puzzle.skipped} word(s) did not fit the grid and were left out.</p>}
      {source !== "tests" && <p className="game-note">Some words come from SetuLearn's built-in vocabulary.</p>}
    </div>
  );
}
