import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ContactUs() {
    const navigate = useNavigate();
    document.title = "Contact Us - SetuLearn";
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        alert("Message sent successfully!");

        setFormData({
            name: "",
            email: "",
            subject: "",
            message: "",
        });
    };

    return (
        <div className="contact-page">
            {/* Hero */}
            <section className="contact-hero">
                <div className="contact-hero-content">
                    <span className="contact-badge">📞 We're Here To Help</span>

                    <h1>
                        Get In <span>Touch</span>
                    </h1>

                    <p>
                        Have questions, suggestions, or found an issue?
                        We'd love to hear from you.
                    </p>
                </div>
            </section>

            {/* Contact Info */}
            <section className="contact-info-grid">
                <div className="contact-card">
                    <div className="contact-icon">📧</div>
                    <h3>Email Us</h3>
                    <p>support@SetuLearn.com</p>
                </div>

                <div className="contact-card">
                    <div className="contact-icon">📱</div>
                    <h3>Call Us</h3>
                    <p>+91 98765 43210</p>
                </div>

                <div className="contact-card">
                    <div className="contact-icon">⏰</div>
                    <h3>Support Hours</h3>
                    <p>Mon - Sat, 9 AM - 6 PM</p>
                </div>
            </section>

            {/* Main Section */}
            <section className="contact-main">
                {/* Form */}
                <div className="contact-form-card">
                    <div className="form-header">
                        <h2>Send Us a Message</h2>
                        <p>We'll get back to you within 24 hours.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <input
                                type="text"
                                name="name"
                                placeholder="Your Name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                            />

                            <input
                                type="email"
                                name="email"
                                placeholder="Your Email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <input
                            type="text"
                            name="subject"
                            placeholder="Subject"
                            required
                            value={formData.subject}
                            onChange={handleChange}
                        />

                        <textarea
                            rows="6"
                            name="message"
                            placeholder="Write your message here..."
                            required
                            value={formData.message}
                            onChange={handleChange}
                        />

                        <button type="submit" className="btn-primary btn-lg">
                            Send Message →
                        </button>
                    </form>
                </div>

                {/* Side Panel */}
                <div className="contact-side">
                    <div className="response-card">
                        <h3>⚡ Quick Response</h3>
                        <p>
                            Most support requests are answered within
                            24 hours.
                        </p>
                    </div>

                    <div className="response-card">
                        <h3>💡 Suggestions Welcome</h3>
                        <p>
                            We continuously improve SetuLearn based
                            on student feedback.
                        </p>
                    </div>

                    <div className="response-card">
                        <h3>🐞 Report Issues</h3>
                        <p>
                            Found a bug or incorrect question?
                            Let us know and we'll fix it quickly.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="contact-cta">
                <h2>Ready to Continue Practicing?</h2>
                <p>
                    Explore hundreds of mock tests and improve
                    your exam performance.
                </p>

                <button className="btn-white" onClick={() => navigate("/tests")}>
                    Browse Tests →
                </button>
            </section>
        </div>
    );
}