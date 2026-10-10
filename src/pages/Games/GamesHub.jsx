import { CATEGORIES, GAMES } from "../../games/gamesConfig";
import GameBackdrop from "../../components/games/GameBackdrop";
import GameCard from "../../components/games/GameCard";
import "../../games/games.css";

export default function GamesHub() {
  document.title = "Play a Game - SetuLearn";
  return (
    <div className="game-page theme-hub">
      <GameBackdrop glyphs={["🧩", "🔍", "🃏", "⚡", "🚀", "🏁", "🪙", "📡"]} count={22} />
      <div className="game-wrap">
        <header className="hub-header">
          <h1>Bored now? <span className="games-title-accent">Play a game</span> 🎮</h1>
          <p>Short, brain-friendly puzzles with terms and clues pulled from SetuLearn mock tests.</p>
        </header>
        {CATEGORIES.map((cat) => (
          <section key={cat.id} className="hub-category" aria-labelledby={`cat-${cat.id}`}>
            <h2 id={`cat-${cat.id}`}>{cat.title} <small>{cat.blurb}</small></h2>
            <div className="games-grid">
              {GAMES.filter((g) => g.category === cat.id).map((g, i) => (
                <GameCard key={g.id} game={g} index={i} />
              ))}
            </div>
          </section>
        ))}
        <p className="hub-note">Your best scores are saved in this browser only.</p>
      </div>
    </div>
  );
}
