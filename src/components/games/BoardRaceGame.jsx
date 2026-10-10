import { useEffect, useMemo, useRef, useState } from "react";
import { useCountdown } from "../../games/hooks";
import { formatTime } from "../../games/utils";
import McqPanel from "./McqPanel";

const COLS = 5;
const TILES = 25; // 0 = start, 24 = finish
const BONUS = [4, 9, 14, 19];
const TRAPS = [6, 12, 17, 21];

const tilePos = (i) => {
  const row = Math.floor(i / COLS);
  const col = row % 2 === 0 ? i % COLS : COLS - 1 - (i % COLS);
  return { row, col };
};

/** Trivia Map / Board Race: right answers move you along the board; race the computer to the finish. */
export default function BoardRaceGame({ questions, level, options, onFinish, onQuit, source }) {
  const avatar = options.avatar || "🦊";
  const [idx, setIdx] = useState(0);
  const [me, setMe] = useState(0);
  const [bot, setBot] = useState(0);
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [log, setLog] = useState("Answer correctly to move forward!");
  const [correct, setCorrect] = useState(0);
  const [started] = useState(() => Date.now());
  const busy = useRef(false);
  const q = questions[idx];

  const timer = useCountdown(level.seconds, () => settle(null));
  useEffect(() => { if (q) { busy.current = false; timer.restart(); } }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  const apply = (pos, steps) => {
    let p = Math.min(TILES - 1, pos + steps);
    let note = "";
    if (BONUS.includes(p)) { p = Math.min(TILES - 1, p + 2); note = " ⚡ boost +2!"; }
    else if (TRAPS.includes(p)) { p = Math.max(0, p - 2); note = " 🕳️ trap -2!"; }
    return { p, note };
  };

  function settle(choice) {
    if (busy.current || !q) return;
    busy.current = true;
    timer.stop();
    setPicked(choice);
    setRevealed(true);
    const ok = choice === q.correct;
    let myPos = me, botPos = bot, c = correct, text = "";

    if (ok) {
      const steps = timer.fraction > 0.6 ? 3 : 2; // fast answers move further
      const r = apply(me, steps);
      myPos = r.p; c += 1;
      text = `You +${steps}${r.note}`;
    } else {
      text = choice === null ? "Too slow - you stay put." : "Wrong - you stay put.";
    }
    setMe(myPos); setCorrect(c);

    const finishRace = (winner) => {
      const score = myPos * 40 + c * 50 + (winner === "me" ? 500 : 0);
      setTimeout(() => onFinish({
        score,
        headline: winner === "me" ? "You won the race!" : winner === "bot" ? "The bot got there first" : "Photo finish!",
        stats: [
          { label: "Your tile", value: `${myPos}/${TILES - 1}` },
          { label: "Bot's tile", value: `${botPos}/${TILES - 1}` },
          { label: "Correct", value: c },
          { label: "Time", value: formatTime((Date.now() - started) / 1000) },
        ],
      }), 1100);
    };

    if (myPos >= TILES - 1) { setLog(`${text} 🏁 You reached the finish!`); finishRace("me"); return; }

    // the bot's turn
    if (Math.random() < level.botAccuracy) {
      const steps = Math.random() < 0.3 ? 3 : 2;
      const r = apply(bot, steps);
      botPos = r.p;
      text += ` · Bot +${steps}${r.note}`;
    } else {
      text += " · Bot missed.";
    }
    setBot(botPos);
    setLog(text);

    if (botPos >= TILES - 1) { finishRace("bot"); return; }
    if (idx + 1 >= questions.length) { finishRace(myPos > botPos ? "me" : myPos < botPos ? "bot" : "tie"); return; }
    setTimeout(() => { setPicked(null); setRevealed(false); setIdx(idx + 1); }, ok ? 1000 : 1700);
  }

  const tiles = useMemo(() => Array.from({ length: TILES }, (_, i) => ({ i, ...tilePos(i) })), []);
  const place = (i, who) => {
    const { row, col } = tilePos(i);
    const off = who === "me" ? -9 : 9;
    return { left: `calc(${col * 20 + 10}% + ${off}px)`, top: `calc(${(4 - row) * 20 + 10}% )` };
  };

  if (!q) {
    return <div className="game-panel center-panel"><p>No questions available.</p><button className="game-start" onClick={onQuit}>Back</button></div>;
  }

  return (
    <div className="game-panel play-panel">
      <div className="hud">
        <span className="hud-pill">{avatar} tile {me}/{TILES - 1}</span>
        <span className="hud-pill">🤖 tile {bot}/{TILES - 1}</span>
        <span className="hud-pill">Q {idx + 1}</span>
        <span className="hud-spacer" />
        <button className="game-ghost sm" onClick={onQuit}>Quit</button>
      </div>

      <div className="br-layout">
        <div className="br-board" role="img" aria-label={`Board. You are on tile ${me}, the bot on tile ${bot}, finish is tile ${TILES - 1}`}>
          {tiles.map((t) => (
            <div
              key={t.i}
              className={`br-tile ${BONUS.includes(t.i) ? "bonus" : ""} ${TRAPS.includes(t.i) ? "trap" : ""} ${t.i === 0 ? "start" : ""} ${t.i === TILES - 1 ? "finish" : ""}`}
              style={{ left: `${t.col * 20}%`, top: `${(4 - t.row) * 20}%` }}
            >
              <span>{t.i === 0 ? "START" : t.i === TILES - 1 ? "🏁" : BONUS.includes(t.i) ? "⚡" : TRAPS.includes(t.i) ? "🕳️" : t.i}</span>
            </div>
          ))}
          <div className="br-pawn me" style={place(me, "me")}>{avatar}</div>
          <div className="br-pawn bot" style={place(bot, "bot")}>🤖</div>
        </div>

        <div className="br-quiz">
          <div className="timer-bar" aria-hidden="true">
            <div className={`timer-fill ${timer.fraction < 0.3 ? "low" : ""}`} style={{ width: `${timer.fraction * 100}%` }} />
            <span className="timer-text">{Math.ceil(timer.left)}s</span>
          </div>
          <div className="flash-line" aria-live="polite">{log}</div>
          <McqPanel question={q} picked={picked} reveal={revealed} locked={revealed} onPick={settle} compact />
        </div>
      </div>
      <p className="game-note">Answer within 60% of the time for +3 tiles instead of +2. ⚡ boosts you, 🕳️ sets you back.</p>
      {source !== "tests" && <p className="game-note">Some questions come from SetuLearn's built-in set.</p>}
    </div>
  );
}
