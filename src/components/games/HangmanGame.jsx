import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { shuffle } from "../../games/utils";

const ROUNDS = 6;
const KEYS = "QWERTYUIOPASDFGHJKLZXCVBNM".split("");
const PARTS = 6; // head, body, two arms, two legs

function Gallows({ stage }) {
  const p = (n) => (stage >= n ? "hm-part on" : "hm-part");
  return (
    <svg className="hm-svg" viewBox="0 0 160 190" role="img" aria-label={`Hangman drawing, stage ${stage} of ${PARTS}`}>
      <g className="hm-frame">
        <line x1="20" y1="180" x2="120" y2="180" /><line x1="50" y1="180" x2="50" y2="14" />
        <line x1="50" y1="14" x2="110" y2="14" /><line x1="110" y1="14" x2="110" y2="36" />
      </g>
      <circle className={p(1)} cx="110" cy="50" r="14" />
      <line className={p(2)} x1="110" y1="64" x2="110" y2="112" />
      <line className={p(3)} x1="110" y1="76" x2="92" y2="98" />
      <line className={p(4)} x1="110" y1="76" x2="128" y2="98" />
      <line className={p(5)} x1="110" y1="112" x2="94" y2="142" />
      <line className={p(6)} x1="110" y1="112" x2="126" y2="142" />
    </svg>
  );
}

/** Hangman / Guess the Term: work out the technical term letter by letter from a clue. */
export default function HangmanGame({ terms, level, onFinish, onQuit, source }) {
  const words = useMemo(
    () => shuffle(terms.filter((t) => t.letters.length >= 4 && t.letters.length <= 14)).slice(0, ROUNDS),
    [terms]
  );
  const [idx, setIdx] = useState(0);
  const [guessed, setGuessed] = useState([]);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [hints, setHints] = useState(0);
  const [state, setState] = useState("play"); // play | won | lost
  const advancing = useRef(false);
  const word = words[idx];

  const wrong = word ? guessed.filter((g) => !word.letters.includes(g)) : [];
  const stage = Math.ceil((wrong.length / level.lives) * PARTS);
  const allLetters = word ? [...new Set(word.letters.split(""))] : [];

  const advance = useCallback((s, ok, h) => {
    if (advancing.current) return;
    advancing.current = true;
    setTimeout(() => {
      advancing.current = false;
      if (idx + 1 >= words.length) {
        onFinish({
          score: s,
          headline: ok >= 4 ? "Master of terms!" : "Round complete",
          stats: [{ label: "Terms guessed", value: `${ok}/${words.length}` }, { label: "Hints used", value: h }],
        });
      } else {
        setIdx(idx + 1);
        setGuessed([]);
        setState("play");
      }
    }, 1600);
  }, [idx, words.length, onFinish]);

  const guess = (ch) => {
    if (state !== "play" || !word || guessed.includes(ch)) return;
    const next = [...guessed, ch];
    setGuessed(next);
    const wrongNow = next.filter((g) => !word.letters.includes(g)).length;
    if (allLetters.every((l) => next.includes(l))) {
      const gain = Math.max(20, 100 + (level.lives - wrongNow) * 20);
      const s = score + gain;
      setScore(s); setSolved((n) => n + 1); setState("won");
      advance(s, solved + 1, hints);
    } else if (wrongNow >= level.lives) {
      setState("lost");
      advance(score, solved, hints);
    }
  };

  const hint = () => {
    if (state !== "play") return;
    const left = allLetters.filter((l) => !guessed.includes(l));
    if (left.length <= 1) return; // never reveal the final letter for free
    const ch = left[Math.floor(Math.random() * left.length)];
    setHints((h) => h + 1);
    setScore((s) => Math.max(0, s - 30));
    setGuessed((g) => [...g, ch]);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[a-zA-Z]$/.test(e.key)) guess(e.key.toUpperCase());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!word) {
    return <div className="game-panel center-panel"><p>Not enough suitable terms. Try another subject.</p><button className="game-start" onClick={onQuit}>Back</button></div>;
  }

  const display = word.answer.split("").map((ch, i) => {
    if (!/[A-Za-z]/.test(ch)) return <span key={i} className="hm-gap">{ch === " " ? "\u00a0\u00a0" : ch}</span>;
    const show = guessed.includes(ch.toUpperCase()) || state === "lost";
    return <span key={i} className={`hm-letter ${show ? "on" : ""} ${state === "lost" && !guessed.includes(ch.toUpperCase()) ? "missed" : ""}`}>{show ? ch.toUpperCase() : ""}</span>;
  });

  return (
    <div className="game-panel play-panel">
      <div className="hud">
        <span className="hud-pill">Term {idx + 1}/{words.length}</span>
        <span className="hud-pill">⭐ {score}</span>
        <span className="hud-pill hud-warn">Mistakes {wrong.length}/{level.lives}</span>
        <span className="hud-spacer" />
        <button className="game-ghost sm" onClick={onQuit}>Quit</button>
      </div>

      <div className="hm-layout">
        <Gallows stage={stage} />
        <div className="hm-main">
          <div className="quick-clue"><span className="quick-label">Clue</span>{word.clue}</div>
          <div className="hm-word" aria-label="Word to guess">{display}</div>
          <div className="quick-feedback" aria-live="polite">
            {state === "won" && <span className="fb-good">✔ Yes! It's {word.answer}</span>}
            {state === "lost" && <span className="fb-bad">✘ It was {word.answer}</span>}
          </div>
          <div className="hm-keys">
            {KEYS.map((k) => {
              const used = guessed.includes(k);
              const bad = used && !word.letters.includes(k);
              return (
                <button key={k} type="button" disabled={used || state !== "play"} onClick={() => guess(k)}
                  className={`hm-key ${used ? (bad ? "bad" : "good") : ""}`}>{k}</button>
              );
            })}
          </div>
          <div className="game-actions"><button className="game-ghost" onClick={hint}>💡 Reveal a letter (−30)</button></div>
        </div>
      </div>
      {source !== "tests" && <p className="game-note">Some terms come from SetuLearn's built-in vocabulary.</p>}
    </div>
  );
}
