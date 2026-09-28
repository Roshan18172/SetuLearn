import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useStudentAuth } from "../context/StudentAuthContext";
import { getErrorMessage } from "../api/apiErrorHandler";
import SEO from "../components/SEO";
import "./StudentAuth.css";

const GOOGLE_ENABLED = Boolean(process.env.REACT_APP_GOOGLE_CLIENT_ID);

export default function StudentAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, login, signup, googleLogin } = useStudentAuth();

  const [mode, setMode] = useState(
    location.pathname.includes("signup") ? "signup" : "login"
  );

  useEffect(() => {
    setMode(location.pathname.includes("signup") ? "signup" : "login");
  }, [location.pathname]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Google first-signup phone capture
  const [pendingGoogleToken, setPendingGoogleToken] = useState(null);
  const [googlePhone, setGooglePhone] = useState("");
  const [googlePhoneError, setGooglePhoneError] = useState("");
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const pendingTest = location.state?.pendingTest;
  const redirectTo = location.state?.from || "/dashboard";

  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (pendingTest?.test) {
        navigate("/instructions", {
          replace: true,
          state: { test: pendingTest.test, mode: pendingTest.mode || "timed" },
        });
        return;
      }
      navigate(redirectTo, { replace: true });
    }
  }, [loading, isAuthenticated, navigate, redirectTo, pendingTest]);

  document.title = mode === "signup" ? "Sign Up - SetuLearn" : "Login - SetuLearn";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "signup") {
        await signup({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        });
      } else {
        await login({ email: email.trim(), password });
      }
      goAfterAuth();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

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

  const completeGoogle = async (idToken, phoneValue) => {
    setGoogleSubmitting(true);
    setGooglePhoneError("");
    setError("");
    try {
      await googleLogin({
        idToken,
        phone: phoneValue || undefined,
      });
      setPendingGoogleToken(null);
      goAfterAuth();
    } catch (err) {
      const message = getErrorMessage(err);
      const needsPhone =
        err?.response?.status === 400 &&
        /phone/i.test(message || "");

      if (needsPhone && !phoneValue) {
        setPendingGoogleToken(idToken);
      } else if (pendingGoogleToken) {
        setGooglePhoneError(message);
      } else {
        setError(message);
      }
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) {
      setError("Google sign-in failed. Please try again.");
      return;
    }
    await completeGoogle(idToken);
  };

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
          <h1>{mode === "signup" ? "Create account" : "Welcome back"}</h1>
          <p>
            {mode === "signup"
              ? "Name, email, phone — then start practicing."
              : "Log in to continue your mock tests."}
          </p>
        </div>

        <div className="student-auth-tabs">
          <button
            type="button"
            className={`student-auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={`student-auth-tab ${mode === "signup" ? "active" : ""}`}
            onClick={() => {
              setMode("signup");
              setError("");
            }}
          >
            Sign up
          </button>
        </div>

        {GOOGLE_ENABLED && (
          <>
            <div className="student-auth-google">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google sign-in was cancelled or failed.")}
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
            <input
              id="password"
              type="password"
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
                ? "Creating account..."
                : "Signing in..."
              : mode === "signup"
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="student-auth-hint">
          <Link to="/">Back to home</Link>
        </p>
      </div>

      {pendingGoogleToken && (
        <div className="student-phone-modal-backdrop">
          <div className="student-phone-modal">
            <h2>Add your phone number</h2>
            <p>
              We need your phone once to finish Google signup. You won&apos;t be asked again.
            </p>
            <div className="student-form-group">
              <label htmlFor="google-phone">Phone</label>
              <input
                id="google-phone"
                type="tel"
                value={googlePhone}
                onChange={(e) => setGooglePhone(e.target.value)}
                placeholder="10-digit mobile number"
                autoFocus
              />
            </div>
            {googlePhoneError && (
              <div className="student-auth-error">{googlePhoneError}</div>
            )}
            <button
              type="button"
              className="student-auth-btn student-auth-btn-primary"
              disabled={googleSubmitting || googlePhone.trim().length < 10}
              onClick={() => completeGoogle(pendingGoogleToken, googlePhone.trim())}
            >
              {googleSubmitting ? "Saving..." : "Continue"}
            </button>
            <button
              type="button"
              className="student-auth-btn"
              style={{ marginTop: 8, background: "transparent", color: "#6f6a85" }}
              onClick={() => {
                setPendingGoogleToken(null);
                setGooglePhone("");
                setGooglePhoneError("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
