import { useNavigate } from "react-router-dom";
import { GAMES } from "../../games/gamesConfig";
import GameCard from "./GameCard";
import "../../games/games.css";

/** Home-page block: "Bored now? Play a game". */
export default function GamesSection() {
  const navigate = useNavigate();
  return (
    <section className="section games-section" aria-labelledby="games-heading">
      <div className="games-section-bg" aria-hidden="true">
        {["A", "?", "★", "Z", "7", "✦", "Q", "♦"].map((g, i) => (
          <span key={i} style={{ left: `${8 + i * 12}%`, animationDelay: `${-i * 2.3}s` }}>{g}</span>
        ))}
      </div>
      <div className="section-header-center">
        <div className="section-eyebrow">Take a break</div>
        <h2 className="section-title" id="games-heading">
          Bored now? <span className="games-title-accent">Play a game</span> 🎮
        </h2>
        <p className="games-section-sub">
          Word puzzles built from real mock-test questions - learn while you play.
        </p>
      </div>
      <div className="games-grid">
        {GAMES.filter((g) => g.featured).map((g, i) => (
          <GameCard key={g.id} game={g} index={i} />
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 22 }}>
        <button type="button" className="games-all-btn" onClick={() => navigate("/games")}>
          See all {GAMES.length} games →
        </button>
      </div>
    </section>
  );
}
