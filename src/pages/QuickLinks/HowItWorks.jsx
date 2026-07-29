 import { Rocket } from "iconoir-react";
import { useNavigate } from "react-router-dom";
import Reveal from "../../components/Reveal";

export default function HowItWorks() {
  const navigate = useNavigate();
    document.title = "How It Works - SetuLearn";

  const steps = [
    {
      icon: "search.png",
      title: "Browse Tests",
      desc: "Explore hundreds of mock tests across engineering, medical, government, banking, and entrance exam categories."
    },
    {
      icon: "instructions.png",
      title: "Read Instructions",
      desc: "Review test rules, marking scheme, duration, and subject-wise distribution before starting."
    },
    {
      icon: "give-test.png",
      title: "Attempt Questions",
      desc: "Answer questions, mark difficult ones for review, and navigate freely between sections."
    },
    {
      icon: "time.png",
      title: "Manage Time",
      desc: "Practice under real exam conditions using the built-in timer and performance tracker."
    },
    {
      icon: "answers.png",
      title: "Get Instant Results",
      desc: "Receive detailed scorecards immediately after submission with accuracy and percentile insights."
    },
    {
      icon: "analyze.png",
      title: "Analyze & Improve",
      desc: "Review solutions, identify weak topics, and improve your performance with every attempt."
    }
  ];

  const features = [
    {
      icon: "computer-test.png",
      title: "Real Exam Experience",
      desc: "Tests designed to match actual exam patterns."
    },
    {
      icon: "quick.png",
      title: "Instant Evaluation",
      desc: "No waiting. Get your results immediately."
    },
    {
      icon: "analytics.png",
      title: "Performance Analytics",
      desc: "Track progress and improve weak areas."
    },
    {
      icon: "free.png",
      title: "Completely Free",
      desc: "Practice without subscriptions or hidden charges."
    }
  ];

  return (
    <div className="how-page">
      {/* Hero Section */}
      <section className="how-hero">
        <div className="how-badge">
          <img src="/icons/rocket.png" alt="rocket" height={20}/> Simple • Smart • Effective
        </div>

        <h1>
          How <span>SetuLearn</span> Works
        </h1>

        <p>
          Preparing for competitive exams has never been easier.
          Follow these simple steps and start improving your performance today.
        </p>
      </section>

      {/* Steps Timeline */}
      <section className="how-section">
        <div className="section-heading">
          <h2>Step-by-Step Process</h2>
          <p>Your journey from practice to success.</p>
        </div>

        <div className="steps-grid">
          {steps.map((step, index) => (
            <Reveal key={index} delay={index * 80}>
              <div className="step-card">
                <div className="step-number">
                  {index + 1}
                </div>

                <div className="step-icon">
                  <img src={`/icons/how-works/${step.icon}`} alt={step.title} />
                </div>

                <h3>{step.title}</h3>

                <p>{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Flow Section */}
      <section className="workflow-section">
        <div className="workflow-card workflow-animated">
          <div className="flow-item">Browse Tests</div>
          <div className="flow-arrow">→</div>

          <div className="flow-item">Start Exam</div>
          <div className="flow-arrow">→</div>

          <div className="flow-item">Submit Test</div>
          <div className="flow-arrow">→</div>

          <div className="flow-item">View Analysis</div>
          <div className="flow-arrow">→</div>

          <div className="flow-item">Improve Score</div>
        </div>
      </section>

      {/* Features */}
      <section className="how-section">
        <div className="section-heading">
          <h2>Why Students Love SetuLearn</h2>
          <p>Everything you need to crack your exams.</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <Reveal key={index} delay={index * 80}>
              <div className="feature-card">
                <div className="feature-icon">
                 <img src={`/icons/features/${feature.icon}`} alt={feature.icon} />
                </div>

                <h3>{feature.title}</h3>

                <p>{feature.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Statistics */}
      <section className="stats-section">
        {[
          { icon: "/icons/stats/exams.png", alt: "Mock Tests", value: "45+", label: "Mock Tests" },
          { icon: "/icons/stats/students.png", alt: "Students", value: "20K+", label: "Students" },
          { icon: "/icons/stats/trophy.png", alt: "Success Rate", value: "95%", label: "Success Rate" },
          { icon: "/icons/stats/ok.png", alt: "Free Access", value: "100%", label: "Free Access" },
        ].map((s, i) => (
          <Reveal as="div" className="stat-box" key={s.label} delay={i * 80}>
            <img src={s.icon} alt={s.alt} />
            <h2>{s.value}</h2>
            <p>{s.label}</p>
          </Reveal>
        ))}
      </section>

      {/* CTA */}
      <section className="how-cta">
        <h2>Ready to Start Practicing?</h2>

        <p>
          Take your first mock test and discover your strengths today.
        </p>

        <button className="btn-white btn-lg" onClick={() => navigate("/tests")} >
          <Rocket /> <span>Browse Tests </span>
        </button>
      </section>
    </div>
  );
}