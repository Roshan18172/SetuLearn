import { useNavigate } from "react-router-dom";

export default function Accessibility() {
    const navigate = useNavigate();
    document.title = "Accessibility Statement - SetuLearn";

    const features = [
        {
            icon: "⌨️",
            title: "Keyboard Navigation",
            desc: "Navigate tests and pages using keyboard shortcuts without relying on a mouse."
        },
        {
            icon: "👀",
            title: "Readable Design",
            desc: "Clear typography, proper spacing, and high contrast colors improve readability."
        },
        {
            icon: "📱",
            title: "Responsive Layout",
            desc: "Access SetuLearn seamlessly across desktop, tablet, and mobile devices."
        },
        {
            icon: "🔍",
            title: "Zoom Support",
            desc: "The platform remains usable even when browser zoom levels are increased."
        },
        {
            icon: "🎨",
            title: "Accessible Colors",
            desc: "Color combinations are selected to improve visibility and reduce eye strain."
        },
        {
            icon: "🔊",
            title: "Screen Reader Friendly",
            desc: "Semantic HTML helps assistive technologies interpret content accurately."
        }
    ];

    return (
        <div className="accessibility-page">
            {/* Hero */}
            <section className="accessibility-hero">
                <div className="accessibility-badge">
                    ♿ Inclusive Learning For Everyone
                </div>

                <h1>
                    Accessibility <span>Statement</span>
                </h1>

                <p>
                    At SetuLearn, we believe every student deserves equal access to quality
                    exam preparation resources. We are committed to creating an inclusive
                    learning experience for all users.
                </p>
            </section>

            {/* Mission */}
            <section className="accessibility-mission">
                <div className="mission-card">
                    <h2>Our Commitment</h2>

                    <p>
                        We continuously work to improve accessibility so students can use
                        SetuLearn regardless of device, ability, or learning environment.
                        Our goal is to make exam preparation simple, accessible, and
                        effective for everyone.
                    </p>
                </div>
            </section>

            {/* Features */}
            <section className="accessibility-features">
                <h2>Accessibility Features</h2>

                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="access-card">
                            <div className="access-icon">{feature.icon}</div>

                            <h3>{feature.title}</h3>

                            <p>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Standards */}
            <section className="accessibility-standards">
                <div className="standards-card">
                    <h2>🌍 Accessibility Standards</h2>

                    <p>
                        SetuLearn aims to follow modern web accessibility principles and
                        continuously improve usability through user feedback and best
                        practices.
                    </p>

                    <div className="standards-list">
                        <div className="standard-item">✅ Semantic HTML Structure</div>
                        <div className="standard-item">✅ Keyboard Friendly Navigation</div>
                        <div className="standard-item">✅ Responsive Design</div>
                        <div className="standard-item">✅ Accessible Form Elements</div>
                        <div className="standard-item">✅ Readable Typography</div>
                        <div className="standard-item">✅ Proper Color Contrast</div>
                    </div>
                </div>
            </section>

            {/* Feedback */}
            <section className="accessibility-feedback">
                <div className="feedback-card">
                    <h2>💬 Need Assistance?</h2>

                    <p>
                        If you encounter accessibility barriers while using SetuLearn,
                        please let us know. Your feedback helps us improve the experience
                        for everyone.
                    </p>

                    <button className="btn-primary btn-lg" onClick={() => navigate("/contact")} >
                        Contact Support →
                    </button>
                </div>
            </section>
        </div>
    );
}