import { categories, tests } from "../data/demoData";

import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const featuredTests = tests.slice(0, 3);
  document.title = "Home - SetuLearn";

  const lastExam = JSON.parse(localStorage.getItem('lastexam')) || {};
  const lastExamTitle = lastExam.testTitle || "N/A";
  const lastExamScore = lastExam.securedScore || 0;
  const lastExamTotal = lastExam.totalScore || 0;
  const lastExamPercentage = lastExam.totalScore ? ((lastExam.securedScore / lastExam.totalScore) * 100).toFixed(2) : 0;
  const lastExamCorrect = lastExam.correct || 0;
  const lastExamIncorrect = lastExam.incorrect || 0;
  const lastExamUnattempted = lastExam.unattempted || 0;
  const lastExamQuestions = lastExam.totalQuestions || (lastExam.correct + lastExam.incorrect + lastExam.unattempted);
  const lastExamPercentile = lastExam.percentile || 0;

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🎯 India's #1 Free Mock Test Platform</div>
          <h1 className="hero-title">
            Practice. Improve.<br />
            <span className="hero-accent">Succeed.</span>
          </h1>
          <p className="hero-desc">
            Explore and attempt mock tests for various government and college entrance exams.
            Real exam patterns, instant results, detailed analytics — all free.
          </p>
          <div className="hero-actions">
            <button className="btn-primary btn-lg" onClick={() => navigate("/tests")}>
              🚀 Browse All Tests
            </button>
            <button className="btn-outline btn-lg" onClick={() => navigate("/tests")}>
              View Categories
            </button>
          </div>
          <div className="hero-stats">
            <div className="hstat"><b>45+</b><span>Mock Tests</span></div>
            <div className="hstat-div" />
            <div className="hstat"><b>20K+</b><span>Students</span></div>
            <div className="hstat-div" />
            <div className="hstat"><b>Free</b><span>No Sign-up</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card hero-card-1">
            <div className="hc-icon">📝</div>
            <div>
              <div className="hc-title">JEE Main 2024</div>
              <div className="hc-sub">90 Questions • 180 Mins</div>
            </div>
            <div className="hc-badge hard">Hard</div>
          </div>
          <div className="hero-card hero-card-2">
            <div className="hc-icon">🏥</div>
            <div>
              <div className="hc-title">NEET Full Length</div>
              <div className="hc-sub">180 Questions • 3 Hrs</div>
            </div>
            <div className="hc-badge medium">Medium</div>
          </div>
          <div className="hero-card hero-card-3">
            <div className="hc-result">
              <span className="hc-score">82%</span>
              <span className="hc-score-lbl">Your Score</span>
            </div>
            <div className="hc-bar-wrap">
              <div className="hc-bar" style={{ width: "82%", background: "#6C63FF" }} />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="section-header">
          <div>
            <div className="section-eyebrow">Explore by Category</div>
            <h2 className="section-title">Popular Exam Categories</h2>
          </div>
          <button className="btn-text" onClick={() => navigate("/tests")}>View All →</button>
        </div>
        <div className="categories-grid">
          {categories.map((cat) => (
            <div key={cat.id} className="category-card" onClick={() => navigate("/tests")}
              style={{ "--cat-color": cat.color }}
            >
              <div className="cat-icon">{cat.icon}</div>
              <div className="cat-name">{cat.name}</div>
              <div className="cat-exams">{cat.exams.slice(0, 3).join(", ")}</div>
              <div className="cat-count">{cat.tests} Tests</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="why-section">
        <div className="why-inner">
          <div className="why-text">
            <div className="section-eyebrow">Why SetuLearn?</div>
            <h2 className="section-title">Why Take Mock Tests?</h2>
            <div className="why-points">
              {[
                { icon: "🎯", title: "Real Exam Experience", desc: "Tests follow exact patterns of actual exams with same difficulty and time constraints." },
                { icon: "⚡", title: "Improve Speed & Accuracy", desc: "Practice under timed conditions to build pace and reduce silly mistakes." },
                { icon: "📊", title: "Identify Strengths & Weaknesses", desc: "Detailed analytics after every test help you focus on areas that need improvement." },
                { icon: "🆓", title: "Completely Free", desc: "No registration, no fees. Just open a test and start practicing." },
              ].map((p) => (
                <div key={p.title} className="why-point">
                  <div className="why-icon">{p.icon}</div>
                  <div>
                    <div className="why-point-title">{p.title}</div>
                    <div className="why-point-desc">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="why-visual">
            <div className="score-card">
              <div className="sc-header">Test Completed!</div>
              <div className="sc-header">{lastExamTitle}</div>
              <div className="sc-score">{lastExamScore} <span>/ {lastExamTotal}</span></div>
              <div className="sc-percent">{lastExamPercentage}% Score</div>
              <div className="sc-row"><span>✅ Correct</span><b>{lastExamCorrect}/{lastExamQuestions}</b></div>
              <div className="sc-row"><span>❌ Incorrect</span><b>{lastExamIncorrect}/{lastExamQuestions}</b></div>
              <div className="sc-row"><span>⬜ Unattempted</span><b>{lastExamUnattempted}/{lastExamQuestions}</b></div>
              <div className="sc-percentile">Percentile: <b>{lastExamPercentile}</b></div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tests */}
      <section className="section">
        <div className="section-header">
          <div>
            <div className="section-eyebrow">Recommended</div>
            <h2 className="section-title">Featured Tests</h2>
          </div>
          <button className="btn-text" onClick={() => navigate("/tests")}>View All Tests →</button>
        </div>
        <div className="tests-list">
          {featuredTests.map((test) => (
            <div key={test.id} className="test-card-home">
              <div className="tc-left">
                <div className="tc-badge" style={{ background: categories.find((c) => c.name === test.category)?.color || "#6C63FF" }}>
                  {test.exam.slice(0, 3).toUpperCase()}
                </div>
                <div className="tc-info">
                  <div className="tc-title">{test.title}</div>
                  <div className="tc-meta">
                    <span>{test.category}</span>
                    <span>•</span>
                    <span>{test.questions} Questions</span>
                    <span>•</span>
                    <span>{test.duration} Mins</span>
                    <span>•</span>
                    <span className={`diff-badge ${test.difficulty.toLowerCase()}`}>{test.difficulty}</span>
                  </div>
                </div>
              </div>
              <button className="btn-primary" onClick={() => navigate("/instructions", { state: { test, mode: "timed" } })} >
                Start Test
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="cta-content">
          <h2>Ready to ace your exam?</h2>
          <p>Join thousands of students who practice with SetuLearn every day.</p>
          <button className="btn-white" onClick={() => navigate("/tests")}>
            Browse All Tests →
          </button>
        </div>
      </section>
    </div>
  );
}
