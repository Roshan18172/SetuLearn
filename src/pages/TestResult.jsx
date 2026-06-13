import { sampleResult } from "../data/demoData";
import { useNavigate, useLocation } from "react-router-dom";

export default function TestResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { test, result } = location.state || {};
  const r = result || sampleResult;

  return (
    <div className="result-page">
      {/* Completion Banner */}
      <div className="result-banner">
        <div className="result-trophy">🏆</div>
        <h2>Test Completed!</h2>
        <p>Great job! Here's your performance summary.</p>
        <div className="result-test-name">{test?.title || r.testTitle}</div>
      </div>

      <div className="result-body">
        {/* Score Card */}
        <div className="scorecard">
          <div className="sc-circle-wrap">
            <div className="sc-circle">
              <div className="sc-big-score">{r.score}</div>
              <div className="sc-total">/{r.totalMarks}</div>
              <div className="sc-pct">{r.scorePercent}%</div>
            </div>
          </div>

          <div className="sc-details">
            <div className="sc-detail-row">
              <div className="scd-item correct">
                <span className="scd-icon">✅</span>
                <div>
                  <div className="scd-label">Correct Answers</div>
                  <div className="scd-val">{r.correctCount} / {r.totalQuestions}</div>
                </div>
              </div>
              <div className="scd-item incorrect">
                <span className="scd-icon">❌</span>
                <div>
                  <div className="scd-label">Incorrect Answers</div>
                  <div className="scd-val">{r.incorrectCount} / {r.totalQuestions}</div>
                </div>
              </div>
              <div className="scd-item unattempted">
                <span className="scd-icon">⬜</span>
                <div>
                  <div className="scd-label">Unattempted</div>
                  <div className="scd-val">{r.unattempted}</div>
                </div>
              </div>
              <div className="scd-item total">
                <span className="scd-icon">📋</span>
                <div>
                  <div className="scd-label">Total Questions</div>
                  <div className="scd-val">{r.totalQuestions}</div>
                </div>
              </div>
            </div>

            <div className="sc-extra">
              <div className="sce-item">
                <div className="sce-label">Time Taken</div>
                <div className="sce-val">⏱️ {r.timeTaken}</div>
              </div>
              <div className="sce-item">
                <div className="sce-label">Percentile</div>
                <div className="sce-val">📈 {r.percentile}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Summary Table */}
        <div className="result-section">
          <h3 className="rs-title">Section Summary</h3>
          <div className="subject-summary-table">
            <div className="sst-head">
              <span>Section</span>
              <span>Questions</span>
              <span>Attempted</span>
              <span>Correct</span>
              <span>Incorrect</span>
              <span>Score</span>
              <span>Accuracy</span>
            </div>
            {r.subjects.map((s) => (
              <div key={s.name} className="sst-row">
                <span className="sst-name">{s.name}</span>
                <span>{s.questions}</span>
                <span>{s.attempted}</span>
                <span className="green">{s.correct}</span>
                <span className="red">{s.incorrect}</span>
                <span>{s.score}/{s.total}</span>
                <span className={s.accuracy >= 75 ? "green" : s.accuracy >= 60 ? "orange" : "red"}>
                  {s.accuracy}%
                </span>
              </div>
            ))}
            <div className="sst-row sst-total">
              <span className="sst-name">Total</span>
              <span>{r.totalQuestions}</span>
              <span>{r.correctCount + r.incorrectCount}</span>
              <span className="green">{r.correctCount}</span>
              <span className="red">{r.incorrectCount}</span>
              <span>{r.score}/{r.totalMarks}</span>
              <span className="green">{r.scorePercent}%</span>
            </div>
          </div>
        </div>

        {/* Bar Chart – topic breakdown */}
        <div className="result-section">
          <h3 className="rs-title">Topic-wise Performance</h3>
          <div className="topic-bars">
            {r.topicBreakdown.map((t) => (
              <div key={t.topic} className="topic-bar-row">
                <span className="tb-label">{t.topic}</span>
                <div className="tb-track">
                  <div
                    className="tb-fill"
                    style={{
                      width: `${t.score}%`,
                      background: t.score >= 80 ? "#00BFA6" : t.score >= 65 ? "#6C63FF" : "#FF6B6B",
                    }}
                  />
                </div>
                <span className="tb-val">{t.score}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Actions */}
        <div className="result-actions">
          <button className="btn-outline" onClick={() => navigate("/instructions", { test, mode: "timed" })}>
            🔄 Retake Test
          </button>
          <button className="btn-primary" onClick={() => navigate("/analysis", { test, result: r })}>
            📊 View Detailed Analysis
          </button>
          <button className="btn-outline" onClick={() => navigate("/tests")}>
            Browse More Tests
          </button>
        </div>
      </div>
    </div>
  );
}
