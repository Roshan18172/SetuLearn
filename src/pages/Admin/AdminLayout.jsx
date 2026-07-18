import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import {
  LayoutDashboard, Library, FileText, Settings, BookOpen,
  Tag, HelpCircle, Upload, Mail, Flag, ClipboardList,
} from "../../data/svgs";
import "./AdminUI.css";

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/exams", label: "Exams", icon: Library },
    { path: "/admin/tests", label: "Tests", icon: FileText },
    { path: "/admin/tests/generate", label: "Generate Test", icon: Settings },
    { path: "/admin/subjects", label: "Subjects", icon: BookOpen },
    { path: "/admin/topics", label: "Topics", icon: Tag },
    { path: "/admin/questions", label: "Questions", icon: HelpCircle },
    { path: "/admin/questions/seed", label: "Seed Questions", icon: Upload },
    { path: "/admin/contacts", label: "Contacts", icon: Mail },
    { path: "/admin/reports", label: "Reports", icon: Flag },
    { path: "/admin/submissions", label: "Submissions", icon: ClipboardList },
  ];

  // Fixed matching logic: Only allows sub-path matching if the current URL 
  // doesn't explicitly belong to another item in the sidebar array.
  const isActive = (path) => {
    if (location.pathname === path) return true;

    const isExactMatchForOtherItem = navItems.some((item) => location.pathname === item.path);
    if (isExactMatchForOtherItem) return false;

    return location.pathname.startsWith(path + "/");
  };

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
              <span className="admin-sidebar-icon">
                <item.icon size={18} />
              </span>
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
