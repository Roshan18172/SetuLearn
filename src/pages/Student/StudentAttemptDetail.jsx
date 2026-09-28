import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import studentService from "../../api/studentService";
import { getErrorMessage } from "../../api/apiErrorHandler";
import MathContent from "../../components/MathContent";

export default function StudentAttemptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await studentService.getSubmissionResult(id);
        if (!cancelled) setResult(data);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  document.title = "Attempt Result - SetuLearn";

  const statusBadge = (status) => {
    if (status === "correct") return "admin-badge-success";
    if (status === "incorrect") return "admin-badge-danger";
    return "admin-badge-secondary";
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Attempt Result</h1>
          <p className="admin-page-sub">Detailed score and question review</p>
        </div>
        <button
          className="admin-btn admin-btn-outline"
          onClick={() => navigate("/dashboard/attempts")}
        >
          ← Back to attempts
        </button>
      </div>

      {loading && <div className="admin-loading">Loading result...</div>}
      {error && <div className="admin-error-box">{error}</div>}

      {result && (
        <>
          <div className="admin-stats-grid">
            <div className="admin-stat-card" style={{ borderTopColor: "#5A1EAD" }}>
              <div className="admin-stat-label">Score</div>
              <div className="admin-stat-value" style={{ color: "#5A1EAD" }}>
                {result.score} / {result.totalMarks}
              </div>
            </div>
            <div className="admin-stat-card" style={{ borderTopColor: "#2196F3" }}>
              <div className="admin-stat-label">Percentage</div>
              <div className="admin-stat-value" style={{ color: "#2196F3" }}>
                {result.percentage}%
              </div>
            </div>
            <div className="admin-stat-card" style={{ borderTopColor: "#4CAF50" }}>
              <div className="admin-stat-label">Correct</div>
              <div className="admin-stat-value" style={{ color: "#4CAF50" }}>
                {result.correct}
              </div>
            </div>
            <div className="admin-stat-card" style={{ borderTopColor: "#FF6B6B" }}>
              <div className="admin-stat-label">Incorrect</div>
              <div className="admin-stat-value" style={{ color: "#FF6B6B" }}>
                {result.incorrect}
              </div>
            </div>
          </div>

          {Array.isArray(result.subjectAnalysis) && result.subjectAnalysis.length > 0 && (
            <div className="admin-dash-panel" style={{ marginBottom: 24 }}>
              <div className="admin-dash-panel-head">
                <h2>Subject-wise</h2>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Correct</th>
                      <th>Incorrect</th>
                      <th>Skipped</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.subjectAnalysis.map((s) => (
                      <tr key={s.subjectId}>
                        <td className="admin-td-bold">{s.subjectName}</td>
                        <td>{s.correct}</td>
                        <td>{s.incorrect}</td>
                        <td>{s.unattempted}</td>
                        <td>
                          {s.score} / {s.totalMarks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {Array.isArray(result.questionAnalysis) && (
            <div className="admin-dash-panel">
              <div className="admin-dash-panel-head">
                <h2>Question review</h2>
              </div>
              <div className="admin-mini-list">
                {result.questionAnalysis.map((q, index) => (
                  <div key={q.questionId} className="admin-mini-item" style={{ cursor: "default" }}>
                    <div className="admin-mini-main">
                      <span className="admin-mini-title">
                        Q{index + 1}{" "}
                        <span className={`admin-badge ${statusBadge(q.status)}`}>
                          {q.status}
                        </span>
                      </span>
                      <span className="admin-mini-sub">
                        Selected: {q.selectedOption?.text || "—"} · Correct:{" "}
                        {q.correctOption?.text || "—"}
                      </span>
                      {q.explanation && (
                        <span className="admin-mini-sub" style={{ marginTop: 6, display: "block" }}>
                          <MathContent>{q.explanation}</MathContent>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
