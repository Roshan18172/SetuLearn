import { useEffect, useState } from "react";
import { useStudentAuth } from "../../context/StudentAuthContext";
import { getErrorMessage } from "../../api/apiErrorHandler";

export default function StudentProfile() {
  const { student, updateProfile } = useStudentAuth();
  const [name, setName] = useState(student?.name || "");
  const [email, setEmail] = useState(student?.email || "");
  const [phone, setPhone] = useState(student?.phone || "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(student?.name || "");
    setEmail(student?.email || "");
    setPhone(student?.phone || "");
  }, [student]);

  document.title = "Profile - SetuLearn";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };
      if (password.trim().length >= 8) {
        payload.password = password.trim();
      }
      await updateProfile(payload);
      setPassword("");
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Profile</h1>
          <p className="admin-page-sub">Update your account details</p>
        </div>
      </div>

      <div className="admin-dash-panel" style={{ maxWidth: 520 }}>
        <form onSubmit={handleSubmit} style={{ padding: 8 }}>
          <div className="admin-form-group">
            <label htmlFor="profile-name">Name</label>
            <input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="profile-email">Email</label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="profile-phone">Phone</label>
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="profile-password">New password (optional)</label>
            <input
              id="profile-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              minLength={8}
            />
          </div>

          {error && <div className="admin-error-box">{error}</div>}
          {message && (
            <div className="admin-error-box" style={{ background: "var(--success-bg)", color: "var(--success-text)" }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
