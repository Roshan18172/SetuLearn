import { useEffect, useRef, useState } from "react";
import { useCountdown } from "../../games/hooks";
import McqPanel from "./McqPanel";

const BOTS = ["Nova", "Bolt", "Pixel"];
const SHOP = [
  { id: "mult", icon: "✖️2", name: "Double cash", cost: 400, desc: "Your next 5 correct answers pay double." },
  { id: "shield", icon: "🛡️", name: "Shield", cost: 250, desc: "Blocks the penalty of your next wrong answer." },
  { id: "time", icon: "⏳", name: "+15 seconds", cost: 300, desc: "Adds 15 seconds to the clock." },
  { id: "freeze", icon: "🧊", name: "Freeze rivals", cost: 500, desc: "Rivals earn nothing for 12 seconds." },
];

/** Quiz Market (Gimkit style): earn coins, spend them on power-ups, finish top of the leaderboard. */
export default function EconomyGame({ questions, level, onFinish, onQuit, source }) {
  const [idx, setIdx] = useState(0);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [mult, setMult] = useState(0); // correct answers left that pay double
  const [shield, setShield] = useState(false);
  const [frozenUntil, setFrozenUntil] = useState(0);
  const [bots, setBots] = useState(() => BOTS.map((name) => ({ name, coins: 0 })));
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [note, setNote] = useState("Earn coins, then spend them in the market →");
  const [correct, setCorrect] = useState(0);
  const [spent, setSpent] = useState(0);
  const busy = useRef(false);
  const over = useRef(false);
  const live = useRef({});
  const q = questions[idx];
  live.current = { coins, bots, correct, spent, frozenUntil };

  const clock = useCountdown(level.total, () => finish());
  useEffect(() => { clock.restart(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function finish() {
    if (over.current) return;
    over.current = true;
    clock.stop();
    const { coins: c, bots: b, correct: ok, spent: sp } = live.current;
    const rank = 1 + b.filter((x) => x.coins > c).length;
    onFinish({
      score: c,
      headline: rank === 1 ? "You won the market!" : `You finished #${rank}`,
      stats: [
        { label: "Final rank", value: `#${rank} of ${b.length + 1}` },
        { label: "Correct answers", value: ok },
        { label: "Coins spent", value: sp },
      ],
    });
  }

  // rivals earn coins every second (unless frozen)
  useEffect(() => {
    const id = setInterval(() => {
      if (over.current || Date.now() < live.current.frozenUntil) return;
      setBots((bs) => bs.map((b, i) => ({ ...b, coins: b.coins + Math.round(level.botRate * (0.5 + Math.random()) * (1 + i * 0.1)) })));
    }, 1000);
    return () => clearInterval(id);
  }, [level.botRate]);

  const frozen = Date.now() < frozenUntil;
  useEffect(() => {
    if (!frozenUntil) return undefined;
    const t = setTimeout(() => setFrozenUntil(0), Math.max(0, frozenUntil - Date.now()) + 50);
    return () => clearTimeout(t);
  }, [frozenUntil]);

  const answer = (choice) => {
    if (busy.current || over.current || !q) return;
    busy.current = true;
    setPicked(choice);
    setRevealed(true);
    if (choice === q.correct) {
      const st = streak + 1;
      const base = 100 + Math.min(st - 1, 10) * 10;
      const gain = base * (mult > 0 ? 2 : 1);
      setCoins((c) => c + gain);
      setStreak(st);
      setCorrect((n) => n + 1);
      if (mult > 0) setMult((m) => m - 1);
      setNote(`+$${gain}${mult > 0 ? " (double cash!)" : ""}`);
    } else if (shield) {
      setShield(false);
      setNote("🛡️ Your shield absorbed the penalty!");
    } else {
      setCoins((c) => Math.max(0, c - 50));
      setStreak(0);
      setNote("✘ Wrong! -$50");
    }
    setTimeout(() => {
      busy.current = false;
      setPicked(null);
      setRevealed(false);
      if (idx + 1 >= questions.length) finish();
      else setIdx(idx + 1);
    }, choice === q.correct ? 650 : 1300);
  };

  const buy = (item) => {
    if (over.current || coins < item.cost) return;
    setCoins((c) => c - item.cost);
    setSpent((s) => s + item.cost);
    if (item.id === "mult") setMult((m) => m + 5);
    if (item.id === "shield") setShield(true);
    if (item.id === "time") clock.adjust(15);
    if (item.id === "freeze") setFrozenUntil(Date.now() + 12000);
    setNote(`Bought ${item.name}!`);
  };

  if (!q) {
    return <div className="game-panel center-panel"><p>No questions available.</p><button className="game-start" onClick={onQuit}>Back</button></div>;
  }

  const board = [{ name: "You", coins, me: true }, ...bots].sort((a, b) => b.coins - a.coins);

  return (
    <div className="game-panel play-panel">
      <div className="hud">
        <span className={`hud-pill big-clock ${clock.left < 10 ? "hud-hot" : ""}`}>⏱ {Math.ceil(clock.left)}s</span>
        <span className="hud-pill coin-pill">🪙 ${coins}</span>
        <span className={`hud-pill ${streak >= 3 ? "hud-hot" : ""}`}>🔥 {streak}</span>
        {mult > 0 && <span className="hud-pill hud-warn">✖️2 × {mult}</span>}
        {shield && <span className="hud-pill hud-warn">🛡️ shield</span>}
        <span className="hud-spacer" />
        <button className="game-ghost sm" onClick={onQuit}>Quit</button>
      </div>

      <div className="eco-layout">
        <div className="eco-main">
          <div className="flash-line" aria-live="polite">{note}</div>
          <McqPanel question={q} picked={picked} reveal={revealed} locked={revealed} onPick={answer} compact />
        </div>

        <aside className="eco-side">
          <h3>🏪 Market</h3>
          <ul className="eco-shop">
            {SHOP.map((it) => (
              <li key={it.id}>
                <button type="button" className="eco-item" disabled={coins < it.cost} onClick={() => buy(it)}>
                  <span className="eco-icon">{it.icon}</span>
                  <span className="eco-info"><b>{it.name}</b><small>{it.desc}</small></span>
                  <span className="eco-cost">${it.cost}</span>
                </button>
              </li>
            ))}
          </ul>
          <h3>🏆 Leaderboard {frozen && <span className="eco-frozen">🧊 rivals frozen</span>}</h3>
          <ol className="eco-board">
            {board.map((b, i) => (
              <li key={b.name} className={b.me ? "me" : ""}><span>{i + 1}. {b.name}</span><b>${b.coins}</b></li>
            ))}
          </ol>
        </aside>
      </div>
      {source !== "tests" && <p className="game-note">Some questions come from SetuLearn's built-in set.</p>}
    </div>
  );
}
