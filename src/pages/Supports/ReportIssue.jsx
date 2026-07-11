import { useState } from "react";
import reportService from "../../api/reportService";
import { getErrorMessage } from "../../api/apiErrorHandler";

export default function ReportIssue() {
    document.title = "Report an Issue - SetuLearn";
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        issueType: "",
        page: "",
        description: "",
    });
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await reportService.submitReport(formData);

            setSubmitted(true);

            setFormData({
                name: "",
                email: "",
                issueType: "",
                page: "",
                description: "",
            });

            setTimeout(() => {
                setSubmitted(false);
            }, 4000);
        } catch (error) {
            alert(getErrorMessage(error));
        }
    };

    return (
        <div className="report-page">

            {/* Hero */}
            <section className="report-hero">
                <div className="report-badge">
                    🛠️ Support Center
                </div>

                <h1>Report an Issue</h1>

                <p>
                    Found a bug, incorrect question, technical problem, or have feedback?
                    Let us know and we'll work on fixing it.
                </p>
            </section>

            {/* Quick Categories */}
            <section className="issue-categories">
                <div className="issue-card">
                    <span>🐞</span>
                    <h3>Bug Report</h3>
                    <p>Something isn't working correctly.</p>
                </div>

                <div className="issue-card">
                    <span>📝</span>
                    <h3>Question Error</h3>
                    <p>Incorrect answer or question content.</p>
                </div>

                <div className="issue-card">
                    <span>⚡</span>
                    <h3>Performance</h3>
                    <p>Slow loading or website issues.</p>
                </div>

                <div className="issue-card">
                    <span>💡</span>
                    <h3>Suggestion</h3>
                    <p>Share ideas to improve SetuLearn.</p>
                </div>
            </section>

            {/* Form */}
            <section className="report-form-section">

                <div className="report-info">
                    <h2>We're Here To Help</h2>

                    <p>
                        Your feedback helps us improve the platform for thousands
                        of students preparing for competitive exams.
                    </p>

                    <div className="report-features">
                        <div>✅ Fast Response</div>
                        <div>✅ Issue Tracking</div>
                        <div>✅ Regular Updates</div>
                        <div>✅ Student First Approach</div>
                    </div>

                    <div className="response-box">
                        <h4>⏱️ Expected Response Time</h4>
                        <p>Most issues are reviewed within 24-48 hours.</p>
                    </div>
                </div>

                <form className="report-form" onSubmit={handleSubmit}>

                    <div className="form-row">
                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <input
                            name="email"
                            type="email"
                            placeholder="Your Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />                    </div>

                    <select name="issueType" value={formData.issueType} onChange={handleChange} required>
                        <option value="">
                            Select Issue Type
                        </option>

                        <option>Bug Report</option>
                        <option>Question Error</option>
                        <option>Performance Issue</option>
                        <option>Feature Request</option>
                        <option>Other</option>
                    </select>

                    <input
                        type="text"
                        name="page"
                        placeholder="Page / Test Name (Optional)"
                        value={formData.page}
                        onChange={handleChange}
                    />
                    <textarea
                        rows="6"
                        name="description"
                        placeholder="Describe the issue in detail..."
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit" className="btn-primary submit-btn" >
                        Submit Report →
                    </button>

                    {submitted && (
                        <div className="success-message">
                            🎉 Your issue has been submitted successfully!
                        </div>
                    )}

                </form>

            </section>

            {/* FAQ Support */}
            <section className="report-help">
                <h2>Before Reporting</h2>

                <div className="help-grid">

                    <div className="help-item">
                        <span>🔄</span>
                        <h3>Refresh Page</h3>
                        <p>Many temporary issues are fixed by refreshing.</p>
                    </div>

                    <div className="help-item">
                        <span>🌐</span>
                        <h3>Check Internet</h3>
                        <p>Ensure your connection is stable.</p>
                    </div>

                    <div className="help-item">
                        <span>📱</span>
                        <h3>Try Another Device</h3>
                        <p>Test if the issue is device-specific.</p>
                    </div>

                    <div className="help-item">
                        <span>🧹</span>
                        <h3>Clear Browser Cache</h3>
                        <p>Old cache files can sometimes cause issues.</p>
                    </div>

                </div>
            </section>

        </div>
    );
}