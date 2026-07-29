import { useNavigate } from "react-router-dom";
export default function PrivacyPolicy() {
    const navigate = useNavigate();
    document.title = "Privacy Policy - SetuLearn";
    const sections = [
        {
            title: "Information We Collect",
            icon: "/icons/document.png",
            content:
                "We may collect information such as your name, email address, exam preferences, test attempts, performance analytics, and feedback submitted through the platform."
        },
        {
            title: "How We Use Information",
            icon: "/icons/misc/gear.png",
            content:
                "Information is used to improve user experience, personalize recommendations, analyze performance, fix technical issues, and enhance platform functionality."
        },
        {
            title: "Cookies & Analytics",
            icon: "/icons/misc/cookie.png",
            content:
                "SetuLearn may use cookies and analytics tools to understand user behavior, remember preferences, and improve website performance."
        },
        {
            title: "Data Security",
            icon: "/icons/misc/shield.png",
            content:
                "We implement appropriate security measures to protect your data from unauthorized access, alteration, disclosure, or destruction."
        },
        {
            title: "Third-Party Services",
            icon: "/icons/vision.png",
            content:
                "We may integrate trusted third-party services for analytics, hosting, authentication, and communication. These providers follow their own privacy policies."
        },
        {
            title: "User Rights",
            icon: "/icons/misc/scale.png",
            content:
                "You have the right to access, update, or request deletion of your personal information in accordance with applicable laws."
        },
        {
            title: "Children's Privacy",
            icon: "/icons/exam-icons/graduation-cap.png",
            content:
                "Our platform is intended for students and learners. We do not knowingly collect sensitive personal information from children without appropriate consent."
        },
        {
            title: "Policy Updates",
            icon: "/icons/misc/refresh.png",
            content:
                "This Privacy Policy may be updated periodically. Changes will be posted on this page along with the updated revision date."
        }
    ];

    return (
        <div className="privacy-page">

            {/* Hero Section */}
            <section className="privacy-hero">
                <div className="privacy-badge">
                    <img src="/icons/misc/shield.png" alt="" className="emoji-icon" /> Your Privacy Matters
                </div>

                <h1>Privacy Policy</h1>

                <p>
                    At SetuLearn, protecting your privacy and personal information
                    is one of our highest priorities. This page explains how we
                    collect, use, and safeguard your data.
                </p>

                <div className="privacy-date">
                    Last Updated: June 2026
                </div>
            </section>

            {/* Intro */}
            <section className="privacy-intro">
                <div className="privacy-intro-card">
                    <h2>Our Commitment</h2>

                    <p>
                        We believe students should be able to prepare for exams
                        confidently and securely. We collect only the information
                        necessary to provide a better learning experience and
                        continuously improve the platform.
                    </p>
                </div>
            </section>

            {/* Policy Sections */}
            <section className="privacy-sections">
                {sections.map((section, index) => (
                    <div className="privacy-card" key={index}>
                        <div className="privacy-icon">
                            {section.icon && typeof section.icon === 'string' && section.icon.startsWith('/') ? (
                                <img src={section.icon} alt={section.title} height={70}/>
                            ) : (
                                section.icon
                            )}
                        </div>

                        <div>
                            <h3>{section.title}</h3>
                            <p>{section.content}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* Data Protection */}
            <section className="privacy-highlight">
                <div className="highlight-content">
                    <h2><img src="/icons/misc/shield.png" alt="" className="emoji-icon-lg" /> Data Protection First</h2>

                    <p>
                        Your test results, analytics, and account information
                        are handled responsibly and protected using modern
                        security practices.
                    </p>

                    <div className="highlight-points">
                        <span><img src="/icons/correct.png" alt="ok" /> Secure Storage</span>
                        <span><img src="/icons/correct.png" alt="ok" /> Encrypted Communication</span>
                        <span><img src="/icons/correct.png" alt="ok" /> Limited Data Access</span>
                        <span><img src="/icons/correct.png" alt="ok" /> Regular Monitoring</span>
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section className="privacy-contact">
                <h2>Questions About Privacy?</h2>

                <p>
                    If you have any concerns regarding data collection,
                    storage, or privacy practices, please contact our
                    support team.
                </p>

                <button className="btn-primary"  style={{ margin: "0 auto", display: "block" }} onClick={() => navigate("/contact")}>
                    Contact Support →
                </button>
            </section>

        </div>
    );
}