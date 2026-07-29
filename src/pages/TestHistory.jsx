import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import { getTestHistory, clearTestHistory } from "../utils/testHistory";
import { ChevronRight, Trash2 } from "../data/svgs";

function formatDate(timestamp) {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(seconds) {
  const total = Number(seconds) || 0;
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}m ${secs}s`;
}

export default function TestHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState(() => getTestHistory());

  document.title = "Test History - SetuLearn";

  const handleClear = () => {
    if (!window.confirm("Clear all saved test history on this device? This can't be undone.")) {
      return;
    }
    clearTestHistory();
    setHistory([]);
  };

  return (
    <div className="history-page">
      <SEO
        title="Test History"
        description="Review every mock test you've attempted on SetuLearn, with full question-by-question breakdowns of your answers."
        canonical="/test-history"
      />

      <div className="history-header">
        <div>
          <h1>Test History</h1>
          <p className="history-subtitle">
            All the tests you've attempted on this device, most recent first.
          </p>
        </div>
        {history.length > 0 && (
          <button className="btn-outline history-clear-btn" onClick={handleClear}>
            <Trash2 /> <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><img src="/icons/document.png" alt="No data" className="emoji-icon-xl" /></div>
          <h3>No test history yet</h3>
          <p>Complete a mock test and it'll show up here.</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/tests")}>
            Browse Tests
          </button>
        </div>
      ) : (
        <div className="history-list">
          {history.map((entry) => {
            const totalAttempted = (entry.correct || 0) + (entry.incorrect || 0);
            const accuracy =
              totalAttempted > 0 ? Math.round(((entry.correct || 0) / totalAttempted) * 100) : 0;

            return (
              <button
                key={entry.id}
                className="history-card"
                onClick={() => navigate(`/test-history/${entry.id}`)}
              >
                <div className="history-card-main">
                  <div className="history-card-title">{entry.testTitle}</div>
                  <div className="history-card-date">{formatDate(entry.timestamp)}</div>
                </div>

                <div className="history-card-stats">
                  <div className="history-stat">
                    <span className="history-stat-label">Score</span>
                    <span className="history-stat-val">
                      {entry.score} / {entry.totalMarks}
                    </span>
                  </div>
                  <div className="history-stat">
                    <span className="history-stat-label">Percentage</span>
                    <span className="history-stat-val">{entry.percentage}%</span>
                  </div>
                  <div className="history-stat">
                    <span className="history-stat-label">Accuracy</span>
                    <span className="history-stat-val">{accuracy}%</span>
                  </div>
                  <div className="history-stat">
                    <span className="history-stat-label">Correct</span>
                    <span className="history-stat-val green">{entry.correct || 0}</span>
                  </div>
                  <div className="history-stat">
                    <span className="history-stat-label">Incorrect</span>
                    <span className="history-stat-val red">{entry.incorrect || 0}</span>
                  </div>
                  <div className="history-stat">
                    <span className="history-stat-label">Time Taken</span>
                    <span className="history-stat-val">{formatDuration(entry.timeSpentSeconds)}</span>
                  </div>
                </div>

                <div className="history-card-arrow">
                  <ChevronRight />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
