import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import practiceService from "../../api/practiceService";
import { getGame } from "../../games/gamesConfig";
import { loadTerms } from "../../games/terms";
import { loadQuestions } from "../../games/questions";
import { saveScore } from "../../games/utils";
import GameBackdrop from "../../components/games/GameBackdrop";
import CrosswordGame from "../../components/games/CrosswordGame";
import WordSearchGame from "../../components/games/WordSearchGame";
import MatchingGame from "../../components/games/MatchingGame";
import UnscrambleGame from "../../components/games/UnscrambleGame";
import FillBlanksGame from "../../components/games/FillBlanksGame";
import BlitzGame from "../../components/games/BlitzGame";
import SurvivalGame from "../../components/games/SurvivalGame";
import AsteroidGame from "../../components/games/AsteroidGame";
import BoardRaceGame from "../../components/games/BoardRaceGame";
import HangmanGame from "../../components/games/HangmanGame";
import EconomyGame from "../../components/games/EconomyGame";
import LiveBattle from "../../components/games/LiveBattle";
import "../../games/games.css";

const COMPONENTS = {
  crossword: CrosswordGame,
  wordsearch: WordSearchGame,
  matching: MatchingGame,
  unscramble: UnscrambleGame,
  fillblanks: FillBlanksGame,
  blitz: BlitzGame,
  survival: SurvivalGame,
  asteroids: AsteroidGame,
  boardrace: BoardRaceGame,
  hangman: HangmanGame,
  economy: EconomyGame,
  livebattle: LiveBattle,
};

export default function GamePage() {
  const { gameId } = useParams();
  const game = getGame(gameId);

  const [phase, setPhase] = useState("intro"); // intro | loading | playing | result
  const [level, setLevel] = useState("medium");
  const [subjectId, setSubjectId] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [opts, setOpts] = useState({});
  const [data, setData] = useState(null);
  const [result, setResult] = useState(null);
  const [runKey, setRunKey] = useState(0);

  // reset when navigating between games
  useEffect(() => {
    setPhase("intro");
    setResult(null);
    setData(null);
    setOpts(Object.fromEntries((game?.options || []).map((o) => [o.id, o.default])));
    if (game) document.title = `${game.title} - SetuLearn Games`;
    window.scrollTo?.(0, 0);
  }, [gameId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    practiceService
      .getSubjects()
      .then((s) => setSubjects(Array.isArray(s) ? s : s?.subjects || []))
      .catch(() => setSubjects([]));
  }, []);

  const Game = COMPONENTS[gameId];
  // games without a "medium" level (e.g. Live Battle) fall back to their first one
  const levelKey = game?.difficulty[level] ? level : Object.keys(game?.difficulty || {})[0];
  const levelCfg = game?.difficulty[levelKey];
  const glyphs = useMemo(() => game?.glyphs || ["★"], [game]);

  if (!game || !Game) return <Navigate to="/games" replace />;

  const start = async () => {
    setPhase("loading");
    let loaded;
    if (game.data === "live") loaded = { live: true, source: "tests" };
    else if (game.data === "questions") loaded = await loadQuestions({ subjectId: subjectId || undefined, limit: 50, min: 14 });
    else loaded = await loadTerms({ subjectId: subjectId || undefined, min: 16, limit: 100 });
    setData(loaded);
    setRunKey((k) => k + 1);
    setPhase("playing");
  };

  const finish = (res) => {
    const saved = saveScore(game.id, res.score);
    setResult({ ...res, ...saved });
    setPhase("result");
  };

  return (
    <div className={`game-page theme-${game.theme}`}>
      <GameBackdrop glyphs={glyphs} />
      <div className="game-wrap">
        <nav className="game-crumbs" aria-label="Breadcrumb">
          <Link to="/games">← All games</Link>
        </nav>

        {phase === "intro" && (
          <div className="game-panel intro-panel">
            <div className="intro-title">
              <span className="intro-emoji" aria-hidden="true">{game.emoji}</span>
              <div>
                <h1>{game.title}</h1>
                <p>{game.tagline}</p>
              </div>
            </div>

            <div className="intro-cols">
              <section>
                <h2>📖 How to play</h2>
                <ol className="intro-list">
                  {game.howTo.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ol>
              </section>
              <section>
                <h2>📏 Rules &amp; scoring</h2>
                <ul className="intro-list intro-rules">
                  {game.rules.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="intro-setup">
              {Object.keys(game.difficulty).length > 1 && (
              <div className="setup-group">
                <span className="setup-label">Difficulty</span>
                <div className="chips" role="radiogroup" aria-label="Difficulty">
                  {Object.entries(game.difficulty).map(([key, d]) => (
                    <button key={key} type="button" role="radio" aria-checked={levelKey === key}
                      className={`chip ${levelKey === key ? "chip-on" : ""}`} onClick={() => setLevel(key)}>
                      {d.label}
                      <small>{d.note}</small>
                    </button>
                  ))}
                </div>
              </div>
              )}

              {(game.options || []).map((o) => (
                <div className="setup-group" key={o.id}>
                  <span className="setup-label">{o.label}</span>
                  <div className="chips" role="radiogroup" aria-label={o.label}>
                    {o.choices.map((c) => (
                      <button key={c.value} type="button" role="radio" aria-checked={opts[o.id] === c.value}
                        className={`chip ${opts[o.id] === c.value ? "chip-on" : ""}`}
                        onClick={() => setOpts((p) => ({ ...p, [o.id]: c.value }))}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="setup-group">
                <label className="setup-label" htmlFor="game-subject">{game.data === "terms" ? "Words from" : "Questions from"}</label>
                <select id="game-subject" className="game-select" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                  <option value="">All subjects</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="button" className="game-start" onClick={start}>
              Start game ▶
            </button>
          </div>
        )}

        {phase === "loading" && (
          <div className="game-panel center-panel">
            <div className="game-spinner" aria-hidden="true" />
            <p>{game.data === "terms" ? "Picking terms from the mock-test bank…" : "Getting questions from the mock-test bank…"}</p>
          </div>
        )}

        {phase === "playing" && data && (
          <Game
            key={runKey}
            terms={data.terms}
            questions={data.questions}
            subjectId={subjectId || undefined}
            source={data.source}
            level={levelCfg}
            levelKey={levelKey}
            options={opts}
            onFinish={finish}
            onQuit={() => setPhase("intro")}
          />
        )}

        {phase === "result" && result && (
          <div className="game-panel center-panel result-panel">
            <div className="result-emoji" aria-hidden="true">{result.isNewBest ? "🏆" : "🎉"}</div>
            <h1>{result.headline || "Well played!"}</h1>
            <div className="result-score">{result.score}<small> points</small></div>
            {result.isNewBest ? (
              <p className="result-best">New personal best!</p>
            ) : (
              <p className="result-best">Your best: {result.best}</p>
            )}
            <ul className="result-stats">
              {(result.stats || []).map((s) => (
                <li key={s.label}><strong>{s.value}</strong><span>{s.label}</span></li>
              ))}
            </ul>
            <div className="result-actions">
              <button type="button" className="game-start" onClick={start}>Play again ↻</button>
              <button type="button" className="game-ghost" onClick={() => setPhase("intro")}>Change settings</button>
              <Link to="/games" className="game-ghost">More games</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
