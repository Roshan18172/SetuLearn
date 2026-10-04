import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useStudentAuth } from "../../context/StudentAuthContext";
import studentService from "../../api/studentService";
import NotificationBell from "../../components/NotificationBell";
import { syncSubmissionNotifications } from "../../utils/notifications";
import {
  LayoutDashboard,
  ClipboardList,
  Settings,
  Library,
  Logout,
} from "../../data/svgs";
import "../Admin/AdminUI.css";

export default function StudentLayout() {
  const { student, logout } = useStudentAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
    { path: "/dashboard/attempts", label: "My Attempts", icon: ClipboardList },
    { path: "/dashboard/profile", label: "Profile", icon: Settings },
    { path: "/tests", label: "Browse Tests", icon: Library },
  ];

  const isActive = (item) => {
    if (item.end) {
      return location.pathname === item.path;
    }
    if (location.pathname === item.path) return true;
    return location.pathname.startsWith(item.path + "/");
  };

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  // Turn finished exam attempts into bell notifications (also catches attempts made on another device).
  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      try {
        const data = await studentService.getSubmissions();
        if (!cancelled) syncSubmissionNotifications(Array.isArray(data) ? data : []);
      } catch {
        /* notifications are best-effort */
      }
    };
    sync();
    const timer = setInterval(sync, 60_000);
    window.addEventListener("focus", sync);
    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener("focus", sync);
    };
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  const currentLabel =
    navItems.find((item) => isActive(item))?.label || "Student";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="admin-layout">
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
        <NotificationBell variant="inline" />
        <div className="admin-topbar-avatar">
          {student?.name?.charAt(0)?.toUpperCase() || "S"}
        </div>
      </header>

      <div
        className={`admin-sidebar-backdrop ${navOpen ? "is-visible" : ""}`}
        onClick={() => setNavOpen(false)}
        aria-hidden="true"
      />

      <aside className={`admin-sidebar ${navOpen ? "is-open" : ""}`}>
        <div
          className="admin-sidebar-brand"
          onClick={() => navigate("/dashboard")}
          style={{ cursor: "pointer" }}
        >
          <img src="/footer-logo.webp" alt="SetuLearn" height="40" />
        </div>

        <span className="student-sidebar-bell">
          <NotificationBell variant="inline" />
        </span>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`admin-sidebar-link ${isActive(item) ? "active" : ""}`}
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
            <div className="admin-sidebar-avatar">
              {student?.name?.charAt(0)?.toUpperCase() || "S"}
            </div>
            <div>
              <div className="admin-sidebar-name">{student?.name || "Student"}</div>
              <div className="admin-sidebar-role">Student</div>
            </div>
          </div>
          <button className="admin-sidebar-logout" onClick={handleLogout}>
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
