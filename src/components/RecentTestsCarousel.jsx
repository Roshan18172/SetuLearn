import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTestHistory } from "../utils/testHistory";
import { ChevronLeft, ChevronRight } from "../data/svgs";

function formatDate(timestamp) {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

function MiniCard({ entry, position, onClick }) {
  if (!entry) return null;
  const accuracyBase = (entry.correct || 0) + (entry.incorrect || 0);
  const accuracy =
    accuracyBase > 0 ? Math.round(((entry.correct || 0) / accuracyBase) * 100) : 0;

  return (
    <button
      className={`rtc-card rtc-card-${position}`}
      onClick={onClick}
      aria-label={`View history for ${entry.testTitle}`}
    >
      <div className="rtc-card-top">
        <span className="rtc-badge">{formatDate(entry.timestamp)}</span>
        <span className="rtc-percent">{entry.percentage}%</span>
      </div>
      <h4 className="rtc-title">{entry.testTitle}</h4>
      {entry.examName && <div className="rtc-exam">{entry.examName}</div>}
      <div className="rtc-score-row">
        <span>
          Score <b>{entry.score}/{entry.totalMarks}</b>
        </span>
        <span>
          Accuracy <b>{accuracy}%</b>
        </span>
      </div>
      <div className="rtc-view-link">View Details →</div>
    </button>
  );
}

export default function RecentTestsCarousel() {
  const navigate = useNavigate();
  const [history] = useState(() => getTestHistory());
  const [centerIndex, setCenterIndex] = useState(0);

  const total = history.length;
  const prevDisabled = total === 0 || centerIndex === 0;
  const nextDisabled = total === 0 || centerIndex >= total - 1;

  const goPrev = () => {
    if (prevDisabled) return;
    setCenterIndex((i) => Math.max(0, i - 1));
  };
  const goNext = () => {
    if (nextDisabled) return;
    setCenterIndex((i) => Math.min(total - 1, i + 1));
  };

  const openEntry = (entry) => {
    if (!entry) return;
    navigate(`/test-history/${entry.id}`);
  };

  /* ── Empty state: no tests attempted yet ─────────────── */
  if (total === 0) {
    return (
      <div className="rtc-wrap rtc-empty">
        <div className="rtc-bg-blob rtc-bg-blob-a" />
        <div className="rtc-bg-blob rtc-bg-blob-b" />
        <div className="start-test-card">
          <div className="start-test-icon"><img src="/icons/rocket.png" alt="Start" height={40} /></div>
          <h3>Take Your First Mock Test</h3>
          <p>
            You haven't attempted any tests on this device yet. Start one now
            and your results will show up right here.
          </p>
          <button className="btn-primary" style={ {margin: "0 auto"}}  onClick={() => navigate("/tests")}>
            Start a Test
          </button>
        </div>
      </div>
    );
  }

  const leftEntry = centerIndex - 1 >= 0 ? history[centerIndex - 1] : null;
  const centerEntry = history[centerIndex];
  const rightEntry = centerIndex + 1 < total ? history[centerIndex + 1] : null;

  return (
    <div className="rtc-wrap">
      <div className="rtc-bg-blob rtc-bg-blob-a" />
      <div className="rtc-bg-blob rtc-bg-blob-b" />

      <div className="rtc-header">
        <span className="rtc-header-label">Your Recent Attempts</span>
        <button className="btn-outline rtc-history-btn" onClick={() => navigate("/test-history")}>
          View All Test History
        </button>
      </div>

      <div className="rtc-stage">
        <button
          className="rtc-nav rtc-nav-left"
          onClick={goPrev}
          disabled={prevDisabled}
          aria-label="Show previous test"
        >
          <ChevronLeft />
        </button>

        <div className="rtc-cards">
          <MiniCard entry={leftEntry} position="left" onClick={() => leftEntry && (setCenterIndex(centerIndex - 1))} />
          <MiniCard entry={centerEntry} position="center" onClick={() => openEntry(centerEntry)} />
          <MiniCard entry={rightEntry} position="right" onClick={() => rightEntry && (setCenterIndex(centerIndex + 1))} />
        </div>

        <button
          className="rtc-nav rtc-nav-right"
          onClick={goNext}
          disabled={nextDisabled}
          aria-label="Show next test"
        >
          <ChevronRight />
        </button>
      </div>

      <div className="rtc-dots">
        {history.slice(0, 8).map((_, i) => (
          <span key={i} className={`rtc-dot ${i === centerIndex ? "active" : ""}`} />
        ))}
      </div>
    </div>
  );
}
