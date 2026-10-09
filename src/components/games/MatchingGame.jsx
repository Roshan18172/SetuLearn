import { useEffect, useMemo, useRef, useState } from "react";
import { PAIR_PACKS } from "../../games/fallbackTerms";
import { useElapsed } from "../../games/hooks";
import { formatTime, pick, shuffle } from "../../games/utils";

function buildPairs(terms, pack, count) {
  let pairs = [];
  let usedBuiltin = false;
  if (pack === "tests") {
    pairs = terms
      .filter((t) => t.clue.length <= 85 && t.answer.length <= 28)
      .map((t) => [t.answer, t.clue]);
    pairs = pick(pairs, count);
    if (pairs.length < count) {
      // top up with built-in "key terms" so the round is always full
      const have = new Set(pairs.map((p) => p[0].toLowerCase()));
      const extra = shuffle(PAIR_PACKS.terms.pairs).filter((p) => !have.has(p[0].toLowerCase()));
      pairs = [...pairs, ...extra.slice(0, count - pairs.length)];
      usedBuiltin = true;
    }
  } else {
    pairs = pick(PAIR_PACKS[pack]?.pairs || PAIR_PACKS.terms.pairs, count);
    usedBuiltin = true;
  }
  return { pairs: pairs.slice(0, count), usedBuiltin };
}

export default function MatchingGame({ terms, level, options, onFinish, onQuit }) {
  const mode = options.mode || "flip";
  const { pairs, usedBuiltin } = useMemo(() => buildPairs(terms, options.pack || "tests", level.pairs), [terms, options.pack, level]);

  const cards = useMemo(
    () => shuffle(pairs.flatMap((p, i) => [{ id: `${i}a`, pair: i, text: p[0], side: "a" }, { id: `${i}b`, pair: i, text: p[1], side: "b" }])),
    [pairs]
  );
  const left = useMemo(() => shuffle(cards.filter((c) => c.side === "a")), [cards]);
  const right = useMemo(() => shuffle(cards.filter((c) => c.side === "b")), [cards]);

  const [flipped, setFlipped] = useState([]); // card ids
  const [matched, setMatched] = useState({}); // pair index -> true
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [picked, setPicked] = useState(null); // link mode: left card id
  const [shake, setShake] = useState(null);
  const [locked, setLocked] = useState(false);
  const [done, setDone] = useState(false);
  const dragId = useRef(null);
  const elapsed = useElapsed(!done);

  const matchedCount = Object.keys(matched).length;

  const finish = (count, miss, allDone) => {
    const allowance = pairs.length * 25;
    const bonus = allDone ? Math.min(300, Math.max(0, Math.round((allowance - elapsed) * 2))) : 0;
    const score = Math.max(0, count * 100 - miss * 15 + bonus);
    onFinish({
      score,
      headline: allDone ? "All pairs matched!" : "Round over",
      stats: [
        { label: "Pairs matched", value: `${count}/${pairs.length}` },
        { label: "Moves", value: moves },
        { label: "Wrong tries", value: miss },
        { label: "Time", value: formatTime(elapsed) },
        { label: "Speed bonus", value: bonus },
      ],
    });
  };

  useEffect(() => {
    if (matchedCount === pairs.length && !done) {
      setDone(true);
      const t = setTimeout(() => finish(matchedCount, mistakes, true), 800);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [matchedCount]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- flip mode ----
  const flip = (card) => {
    if (locked || done || matched[card.pair] || flipped.includes(card.id)) return;
    const next = [...flipped, card.id];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      setLocked(true);
      const [a, b] = next.map((id) => cards.find((c) => c.id === id));
      if (a.pair === b.pair) {
        setTimeout(() => { setMatched((m) => ({ ...m, [a.pair]: true })); setFlipped([]); setLocked(false); }, 450);
      } else {
        setMistakes((m) => m + 1);
        setTimeout(() => { setFlipped([]); setLocked(false); }, 1000);
      }
    }
  };

  // ---- link mode ----
  const tryLink = (leftId, rightCard) => {
    if (done || matched[rightCard.pair]) return;
    const l = cards.find((c) => c.id === leftId);
    if (!l) return;
    setMoves((m) => m + 1);
    if (l.pair === rightCard.pair) {
      setMatched((m) => ({ ...m, [l.pair]: true }));
    } else {
      setMistakes((m) => m + 1);
      setShake(rightCard.id);
      setTimeout(() => setShake(null), 450);
    }
    setPicked(null);
  };

  return (
    <div className="game-panel play-panel">
      <div className="hud">
        <span className="hud-pill">⏱ {formatTime(elapsed)}</span>
        <span className="hud-pill">✅ {matchedCount}/{pairs.length}</span>
        <span className="hud-pill">🎯 {moves} moves</span>
        {mistakes > 0 && <span className="hud-pill hud-warn">Wrong −{mistakes * 15}</span>}
        <span className="hud-spacer" />
        <button className="game-ghost sm" onClick={onQuit}>Quit</button>
      </div>

      {mode === "flip" ? (
        <div className="mp-grid" style={{ "--cols": pairs.length > 8 ? 5 : 4 }}>
          {cards.map((card) => {
            const open = flipped.includes(card.id) || matched[card.pair];
            return (
              <button
                key={card.id}
                type="button"
                className={`mp-card ${open ? "open" : ""} ${matched[card.pair] ? "matched" : ""} ${card.side === "b" ? "def" : ""}`}
                onClick={() => flip(card)}
                aria-label={open ? card.text : "Hidden card"}
              >
                <span className="mp-inner">
                  <span className="mp-face mp-back">❓</span>
                  <span className="mp-face mp-front"><span className="mp-text">{card.text}</span></span>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="link-board">
          <div className="link-col">
            <h3>Terms</h3>
            {left.map((c) => (
              <button
                key={c.id}
                type="button"
                draggable={!matched[c.pair]}
                onDragStart={() => { dragId.current = c.id; setPicked(c.id); }}
                onDragEnd={() => { dragId.current = null; }}
                className={`link-item ${picked === c.id ? "picked" : ""} ${matched[c.pair] ? `linked linked-${c.pair % 6}` : ""}`}
                disabled={!!matched[c.pair]}
                onClick={() => setPicked(picked === c.id ? null : c.id)}
              >
                {c.text}
              </button>
            ))}
          </div>
          <div className="link-mid" aria-hidden="true">⇄</div>
          <div className="link-col">
            <h3>Matches</h3>
            {right.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`link-item ${shake === c.id ? "shake" : ""} ${matched[c.pair] ? `linked linked-${c.pair % 6}` : ""}`}
                disabled={!!matched[c.pair]}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); tryLink(dragId.current || picked, c); }}
                onClick={() => picked && tryLink(picked, c)}
              >
                {c.text}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="game-note">
        {mode === "flip" ? "Tap two cards to flip them." : "Tap a term, then its match - or drag a term onto its match."}
        {usedBuiltin && options.pack === "tests" ? " Some pairs come from SetuLearn's built-in vocabulary." : ""}
      </p>
      <div className="game-actions">
        <button className="game-start sm" onClick={() => { setDone(true); finish(matchedCount, mistakes, false); }}>Give up</button>
      </div>
    </div>
  );
}
