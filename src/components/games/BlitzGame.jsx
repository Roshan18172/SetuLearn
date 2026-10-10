import { useEffect, useRef, useState } from "react";
import { useCountdown } from "../../games/hooks";
import McqPanel from "./McqPanel";

/** Time Attack: a global clock plus a per-question limit that shrinks with every correct answer. */
export default function BlitzGame({ questions, level, onFinish, onQuit, source }) {
  const [idx, setIdx] = useState(0);
  const [perQ, setPerQ] = useState(level.perQ);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [flash, setFlash] = useState("");
  const busy = useRef(false);
  const over = useRef(false);
  const q = questions[idx];

  const finish = (s = score, c = correct, w = wrong, b = best) => {
    if (over.current) return;
    over.current = true;
    clock.stop();
    qTimer.stop();
    onFinish({
      score: s,
      headline: c >= 15 ? "Lightning fast!" : "Time's up!",
      stats: [
        { label: "Correct", value: c },
        { label: "Wrong / missed", value: w },
        { label: "Accuracy", value: c + w ? `${Math.round((c / (c + w)) * 100)}%` : "-" },
        { label: "Best streak", value: b },
      ],
    });
  };

  const clock = useCountdown(level.total, () => finish());
  const qTimer = useCountdown(perQ, () => settle(null));

  useEffect(() => { clock.restart(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (q) qTimer.restart(); }, [idx, perQ]); // eslint-disable-line react-hooks/exhaustive-deps

  function settle(choice) {
    if (busy.current || over.current || !q) return;
    busy.current = true;
    qTimer.stop();
    setPicked(choice);
    const ok = choice === q.correct;
    let s = score, c = correct, w = wrong, b = best;
    if (ok) {
      const st = streak + 1;
      const gain = 100 + Math.round(qTimer.fraction * 100) + Math.min(st - 1, 10) * 10;
      s += gain; c += 1; b = Math.max(b, st);
      setStreak(st); setBest(b); setScore(s); setCorrect(c);
      setPerQ((p) => Math.max(level.minQ, +(p - 0.5).toFixed(1)));
      setFlash(`+${gain}`);
    } else {
      w += 1;
      setStreak(0); setWrong(w);
      clock.adjust(-level.penalty);
      setFlash(choice === null ? `Too slow! -${level.penalty}s` : `Wrong! -${level.penalty}s`);
    }
    setTimeout(() => {
      busy.current = false;
      setPicked(null);
      setFlash("");
      if (idx + 1 >= questions.length) finish(s, c, w, b);
      else setIdx(idx + 1);
    }, ok ? 450 : 1100);
  }

  if (!q) {
    return <div className="game-panel center-panel"><p>No questions available.</p><button className="game-start" onClick={onQuit}>Back</button></div>;
  }

  return (
    <div className="game-panel play-panel">
      <div className="hud">
        <span className={`hud-pill big-clock ${clock.left < 10 ? "hud-hot" : ""}`}>⏱ {Math.ceil(clock.left)}s</span>
        <span className="hud-pill">⭐ {score}</span>
        <span className={`hud-pill ${streak >= 3 ? "hud-hot" : ""}`}>🔥 {streak}</span>
        <span className="hud-pill hud-warn">⚡ {perQ}s per question</span>
        <span className="hud-spacer" />
        <button className="game-ghost sm" onClick={onQuit}>Quit</button>
      </div>
      <div className="timer-bar" aria-hidden="true">
        <div className={`timer-fill ${qTimer.fraction < 0.3 ? "low" : ""}`} style={{ width: `${qTimer.fraction * 100}%` }} />
      </div>
      <div className="flash-line" aria-live="polite">{flash}</div>
      <McqPanel question={q} picked={picked} reveal={flash !== ""} locked={flash !== ""} onPick={settle} />
      {source !== "tests" && <p className="game-note">Some questions come from SetuLearn's built-in set.</p>}
    </div>
  );
}
