 import { useNavigate } from "react-router-dom";

export default function HowItWorks() {
  const navigate = useNavigate();
    document.title = "How It Works - SetuLearn";

  const steps = [
    {
      icon: "🔍",
      title: "Browse Tests",
      desc: "Explore hundreds of mock tests across engineering, medical, government, banking, and entrance exam categories."
    },
    {
      icon: "📋",
      title: "Read Instructions",
      desc: "Review test rules, marking scheme, duration, and subject-wise distribution before starting."
    },
    {
      icon: "📝",
      title: "Attempt Questions",
      desc: "Answer questions, mark difficult ones for review, and navigate freely between sections."
    },
    {
      icon: "⏱️",
      title: "Manage Time",
      desc: "Practice under real exam conditions using the built-in timer and performance tracker."
    },
    {
      icon: "📊",
      title: "Get Instant Results",
      desc: "Receive detailed scorecards immediately after submission with accuracy and percentile insights."
    },
    {
      icon: "📖",
      title: "Analyze & Improve",
      desc: "Review solutions, identify weak topics, and improve your performance with every attempt."
    }
  ];

  const features = [
    {
      icon: "🎯",
      title: "Real Exam Experience",
      desc: "Tests designed to match actual exam patterns."
    },
    {
      icon: "⚡",
      title: "Instant Evaluation",
      desc: "No waiting. Get your results immediately."
    },
    {
      icon: "📈",
      title: "Performance Analytics",
      desc: "Track progress and improve weak areas."
    },
    {
      icon: "🆓",
      title: "Completely Free",
      desc: "Practice without subscriptions or hidden charges."
    }
  ];

  return (
    <div className="how-page">
      {/* Hero Section */}
      <section className="how-hero">
        <div className="how-badge">
          🚀 Simple • Smart • Effective
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
            <div key={index} className="step-card">
              <div className="step-number">
                {index + 1}
              </div>

              <div className="step-icon">
                {step.icon}
              </div>

              <h3>{step.title}</h3>

              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Flow Section */}
      <section className="workflow-section">
        <div className="workflow-card">
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
            <div key={index} className="feature-card">
              <div className="feature-icon">
                {feature.icon}
              </div>

              <h3>{feature.title}</h3>

              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Statistics */}
      <section className="stats-section">
        <div className="stat-box">
          <h2>45+</h2>
          <p>Mock Tests</p>
        </div>

        <div className="stat-box">
          <h2>20K+</h2>
          <p>Students</p>
        </div>

        <div className="stat-box">
          <h2>95%</h2>
          <p>Success Rate</p>
        </div>

        <div className="stat-box">
          <h2>100%</h2>
          <p>Free Access</p>
        </div>
      </section>

      {/* CTA */}
      <section className="how-cta">
        <h2>Ready to Start Practicing?</h2>

        <p>
          Take your first mock test and discover your strengths today.
        </p>

        <button className="btn-primary btn-lg" onClick={() => navigate("/tests")} >
          🚀 Browse Tests
        </button>
      </section>
    </div>
  );
}