import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import adminService from "../../api/adminService";
import {
  Library, FileText, BookOpen, Tag, HelpCircle, Mail, Flag,
  ClipboardList, Sparkles, ArrowRight, Plus,
} from "../../data/svgs";

export default function AdminDashboard() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    exams: 0, tests: 0, subjects: 0, topics: 0, questions: 0,
    contacts: 0, reports: 0, submissions: 0,
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  document.title = "Admin Dashboard - SetuLearn";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          exams, tests, subjects, topics, questionsData,
          contacts, reports, submissions,
        ] = await Promise.all([
          adminService.getExams(),
          adminService.getTests(),
          adminService.getSubjects(),
          adminService.getTopics(),
          adminService.getQuestions({ limit: 1 }),
          adminService.getContacts({ limit: 1 }),
          adminService.getReports({ limit: 1 }),
          adminService.getSubmissions({ limit: 5 }),
        ]);
        setStats({
          exams: exams.length,
          tests: tests.length,
          subjects: subjects.length,
          topics: topics.length,
          questions: questionsData.pagination?.total || 0,
          contacts: contacts.pagination?.total || 0,
          reports: reports.pagination?.total || 0,
          submissions: submissions.pagination?.total || 0,
        });
        setRecentSubmissions(submissions.submissions || []);
        setRecentReports((await adminService.getReports({ limit: 5 })).reports || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: "Exams", value: stats.exams, color: "#5A1EAD", icon: Library, path: "/admin/exams" },
    { label: "Tests", value: stats.tests, color: "#FD860D", icon: FileText, path: "/admin/tests" },
    { label: "Subjects", value: stats.subjects, color: "#2196F3", icon: BookOpen, path: "/admin/subjects" },
    { label: "Topics", value: stats.topics, color: "#00BCD4", icon: Tag, path: "/admin/topics" },
    { label: "Questions", value: stats.questions, color: "#4CAF50", icon: HelpCircle, path: "/admin/questions" },
    { label: "Contacts", value: stats.contacts, color: "#FF9800", icon: Mail, path: "/admin/contacts" },
    { label: "Reports", value: stats.reports, color: "#FF6B6B", icon: Flag, path: "/admin/reports" },
    { label: "Submissions", value: stats.submissions, color: "#9C27B0", icon: ClipboardList, path: "/admin/submissions" },
  ];

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-dash-header">
        <div>
          <h1>Welcome back, {admin?.name} <Sparkles size={20} style={{ verticalAlign: "middle", color: "var(--accent)" }} /></h1>
          <p className="admin-dash-sub">
            Here's what's happening on SetuLearn today.
          </p>
        </div>
        <button className="admin-btn admin-btn-outline" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid admin-stats-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="admin-stat-card"
            style={{ borderTopColor: card.color }}
            onClick={() => navigate(card.path)}
          >
            <div className="admin-stat-icon" style={{ background: card.color }}>
              <card.icon size={18} color="#fff" />
            </div>
            <div className="admin-stat-value" style={{ color: card.color }}>
              {loading ? "..." : card.value.toLocaleString()}
            </div>
            <div className="admin-stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="admin-dash-cols">
        {/* Recent Submissions */}
        <div className="admin-dash-panel">
          <div className="admin-dash-panel-head">
            <h2>Recent Submissions</h2>
            <button className="admin-link-btn" onClick={() => navigate("/admin/submissions")}>
              View all <ArrowRight />
            </button>
          </div>
          {loading ? (
            <div className="admin-loading-sm">Loading...</div>
          ) : recentSubmissions.length === 0 ? (
            <p className="admin-empty-sm">No submissions yet</p>
          ) : (
            <div className="admin-mini-list">
              {recentSubmissions.map((s) => (
                <div key={s.id} className="admin-mini-item" onClick={() => navigate("/admin/submissions")}>
                  <div className="admin-mini-main">
                    <span className="admin-mini-title">{s.test?.title || "Test"}</span>
                    <span className="admin-mini-sub">
                      {s.percentage?.toFixed(1)}% · {new Date(s.startedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`admin-badge ${s.percentage >= 50 ? "admin-badge-success" : "admin-badge-danger"}`}>
                    {s.score}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Reports */}
        <div className="admin-dash-panel">
          <div className="admin-dash-panel-head">
            <h2>Recent Reports</h2>
            <button className="admin-link-btn" onClick={() => navigate("/admin/reports")}>
              View all <ArrowRight />
            </button>
          </div>
          {loading ? (
            <div className="admin-loading-sm">Loading...</div>
          ) : recentReports.length === 0 ? (
            <p className="admin-empty-sm">No reports yet</p>
          ) : (
            <div className="admin-mini-list">
              {recentReports.map((r) => (
                <div key={r.id} className="admin-mini-item" onClick={() => navigate("/admin/reports")}>
                  <div className="admin-mini-main">
                    <span className="admin-mini-title">{r.name}</span>
                    <span className="admin-mini-sub">
                      {r.issueType} · {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="admin-badge">{r.email?.slice(0, 20)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="admin-quick-links">
        <h2>Quick Actions</h2>
        <div className="admin-quick-grid">
          <button className="admin-quick-btn" onClick={() => navigate("/admin/exams")}><Plus size={15} /> Manage Exams</button>
          <button className="admin-quick-btn" onClick={() => navigate("/admin/tests")}><Plus size={15} /> Manage Tests</button>
          <button className="admin-quick-btn" onClick={() => navigate("/admin/subjects")}><Plus size={15} /> Manage Subjects</button>
          <button className="admin-quick-btn" onClick={() => navigate("/admin/topics")}><Plus size={15} /> Manage Topics</button>
          <button className="admin-quick-btn" onClick={() => navigate("/admin/questions")}><Plus size={15} /> Manage Questions</button>
          <button className="admin-quick-btn" onClick={() => navigate("/admin/contacts")}><Mail size={15} /> View Contacts</button>
          <button className="admin-quick-btn" onClick={() => navigate("/admin/reports")}><Flag size={15} /> View Reports</button>
          <button className="admin-quick-btn" onClick={() => navigate("/admin/submissions")}><ClipboardList size={15} /> View Submissions</button>
        </div>
      </div>
    </div>
  );
}