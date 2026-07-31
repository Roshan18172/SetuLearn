import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import eventsService from "../api/eventsService";
import "./EventQuiz.css";

function darken(hex, amount = 0.3) {
  try {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, ((num >> 16) & 0xff) * (1 - amount));
    const g = Math.max(0, ((num >> 8) & 0xff) * (1 - amount));
    const b = Math.max(0, (num & 0xff) * (1 - amount));
    return `rgb(${r | 0}, ${g | 0}, ${b | 0})`;
  } catch {
    return hex;
  }
}

function EventCard({ card, onClick, locked }) {
  return (
    <div
      className={`event-card${locked ? " event-card-locked" : ""}`}
      style={{ "--card-color": card.color, "--card-color-dark": darken(card.color) }}
      onClick={locked ? undefined : onClick}
      role={locked ? undefined : "button"}
      tabIndex={locked ? -1 : 0}
    >
      {card.badge && <span className="event-card-badge">{card.badge}</span>}
      <span className="event-card-emoji">{card.emoji}</span>
      <p className="event-card-name">{card.name}</p>
      <p className="event-card-sub">{card.sub}</p>
      {!locked && <div className="event-card-cta">Take the Quiz →</div>}
    </div>
  );
}

export default function EventQuizCarousel() {
  const navigate = useNavigate();
  const [cards, setCards] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [today, upcoming] = await Promise.all([
          eventsService.getToday(),
          eventsService.getUpcoming(6),
        ]);
        if (cancelled) return;

        const todayCard = {
          id: `today-${today.event.id}`,
          isToday: true,
          emoji: today.event.emoji,
          name: today.event.name,
          sub: today.quizTitle,
          color: today.event.color,
          badge: "Today",
        };

        const upcomingCards = upcoming
          .filter((f) => f.daysAway > 0)
          .map((f) => ({
            id: `upcoming-${f.id}`,
            isToday: false,
            emoji: f.emoji,
            name: f.name,
            sub:
              f.daysAway === 1
                ? "Quiz unlocks tomorrow"
                : `Quiz unlocks in ${f.daysAway} days`,
            color: f.color,
            badge: f.daysAway === 1 ? "Tomorrow" : `${f.daysAway}d`,
          }));

        setCards([todayCard, ...upcomingCards]);
      } catch (err) {
        console.error("[EventQuizCarousel] Failed to load event cards:", err);
        setCards([]);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (cards === null || cards.length === 0) return null;

  return (
    <section className="section event-carousel-section">
      <div className="section-header">
        <div>
          <div className="section-eyebrow">Don't Miss Out</div>
          <h2 className="section-title">Festival &amp; Current Affairs Quizzes</h2>
        </div>
      </div>
      <div className="event-carousel-viewport">
        <div className="event-carousel-track">
          {[...cards, ...cards].map((card, idx) => (
            <EventCard
              key={`${card.id}-${idx}`}
              card={card}
              locked={!card.isToday}
              onClick={() => navigate("/current-affairs-quiz")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
