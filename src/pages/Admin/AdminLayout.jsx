import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "./AdminUI.css";

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/exams", label: "Exams", icon: "📚" },
    { path: "/admin/tests", label: "Tests", icon: "📝" },
    { path: "/admin/tests/generate", label: "Generate Test", icon: "⚙️" },
    { path: "/admin/subjects", label: "Subjects", icon: "📖" },
    { path: "/admin/topics", label: "Topics", icon: "🏷️" },
    { path: "/admin/questions", label: "Questions", icon: "❓" },
    { path: "/admin/questions/seed", label: "Seed Questions", icon: "📤" },
    { path: "/admin/contacts", label: "Contacts", icon: "📧" },
    { path: "/admin/reports", label: "Reports", icon: "🚩" },
    { path: "/admin/submissions", label: "Submissions", icon: "📋" },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  // Prevent background scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  const currentLabel = navItems.find((item) => isActive(item.path))?.label || "Admin";

  return (
    <div className="admin-layout">
      {/* Mobile top bar */}
      <header className="admin-topbar">
        <button
          className="admin-topbar-burger"
          aria-label={navOpen ? "Close menu" : "Open menu"}
          aria-expanded={navOpen}
          onClick={() => setNavOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className="admin-topbar-title">{currentLabel}</div>
        <div className="admin-topbar-avatar">{admin?.name?.charAt(0)?.toUpperCase()}</div>
      </header>

      {/* Backdrop for mobile drawer */}
      <div
        className={`admin-sidebar-backdrop ${navOpen ? "is-visible" : ""}`}
        onClick={() => setNavOpen(false)}
        aria-hidden="true"
      />

      <aside className={`admin-sidebar ${navOpen ? "is-open" : ""}`}>
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
