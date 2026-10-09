import { useNavigate } from "react-router-dom";
import { readScores } from "../../games/utils";

/** One game tile, used on the home page and on /games. */
export default function GameCard({ game, index = 0 }) {
  const navigate = useNavigate();
  const best = readScores()[game.id]?.best;

  return (
    <button
      type="button"
      className={`game-card theme-${game.theme}`}
      style={{ animationDelay: `${index * 80}ms` }}
      onClick={() => navigate(`/games/${game.id}`)}
      aria-label={`Play ${game.title}`}
    >
      <span className="game-card-glow" aria-hidden="true" />
      <span className="game-card-emoji" aria-hidden="true">{game.emoji}</span>
      <span className="game-card-title">{game.title}</span>
      <span className="game-card-tagline">{game.tagline}</span>
      <span className="game-card-foot">
        {best ? <span className="game-card-best">🏆 Best {best}</span> : <span className="game-card-best">New!</span>}
        <span className="game-card-play">Play ▶</span>
      </span>
    </button>
  );
}
