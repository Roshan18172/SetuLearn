import {useNavigate} from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="brand-icon">TF</div>
            <span className="brand-name">TestFlow</span>
          </div>
          <p className="footer-tagline">
            Practice. Improve. Succeed. Your all-in-one platform for government and entrance exam preparation.
          </p>
          <div className="footer-socials">
            <a href="/" className="social-btn" aria-label="Twitter">𝕏</a>
            <a href="/" className="social-btn" aria-label="Instagram">📸</a>
            <a href="/" className="social-btn" aria-label="YouTube">▶</a>
            <a href="/" className="social-btn" aria-label="Telegram">✈</a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Exam Categories</h4>
          <ul>
            <li><a href="/" onClick={(e) => { e.preventDefault(); navigate("/tests"); }}>Engineering (JEE, BITSAT)</a></li>
            <li><a href="/" onClick={(e) => { e.preventDefault(); navigate("/tests"); }}>Medical (NEET, AIIMS)</a></li>
            <li><a href="/" onClick={(e) => { e.preventDefault(); navigate("/tests"); }}>Government (UPSC, SSC)</a></li>
            <li><a href="/" onClick={(e) => { e.preventDefault(); navigate("/tests"); }}>Banking & Railways</a></li>
            <li><a href="/" onClick={(e) => { e.preventDefault(); navigate("/tests"); }}>College Entrance (CUET)</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>Home</a></li>
            <li><a href="/" onClick={(e) => { e.preventDefault(); navigate("/tests"); }}>All Tests</a></li>
            <li><a href="/" onClick={(e) => { e.preventDefault(); navigate("/how-it-works"); }}>How It Works</a></li>
            <li><a href="/" onClick={(e) => { e.preventDefault(); navigate("/performance-tips"); }}>Performance Tips</a></li>
            <li><a href="/" onClick={(e) => { e.preventDefault(); navigate("/faq"); }}>FAQ</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          <ul>
            <li><a href="/" onClick={(e) => { e.preventDefault(); navigate("/contact"); }}>Contact Us</a></li>
            <li><a href="/" onClick={(e) => { e.preventDefault(); navigate("/report-issue"); }}>Report an Issue</a></li>
            <li><a href="/" onClick={(e) => { e.preventDefault(); navigate("/privacy-policy"); }}>Privacy Policy</a></li>
            <li><a href="/" onClick={(e) => { e.preventDefault(); navigate("/terms-of-service"); }}>Terms of Service</a></li>
            <li><a href="/" onClick={(e) => { e.preventDefault(); navigate("/accessibility"); }}>Accessibility</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-stats">
        <div className="footer-stat">
          <span className="fs-num">45+</span>
          <span className="fs-lbl">Mock Tests</span>
        </div>
        <div className="footer-stat">
          <span className="fs-num">20K+</span>
          <span className="fs-lbl">Students</span>
        </div>
        <div className="footer-stat">
          <span className="fs-num">4</span>
          <span className="fs-lbl">Exam Categories</span>
        </div>
        <div className="footer-stat">
          <span className="fs-num">Free</span>
          <span className="fs-lbl">No Registration</span>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2024 TestFlow Platform. All rights reserved. Built for students, by educators.</p>
      </div>
    </footer>
  );
}
