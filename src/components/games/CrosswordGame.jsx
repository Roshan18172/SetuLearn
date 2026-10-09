import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { generateCrossword } from "../../games/crosswordGenerator";
import { useElapsed } from "../../games/hooks";
import { formatTime, shuffle } from "../../games/utils";

const key = (r, c) => `${r},${c}`;

export default function CrosswordGame({ terms, level, onFinish, onQuit, source }) {
  const puzzle = useMemo(() => {
    const entries = shuffle(terms.filter((t) => t.letters.length >= 4 && t.letters.length <= level.size - 2))
      .slice(0, level.words + 4)
      .map((t, i) => ({ id: i, letters: t.letters, clue: t.clue, answer: t.answer }));
    // generate with a few spare words, then keep what fits
    const cw = generateCrossword(entries, { size: level.size });
    return cw;
  }, [terms, level]);

  const rows = puzzle?.rows ?? 0;
  const cols = puzzle?.cols ?? 0;

  const [values, setValues] = useState(() => Array.from({ length: rows }, () => Array(cols).fill("")));
  const [marks, setMarks] = useState({}); // "r,c" -> "ok" | "bad"
  const [revealed, setRevealed] = useState({}); // "r,c" -> true
  const [penalty, setPenalty] = useState(0);
  const [sel, setSel] = useState(() => {
    const first = puzzle?.entries[0];
    return first ? { r: first.row, c: first.col, dir: first.dir } : { r: 0, c: 0, dir: "across" };
  });
  const [done, setDone] = useState(false);
  const inputRef = useRef(null);
  const elapsed = useElapsed(!done);

  // which entries cover each cell
  const cover = useMemo(() => {
    const map = {};
    (puzzle?.entries || []).forEach((e) => {
      for (let i = 0; i < e.letters.length; i++) {
        const r = e.row + (e.dir === "down" ? i : 0);
        const c = e.col + (e.dir === "across" ? i : 0);
        (map[key(r, c)] ||= {})[e.dir] = e;
      }
    });
    return map;
  }, [puzzle]);

  const activeEntry = cover[key(sel.r, sel.c)]?.[sel.dir] || cover[key(sel.r, sel.c)]?.[sel.dir === "across" ? "down" : "across"];

  const focusInput = () => inputRef.current?.focus({ preventScroll: true });

  const select = (r, c, forceDir) => {
    const cc = cover[key(r, c)];
    if (!cc) return;
    let dir = forceDir || sel.dir;
    if (!forceDir && sel.r === r && sel.c === c) dir = sel.dir === "across" ? "down" : "across"; // tap again = switch
    if (!cc[dir]) dir = dir === "across" ? "down" : "across";
    setSel({ r, c, dir });
    focusInput();
  };

  const selectEntry = (e) => {
    setSel({ r: e.row, c: e.col, dir: e.dir });
    focusInput();
  };

  const move = useCallback((r, c, dir, step) => {
    const nr = r + (dir === "down" ? step : 0);
    const nc = c + (dir === "across" ? step : 0);
    return cover[key(nr, nc)] ? { r: nr, c: nc } : null;
  }, [cover]);

  const setLetter = (r, c, ch) => {
    setValues((v) => v.map((row, ri) => (ri === r ? row.map((x, ci) => (ci === c ? ch : x)) : row)));
    setMarks((m) => {
      if (!m[key(r, c)]) return m;
      const { [key(r, c)]: _gone, ...rest } = m;
      return rest;
    });
  };

  const typeLetter = (ch) => {
    if (revealed[key(sel.r, sel.c)]) {
      const nx = move(sel.r, sel.c, sel.dir, 1);
      if (nx) setSel((s) => ({ ...s, ...nx }));
      return;
    }
    setLetter(sel.r, sel.c, ch);
    const nx = move(sel.r, sel.c, sel.dir, 1);
    if (nx && cover[key(nx.r, nx.c)]?.[sel.dir]) setSel((s) => ({ ...s, ...nx }));
  };

  const backspace = () => {
    if (values[sel.r][sel.c] && !revealed[key(sel.r, sel.c)]) {
      setLetter(sel.r, sel.c, "");
      return;
    }
    const pv = move(sel.r, sel.c, sel.dir, -1);
    if (pv && cover[key(pv.r, pv.c)]?.[sel.dir]) {
      if (!revealed[key(pv.r, pv.c)]) setLetter(pv.r, pv.c, "");
      setSel((s) => ({ ...s, ...pv }));
    }
  };

  const onKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      typeLetter(e.key.toUpperCase());
    } else if (e.key === "Backspace") {
      e.preventDefault();
      backspace();
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setSel((s) => (cover[key(s.r, s.c)]?.[s.dir === "across" ? "down" : "across"] ? { ...s, dir: s.dir === "across" ? "down" : "across" } : s));
    } else if (e.key.startsWith("Arrow")) {
      e.preventDefault();
      const d = { ArrowRight: [0, 1, "across"], ArrowLeft: [0, -1, "across"], ArrowDown: [1, 0, "down"], ArrowUp: [-1, 0, "down"] }[e.key];
      const nr = sel.r + d[0], nc = sel.c + d[1];
      if (cover[key(nr, nc)]) setSel({ r: nr, c: nc, dir: cover[key(nr, nc)][d[2]] ? d[2] : sel.dir });
    }
  };

  // virtual keyboards (Android) report "Unidentified" keys, so letters also arrive through the input event
  const onInput = (e) => {
    const ch = (e.target.value || "").replace(/[^a-zA-Z]/g, "").slice(-1).toUpperCase();
    e.target.value = "";
    if (ch) typeLetter(ch);
  };

  // ----- scoring -----
  const solution = (r, c) => puzzle.cells[r][c].letter;
  const stats = useCallback(() => {
    let correct = 0, filled = 0, total = 0;
    puzzle.cells.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (!cell.letter) return;
        total++;
        if (values[r][c]) filled++;
        if (values[r][c] === cell.letter && !revealed[key(r, c)]) correct++;
      })
    );
    return { correct, filled, total };
  }, [puzzle, values, revealed]);

  const complete = useMemo(() => {
    if (!puzzle) return false;
    return puzzle.cells.every((row, r) => row.every((cell, c) => !cell.letter || values[r][c] === cell.letter));
  }, [puzzle, values]);

  const finish = useCallback(
    (isComplete) => {
      const s = stats();
      const allowance = puzzle.entries.length * 45;
      const bonus = isComplete ? Math.max(0, Math.round(((allowance - elapsed) / allowance) * 300)) : 0;
      const score = Math.max(0, s.correct * 10 - penalty + bonus);
      onFinish({
        score,
        headline: isComplete ? "Crossword complete!" : "Round over",
        stats: [
          { label: "Correct letters", value: `${s.correct}/${s.total}` },
          { label: "Time", value: formatTime(elapsed) },
          { label: "Speed bonus", value: bonus },
          { label: "Hint penalty", value: `-${penalty}` },
        ],
      });
    },
    [stats, puzzle, elapsed, penalty, onFinish]
  );

  // finish automatically once everything is right
  useEffect(() => {
    if (complete && !done) {
      setDone(true);
      const t = setTimeout(() => finish(true), 900);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [complete]); // eslint-disable-line react-hooks/exhaustive-deps

  const check = () => {
    const m = {};
    puzzle.cells.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (cell.letter && values[r][c]) m[key(r, c)] = values[r][c] === cell.letter ? "ok" : "bad";
      })
    );
    setMarks(m);
  };

  const hint = () => {
    const k = key(sel.r, sel.c);
    if (revealed[k] || values[sel.r][sel.c] === solution(sel.r, sel.c)) return;
    setLetter(sel.r, sel.c, solution(sel.r, sel.c));
    setRevealed((x) => ({ ...x, [k]: true }));
    setPenalty((p) => p + 15);
  };

  const revealWord = () => {
    if (!activeEntry) return;
    let cost = 0;
    const newRev = {};
    const vals = values.map((r) => [...r]);
    for (let i = 0; i < activeEntry.letters.length; i++) {
      const r = activeEntry.row + (activeEntry.dir === "down" ? i : 0);
      const c = activeEntry.col + (activeEntry.dir === "across" ? i : 0);
      if (vals[r][c] !== solution(r, c)) {
        vals[r][c] = solution(r, c);
        if (!revealed[key(r, c)]) { newRev[key(r, c)] = true; cost += 5; }
      }
    }
    setValues(vals);
    setRevealed((x) => ({ ...x, ...newRev }));
    setPenalty((p) => p + cost);
  };

  useEffect(() => { focusInput(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!puzzle) {
    return (
      <div className="game-panel center-panel">
        <p>Not enough suitable words to build a crossword. Try another subject.</p>
        <button className="game-start" onClick={onQuit}>Back</button>
      </div>
    );
  }

  const entryFilled = (e) =>
    Array.from({ length: e.letters.length }).every((_, i) => values[e.row + (e.dir === "down" ? i : 0)][e.col + (e.dir === "across" ? i : 0)]);
  const inActive = (r, c) => {
    if (!activeEntry) return false;
    for (let i = 0; i < activeEntry.letters.length; i++) {
      if (activeEntry.row + (activeEntry.dir === "down" ? i : 0) === r && activeEntry.col + (activeEntry.dir === "across" ? i : 0) === c) return true;
    }
    return false;
  };

  const across = puzzle.entries.filter((e) => e.dir === "across");
  const down = puzzle.entries.filter((e) => e.dir === "down");
  const st = stats();

  return (
    <div className="game-panel play-panel" onClick={focusInput}>
      <div className="hud">
        <span className="hud-pill">⏱ {formatTime(elapsed)}</span>
        <span className="hud-pill">✏️ {st.filled}/{st.total} letters</span>
        {penalty > 0 && <span className="hud-pill hud-warn">Hints −{penalty}</span>}
        <span className="hud-spacer" />
        <button className="game-ghost sm" onClick={onQuit}>Quit</button>
      </div>

      {activeEntry && (
        <div className="active-clue" aria-live="polite">
          <strong>{activeEntry.number} {activeEntry.dir === "across" ? "Across" : "Down"}</strong> · {activeEntry.clue}
          <em> ({activeEntry.letters.length} letters)</em>
        </div>
      )}

      <div className="cw-layout">
        <div className="cw-board-wrap">
          <div
            className="cw-board"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, width: `min(100%, ${cols * 46}px)` }}
            role="grid"
            aria-label="Crossword grid"
          >
            {puzzle.cells.map((row, r) =>
              row.map((cell, c) => {
                if (!cell.letter) return <div key={key(r, c)} className="cw-cell cw-block" aria-hidden="true" />;
                const k = key(r, c);
                const isSel = sel.r === r && sel.c === c;
                return (
                  <button
                    key={k}
                    type="button"
                    role="gridcell"
                    className={`cw-cell ${inActive(r, c) ? "cw-active" : ""} ${isSel ? "cw-sel" : ""} ${marks[k] ? `cw-${marks[k]}` : ""} ${revealed[k] ? "cw-revealed" : ""}`}
                    onClick={(e) => { e.stopPropagation(); select(r, c); }}
                    aria-label={`Row ${r + 1} column ${c + 1}${cell.number ? `, clue ${cell.number}` : ""}${values[r][c] ? `, letter ${values[r][c]}` : ", empty"}`}
                  >
                    {cell.number && <span className="cw-num">{cell.number}</span>}
                    <span className="cw-letter">{values[r][c]}</span>
                  </button>
                );
              })
            )}
          </div>
          <input
            ref={inputRef}
            className="cw-hidden-input"
            aria-label="Type your answer"
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            onKeyDown={onKeyDown}
            onInput={onInput}
          />
        </div>

        <div className="cw-clues">
          {[["Across", across], ["Down", down]].map(([label, list]) => (
            <div key={label} className="cw-clue-group">
              <h3>{label}</h3>
              <ul>
                {list.map((e) => (
                  <li key={`${e.dir}${e.number}`}>
                    <button
                      type="button"
                      className={`cw-clue ${activeEntry === e ? "on" : ""} ${entryFilled(e) ? "filled" : ""}`}
                      onClick={(ev) => { ev.stopPropagation(); selectEntry(e); }}
                    >
                      <b>{e.number}.</b> {e.clue} <em>({e.letters.length})</em>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="game-actions">
        <button className="game-ghost" onClick={check}>✔ Check</button>
        <button className="game-ghost" onClick={hint}>💡 Hint (−15)</button>
        <button className="game-ghost" onClick={revealWord}>👁 Reveal word</button>
        <button className="game-start sm" onClick={() => { setDone(true); finish(complete); }}>Finish</button>
      </div>
      {source !== "tests" && <p className="game-note">Some clues come from SetuLearn's built-in vocabulary.</p>}
    </div>
  );
}
