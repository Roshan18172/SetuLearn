import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCountdown } from "../../games/hooks";
import { scrambleLetters, shuffle } from "../../games/utils";

const ROUNDS = 10;

export default function UnscrambleGame({ terms, level, onFinish, onQuit, source }) {
  const rounds = useMemo(
    () =>
      shuffle(terms.filter((t) => t.letters.length >= 4 && t.letters.length <= 12))
        .slice(0, ROUNDS)
        .map((t) => ({ ...t, scrambled: scrambleLetters(t.letters) })),
    [terms]
  );

  const [idx, setIdx] = useState(0);
  // the empty boxes exist from the very first render (no frame without them)
  const [slots, setSlots] = useState(() => Array(rounds[0]?.letters.length || 0).fill(null)); // tile index or null, per letter
  const [locked, setLocked] = useState([]); // hint-locked slots
  const [state, setState] = useState("play"); // play | right | wrong-time | skipped
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [hints, setHints] = useState(0);
  const [gain, setGain] = useState(0);
  const round = rounds[idx];
  const timer = useCountdown(level.seconds, () => onTimeUp());
  const advancing = useRef(false);

  const tiles = useMemo(() => (round ? round.scrambled.split("") : []), [round]);

  const begin = useCallback(() => {
    advancing.current = false;
    setSlots(Array(rounds[idx]?.letters.length || 0).fill(null));
    setLocked([]);
    setState("play");
    timer.restart();
  }, [idx, rounds]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (round) begin(); }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  const finishGame = useCallback((finalScore, ok, best, usedHints) => {
    timer.stop();
    onFinish({
      score: finalScore,
      headline: ok >= rounds.length * 0.7 ? "Word wizard!" : "Round complete",
      stats: [
        { label: "Solved", value: `${ok}/${rounds.length}` },
        { label: "Best streak", value: best },
        { label: "Hints used", value: usedHints },
      ],
    });
  }, [rounds.length, onFinish]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = (finalScore, ok, best, usedHints, delay) => {
    if (advancing.current) return;
    advancing.current = true;
    timer.stop();
    setTimeout(() => {
      if (idx + 1 >= rounds.length) finishGame(finalScore, ok, best, usedHints);
      else setIdx(idx + 1);
    }, delay);
  };

  function onTimeUp() {
    if (state !== "play" || advancing.current) return;
    setState("wrong-time");
    setStreak(0);
    next(score, correct, bestStreak, hints, 1700);
  }

  const used = new Set(slots.filter((s) => s !== null));
  const placed = slots.map((s) => (s === null ? "" : tiles[s]));

  const checkFull = (nextSlots) => {
    if (nextSlots.some((s) => s === null)) return;
    const guess = nextSlots.map((s) => tiles[s]).join("");
    if (guess === round.letters) {
      const speed = Math.round(timer.fraction * 100);
      const newStreak = streak + 1;
      const earned = 100 + speed + (newStreak - 1) * 20;
      const newScore = score + earned;
      const newBest = Math.max(bestStreak, newStreak);
      setGain(earned);
      setScore(newScore);
      setStreak(newStreak);
      setBestStreak(newBest);
      setCorrect((c) => c + 1);
      setState("right");
      next(newScore, correct + 1, newBest, hints, 1100);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 450);
    }
  };

  const addTile = (t) => {
    if (state !== "play" || used.has(t)) return;
    const i = slots.indexOf(null);
    if (i < 0) return;
    const nextSlots = slots.map((s, k) => (k === i ? t : s));
    setSlots(nextSlots);
    checkFull(nextSlots);
  };

  const removeSlot = (i) => {
    if (state !== "play" || locked.includes(i) || slots[i] === null) return;
    setSlots(slots.map((s, k) => (k === i ? null : s)));
  };

  const backspace = () => {
    for (let i = slots.length - 1; i >= 0; i--) {
      if (slots[i] !== null && !locked.includes(i)) { removeSlot(i); return; }
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[a-zA-Z]$/.test(e.key)) {
        const ch = e.key.toUpperCase();
        const t = tiles.findIndex((x, k) => x === ch && !used.has(k));
        if (t >= 0) { e.preventDefault(); addTile(t); }
      } else if (e.key === "Backspace") {
        e.preventDefault();
        backspace();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const hint = () => {
    if (state !== "play") return;
    // keep only hint-locked letters, then lock in the next correct letter
    const base = slots.map((s, k) => (locked.includes(k) ? s : null));
    const usedBase = new Set(base.filter((s) => s !== null));
    const firstFree = base.indexOf(null);
    if (firstFree < 0) return;
    const tileIdx = tiles.findIndex((x, k) => x === round.letters[firstFree] && !usedBase.has(k));
    if (tileIdx < 0) return;
    base[firstFree] = tileIdx;
    setSlots(base);
    setLocked([...locked, firstFree]);
    setHints((h) => h + 1);
    setScore((s) => Math.max(0, s - 30));
    checkFull(base);
  };

  const skip = () => {
    if (state !== "play") return;
    setStreak(0);
    setState("skipped");
    next(score, correct, bestStreak, hints, 1400);
  };

  if (!round) {
    return (
      <div className="game-panel center-panel">
        <p>Not enough suitable words. Try another subject.</p>
        <button className="game-start" onClick={onQuit}>Back</button>
      </div>
    );
  }

  // render word breaks like the original answer ("New Delhi" -> 3 + 5 slots)
  let letterPos = 0;
  const words = round.answer.split(" ").map((w) => {
    const len = w.replace(/[^A-Za-z]/g, "").length;
    const slotsForWord = Array.from({ length: len }, (_, k) => letterPos + k);
    letterPos += len;
    return slotsForWord;
  });

  return (
    <div className="game-panel play-panel quick-panel">
      <div className="hud">
        <span className="hud-pill">Word {idx + 1}/{rounds.length}</span>
        <span className="hud-pill">⭐ {score}</span>
        <span className={`hud-pill ${streak >= 3 ? "hud-hot" : ""}`}>🔥 {streak}</span>
        <span className="hud-spacer" />
        <button className="game-ghost sm" onClick={onQuit}>Quit</button>
      </div>

      <div className="timer-bar" role="progressbar" aria-valuemin={0} aria-valuemax={level.seconds} aria-valuenow={Math.ceil(timer.left)}>
        <div className={`timer-fill ${timer.fraction < 0.25 ? "low" : ""}`} style={{ width: `${timer.fraction * 100}%` }} />
        <span className="timer-text">{Math.ceil(timer.left)}s</span>
      </div>

      <div className="quick-clue">
        <span className="quick-label">Clue</span>
        {round.clue}
      </div>

      <div className={`slot-row ${shake ? "shake" : ""} ${state === "right" ? "slot-right" : ""}`}>
        {words.map((ws, wi) => (
          <div className="slot-word" key={wi}>
            {ws.map((i) => (
              <button
                key={i}
                type="button"
                className={`slot ${placed[i] ? "filled" : ""} ${locked.includes(i) ? "locked" : ""} ${state === "wrong-time" || state === "skipped" ? "reveal" : ""}`}
                onClick={() => removeSlot(i)}
                aria-label={placed[i] ? `Letter ${placed[i]}, tap to remove` : "Empty box"}
              >
                {state === "wrong-time" || state === "skipped" ? round.letters[i] : placed[i]}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="tile-row">
        {tiles.map((t, i) => (
          <button key={i} type="button" className={`tile ${used.has(i) ? "used" : ""}`} disabled={used.has(i) || state !== "play"} onClick={() => addTile(i)}>
            {t}
          </button>
        ))}
      </div>

      <div className="quick-feedback" aria-live="polite">
        {state === "right" && <span className="fb-good">✔ Correct! +{gain}</span>}
        {state === "wrong-time" && <span className="fb-bad">⏰ Time's up - it was {round.answer}</span>}
        {state === "skipped" && <span className="fb-bad">Skipped - it was {round.answer}</span>}
      </div>

      <div className="game-actions">
        <button className="game-ghost" onClick={backspace}>⌫ Undo</button>
        <button className="game-ghost" onClick={hint}>💡 Hint (−30)</button>
        <button className="game-ghost" onClick={skip}>⏭ Skip</button>
      </div>
      {source !== "tests" && <p className="game-note">Some words come from SetuLearn's built-in vocabulary.</p>}
    </div>
  );
}
