import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentAuth } from "../../context/StudentAuthContext";
import studentService from "../../api/studentService";
import { getErrorMessage } from "../../api/apiErrorHandler";
import {
  ClipboardList,
  Gauge,
  Sparkles,
  ArrowRight,
  Library,
  BookOpenCheck,
  Settings,
} from "../../data/svgs";

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { student } = useStudentAuth();
  const [progress, setProgress] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  document.title = "Student Dashboard - SetuLearn";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [progressData, submissionsData] = await Promise.all([
          studentService.getProgress(),
          studentService.getSubmissions(),
        ]);
        if (cancelled) return;
        setProgress(progressData);
        setSubmissions(Array.isArray(submissionsData) ? submissionsData : []);
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

  const recent = submissions.filter((s) => s.submittedAt).slice(0, 5);

  const statCards = [
    {
      label: "Attempts",
      value: progress?.totalAttempts ?? 0,
      color: "#5A1EAD",
      icon: ClipboardList,
      path: "/dashboard/attempts",
    },
    {
      label: "Tests tried",
      value: progress?.uniqueTestsAttempted ?? 0,
      color: "#FD860D",
      icon: Library,
      path: "/tests",
    },
    {
      label: "Avg %",
      value: progress?.averagePercentage ?? 0,
      color: "#2196F3",
      icon: Gauge,
      path: "/dashboard/attempts",
      suffix: "%",
    },
    {
      label: "Best score",
      value: progress?.bestScore ?? 0,
      color: "#4CAF50",
      icon: BookOpenCheck,
      path: "/dashboard/attempts",
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-dash-header">
        <div>
          <h1>
            Welcome back, {student?.name?.split(" ")[0] || "Student"}{" "}
            <Sparkles
              size={20}
              style={{ verticalAlign: "middle", color: "var(--accent)" }}
            />
          </h1>
          <p className="admin-dash-sub">
            Track your mock test progress and results.
          </p>
        </div>
        <button
          className="admin-btn admin-btn-primary"
          onClick={() => navigate("/tests")}
        >
          Browse Tests
        </button>
      </div>

      {error && <div className="admin-error-box">{error}</div>}

      <div className="admin-stats-grid">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="admin-stat-card"
            style={{ borderTopColor: card.color, cursor: "pointer" }}
            onClick={() => navigate(card.path)}
          >
            <div className="admin-stat-icon" style={{ background: card.color }}>
              <card.icon size={18} color="#fff" />
            </div>
            <div className="admin-stat-value" style={{ color: card.color }}>
              {loading ? "..." : `${Number(card.value).toLocaleString()}${card.suffix || ""}`}
            </div>
            <div className="admin-stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="admin-dash-cols">
        <div className="admin-dash-panel">
          <div className="admin-dash-panel-head">
            <h2>Recent Attempts</h2>
            <button
              className="admin-link-btn"
              onClick={() => navigate("/dashboard/attempts")}
            >
              View all <ArrowRight />
            </button>
          </div>
          {loading ? (
            <div className="admin-loading-sm">Loading...</div>
          ) : recent.length === 0 ? (
            <p className="admin-empty-sm">No attempts yet. Start a mock test.</p>
          ) : (
            <div className="admin-mini-list">
              {recent.map((s) => (
                <div
                  key={s.id}
                  className="admin-mini-item"
                  onClick={() => navigate(`/dashboard/attempts/${s.id}`)}
                >
                  <div className="admin-mini-main">
                    <span className="admin-mini-title">
                      {s.test?.title || "Test"}
                    </span>
                    <span className="admin-mini-sub">
                      {s.test?.exam?.name ? `${s.test.exam.name} · ` : ""}
                      {formatDate(s.submittedAt)}
                    </span>
                  </div>
                  <span
                    className={`admin-badge ${
                      (s.percentage ?? 0) >= 50
                        ? "admin-badge-success"
                        : "admin-badge-danger"
                    }`}
                  >
                    {s.percentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-dash-panel">
          <div className="admin-dash-panel-head">
            <h2>Quick Actions</h2>
          </div>
          <div className="admin-quick-grid" style={{ marginTop: 8 }}>
            <button
              className="admin-quick-btn"
              onClick={() => navigate("/tests")}
            >
              <Library size={15} /> Browse Tests
            </button>
            <button
              className="admin-quick-btn"
              onClick={() => navigate("/dashboard/attempts")}
            >
              <ClipboardList size={15} /> My Attempts
            </button>
            <button
              className="admin-quick-btn"
              onClick={() => navigate("/dashboard/profile")}
            >
              <Settings size={15} /> Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
