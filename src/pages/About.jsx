import { useNavigate } from "react-router-dom";
import SEO from "../components/SEO";

export default function About() {
  const navigate = useNavigate();
  document.title = "About Us - SetuLearn";

  return (
    <div className="about-page">
      <SEO
        title="About Us"
        description="Learn about SetuLearn - India's free mock test platform for government jobs, engineering, medical, and college entrance exam preparation. Our mission is to help students practice smarter and succeed."
        canonical="/about"
      />
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-badge">
            🎓 Empowering Students Through Practice
          </span>

          <h1>
            About <span>SetuLearn</span>
          </h1>

          <p>
            SetuLearn is a modern online mock test platform designed to help
            students prepare smarter, track performance, and build confidence
            before real examinations.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="about-section">
        <div className="about-grid">
          <div className="about-text">
            <h2>Our Story</h2>

            <p>
              Preparing for competitive exams can be overwhelming. Students
              often struggle to find quality mock tests that simulate real exam
              conditions.
            </p>

            <p>
              That's why SetuLearn was created — a platform where students can
              practice exam-oriented questions, analyze their performance, and
              continuously improve.
            </p>

            <p>
              Whether you're preparing for JEE, NEET, UPSC, SSC, Banking,
              Railway, or CUET, SetuLearn provides an exam-like experience that
              helps you succeed.
            </p>
          </div>

          <div className="about-card large">
            <div className="about-card-icon">
              <img src="/icons/rocket.png" alt="Rocket Icon" />
            </div>
            <h3>Learning Through Practice</h3>
            <p>We believe consistent practice is the key to exam success.</p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mission-section">
        <div className="mission-card">
          <div className="mission-icon">
            <img src="/icons/target.png" alt="Target Icon" />
          </div>

          <h2>Our Mission</h2>

          <p>
            To provide every student with free access to high-quality mock
            tests, performance analytics, and exam preparation tools.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="about-features">
        <div className="section-header-center">
          <span className="section-eyebrow">Why Students Choose Us</span>

          <h2>What Makes SetuLearn Different?</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <img src="/icons/features/computer-test.png" alt="Pencil Icon" />
            </div>
            <h3>Real Exam Simulation</h3>
            <p>
              Experience actual exam environments with timers, navigation, and
              question palettes.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <img src="/icons/features/analytics.png" alt="Analytics Icon" />
            </div>
            <h3>Detailed Analytics</h3>
            <p>Understand strengths and weaknesses through detailed reports.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <img src="/icons/features/review.png" alt="Solution Review Icon" />
            </div>
            <h3>Solution Review</h3>
            <p>Learn from mistakes with complete solutions and explanations.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <img src="/icons/features/quick.png" alt="Instant Results Icon" />
            </div>
            <h3>Instant Results</h3>
            <p>Get performance reports immediately after completing a test.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <img
                src="/icons/features/multiple-exams.png"
                alt="Multiple Exam Categories Icon"
              />
            </div>
            <h3>Multiple Exam Categories</h3>
            <p>
              Practice for engineering, medical, government, and entrance exams.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <img src="/icons/features/free.png" alt="Free Icon" />
            </div>
            <h3>Completely Free</h3>
            <p>No subscriptions, no hidden charges, just learning.</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="about-stats">
        <div className="about-stat">
          <h2>45+</h2>
          <p>Mock Tests</p>
        </div>

        <div className="about-stat">
          <h2>20K+</h2>
          <p>Students</p>
        </div>

        <div className="about-stat">
          <h2>4+</h2>
          <p>Exam Categories</p>
        </div>

        <div className="about-stat">
          <h2>100%</h2>
          <p>Free Access</p>
        </div>
      </section>

      {/* Vision */}
      <section className="vision-section">
        <div className="vision-card">
          <div className="vision-icon">
            <img src="/icons/vision.png" alt="Vision Icon" />
          </div>
          <div className="vision-text">
            <h2>Our Vision</h2>
            <p>
              We envision a future where every student, regardless of
              background, has access to quality exam preparation resources.
            </p>
            <p>
              SetuLearn aims to become a trusted companion for millions of
              learners preparing for competitive examinations.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <h2>Ready To Start Practicing?</h2>
        <p>Explore mock tests and begin your journey toward success today.</p>
        <button className="btn-white" onClick={() => navigate("/tests")}>
          {" "}
          Browse Tests →{" "}
        </button>
      </section>
    </div>
  );
}
