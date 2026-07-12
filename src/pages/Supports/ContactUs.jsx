import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import contactService from "../../api/contactService";
import { getErrorMessage } from "../../api/apiErrorHandler";
import { ArrowRight, Send } from "../../data/svgs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELD_LIMITS = {
  name: 100,
  email: 254,
  subject: 200,
  message: 2000,
};

const INITIAL_FORM = { name: "", email: "", subject: "", message: "" };
const INITIAL_ERRORS = { name: "", email: "", subject: "", message: "" };

export default function ContactUs() {
  const navigate = useNavigate();
  const errorTimerRef = useRef(null);

  document.title = "Contact Us - SetuLearn";

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

      case "subject":
        if (!trimmed) return "Subject is required.";
        if (trimmed.length < 3) return "Subject must be at least 3 characters.";
        if (trimmed.length > FIELD_LIMITS.subject) return `Subject must be under ${FIELD_LIMITS.subject} characters.`;
        return "";

      case "message":
        if (!trimmed) return "Message is required.";
        if (trimmed.length < 10) return "Message must be at least 10 characters.";
        if (trimmed.length > FIELD_LIMITS.message) return `Message must be under ${FIELD_LIMITS.message} characters.`;
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
      await contactService.sendMessage(trimmedData);
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

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-field">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
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
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
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
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                required
                value={formData.subject}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={FIELD_LIMITS.subject}
                className={fieldErrors.subject ? "input-error" : ""}
                aria-invalid={!!fieldErrors.subject}
                aria-describedby={fieldErrors.subject ? "subject-error" : undefined}
              />
              {fieldErrors.subject && (
                <span id="subject-error" className="field-error" role="alert">
                  {fieldErrors.subject}
                </span>
              )}
            </div>

            <div className="form-field">
              <textarea
                rows="6"
                name="message"
                placeholder="Write your message here..."
                required
                value={formData.message}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={FIELD_LIMITS.message}
                className={fieldErrors.message ? "input-error" : ""}
                aria-invalid={!!fieldErrors.message}
                aria-describedby={fieldErrors.message ? "message-error" : undefined}
              />
              {fieldErrors.message && (
                <span id="message-error" className="field-error" role="alert">
                  {fieldErrors.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary btn-lg"
              disabled={isSubmitting}
            >
              <Send />  {isSubmitting ? "Sending..." : "Send Message"}
            </button>

            {errorMessage && (
              <div className="error-message" role="alert">
                {errorMessage}
              </div>
            )}

            {submitted && (
              <div className="success-message">
                🎉 Your message has been sent successfully!
              </div>
            )}
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
          Browse Tests <ArrowRight />
        </button>
      </section>
    </div>
  );
}