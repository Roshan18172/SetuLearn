import { useNavigate } from "react-router-dom";

export default function TermsOfService() {
    document.title = "Terms of Service - SetuLearn";
    const navigate = useNavigate();

    const sections = [
        {
            icon: "📚",
            title: "Use of Platform",
            text: "SetuLearn provides mock tests and educational resources for exam preparation. Users may use the platform only for lawful educational purposes."
        },
        {
            icon: "👤",
            title: "User Responsibilities",
            text: "Users are responsible for providing accurate information and maintaining appropriate conduct while using the platform."
        },
        {
            icon: "🚫",
            title: "Prohibited Activities",
            text: "You may not copy, distribute, modify, reverse engineer, or misuse any content, tests, or services provided by SetuLearn."
        },
        {
            icon: "📝",
            title: "Intellectual Property",
            text: "All test content, designs, logos, and educational materials remain the property of SetuLearn unless otherwise stated."
        },
        {
            icon: "⚠️",
            title: "Disclaimer",
            text: "Mock test results are for practice purposes only and do not guarantee actual exam performance."
        },
        {
            icon: "🔒",
            title: "Privacy",
            text: "Your use of SetuLearn is also governed by our Privacy Policy, which explains how we collect and protect information."
        },
        {
            icon: "🔄",
            title: "Changes to Terms",
            text: "We reserve the right to update these Terms of Service at any time. Continued use of the platform constitutes acceptance of the revised terms."
        },
        {
            icon: "📩",
            title: "Contact",
            text: "For questions regarding these terms, users may contact our support team through the Contact Us page."
        }
    ];

    return (
        <div className="tos-page">
            {/* Hero */}
            <section className="tos-hero">
                <div className="tos-hero-content">
                    <div className="tos-badge">📜 Legal Information</div>

                    <h1>
                        Terms of <span>Service</span>
                    </h1>

                    <p>
                        These terms govern your use of SetuLearn. By accessing our platform,
                        you agree to comply with the following conditions and guidelines.
                    </p>
                </div>
            </section>

            {/* Overview */}
            <section className="tos-overview">
                <div className="tos-overview-card">
                    <h2>Agreement Overview</h2>

                    <p>
                        SetuLearn is designed to help students prepare for examinations
                        through mock tests, analytics, and performance tracking.
                        By using our services, you acknowledge and agree to these terms.
                    </p>
                </div>
            </section>

            {/* Terms Sections */}
            <section className="tos-sections">
                {sections.map((item, index) => (
                    <div key={index} className="tos-card">
                        <div className="tos-icon">{item.icon}</div>

                        <h3>{item.title}</h3>

                        <p>{item.text}</p>
                    </div>
                ))}
            </section>

            {/* Important Notice */}
            <section className="tos-notice">
                <div className="tos-notice-card">
                    <h2>⚠️ Important Notice</h2>

                    <p>
                        Violation of these terms may result in temporary or permanent
                        suspension of access to SetuLearn services.
                    </p>
                </div>
            </section>

            {/* CTA */}
            <section className="tos-cta">
                <h2>Continue Your Preparation Journey</h2>

                <p>
                    Explore mock tests, improve your performance, and achieve your goals.
                </p>

                <button
                    className="btn-primary btn-lg"
                    onClick={() => navigate("/tests")}
                >
                    Browse Tests →
                </button>
            </section>
        </div>
    );
}