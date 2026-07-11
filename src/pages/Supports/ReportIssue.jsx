import { useState, useEffect, useRef } from "react";
import reportService from "../../api/reportService";
import { getErrorMessage } from "../../api/apiErrorHandler";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELD_LIMITS = {
  name: 100,
  email: 254,
  issueType: 50,
  page: 200,
  description: 3000,
};

const INITIAL_FORM = {
  name: "",
  email: "",
  issueType: "",
  page: "",
  description: "",
};

const INITIAL_ERRORS = {
  name: "",
  email: "",
  issueType: "",
  page: "",
  description: "",
};

export default function ReportIssue() {
  const errorTimerRef = useRef(null);

  document.title = "Report an Issue - SetuLearn";

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ ...INITIAL_ERRORS });
  const [formData, setFormData] = useState({ ...INITIAL_FORM });

  // Auto-dismiss error after 8 seconds
  useEffect(() => {
    if (errorMessage) {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      errorTimerRef.current = setTimeout(() => setErrorMessage(""), 8000);
    }
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, [errorMessage]);

  const validateField = (name, value) => {
    const trimmed = value.trim();

    switch (name) {
      case "name":
        if (!trimmed) return "Name is required.";
        if (trimmed.length < 2) return "Name must be at least 2 characters.";
        if (trimmed.length > FIELD_LIMITS.name) return `Name must be under ${FIELD_LIMITS.name} characters.`;
        return "";

      case "email":
        if (!trimmed) return "Email is required.";
        if (!EMAIL_REGEX.test(trimmed)) return "Please enter a valid email address.";
        if (trimmed.length > FIELD_LIMITS.email) return `Email must be under ${FIELD_LIMITS.email} characters.`;
        return "";

      case "issueType":
        if (!trimmed) return "Please select an issue type.";
        return "";

      case "page":
        // Optional field — no validation if empty
        if (trimmed && trimmed.length > FIELD_LIMITS.page) return `Page name must be under ${FIELD_LIMITS.page} characters.`;
        return "";

      case "description":
        if (!trimmed) return "Description is required.";
        if (trimmed.length < 20) return "Please provide a more detailed description (at least 20 characters).";
        if (trimmed.length > FIELD_LIMITS.description) return `Description must be under ${FIELD_LIMITS.description} characters.`;
        return "";

      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear the general error when user starts typing
    if (errorMessage) setErrorMessage("");

    // Clear the field-level error for the field being edited
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // --- Offline check ---
    if (!navigator.onLine) {
      setErrorMessage("You appear to be offline. Please check your internet connection and try again.");
      return;
    }

    // --- Validate all fields ---
    const trimmedData = {};
    const newFieldErrors = { ...INITIAL_ERRORS };
    let hasError = false;

    for (const field of Object.keys(INITIAL_FORM)) {
      const trimmed = formData[field].trim();
      trimmedData[field] = trimmed;
      const error = validateField(field, trimmed);
      if (error) {
        newFieldErrors[field] = error;
        hasError = true;
      }
    }

    setFieldErrors(newFieldErrors);

    if (hasError) {
      setErrorMessage("Please fix the highlighted fields before submitting.");
      return;
    }

    // --- Submit ---
    setIsSubmitting(true);
    setErrorMessage("");
    setSubmitted(false);

    try {
      await reportService.submitReport(trimmedData);

      setSubmitted(true);
      setFormData({ ...INITIAL_FORM });
      setFieldErrors({ ...INITIAL_ERRORS });

      setTimeout(() => {
        setSubmitted(false);
      }, 4000);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
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

        <form className="report-form" onSubmit={handleSubmit} noValidate>

          <div className="form-row">
            <div className="form-field">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                maxLength={FIELD_LIMITS.name}
                className={fieldErrors.name ? "input-error" : ""}
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? "name-error" : undefined}
              />
              {fieldErrors.name && (
                <span id="name-error" className="field-error" role="alert">
                  {fieldErrors.name}
                </span>
              )}
            </div>

            <div className="form-field">
              <input
                name="email"
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                maxLength={FIELD_LIMITS.email}
                className={fieldErrors.email ? "input-error" : ""}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
              />
              {fieldErrors.email && (
                <span id="email-error" className="field-error" role="alert">
                  {fieldErrors.email}
                </span>
              )}
            </div>
          </div>

          <div className="form-field">
            <select
              name="issueType"
              value={formData.issueType}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={fieldErrors.issueType ? "input-error" : ""}
              aria-invalid={!!fieldErrors.issueType}
              aria-describedby={fieldErrors.issueType ? "issuetype-error" : undefined}
            >
              <option value="">
                Select Issue Type
              </option>

              <option>Bug Report</option>
              <option>Question Error</option>
              <option>Performance Issue</option>
              <option>Feature Request</option>
              <option>Other</option>
            </select>
            {fieldErrors.issueType && (
              <span id="issuetype-error" className="field-error" role="alert">
                {fieldErrors.issueType}
              </span>
            )}
          </div>

          <div className="form-field">
            <input
              type="text"
              name="page"
              placeholder="Page / Test Name (Optional)"
              value={formData.page}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={FIELD_LIMITS.page}
              className={fieldErrors.page ? "input-error" : ""}
              aria-invalid={!!fieldErrors.page}
              aria-describedby={fieldErrors.page ? "page-error" : undefined}
            />
            {fieldErrors.page && (
              <span id="page-error" className="field-error" role="alert">
                {fieldErrors.page}
              </span>
            )}
          </div>

          <div className="form-field">
            <textarea
              rows="6"
              name="description"
              placeholder="Describe the issue in detail..."
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              maxLength={FIELD_LIMITS.description}
              className={fieldErrors.description ? "input-error" : ""}
              aria-invalid={!!fieldErrors.description}
              aria-describedby={fieldErrors.description ? "description-error" : undefined}
            />
            {fieldErrors.description && (
              <span id="description-error" className="field-error" role="alert">
                {fieldErrors.description}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Report →"}
          </button>

          {errorMessage && (
            <div className="error-message" role="alert" style={{ color: "#b91c1c", marginTop: "0.75rem" }}>
              {errorMessage}
            </div>
          )}

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