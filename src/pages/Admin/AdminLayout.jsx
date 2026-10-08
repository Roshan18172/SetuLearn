import { useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import {
  LayoutDashboard, Library, FileText, Settings, BookOpen,
  Tag, HelpCircle, Upload, Mail, Flag, ClipboardList,
  Logout, GraduationCap, Users, Activity,
} from "../../data/svgs";
import "./AdminUI.css";

const FULL_ADMIN_ROLES = ["admin", "super_admin"];
const CONTENT_ONLY_PATHS = new Set([
  "/admin/dashboard",
  "/admin/exams",
  "/admin/tests",
  "/admin/tests/generate",
  "/admin/subjects",
  "/admin/topics",
  "/admin/questions",
  "/admin/questions/seed",
]);

export function isFullAdmin(role) {
  return FULL_ADMIN_ROLES.includes(role);
}

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const fullAdmin = isFullAdmin(admin?.role);

  const allNavItems = useMemo(
    () => [
      { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/admin/exams", label: "Exams", icon: Library },
      { path: "/admin/tests", label: "Tests", icon: FileText },
      { path: "/admin/tests/generate", label: "Generate Test", icon: Settings },
      { path: "/admin/subjects", label: "Subjects", icon: BookOpen },
      { path: "/admin/topics", label: "Topics", icon: Tag },
      { path: "/admin/questions", label: "Questions", icon: HelpCircle },
      { path: "/admin/questions/seed", label: "Seed Questions", icon: Upload },
      { path: "/admin/students", label: "Students", icon: GraduationCap, fullOnly: true },
      { path: "/admin/activity", label: "Activity Logs", icon: Activity, fullOnly: true },
      { path: "/admin/contacts", label: "Contacts", icon: Mail, fullOnly: true },
      { path: "/admin/reports", label: "Reports", icon: Flag, fullOnly: true },
      { path: "/admin/submissions", label: "Submissions", icon: ClipboardList, fullOnly: true },
      { path: "/admin/admins", label: "Admins", icon: Users, fullOnly: true },
    ],
    []
  );

  const navItems = useMemo(
    () => allNavItems.filter((item) => fullAdmin || !item.fullOnly),
    [allNavItems, fullAdmin]
  );

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

  // Redirect content admins away from full-admin-only URLs
  useEffect(() => {
    if (!admin || fullAdmin) return;
    const allowed =
      CONTENT_ONLY_PATHS.has(location.pathname) ||
      location.pathname.startsWith("/admin/tests/") ||
      location.pathname.startsWith("/admin/questions/");
    if (!allowed) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [admin, fullAdmin, location.pathname, navigate]);

  const currentLabel = navItems.find((item) => isActive(item.path))?.label || "Admin";
  const roleLabel =
    admin?.role === "content_admin"
      ? "Content Admin"
      : admin?.role === "super_admin"
        ? "Super Admin"
        : "Admin";

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
          <img src="/footer-logo.webp" alt="SetuLearn" height="40" />
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
              <div className="admin-sidebar-role">{roleLabel}</div>
            </div>
          </div>
          <button className="admin-sidebar-logout" onClick={logout}>
           <Logout /> Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
