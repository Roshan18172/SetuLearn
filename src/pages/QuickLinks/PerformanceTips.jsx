import { useNavigate } from "react-router-dom";

export default function PerformanceTips() {
    const navigate = useNavigate();
    document.title = "Performance Tips - SetuLearn";

    const tips = [
        {
            icon: "⏰",
            title: "Practice with a Timer",
            desc: "Simulate real exam conditions to improve speed and time management."
        },
        {
            icon: "📊",
            title: "Analyze Your Results",
            desc: "Review incorrect answers and identify weak areas after every test."
        },
        {
            icon: "🎯",
            title: "Focus on Accuracy",
            desc: "Avoid random guessing. Accuracy is often more important than attempts."
        },
        {
            icon: "📚",
            title: "Strengthen Fundamentals",
            desc: "A strong understanding of concepts helps solve tricky questions quickly."
        },
        {
            icon: "🔄",
            title: "Take Regular Mock Tests",
            desc: "Consistency builds confidence and helps track progress over time."
        },
        {
            icon: "📝",
            title: "Maintain Notes",
            desc: "Write down important formulas, shortcuts, and mistakes for revision."
        },
        {
            icon: "🚫",
            title: "Avoid Silly Mistakes",
            desc: "Read questions carefully and double-check calculations."
        },
        {
            icon: "💡",
            title: "Use Smart Strategies",
            desc: "Attempt easy questions first and return to difficult ones later."
        }
    ];

    return (
        <div className="tips-page">

            {/* Hero */}
            <section className="tips-hero">
                <div className="tips-hero-content">
                    <div className="tips-badge">
                        🚀 Score Better in Every Mock Test
                    </div>

                    <h1>
                        Performance <span>Tips</span>
                    </h1>

                    <p>
                        Learn proven strategies used by top rankers to improve
                        speed, accuracy, confidence, and overall exam performance.
                    </p>
                </div>
            </section>

            {/* Tips Grid */}
            <section className="tips-section">
                <h2>Top Performance Tips</h2>

                <div className="tips-grid">
                    {tips.map((tip, index) => (
                        <div className="tip-card" key={index}>
                            <div className="tip-icon">{tip.icon}</div>
                            <h3>{tip.title}</h3>
                            <p>{tip.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Strategy Section */}
            <section className="strategy-section">
                <h2>Exam Day Strategy</h2>

                <div className="strategy-cards">
                    <div className="strategy-card">
                        <span>1️⃣</span>
                        <h3>Start with Easy Questions</h3>
                        <p>
                            Build momentum and confidence before tackling difficult problems.
                        </p>
                    </div>

                    <div className="strategy-card">
                        <span>2️⃣</span>
                        <h3>Manage Time Wisely</h3>
                        <p>
                            Divide time across sections and avoid spending too long on one question.
                        </p>
                    </div>

                    <div className="strategy-card">
                        <span>3️⃣</span>
                        <h3>Review Before Submitting</h3>
                        <p>
                            Revisit marked questions and verify calculations whenever possible.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="tips-stats">
                <div className="tip-stat">
                    <h3>45+</h3>
                    <p>Mock Tests</p>
                </div>

                <div className="tip-stat">
                    <h3>20K+</h3>
                    <p>Students</p>
                </div>

                <div className="tip-stat">
                    <h3>95%</h3>
                    <p>Success Rate</p>
                </div>

                <div className="tip-stat">
                    <h3>100%</h3>
                    <p>Free Access</p>
                </div>
            </section>

            {/* CTA */}
            <section className="tips-cta">
                <h2>Ready to Boost Your Score?</h2>

                <p>
                    Put these strategies into action and start improving today.
                </p>

                <button
                    className="btn-primary"
                    onClick={() => navigate("/tests")}
                >
                    Start Practicing →
                </button>
            </section>

        </div>
    );
}