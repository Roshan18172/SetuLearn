import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/exams", label: "Exams", icon: "📚" },
    { path: "/admin/tests", label: "Tests", icon: "📝" },
    { path: "/admin/tests/generate", label: "Generate Test", icon: "⚙️" },
    { path: "/admin/questions", label: "Questions", icon: "❓" },
    { path: "/admin/questions/seed", label: "Seed Questions", icon: "📤" },
    { path: "/admin/subjects", label: "Subjects", icon: "📖" },
    { path: "/admin/topics", label: "Topics", icon: "🏷️" },
    { path: "/admin/contacts", label: "Contacts", icon: "📧" },
    { path: "/admin/reports", label: "Reports", icon: "🚩" },
    { path: "/admin/submissions", label: "Submissions", icon: "📋" },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand" onClick={() => navigate("/admin/dashboard")}>
          <img src="/logo.webp" alt="SetuLearn" height="36" />
          <span>Admin</span>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`admin-sidebar-link ${isActive(item.path) ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span className="admin-sidebar-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-sidebar-avatar">{admin?.name?.charAt(0)?.toUpperCase()}</div>
            <div>
              <div className="admin-sidebar-name">{admin?.name}</div>
              <div className="admin-sidebar-role">{admin?.role}</div>
            </div>
          </div>
          <button className="admin-sidebar-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}