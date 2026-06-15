import { useLocation, useNavigate } from "react-router-dom";
import { questionBank } from "../data/demoData";

export default function Solutions() {
  const location = useLocation();
  const navigate = useNavigate();

  const { test } = location.state || {};

  if (!test) {
    return (
      <div className="empty-state">
        <h2>No Solutions Found</h2>

        <button
          className="btn-primary"
          onClick={() => navigate("/tests")}
        >
          Browse Tests
        </button>
      </div>
    );
  }

  const questions = questionBank[test.id] || [];

  document.title = `${test.title} Solutions - TestFlow`;

  return (
    <div className="solution-page">
      {/* Header */}
      <div className="solution-header">
        <button
          className="btn-outline"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <h1>{test.title} - Solutions</h1>
      </div>

      {/* Questions */}
      {questions.map((q, index) => (
        <div
          key={q.id}
          className="solution-card"
        >
          <h3 className="solution-question">
            Q{index + 1}. {q.text}
          </h3>

          <div className="solution-options">
            {q.options.map((opt) => (
              <div
                key={opt.id}
                className={`option-item ${
                  opt.id === q.correct
                    ? "correct-answer"
                    : ""
                }`}
              >
                {opt.text}

                {opt.id === q.correct && (
                  <span className="correct-badge">
                    ✓ Correct Answer
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}