import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "../../api/apiErrorHandler";
import * as liveApi from "../../games/liveApi";
import MathContent from "../MathContent";
import QuestionImage from "../QuestionImage";

const SESSION_KEY = "setulearn_live_session_v1";
const SHAPES = ["▲", "◆", "●", "■"];
const readSession = () => { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch { return null; } };
const writeSession = (s) => { try { s ? sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)) : sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ } };

function useTick(ms = 100) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(id); }, [ms]);
  return now;
}

function Leaderboard({ rows, meId }) {
  return (
    <ol className="live-board">
      {rows.map((r) => (
        <li key={r.id} className={r.id === meId ? "me" : ""}><span>{r.rank}. {r.name}</span><b>{r.score}</b></li>
      ))}
    </ol>
  );
}

function Options({ q, onPick, picked, correct, disabled }) {
  return (
    <div className="live-options">
      {q.options.map((o, i) => (
        <button key={i} type="button" disabled={disabled || !onPick}
          className={`live-opt live-opt-${i} ${picked === i ? "picked" : ""} ${correct !== undefined ? (i === correct ? "right" : "dim") : ""}`}
          onClick={() => onPick?.(i)}>
          <span className="live-shape" aria-hidden="true">{SHAPES[i]}</span>
          <span><MathContent text={o} /></span>
        </button>
      ))}
    </div>
  );
}

/** Live Classroom Battle (Kahoot style). One person hosts, everyone else joins with the game PIN. */
export default function LiveBattle({ options, subjectId, onQuit }) {
  const [session, setSession] = useState(() => readSession());
  const [pinInput, setPinInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [lobby, setLobby] = useState(null);
  const [question, setQuestion] = useState(null);
  const [offset, setOffset] = useState(0); // server clock - local clock
  const [progress, setProgress] = useState({ answered: 0, total: 0 });
  const [reveal, setReveal] = useState(null);
  const [finished, setFinished] = useState(null);
  const [myChoice, setMyChoice] = useState(null);
  const sourceRef = useRef(null);
  const now = useTick(100);

  const leave = useCallback(() => {
    sourceRef.current?.close();
    writeSession(null);
    setSession(null);
    setLobby(null); setQuestion(null); setReveal(null); setFinished(null); setMyChoice(null);
  }, []);

  // connect to the room's event stream
  useEffect(() => {
    if (!session) return undefined;
    const es = liveApi.openEvents(session.pin, session.token);
    sourceRef.current = es;
    const on = (name, fn) => es.addEventListener(name, (e) => { try { fn(JSON.parse(e.data)); } catch { /* ignore bad frame */ } });
    on("lobby", (d) => setLobby(d));
    on("question", (d) => {
      setOffset(d.now - Date.now());
      setQuestion(d); setReveal(null); setMyChoice(null); setProgress({ answered: 0, total: 0 });
    });
    on("progress", (d) => setProgress(d));
    on("reveal", (d) => setReveal(d));
    on("finished", (d) => { setFinished(d); setQuestion(null); setReveal(null); });
    on("fatal", (d) => { setError(d.message || "Connection closed"); leave(); });
    return () => es.close();
  }, [session, leave]);

  const run = async (fn) => {
    setBusy(true);
    setError("");
    try { await fn(); } catch (e) { setError(getErrorMessage(e)); } finally { setBusy(false); }
  };

  const host = () =>
    run(async () => {
      const r = await liveApi.createRoom({ ...(subjectId ? { subjectId } : {}), count: Number(options.count) || 10, seconds: Number(options.seconds) || 20 });
      const s = { role: "host", pin: r.pin, token: r.hostToken };
      writeSession(s); setSession(s);
    });

  const join = (e) => {
    e.preventDefault();
    run(async () => {
      const r = await liveApi.joinRoom(pinInput.trim(), nameInput);
      const s = { role: "player", pin: r.pin, token: r.token, playerId: r.playerId, name: r.name };
      writeSession(s); setSession(s);
    });
  };

  const choose = (i) => {
    if (myChoice !== null || !question) return;
    setMyChoice(i);
    liveApi.sendAnswer(session.pin, session.token, question.index, i).catch((e) => setError(getErrorMessage(e)));
  };

  // ------------------------------------------------ entry (no session yet)
  if (!session) {
    return (
      <div className="game-panel center-panel live-entry">
        {options.role === "host" ? (
          <>
            <h2>Host a live battle</h2>
            <p>You get a 6-digit PIN. Students open <b>Games → Live Battle → Join</b> and type it in. You control the pace and see the leaderboard on your screen.</p>
            <p className="live-set">{options.count} questions · {options.seconds}s each</p>
            {error && <div className="live-error">{error}</div>}
            <button className="game-start" disabled={busy} onClick={host}>{busy ? "Creating…" : "Create game"}</button>
          </>
        ) : (
          <>
            <h2>Join a live battle</h2>
            <form onSubmit={join} className="live-form">
              <input className="live-pin-input" inputMode="numeric" pattern="\d{6}" maxLength={6} placeholder="Game PIN" aria-label="Game PIN"
                value={pinInput} onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))} />
              <input className="type-input" maxLength={20} placeholder="Your nickname" aria-label="Your nickname"
                value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
              {error && <div className="live-error">{error}</div>}
              <button type="submit" className="game-start" disabled={busy || pinInput.length !== 6 || !nameInput.trim()}>{busy ? "Joining…" : "Join"}</button>
            </form>
          </>
        )}
        <button type="button" className="game-ghost sm" style={{ marginTop: 14 }} onClick={onQuit}>Back</button>
      </div>
    );
  }

  const isHost = session.role === "host";
  const remaining = question ? Math.max(0, (question.endsAt - (now + offset)) / 1000) : 0;
  const fraction = question ? Math.min(1, remaining / question.seconds) : 0;
  const Header = (
    <div className="hud">
      <span className="hud-pill">PIN <b>{session.pin}</b></span>
      {lobby && <span className="hud-pill">👥 {lobby.players.length}</span>}
      {question && <span className="hud-pill">Q {question.index + 1}/{question.total}</span>}
      <span className="hud-spacer" />
      {isHost && (question || reveal) && !finished && (
        <button className="game-ghost sm" onClick={() => run(() => liveApi.endGame(session.pin, session.token))}>End game</button>
      )}
      <button className="game-ghost sm" onClick={() => { leave(); onQuit(); }}>Leave</button>
    </div>
  );

  // ------------------------------------------------ finished
  if (finished) {
    return (
      <div className="game-panel center-panel live-stage">
        {Header}
        <div className="result-emoji" aria-hidden="true">🏆</div>
        <h1>{isHost ? "Final leaderboard" : finished.you ? `You finished #${finished.you.rank}!` : "Game over"}</h1>
        {!isHost && finished.you && <div className="result-score">{finished.you.score}<small> points</small></div>}
        <Leaderboard rows={finished.leaderboard} meId={session.playerId} />
        <button className="game-start" onClick={() => { leave(); onQuit(); }}>Done</button>
      </div>
    );
  }

  // ------------------------------------------------ lobby
  if (!question && !reveal) {
    return (
      <div className="game-panel center-panel live-stage">
        {Header}
        {isHost ? (
          <>
            <p className="live-hint">Join at <b>{window.location.host}/games/livebattle</b> with PIN</p>
            <div className="live-pin" aria-label={`Game PIN ${session.pin}`}>{session.pin}</div>
            <div className="live-players">
              {(lobby?.players || []).map((p) => <span key={p.id} className="live-chip">{p.name}</span>)}
              {!lobby?.players.length && <em>Waiting for players…</em>}
            </div>
            {error && <div className="live-error">{error}</div>}
            <button className="game-start" disabled={!lobby?.players.length || busy} onClick={() => run(() => liveApi.startGame(session.pin, session.token))}>
              Start game ({lobby?.total || options.count} questions)
            </button>
          </>
        ) : (
          <>
            <div className="result-emoji" aria-hidden="true">🎮</div>
            <h2>You're in, {session.name}!</h2>
            <p>Waiting for the host to start… {lobby ? `${lobby.players.length} player(s) here.` : ""}</p>
          </>
        )}
      </div>
    );
  }

  // ------------------------------------------------ reveal (after each question)
  if (reveal) {
    const q = question;
    const maxCount = Math.max(1, ...reveal.counts);
    return (
      <div className="game-panel play-panel live-stage">
        {Header}
        {!isHost && reveal.you && (
          <div className={`live-verdict ${reveal.you.correct ? "good" : "bad"}`}>
            {reveal.you.answered ? (reveal.you.correct ? `✔ Correct! +${reveal.you.points}` : "✘ Not this time") : "⏰ No answer"}
            <small>Rank #{reveal.you.rank} · {reveal.you.score} pts{reveal.you.streak > 1 ? ` · 🔥 ${reveal.you.streak}` : ""}</small>
          </div>
        )}
        {q && (
          <div className="live-bars">
            {q.options.map((o, i) => (
              <div key={i} className={`live-bar live-opt-${i} ${i === reveal.correct ? "right" : "dim"}`}>
                <div className="live-bar-fill" style={{ height: `${(reveal.counts[i] / maxCount) * 100}%` }} />
                <span className="live-bar-count">{reveal.counts[i]}</span>
                <span className="live-bar-label">{SHAPES[i]} <MathContent text={o} /></span>
              </div>
            ))}
          </div>
        )}
        <h3>Leaderboard</h3>
        <Leaderboard rows={reveal.leaderboard} meId={session.playerId} />
        {isHost ? (
          <button className="game-start" onClick={() => run(() => liveApi.nextStep(session.pin, session.token))}>
            {reveal.last ? "Show final results" : "Next question ▶"}
          </button>
        ) : (
          <p className="game-note">{reveal.last ? "Final results coming up…" : "Next question starting soon…"}</p>
        )}
      </div>
    );
  }

  // ------------------------------------------------ question
  return (
    <div className="game-panel play-panel live-stage">
      {Header}
      <div className="timer-bar" aria-hidden="true">
        <div className={`timer-fill ${fraction < 0.25 ? "low" : ""}`} style={{ width: `${fraction * 100}%` }} />
        <span className="timer-text">{Math.ceil(remaining)}s</span>
      </div>
      <div className="mcq-question live-question">
        <MathContent text={question.text} />
        <QuestionImage src={question.imageUrl} alt="Question figure" maxHeight={200} />
      </div>
      {isHost ? (
        <>
          <Options q={question} />
          <div className="live-host-bar">
            <span className="hud-pill">✍️ {progress.answered}/{progress.total || lobby?.players.length || 0} answered</span>
            <button className="game-ghost" onClick={() => run(() => liveApi.nextStep(session.pin, session.token))}>Skip to results</button>
          </div>
        </>
      ) : myChoice === null ? (
        <Options q={question} onPick={choose} />
      ) : (
        <div className="live-locked"><div className="game-spinner" aria-hidden="true" /><p>Answer locked in! Waiting for everyone…</p></div>
      )}
      {error && <div className="live-error">{error}</div>}
    </div>
  );
}
