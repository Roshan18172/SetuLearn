import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useStudentAuth } from "../context/StudentAuthContext";
import { getErrorMessage } from "../api/apiErrorHandler";
import PasswordInput from "../components/PasswordInput";
import OtpInput from "../components/OtpInput";
import useCountdown from "../hooks/useCountdown";
import SEO from "../components/SEO";
import "./StudentAuth.css";

const GOOGLE_ENABLED = Boolean(process.env.REACT_APP_GOOGLE_CLIENT_ID);

export default function StudentAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isAuthenticated,
    loading,
    login,
    requestSignupOtp,
    resendSignupOtp,
    verifySignupOtp,
    googleLogin,
  } = useStudentAuth();

  const [mode, setMode] = useState(
    location.pathname.includes("signup") ? "signup" : "login"
  );
  // signup has two steps: "details" -> "otp"
  const [step, setStep] = useState("details");

  useEffect(() => {
    setMode(location.pathname.includes("signup") ? "signup" : "login");
    setStep("details");
    setError("");
  }, [location.pathname]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpInfo, setOtpInfo] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resendIn, startResend] = useCountdown(0);

  const pendingTest = location.state?.pendingTest;
  const redirectTo = location.state?.from || "/dashboard";

  const goAfterAuth = () => {
    if (pendingTest?.test) {
      navigate("/instructions", {
        replace: true,
        state: { test: pendingTest.test, mode: pendingTest.mode || "timed" },
      });
      return;
    }
    navigate(redirectTo, { replace: true });
  };

  useEffect(() => {
    if (!loading && isAuthenticated) goAfterAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAuthenticated]);

  const title =
    mode === "login"
      ? "Login"
      : step === "otp"
        ? "Verify your email"
        : "Sign Up";
  document.title = `${title} - SetuLearn`;

  const switchMode = (next) => {
    setMode(next);
    setStep("details");
    setError("");
    setNotice("");
    setOtp("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const info = await requestSignupOtp({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        });
        setOtpInfo(info);
        setOtp("");
        startResend(info?.resendAfterSeconds ?? 60);
        setStep("otp");
      } else {
        await login({ email: email.trim(), password });
        goAfterAuth();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      await verifySignupOtp({ email: email.trim(), otp });
      goAfterAuth();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setNotice("");
    try {
      const info = await resendSignupOtp(email.trim());
      setOtpInfo(info);
      setOtp("");
      startResend(info?.resendAfterSeconds ?? 60);
      setNotice("A new code is on its way.");
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      const wait = message.match(/wait (\d+)s/);
      if (wait) startResend(Number(wait[1]));
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) {
      setError("Google sign-in failed. Please try again.");
      return;
    }
    setError("");
    try {
      // No phone needed here — new Google users are asked for it on the dashboard.
      await googleLogin({ idToken });
      goAfterAuth();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const showOtpStep = mode === "signup" && step === "otp";

  return (
    <div className="student-auth-page">
      <SEO
        title={mode === "signup" ? "Sign Up" : "Login"}
        description="Create a SetuLearn student account or log in to take mock tests and track your progress."
        canonical={mode === "signup" ? "/signup" : "/login"}
      />

      <div className="student-auth-card">
        <div className="student-auth-header">
          <img src="/logo.webp" alt="SetuLearn" />
          <h1>
            {showOtpStep
              ? "Verify your email"
              : mode === "signup"
                ? "Create account"
                : "Welcome back"}
          </h1>
          <p>
            {showOtpStep
              ? `We sent a 6-digit code to ${email.trim()}${otpInfo?.smsSent ? ` and to ${otpInfo.phoneMasked}` : ""}.`
              : mode === "signup"
                ? "Name, email, phone — then start practicing."
                : "Log in to continue your mock tests."}
          </p>
        </div>

        {showOtpStep ? (
          <form onSubmit={handleVerify}>
            <OtpInput value={otp} onChange={setOtp} disabled={submitting} />

            {error && <div className="student-auth-error">{error}</div>}
            {notice && <div className="student-auth-success">{notice}</div>}

            <button
              type="submit"
              className="student-auth-btn student-auth-btn-primary"
              disabled={submitting || otp.length !== 6}
            >
              {submitting ? "Verifying..." : "Verify & create account"}
            </button>

            <div className="student-auth-row student-auth-row-center">
              {resendIn > 0 ? (
                <span className="student-auth-muted">Resend code in {resendIn}s</span>
              ) : (
                <button type="button" className="student-auth-link" onClick={handleResend}>
                  Resend code
                </button>
              )}
              <span className="student-auth-muted">·</span>
              <button
                type="button"
                className="student-auth-link"
                onClick={() => {
                  setStep("details");
                  setError("");
                  setNotice("");
                }}
              >
                Change details
              </button>
            </div>
            <p className="student-auth-hint student-auth-hint-small">
              The code expires in {Math.round((otpInfo?.expiresInSeconds ?? 600) / 60)} minutes. Check your spam folder if you don&apos;t see it.
            </p>
          </form>
        ) : (
          <>
            <div className="student-auth-tabs">
              <button
                type="button"
                className={`student-auth-tab ${mode === "login" ? "active" : ""}`}
                onClick={() => switchMode("login")}
              >
                Login
              </button>
              <button
                type="button"
                className={`student-auth-tab ${mode === "signup" ? "active" : ""}`}
                onClick={() => switchMode("signup")}
              >
                Sign up
              </button>
            </div>

            {GOOGLE_ENABLED && (
              <>
                <div className="student-auth-google">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                      console.error(
                        `[Google] Sign-in failed on origin ${window.location.origin}. ` +
                          "If this is your deployed site, add that exact origin under " +
                          "Authorized JavaScript origins for the OAuth client in Google Cloud Console."
                      );
                      setError("Google sign-in was cancelled or failed.");
                    }}
                    useOneTap={false}
                    text={mode === "signup" ? "signup_with" : "signin_with"}
                    shape="pill"
                    width="340"
                  />
                </div>
                <div className="student-auth-divider">or</div>
              </>
            )}

            <form onSubmit={handleSubmit}>
              {mode === "signup" && (
                <>
                  <div className="student-form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                      minLength={2}
                      autoComplete="name"
                    />
                  </div>
                  <div className="student-form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      required
                      autoComplete="tel"
                    />
                  </div>
                </>
              )}

              <div className="student-form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="student-form-group">
                <label htmlFor="password">Password</label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                  required
                  minLength={mode === "signup" ? 8 : 1}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
              </div>

              {error && <div className="student-auth-error">{error}</div>}

              <button
                type="submit"
                className="student-auth-btn student-auth-btn-primary"
                disabled={submitting}
              >
                {submitting
                  ? mode === "signup"
                    ? "Sending code..."
                    : "Signing in..."
                  : mode === "signup"
                    ? "Continue"
                    : "Sign in"}
              </button>

              {mode === "login" && (
                <div className="student-auth-row student-auth-row-center">
                  <Link
                    to="/forgot-password"
                    state={{ email: email.trim() }}
                    className="student-auth-link"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}
            </form>
          </>
        )}

        <p className="student-auth-hint">
          <Link to="/">Back to home</Link>
        </p>
      </div>
    </div>
  );
}
