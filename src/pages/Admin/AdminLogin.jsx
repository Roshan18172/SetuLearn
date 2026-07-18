import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { getErrorMessage } from "../../api/apiErrorHandler";
import { ArrowLeft } from "../../data/svgs";
import "./AdminUI.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  document.title = "Admin Login - SetuLearn";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <img src="/logo.webp" alt="SetuLearn" height="48" />
          <h1>Admin Login</h1>
          <p>Sign in to manage SetuLearn</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@setulearn.com"
              autoFocus
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          {error && <div className="admin-error-box">{error}</div>}

          <button type="submit" className="admin-btn admin-btn-primary w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="admin-login-footer">
          <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><ArrowLeft /> Back to SetuLearn</a>
        </div>
      </div>
    </div>
  );
}