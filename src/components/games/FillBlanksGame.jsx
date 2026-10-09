import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCountdown } from "../../games/hooks";
import { shuffle } from "../../games/utils";

const ROUNDS = 10;
const letters = (s) => s.toUpperCase().replace(/[^A-Z]/g, "");

/** "Oxygen" -> "O _ _ G _ N" (first letter always shown, `reveal` = share of the other letters shown) */
function maskAnswer(answer, reveal) {
  const chars = answer.split("");
  const idxs = chars.map((c, i) => (/[A-Za-z]/.test(c) ? i : -1)).filter((i) => i >= 0);
  const shown = new Set([idxs[0]]);
  const extra = Math.floor((idxs.length - 1) * reveal);
  shuffle(idxs.slice(1)).slice(0, extra).forEach((i) => shown.add(i));
  return chars.map((c, i) => (!/[A-Za-z]/.test(c) ? c : shown.has(i) ? c : "_")).join(" ").replace(/ {2,}/g, "   ");
}

export default function FillBlanksGame({ terms, level, onFinish, onQuit, source }) {
  const rounds = useMemo(() => {
    const pool = terms.filter((t) => t.letters.length >= 3 && t.letters.length <= 16);
    return shuffle(pool)
      .slice(0, ROUNDS)
      .map((t) => {
        const others = shuffle(pool.filter((o) => o.letters !== t.letters));
        // distractors of a similar length look like real alternatives
        const similar = others.sort((a, b) => Math.abs(a.letters.length - t.letters.length) - Math.abs(b.letters.length - t.letters.length)).slice(0, 8);
        const choices = shuffle([t.answer, ...shuffle(similar).slice(0, 3).map((o) => o.answer)]);
        return { ...t, choices, mask: maskAnswer(t.answer, level.reveal ?? 0) };
      });
  }, [terms, level]);

  const [idx, setIdx] = useState(0);
  const [state, setState] = useState("play"); // play | right | wrong | time
  const [typed, setTyped] = useState("");
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [gain, setGain] = useState(0);
  const inputRef = useRef(null);
  const advancing = useRef(false);
  const round = rounds[idx];
  const timer = useCountdown(level.seconds, () => resolve(null, true));

  useEffect(() => {
    if (!round) return;
    advancing.current = false;
    setState("play");
    setTyped("");
    setPicked(null);
    timer.restart();
    if (level.mode === "type") setTimeout(() => inputRef.current?.focus(), 50);
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  const finishGame = useCallback((s, ok, best) => {
    timer.stop();
    onFinish({
      score: s,
      headline: ok >= rounds.length * 0.7 ? "Concept champion!" : "Round complete",
      stats: [
        { label: "Correct", value: `${ok}/${rounds.length}` },
        { label: "Best streak", value: best },
      ],
    });
  }, [rounds.length, onFinish]); // eslint-disable-line react-hooks/exhaustive-deps

  function resolve(answer, timedOut = false) {
    if (advancing.current || !round) return;
    advancing.current = true;
    timer.stop();
    const isRight = !timedOut && letters(answer || "") === round.letters;
    let s = score, ok = correct, best = bestStreak;
    if (isRight) {
      const newStreak = streak + 1;
      const earned = 100 + Math.round(timer.fraction * 100) + (newStreak - 1) * 20;
      s += earned; ok += 1; best = Math.max(best, newStreak);
      setGain(earned); setStreak(newStreak); setBestStreak(best); setScore(s); setCorrect(ok);
      setState("right");
    } else {
      setStreak(0);
      setState(timedOut ? "time" : "wrong");
    }
    setTimeout(() => {
      if (idx + 1 >= rounds.length) finishGame(s, ok, best);
      else setIdx(idx + 1);
    }, isRight ? 1000 : 1900);
  }

  if (!round) {
    return (
      <div className="game-panel center-panel">
        <p>Not enough suitable terms. Try another subject.</p>
        <button className="game-start" onClick={onQuit}>Back</button>
      </div>
    );
  }

  const locked = state !== "play";

  return (
    <div className="game-panel play-panel quick-panel">
      <div className="hud">
        <span className="hud-pill">Question {idx + 1}/{rounds.length}</span>
        <span className="hud-pill">⭐ {score}</span>
        <span className={`hud-pill ${streak >= 3 ? "hud-hot" : ""}`}>🔥 {streak}</span>
        <span className="hud-spacer" />
        <button className="game-ghost sm" onClick={onQuit}>Quit</button>
      </div>

      <div className="timer-bar" role="progressbar" aria-valuemin={0} aria-valuemax={level.seconds} aria-valuenow={Math.ceil(timer.left)}>
        <div className={`timer-fill ${timer.fraction < 0.25 ? "low" : ""}`} style={{ width: `${timer.fraction * 100}%` }} />
        <span className="timer-text">{Math.ceil(timer.left)}s</span>
      </div>

      <div className="quick-clue big">
        <span className="quick-label">Complete the concept</span>
        {round.clue}
      </div>

      <div className="blank-line" aria-label="Missing word">
        {locked ? <span className={state === "right" ? "fb-good" : "fb-bad"}>{round.answer}</span> : level.mode === "type" ? round.mask : "_ _ _ _ _ _ _"}
      </div>

      {level.mode === "choice" ? (
        <div className="choice-grid">
          {round.choices.map((c) => {
            const isAnswer = letters(c) === round.letters;
            return (
              <button
                key={c}
                type="button"
                disabled={locked}
                className={`choice ${locked && isAnswer ? "choice-right" : ""} ${locked && picked === c && !isAnswer ? "choice-wrong" : ""}`}
                onClick={() => { setPicked(c); resolve(c); }}
              >
                {c}
              </button>
            );
          })}
        </div>
      ) : (
        <form className="type-form" onSubmit={(e) => { e.preventDefault(); if (typed.trim()) resolve(typed); }}>
          <input
            ref={inputRef}
            className="type-input"
            value={typed}
            disabled={locked}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Type the missing word"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Your answer"
          />
          <button type="submit" className="game-start sm" disabled={locked || !typed.trim()}>Check</button>
        </form>
      )}

      <div className="quick-feedback" aria-live="polite">
        {state === "right" && <span className="fb-good">✔ Correct! +{gain}</span>}
        {state === "wrong" && <span className="fb-bad">✘ Not quite - it was {round.answer}</span>}
        {state === "time" && <span className="fb-bad">⏰ Time's up - it was {round.answer}</span>}
      </div>
      {source !== "tests" && <p className="game-note">Some terms come from SetuLearn's built-in vocabulary.</p>}
    </div>
  );
}
