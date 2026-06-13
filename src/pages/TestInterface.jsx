import { useState, useEffect, useCallback } from "react";
import { questionBank, sampleResult } from "../data/demoData";
import { useNavigate, useLocation } from "react-router-dom";

function padTwo(n) {
  return String(n).padStart(2, "0");
}

function formatTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${padTwo(h)}:${padTwo(m)}:${padTwo(s)}`;
}

export default function TestInterface() {
  const navigate = useNavigate();
const location = useLocation();

const { test, mode } = location.state || {};
  const questions = questionBank[test?.id] || questionBank[1];
  const totalSecs = (test?.duration || 30) * 60;

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [timeLeft, setTimeLeft] = useState(totalSecs);
  const [showConfirm, setShowConfirm] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const handleSubmit = useCallback(() => {
  navigate("/result", {
    test,
    result: sampleResult,
    answers,
  });
}, [navigate, test, answers]);

  useEffect(() => {
    if (mode !== "timed") return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, mode, handleSubmit]);

  if (!test) {
    return (
      <div className="empty-state" style={{ padding: "80px 20px" }}>
        <button className="btn-primary" onClick={() => navigate("tests")}>Browse Tests</button>
      </div>
    );
  }

  const q = questions[current];
  const answered = Object.keys(answers).length;
  const markedCount = Object.keys(marked).length;

  const getQStatus = (i) => {
    const qId = questions[i].id;
    if (marked[qId] && answers[qId]) return "marked-answered";
    if (marked[qId]) return "marked";
    if (answers[qId]) return "answered";
    if (i < current) return "visited";
    return "unanswered";
  };

  return (
    <div className="test-interface">
      {/* Top Bar */}
      <div className="ti-topbar">
        <div className="ti-testname">
          <div className="ti-icon">JEE</div>
          <span>{test.title}</span>
        </div>
        <div className="ti-timer-wrap">
          {mode === "timed" ? (
            <div className={`ti-timer ${timeLeft < 300 ? "timer-warn" : ""}`}>
              <span className="timer-label">Time Left</span>
              <span className="timer-value">{formatTime(timeLeft)}</span>
            </div>
          ) : (
            <div className="ti-timer">
              <span className="timer-label">Practice</span>
              <span className="timer-value">∞</span>
            </div>
          )}
        </div>
        <button className="btn-end-test" onClick={() => setShowConfirm(true)}>End Test</button>
      </div>

      <div className="ti-body">
        {/* Question Panel */}
        <div className="ti-main">
          <div className="ti-q-header">
            <div className="ti-q-num">Question {current + 1}</div>
            <button
              className={`mark-review-btn ${marked[q.id] ? "active" : ""}`}
              onClick={() => setMarked((m) => ({ ...m, [q.id]: !m[q.id] }))}
            >
              {marked[q.id] ? "🔖 Marked" : "🏷️ Mark for Review"}
            </button>
          </div>

          <div className="ti-q-topic">Topic: {q.topic}</div>

          <div className="ti-question">{q.text}</div>

          <div className="ti-options">
            {q.options.map((opt, i) => (
              <label
                key={opt.id}
                className={`ti-option ${answers[q.id] === opt.id ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  value={opt.id}
                  checked={answers[q.id] === opt.id}
                  onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt.id }))}
                />
                <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                <span className="opt-text">{opt.text}</span>
              </label>
            ))}
          </div>

          <div className="ti-q-actions">
            <button
              className="btn-outline"
              onClick={() => setAnswers((a) => { const n = { ...a }; delete n[q.id]; return n; })}
            >
              Clear Response
            </button>
          </div>

          <div className="ti-nav">
            <button
              className="btn-outline"
              disabled={current === 0}
              onClick={() => setCurrent((c) => c - 1)}
            >
              ← Previous
            </button>
            {current < questions.length - 1 ? (
              <button className="btn-primary" onClick={() => setCurrent((c) => c + 1)}>
                Next →
              </button>
            ) : (
              <button className="btn-primary" onClick={() => setShowConfirm(true)}>
                Submit Test ✓
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className={`ti-sidebar ${paletteOpen ? "open" : ""}`}>
          <div className="palette-header">
            <span>Questions</span>
            <button className="palette-close" onClick={() => setPaletteOpen(false)}>✕</button>
          </div>

          <div className="palette-legend">
            <span className="pal-dot answered" /> Answered ({answered})
            <span className="pal-dot unanswered" style={{ marginLeft: 12 }} /> Not Answered ({questions.length - answered - markedCount})
            <span className="pal-dot marked" style={{ marginLeft: 12 }} /> Marked ({markedCount})
          </div>

          <div className="palette-grid">
            {questions.map((_, i) => (
              <button
                key={i}
                className={`pal-btn ${getQStatus(i)} ${i === current ? "current" : ""}`}
                onClick={() => { setCurrent(i); setPaletteOpen(false); }}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="palette-summary">
            <div className="ps-row"><span>Total</span><b>{questions.length}</b></div>
            <div className="ps-row"><span>Answered</span><b className="green">{answered}</b></div>
            <div className="ps-row"><span>Not Answered</span><b className="red">{questions.length - answered}</b></div>
            <div className="ps-row"><span>Marked</span><b className="orange">{markedCount}</b></div>
          </div>

          <button className="btn-primary w-full" onClick={() => setShowConfirm(true)}>
            Submit Test
          </button>
        </div>
      </div>

      {/* Mobile palette toggle */}
      <button className="palette-fab" onClick={() => setPaletteOpen(true)}>
        📋 Questions ({answered}/{questions.length})
      </button>

      {/* Confirm Dialog */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Submit Test?</h3>
            <p>You have answered <b>{answered}</b> out of <b>{questions.length}</b> questions.</p>
            {questions.length - answered > 0 && (
              <p className="modal-warn">⚠️ {questions.length - answered} questions are unanswered.</p>
            )}
            <div className="modal-actions">
              <button className="btn-outline" onClick={() => setShowConfirm(false)}>Continue Test</button>
              <button className="btn-primary" onClick={handleSubmit}>Submit Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
