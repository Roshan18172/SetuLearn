import { GAMES } from "../../games/gamesConfig";
import GameBackdrop from "../../components/games/GameBackdrop";
import GameCard from "../../components/games/GameCard";
import "../../games/games.css";

export default function GamesHub() {
  document.title = "Play a Game - SetuLearn";
  return (
    <div className="game-page theme-hub">
      <GameBackdrop glyphs={["🧩", "🔍", "🃏", "🔤", "✍️", "★"]} count={22} />
      <div className="game-wrap">
        <header className="hub-header">
          <h1>Bored now? <span className="games-title-accent">Play a game</span> 🎮</h1>
          <p>Short, brain-friendly puzzles with terms and clues pulled from SetuLearn mock tests.</p>
        </header>
        <div className="games-grid">
          {GAMES.map((g, i) => (
            <GameCard key={g.id} game={g} index={i} />
          ))}
        </div>
        <p className="hub-note">Your best scores are saved in this browser only.</p>
      </div>
    </div>
  );
}
