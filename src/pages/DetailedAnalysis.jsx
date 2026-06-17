import { useState } from "react";
import { questionBank } from "../data/demoData";
import { useNavigate, useLocation } from "react-router-dom";

const tabs = ["Overview", "Question Analysis", "Subject Analysis", "Time Analysis", "Compare"];

export default function DetailedAnalysis() {
  document.title = "Detailed Analysis - SetuLearn";
  const navigate = useNavigate();
  const location = useLocation();
  const {
    test,
    result,
    answers = {},
  } = location.state || {};
  const r = result;
  const [tab, setTab] = useState("Overview");
  const questions = questionBank[test?.id] || questionBank[1];
  const compareData = [
    {
      metric: "Score",
      you: `${r.score}/${r.totalMarks}`,
      avg: "185/300",
      top: "268/300",
    },
    {
      metric: "Accuracy",
      you: `${r.scorePercent}%`,
      avg: "62%",
      top: "89%",
    },
    {
      metric: "Percentile",
      you: r.percentile,
      avg: "50",
      top: "90+",
    },

    // Dynamic Subject Scores
    ...r.subjects.map((subject) => ({
      metric: `${subject.name} Score`,
      you: `${subject.score}/${subject.total}`,
      avg: `${Math.floor(subject.total * 0.6)}/${subject.total}`,
      top: `${Math.floor(subject.total * 0.9)}/${subject.total}`,
    })),
  ];

  return (
    <div className="analysis-page">
      <div className="analysis-header">
        <div className="ah-left">
          <button className="back-btn" onClick={() =>
            navigate("/result", {
              state: {
                test,
                result: r,
                answers,
              },
            })
          }>← Back</button>
          <h2>{test?.title || r.testTitle}</h2>
        </div>
        <button className="btn-outline download-btn">⬇ Download Report</button>
      </div>

      {/* Tabs */}
      <div className="analysis-tabs">
        {tabs.map((t) => (
          <button key={t} className={`analysis-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)} >
            {t}
          </button>
        ))}
      </div>

      <div className="analysis-body">
        {tab === "Overview" && (
          <div className="analysis-overview">
            <div className="ao-charts">
              {/* Bar chart */}
              <div className="ao-chart-card">
                <h4>Performance Overview</h4>
                <div className="perf-bars">
                  {[
                    { label: "Score (%)", val: r.scorePercent },
                    { label: "Accuracy (%)", val: r.scorePercent },
                    { label: "Percentile", val: r.percentile },
                  ].map((b) => (
                    <div key={b.label} className="perf-bar-col">
                      <div className="pbc-track">
                        <div className="pbc-fill" style={{ height: `${b.val}%` }} />
                        <span className="pbc-val">{b.val}</span>
                      </div>
                      <span className="pbc-label">{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Donut / pie */}
              <div className="ao-chart-card">
                <h4>Accuracy</h4>
                <div className="donut-wrap">
                  <svg viewBox="0 0 120 120" className="donut-svg">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#eee" strokeWidth="16" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#6C63FF" strokeWidth="16"
                      strokeDasharray={`${r.scorePercent * 3.14} ${(100 - r.scorePercent) * 3.14}`}
                      strokeDashoffset="78.5" strokeLinecap="round"
                    />
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#FF6B6B" strokeWidth="16"
                      strokeDasharray={`${(r.incorrectCount / r.totalQuestions) * 100 * 3.14} 999`}
                      strokeDashoffset={`${78.5 - r.scorePercent * 3.14}`}
                    />
                  </svg>
                  <div className="donut-center">{r.scorePercent}%</div>
                </div>
                <div className="donut-legend">
                  <span><span className="dl-dot" style={{ background: "#6C63FF" }} /> Correct ({r.correctCount})</span>
                  <span><span className="dl-dot" style={{ background: "#FF6B6B" }} /> Incorrect ({r.incorrectCount})</span>
                  <span><span className="dl-dot" style={{ background: "#eee" }} /> Unattempted ({r.unattempted})</span>
                </div>
              </div>
            </div>

            {/* Subject table */}
            <div className="ao-section">
              <h4>Section Summary</h4>
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
              </div>
            </div>
          </div>
        )}

        {tab === "Question Analysis" && (
          <div className="qa-section">
            <h4>Question-wise Analysis</h4>

            <div className="qa-table">
              <div className="qat-head">
                <span>#</span>
                <span>Question</span>
                <span>Topic</span>
                <span>Your Answer</span>
                <span>Correct Answer</span>
                <span>Status</span>
              </div>

              {questions.map((q, i) => {
                const userAnswer = answers[q.id];
                const attempted = !!userAnswer;
                const isCorrect = userAnswer === q.correct;

                const userOption =
                  q.options.find(
                    (o) => o.id === userAnswer
                  );

                const correctOption =
                  q.options.find(
                    (o) => o.id === q.correct
                  );

                return (
                  <div key={q.id}
                    className={`qat-row ${isCorrect
                      ? "correct-row"
                      : attempted
                        ? "incorrect-row"
                        : "unattempted-row"
                      }`}
                  >
                    <span>{i + 1}</span>

                    <span className="qat-q">
                      {q.text.length > 60
                        ? q.text.substring(0, 60) + "..."
                        : q.text}
                    </span>

                    <span className="qat-topic"> {q.topic} </span>

                    <span>
                      {userOption
                        ? userOption.text
                        : "Not Attempted"}
                    </span>

                    <span> {correctOption?.text} </span>

                    <span
                      className={`status-badge ${isCorrect
                        ? "correct"
                        : attempted
                          ? "incorrect"
                          : "unattempted"
                        }`}
                    >
                      {isCorrect
                        ? "✅ Correct"
                        : attempted
                          ? "❌ Wrong"
                          : "⚪ Skipped"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {tab === "Subject Analysis" && (
          <div className="subject-analysis">
            {r.subjects.map((s) => (
              <div key={s.name} className="sa-card">
                <div className="sa-header">
                  <h4>{s.name}</h4>
                  <span className={`sa-acc ${s.accuracy >= 75 ? "green" : s.accuracy >= 60 ? "orange" : "red"}`}>
                    {s.accuracy}% Accuracy
                  </span>
                </div>
                <div className="sa-stats">
                  <div className="sa-stat"><div className="sa-stat-val">{s.correct}</div><div className="sa-stat-lbl">Correct</div></div>
                  <div className="sa-stat"><div className="sa-stat-val red">{s.incorrect}</div><div className="sa-stat-lbl">Incorrect</div></div>
                  <div className="sa-stat"><div className="sa-stat-val">{s.attempted}</div><div className="sa-stat-lbl">Attempted</div></div>
                  <div className="sa-stat"><div className="sa-stat-val">{s.score}/{s.total}</div><div className="sa-stat-lbl">Score</div></div>
                </div>
                <div className="sa-bar-track">
                  <div className="sa-bar-fill correct-fill" style={{ width: `${(s.correct / s.questions) * 100}%` }} />
                  <div className="sa-bar-fill incorrect-fill" style={{ width: `${(s.incorrect / s.questions) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Time Analysis" && (
          <div className="time-analysis">
            <div className="ta-summary">
              <div className="tas-card">
                <div className="tas-val">{r.timeTaken}</div>
                <div className="tas-lbl">Total Time Taken</div>
              </div>
              <div className="tas-card">
                <div className="tas-val">~1.8 min</div>
                <div className="tas-lbl">Avg per Question</div>
              </div>
              <div className="tas-card">
                <div className="tas-val">~2.5 min</div>
                <div className="tas-lbl">Avg Correct Answer</div>
              </div>
              <div className="tas-card">
                <div className="tas-val">~1.2 min</div>
                <div className="tas-lbl">Avg Wrong Answer</div>
              </div>
            </div>
            <div className="ta-table-section">
              <h4>Time per Section</h4>
              {r.subjects.map((s, i) => {
                const mins = [52, 48, 65][i];
                return (
                  <div key={s.name} className="ta-row">
                    <span>{s.name}</span>
                    <div className="ta-bar-track">
                      <div
                        className="ta-bar-fill"
                        style={{ width: `${(mins / 180) * 100}%`, background: ["#6C63FF", "#00BFA6", "#FFA726"][i] }}
                      />
                    </div>
                    <span>{mins} min</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "Compare" && (
          <div className="compare-section">
            <h4>Your Performance vs Average</h4>
            <div className="compare-table">
              <div className="ct-head">
                <span>Metric</span>
                <span>You</span>
                <span>Average</span>
                <span>Top 10%</span>
              </div>
              {compareData.map((row) => (
                <div key={row.metric} className="ct-row">
                  <span className="ct-metric">{row.metric}</span>
                  <span className="ct-you">{row.you}</span>
                  <span>{row.avg}</span>
                  <span className="ct-top">{row.top}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="analysis-footer-actions">
        <button className="btn-outline" onClick={() =>
          navigate("/result", {
            state: {
              test,
              result: r,
              answers,
            },
          })
        }>← Back to Results</button>
        <button className="btn-primary" onClick={() => navigate("/tests")}>Browse More Tests</button>
      </div>
    </div>
  );
}
