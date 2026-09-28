import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import studentService from "../../api/studentService";
import { getErrorMessage } from "../../api/apiErrorHandler";
import { Eye } from "../../data/svgs";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function StudentAttempts() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  document.title = "My Attempts - SetuLearn";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await studentService.getSubmissions();
        if (!cancelled) setSubmissions(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>My Attempts</h1>
          <p className="admin-page-sub">All your mock test attempts, newest first</p>
        </div>
        <button
          className="admin-btn admin-btn-primary"
          onClick={() => navigate("/tests")}
        >
          Browse Tests
        </button>
      </div>

      {error && <div className="admin-error-box">{error}</div>}

      {loading ? (
        <div className="admin-loading">Loading...</div>
      ) : submissions.length === 0 ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <tbody>
              <tr>
                <td colSpan="7" className="admin-empty">
                  No attempts yet.{" "}
                  <button
                    className="admin-btn admin-btn-primary"
                    style={{ marginLeft: 8 }}
                    onClick={() => navigate("/tests")}
                  >
                    Start a test
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Test</th>
                <th>Exam</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id}>
                  <td className="admin-td-bold">{s.test?.title || "Test"}</td>
                  <td>{s.test?.exam?.name || "—"}</td>
                  <td>
                    {s.submittedAt
                      ? `${s.score} / ${s.test?.totalMarks ?? "—"}`
                      : "—"}
                  </td>
                  <td>{s.submittedAt ? `${s.percentage}%` : "—"}</td>
                  <td>
                    <span
                      className={`admin-badge ${
                        s.submittedAt
                          ? "admin-badge-success"
                          : "admin-badge-secondary"
                      }`}
                    >
                      {s.submittedAt ? "Completed" : "In progress"}
                    </span>
                  </td>
                  <td>{formatDate(s.submittedAt || s.startedAt)}</td>
                  <td>
                    {s.submittedAt ? (
                      <button
                        className="admin-icon-btn"
                        title="View result"
                        onClick={() => navigate(`/dashboard/attempts/${s.id}`)}
                      >
                        <Eye size={16} />
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
