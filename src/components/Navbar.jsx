import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "../data/svgs";
import { useStudentAuth } from "../context/StudentAuthContext";
import "../pages/StudentAuth.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useStudentAuth();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/practice", label: "Practice" },
    { path: "/tests", label: "Tests" },
    { path: "/games", label: "Games" },
    { path: isAuthenticated ? "/dashboard" : "/test-history", label: isAuthenticated ? "Dashboard" : "History" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  const go = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div
          className="navbar-brand"
          onClick={() => go("/")}
          style={{ cursor: "pointer" }}
        >
          <img src="/logo.webp" alt="SetuLearn" />
        </div>

        <div className="navbar-right">
          <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
            {navItems.map((item) => (
              <button
                key={item.path}
                className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
                onClick={() => go(item.path)}
              >
                {item.label}
              </button>
            ))}

            {!loading && isAuthenticated ? (
              <button className="btn-primary nav-cta" onClick={() => go("/dashboard")}>
                Dashboard
              </button>
            ) : (
              <button className="btn-primary nav-cta" onClick={() => go("/login")}>
                Login / Sign up
              </button>
            )}
          </div>

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </nav>
  );
}
