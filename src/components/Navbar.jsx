import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "../data/svgs";
// import SetuLogo from "../SetuLearn Logo.png"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/tests", label: "Tests" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        <div className="navbar-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }} >
          <img src="/logo.webp" alt="SetuLearn" />
        </div>

        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>

          {navItems.map((item) => (
            <button
              key={item.path}
              className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}

          <button className="btn-primary nav-cta" onClick={() => navigate("/tests")} >
            Start Practicing
          </button>

        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} >
          {menuOpen ? <X /> : <Menu />}
        </button>

      </div>
    </nav>
  );
}