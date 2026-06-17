import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SetuLogo from "../SetuLearn Logo.png"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        <div className="navbar-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }} >
          <div className="brand-icon"><img src={SetuLogo} alt="SetuLearn" /></div>
        </div>

        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>

          <button className={`nav-link ${location.pathname === "/" ? "active" : "" }`}
            onClick={() => navigate("/")} >
            Home
          </button>

          <button className={`nav-link ${location.pathname === "/tests" ? "active" : "" }`}
            onClick={() => navigate("/tests")} >
            Tests
          </button>

          <button className={`nav-link ${location.pathname === "/about" ? "active" : "" }`}
            onClick={() => navigate("/about")} >
            About
          </button>

          <button className="btn-primary nav-cta" onClick={() => navigate("/tests")} >
            Start Practicing
          </button>

        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} >
          <span></span>
          <span></span>
          <span></span>
        </button>

      </div>
    </nav>
  );
}