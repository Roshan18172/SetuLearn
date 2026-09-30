import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import studentService from "../api/studentService";
import { getErrorMessage } from "../api/apiErrorHandler";
import PasswordInput from "../components/PasswordInput";
import OtpInput from "../components/OtpInput";
import useCountdown from "../hooks/useCountdown";
import SEO from "../components/SEO";
import "./StudentAuth.css";

/** 1) enter email -> 2) enter emailed code + new password -> 3) success. */
export default function ForgotPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resendIn, startResend] = useCountdown(0);

  document.title = "Forgot Password - SetuLearn";

  const sendCode = async (e) => {
    e?.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      const info = await studentService.forgotPassword(email.trim());
      startResend(info?.resendAfterSeconds ?? 60);
      setOtp("");
      setStep("reset");
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      const wait = message.match(/wait (\d+)s/);
      if (wait) startResend(Number(wait[1]));
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    await sendCode();
    setNotice((n) => n || "If that email is registered, a new code is on its way.");
  };

  const reset = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await studentService.resetPassword({
        email: email.trim(),
        otp,
        newPassword,
      });
      setStep("done");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="student-auth-page">
      <SEO
        title="Forgot Password"
        description="Reset your SetuLearn account password."
        canonical="/forgot-password"
      />

      <div className="student-auth-card">
        <div className="student-auth-header">
          <img src="/logo.webp" alt="SetuLearn" />
          <h1>
            {step === "done"
              ? "Password updated"
              : step === "reset"
                ? "Set a new password"
                : "Forgot password?"}
          </h1>
          <p>
            {step === "done"
              ? "You can now sign in with your new password."
              : step === "reset"
                ? `Enter the 6-digit code we emailed to ${email.trim()}.`
                : "Enter your account email and we'll send you a reset code."}
          </p>
        </div>

        {step === "email" && (
          <form onSubmit={sendCode}>
            <div className="student-form-group">
              <label htmlFor="fp-email">Email</label>
              <input
                id="fp-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                autoComplete="email"
              />
            </div>
            {error && <div className="student-auth-error">{error}</div>}
            <button
              type="submit"
              className="student-auth-btn student-auth-btn-primary"
              disabled={submitting}
            >
              {submitting ? "Sending code..." : "Send reset code"}
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={reset}>
            <OtpInput value={otp} onChange={setOtp} disabled={submitting} />

            <div className="student-form-group">
              <label htmlFor="fp-new">New password</label>
              <PasswordInput
                id="fp-new"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="student-form-group">
              <label htmlFor="fp-confirm">Confirm new password</label>
              <PasswordInput
                id="fp-confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter the new password"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            {error && <div className="student-auth-error">{error}</div>}
            {notice && <div className="student-auth-success">{notice}</div>}

            <button
              type="submit"
              className="student-auth-btn student-auth-btn-primary"
              disabled={submitting || otp.length !== 6 || newPassword.length < 8}
            >
              {submitting ? "Updating..." : "Reset password"}
            </button>

            <div className="student-auth-row student-auth-row-center">
              {resendIn > 0 ? (
                <span className="student-auth-muted">Resend code in {resendIn}s</span>
              ) : (
                <button type="button" className="student-auth-link" onClick={resend}>
                  Resend code
                </button>
              )}
              <span className="student-auth-muted">·</span>
              <button
                type="button"
                className="student-auth-link"
                onClick={() => {
                  setStep("email");
                  setError("");
                }}
              >
                Change email
              </button>
            </div>
          </form>
        )}

        {step === "done" && (
          <>
            <div className="student-auth-success">
              Your password was changed. We&apos;ve also sent a confirmation to your email.
            </div>
            <button
              type="button"
              className="student-auth-btn student-auth-btn-primary"
              onClick={() => navigate("/login", { replace: true })}
            >
              Back to sign in
            </button>
          </>
        )}

        {step !== "done" && (
          <p className="student-auth-hint">
            <Link to="/login">Back to sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
