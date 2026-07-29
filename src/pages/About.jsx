import { useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import Reveal from "../components/Reveal";

export default function About() {
  const navigate = useNavigate();

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
            <img src="/icons/exam-icons/graduation-cap.png" alt="Graduation" /> Empowering Students Through Practice
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
          <Reveal as="div" className="about-text" y={16}>
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
          </Reveal>

          <Reveal as="div" className="about-card large" delay={120}>
            <div className="about-card-icon">
              <img src="/icons/rocket.png" alt="Rocket Icon" />
            </div>
            <h3>Learning Through Practice</h3>
            <p>We believe consistent practice is the key to exam success.</p>
          </Reveal>
        </div>
      </section>

      {/* Mission */}
      <section className="mission-section">
        <Reveal as="div" className="mission-card">
          <div className="mission-icon">
            <img src="/icons/target.png" alt="Target Icon" />
          </div>

          <h2>Our Mission</h2>

          <p>
            To provide every student with free access to high-quality mock
            tests, performance analytics, and exam preparation tools.
          </p>
        </Reveal>
      </section>

      {/* Features */}
      <section className="about-features">
        <div className="section-header-center">
          <span className="section-eyebrow">Why Students Choose Us</span>

          <h2>What Makes SetuLearn Different?</h2>
        </div>

        <div className="features-grid">
          {[
            { icon: "/icons/features/computer-test.png", alt: "Pencil Icon", title: "Real Exam Simulation", desc: "Experience actual exam environments with timers, navigation, and question palettes." },
            { icon: "/icons/features/analytics.png", alt: "Analytics Icon", title: "Detailed Analytics", desc: "Understand strengths and weaknesses through detailed reports." },
            { icon: "/icons/features/review.png", alt: "Solution Review Icon", title: "Solution Review", desc: "Learn from mistakes with complete solutions and explanations." },
            { icon: "/icons/features/quick.png", alt: "Instant Results Icon", title: "Instant Results", desc: "Get performance reports immediately after completing a test." },
            { icon: "/icons/features/multiple-exams.png", alt: "Multiple Exam Categories Icon", title: "Multiple Exam Categories", desc: "Practice for engineering, medical, government, and entrance exams." },
            { icon: "/icons/features/free.png", alt: "Free Icon", title: "Completely Free", desc: "No subscriptions, no hidden charges, just learning." },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 80}>
              <div className="feature-card">
                <div className="feature-icon">
                  <img src={f.icon} alt={f.alt} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="about-stats">
        {[
          { value: "45+", label: "Mock Tests" },
          { value: "20K+", label: "Students" },
          { value: "4+", label: "Exam Categories" },
          { value: "100%", label: "Free Access" },
        ].map((s, i) => (
          <Reveal as="div" className="about-stat" key={s.label} delay={i * 80}>
            <h2>{s.value}</h2>
            <p>{s.label}</p>
          </Reveal>
        ))}
      </section>

      {/* Vision */}
      <section className="vision-section">
        <Reveal as="div" className="vision-card">
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
        </Reveal>
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
