import { useNavigate } from "react-router-dom";
// import Setulogo from "../SetuLearn Logo.png";
import {Telegram, Youtube, Instagram, Twitter} from "iconoir-react";

export default function Footer() {
  const navigate = useNavigate();

 const examCategories = [
  {
    label: "Engineering (JEE, BITSAT)",
    value: "Engineering Entrances",
  },
  {
    label: "Medical (NEET, AIIMS)",
    value: "Medical Entrances",
  },
  {
    label: "Management (CAT)",
    value: "Management Entrances",
  },
  {
    label: "Higher Education & Research (GATE, CUET)",
    value: "Higher Education & Research",
  },
  {
    label: "Staff Selection (CGL, CHSL)",
    value: "Staff Selection",
  },
  {
    label: "Banking & Insurance (IBPS, SBI PO)",
    value: "Banking & Insurance",
  },
  {
    label: "Railways Recruitment (RRB NTPC)",
    value: "Railways Recruitment",
  },
  {
    label: "Civil Services & Bureaucracy",
    value: "Civil Services & Bureaucracy",
  },
  {
    label: "Defense Services (NDA, CDS)",
    value: "Defense Services",
  },
  {
    label: "Teaching Eligibility (NET, CTET)",
    value: "Teaching Eligibility",
  },
];
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="brand-icon">
              <img src="/footer-logo-accent.webp" height={48} width={"auto"} alt="SetuLearn Logo" />
            </div>
          </div>
          <p className="footer-tagline">
            Practice. Improve. Succeed. Your all-in-one platform for government and entrance exam preparation.
          </p>
          <div className="footer-socials">
            <a href="/" className="social-btn" aria-label="Twitter"><Twitter color="#2d589a" width={20} height={20} /></a>
            <a href="/" className="social-btn" aria-label="Instagram"><Instagram color="#c41076" width={20} height={20} /></a>
            <a href="/" className="social-btn" aria-label="YouTube"><Youtube color="#da1010" width={20} height={20} /></a>
            <a href="/" className="social-btn" aria-label="Telegram"><Telegram color="#418abf" width={20} height={20} /></a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Exam Categories</h4>
          <ul>
             {examCategories.slice(0, 4).map((exam) => (
              <li key={exam.value}>
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/tests", {
                      state: { selectedExam: exam.value },
                    });
                  }}
                >
                  {exam.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-col">
          
          <ul>
              {examCategories.slice(4).map((exam) => (
              <li key={exam.value}>
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/tests", {
                      state: { selectedExam: exam.value },
                    });
                  }}
                >
                  {exam.label}
                </a>
              </li>
            ))}
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
          <span className="fs-num">{examCategories.length}</span>
          <span className="fs-lbl">Exam Categories</span>
        </div>
        <div className="footer-stat">
          <span className="fs-num">Free</span>
          <span className="fs-lbl">No Registration</span>
        </div>
      </div>

      <div className="footer-bottom">
        <p>{`© ${new Date().getFullYear()} SetuLearn Platform. All rights reserved. Built for students, by educators.`}</p>
        <p>Desinged and Developed by <a href="https://www.sapiora.in" target="blank"><strong>Sapiora Tech</strong></a></p>
      </div>
    </footer>
  );
}
