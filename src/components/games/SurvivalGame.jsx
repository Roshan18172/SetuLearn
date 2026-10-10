import { useEffect, useRef, useState } from "react";
import { useCountdown } from "../../games/hooks";
import McqPanel from "./McqPanel";

const MAX_LIVES = 3;

/** Survival: three lives, a wrong answer costs one, three right answers in a row win one back. */
export default function SurvivalGame({ questions, level, onFinish, onQuit, source }) {
  const [idx, setIdx] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [note, setNote] = useState("");
  const [heartFx, setHeartFx] = useState("");
  const busy = useRef(false);
  const q = questions[idx];

  const timer = useCountdown(level.seconds, () => settle(null));
  useEffect(() => { if (q) { busy.current = false; timer.restart(); } }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  function settle(choice) {
    if (busy.current || !q) return;
    busy.current = true;
    timer.stop();
    setPicked(choice);
    setRevealed(true);
    const ok = choice === q.correct;
    let l = lives, s = score, c = correct, b = best, st = streak;
    if (ok) {
      st += 1; c += 1; b = Math.max(b, st);
      const gain = 100 + Math.round(timer.fraction * 50) + Math.min(st - 1, 10) * 10;
      s += gain;
      setNote(`+${gain}`);
      if (st % 3 === 0 && l < MAX_LIVES) { l += 1; setHeartFx("gain"); setNote(`+${gain} · ❤️ life regained!`); }
    } else {
      st = 0; l -= 1;
      setHeartFx("lose");
      setNote(choice === null ? "⏰ Too slow! You lost a life." : "✘ Wrong! You lost a life.");
    }
    setStreak(st); setBest(b); setScore(s); setCorrect(c); setLives(l);
    setTimeout(() => {
      setHeartFx("");
      setNote("");
      if (l <= 0 || idx + 1 >= questions.length) {
        onFinish({
          score: s,
          headline: l > 0 ? "You survived every question!" : "Game over",
          stats: [
            { label: "Questions survived", value: c },
            { label: "Best streak", value: b },
            { label: "Lives left", value: Math.max(0, l) },
          ],
        });
      } else {
        setPicked(null);
        setRevealed(false);
        setIdx(idx + 1);
      }
    }, ok ? 900 : 1700);
  }

  if (!q) {
    return <div className="game-panel center-panel"><p>No questions available.</p><button className="game-start" onClick={onQuit}>Back</button></div>;
  }

  return (
    <div className="game-panel play-panel">
      <div className="hud">
        <span className={`hearts ${heartFx}`} aria-label={`${lives} lives left`}>
          {Array.from({ length: MAX_LIVES }, (_, i) => (
            <span key={i} className={i < lives ? "heart on" : "heart off"}>{i < lives ? "❤️" : "🖤"}</span>
          ))}
        </span>
        <span className="hud-pill">⭐ {score}</span>
        <span className={`hud-pill ${streak >= 3 ? "hud-hot" : ""}`}>🔥 {streak}/3 to heal</span>
        <span className="hud-pill">Q {idx + 1}</span>
        <span className="hud-spacer" />
        <button className="game-ghost sm" onClick={onQuit}>Quit</button>
      </div>
      <div className="timer-bar" aria-hidden="true">
        <div className={`timer-fill ${timer.fraction < 0.3 ? "low" : ""}`} style={{ width: `${timer.fraction * 100}%` }} />
        <span className="timer-text">{Math.ceil(timer.left)}s</span>
      </div>
      <div className="flash-line" aria-live="polite">{note}</div>
      <McqPanel question={q} picked={picked} reveal={revealed} locked={revealed} onPick={settle} />
      {source !== "tests" && <p className="game-note">Some questions come from SetuLearn's built-in set.</p>}
    </div>
  );
}
