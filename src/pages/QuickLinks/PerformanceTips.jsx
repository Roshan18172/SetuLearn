 import { ArrowRight } from "iconoir-react";
import { useNavigate } from "react-router-dom";
import Reveal from "../../components/Reveal";

export default function PerformanceTips() {
    const navigate = useNavigate();
    document.title = "Performance Tips - SetuLearn";

    const tips = [
        {
            icon: "timer.png",
            title: "Practice with a Timer",
            desc: "Simulate real exam conditions to improve speed and time management."
        },
        {
            icon: "analyze.png",
            title: "Analyze Your Results",
            desc: "Review incorrect answers and identify weak areas after every test."
        },
        {
            icon: "focus.png",
            title: "Focus on Accuracy",
            desc: "Avoid random guessing. Accuracy is often more important than attempts."
        },
        {
            icon: "books.png",
            title: "Strengthen Fundamentals",
            desc: "A strong understanding of concepts helps solve tricky questions quickly."
        },
        {
            icon: "repeat.png",
            title: "Take Regular Mock Tests",
            desc: "Consistency builds confidence and helps track progress over time."
        },
        {
            icon: "note.png",
            title: "Maintain Notes",
            desc: "Write down important formulas, shortcuts, and mistakes for revision."
        },
        {
            icon: "avoid.png",
            title: "Avoid Silly Mistakes",
            desc: "Read questions carefully and double-check calculations."
        },
        {
            icon: "smart.png",
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
                        <img src="/icons/rocket.png" alt="rocket" height={20}/> Score Better in Every Mock Test
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
                        <Reveal key={index} delay={index * 70}>
                            <div className="tip-card">
                                <div className="tip-icon">
                                    <img src={`/icons/tips/${tip.icon}`} alt={tip.title} />
                                </div>
                                <h3>{tip.title}</h3>
                                <p>{tip.desc}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* Strategy Section */}
            <section className="strategy-section">
                <h2>Exam Day Strategy</h2>

                <div className="strategy-cards">
                    <Reveal delay={0}>
                        <div className="strategy-card">
                            <span className="strategy-number">1</span>
                            <img src="/icons/tips/one.png" alt="Start with Easy Questions" />
                            <h3>Start with Easy Questions</h3>
                            <p>
                                Build momentum and confidence before tackling difficult problems.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal delay={100}>
                        <div className="strategy-card">
                            <span className="strategy-number">2</span>
                            <img src="/icons/tips/two.png" alt="Manage Time Wisely" />
                            <h3>Manage Time Wisely</h3>
                            <p>
                                Divide time across sections and avoid spending too long on one question.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal delay={200}>
                        <div className="strategy-card">
                            <span className="strategy-number">3</span>
                            <img src="/icons/tips/three.png" alt="Review Before Submitting" />
                            <h3>Review Before Submitting</h3>
                            <p>
                                Revisit marked questions and verify calculations whenever possible.
                            </p>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* Stats */}
            <section className="tips-stats">
                {[
                    { icon: "/icons/stats/exams.png", alt: "Mock Tests", value: "45+", label: "Mock Tests" },
                    { icon: "/icons/stats/students.png", alt: "Students", value: "20K+", label: "Students" },
                    { icon: "/icons/stats/trophy.png", alt: "Success Rate", value: "95%", label: "Success Rate" },
                    { icon: "/icons/stats/ok.png", alt: "Free Access", value: "100%", label: "Free Access" },
                ].map((s, i) => (
                    <Reveal as="div" className="tip-stat" key={s.label} delay={i * 80}>
                        <img src={s.icon} alt={s.alt} />
                        <h3>{s.value}</h3>
                        <p>{s.label}</p>
                    </Reveal>
                ))}
            </section>

            {/* CTA */}
            <section className="tips-cta">
                <h2>Ready to Boost Your Score?</h2>

                <p>
                    Put these strategies into action and start improving today.
                </p>

                <button className="btn-white btn-lg" onClick={() => navigate("/tests")} >
                    Start Practicing <ArrowRight height={18} width={18} />
                </button>
            </section>

        </div>
    );
}