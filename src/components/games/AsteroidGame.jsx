import { useEffect, useRef, useState } from "react";
import McqPanel from "./McqPanel";

const MAX_SHIELDS = 3;

/** Asteroid Blaster: answer before the asteroid reaches your ship. Right = laser blast, wrong = damage. */
export default function AsteroidGame({ questions, level, onFinish, onQuit, source }) {
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0); // 0 = top, 1 = hits the ship
  const [phase, setPhase] = useState("fall"); // fall | blast | hit | over
  const [shields, setShields] = useState(MAX_SHIELDS);
  const [score, setScore] = useState(0);
  const [destroyed, setDestroyed] = useState(0);
  const [tried, setTried] = useState([]);
  const [shake, setShake] = useState(false);
  const [note, setNote] = useState("");
  const startRef = useRef(0);
  const state = useRef({});
  const q = questions[idx];

  // fall time shrinks by 4% per destroyed asteroid, never below 55% of the starting time
  const fallSeconds = Math.max(level.fall * 0.55, level.fall * Math.pow(0.96, destroyed));
  state.current = { phase, idx, shields, score, destroyed, fallSeconds };

  const end = (finalScore, shieldsLeft, kills) => {
    setPhase("over");
    onFinish({
      score: finalScore,
      headline: shieldsLeft > 0 ? "Sector cleared!" : "Ship destroyed",
      stats: [
        { label: "Asteroids destroyed", value: kills },
        { label: "Shields left", value: Math.max(0, shieldsLeft) },
      ],
    });
  };

  const nextAsteroid = (nextShields, nextScore, kills) => {
    if (nextShields <= 0 || idx + 1 >= questions.length) {
      setTimeout(() => end(nextScore, nextShields, kills), 700);
      return;
    }
    setTimeout(() => {
      setIdx((i) => i + 1);
      setTried([]);
      setNote("");
      setProgress(0);
      setPhase("fall");
    }, 900);
  };

  // animation loop
  useEffect(() => {
    if (phase !== "fall") return undefined;
    startRef.current = performance.now() - progress * fallSeconds * 1000;
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - startRef.current) / (fallSeconds * 1000));
      setProgress(p);
      if (p >= 1) {
        const st = state.current;
        const left = st.shields - 1;
        setShields(left);
        setPhase("hit");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setNote("💥 The asteroid hit your ship!");
        nextAsteroid(left, st.score, st.destroyed);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, idx]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (i) => {
    if (phase !== "fall" || !q) return;
    if (i === q.correct) {
      const gain = 100 + Math.round((1 - progress) * 100);
      const s = score + gain;
      const kills = destroyed + 1;
      setScore(s); setDestroyed(kills); setPhase("blast");
      setNote(`🎯 Direct hit! +${gain}`);
      nextAsteroid(shields, s, kills);
    } else {
      setTried((t) => [...t, i]);
      const left = shields - 1;
      setShields(left);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      if (left <= 0) {
        setPhase("hit");
        setNote("💥 Wrong! Shields are gone.");
        nextAsteroid(left, score, destroyed);
      } else {
        setNote("✘ Wrong - shield damaged! Try again.");
      }
    }
  };


  if (!q) {
    return <div className="game-panel center-panel"><p>No questions available.</p><button className="game-start" onClick={onQuit}>Back</button></div>;
  }

  const asteroidTop = `${progress * 62}%`;
  return (
    <div className="game-panel play-panel space-panel">
      <div className="hud">
        <span className="hud-pill">⭐ {score}</span>
        <span className="hud-pill" aria-label={`${shields} shields`}>{"🛡️".repeat(Math.max(0, shields))}{"▫️".repeat(MAX_SHIELDS - Math.max(0, shields))}</span>
        <span className="hud-pill">☄️ {destroyed} destroyed</span>
        <span className="hud-spacer" />
        <button className="game-ghost sm" onClick={onQuit}>Quit</button>
      </div>

      <div className={`space-scene ${shake ? "shake" : ""}`} aria-hidden="true">
        <div className="space-stars" />
        {(phase === "fall" || phase === "hit") && (
          <div className={`asteroid ${phase === "hit" ? "boom" : ""}`} style={{ top: asteroidTop }}>
            {phase === "hit" ? "💥" : "☄️"}
          </div>
        )}
        {phase === "blast" && (
          <>
            <div className="laser" />
            <div className="asteroid boom" style={{ top: asteroidTop }}>💥</div>
          </>
        )}
        <div className="ship">🚀</div>
      </div>
      <div className="flash-line" aria-live="polite">{note}</div>

      <McqPanel question={q} locked={phase !== "fall"} hidden={tried} onPick={pick} compact />
      {source !== "tests" && <p className="game-note">Some questions come from SetuLearn's built-in set.</p>}
    </div>
  );
}
