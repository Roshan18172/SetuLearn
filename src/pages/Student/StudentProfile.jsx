import { useEffect, useState } from "react";
import { useStudentAuth } from "../../context/StudentAuthContext";
import { getErrorMessage } from "../../api/apiErrorHandler";

function toDateInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

const emptyExtra = {
  targetExam: "",
  studyClass: "",
  state: "",
  city: "",
  gender: "",
  dateOfBirth: "",
  preferredLanguage: "",
  schoolOrCoaching: "",
};

export default function StudentProfile() {
  const { student, updateProfile } = useStudentAuth();
  const [name, setName] = useState(student?.name || "");
  const [email, setEmail] = useState(student?.email || "");
  const [phone, setPhone] = useState(student?.phone || "");
  const [password, setPassword] = useState("");
  const [extra, setExtra] = useState(emptyExtra);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(student?.name || "");
    setEmail(student?.email || "");
    setPhone(student?.phone || "");
    setExtra({
      targetExam: student?.targetExam || "",
      studyClass: student?.studyClass || "",
      state: student?.state || "",
      city: student?.city || "",
      gender: student?.gender || "",
      dateOfBirth: toDateInput(student?.dateOfBirth),
      preferredLanguage: student?.preferredLanguage || "",
      schoolOrCoaching: student?.schoolOrCoaching || "",
    });
  }, [student]);

  document.title = "Profile - SetuLearn";

  const setField = (key) => (e) => {
    setExtra((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const nullable = (value) => {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  };

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
        targetExam: nullable(extra.targetExam),
        studyClass: nullable(extra.studyClass),
        state: nullable(extra.state),
        city: nullable(extra.city),
        gender: nullable(extra.gender),
        dateOfBirth: extra.dateOfBirth ? extra.dateOfBirth : null,
        preferredLanguage: nullable(extra.preferredLanguage),
        schoolOrCoaching: nullable(extra.schoolOrCoaching),
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
          <p className="admin-page-sub">Update your account and study details</p>
        </div>
      </div>

      <div className="admin-dash-panel" style={{ maxWidth: 720 }}>
        <form onSubmit={handleSubmit} style={{ padding: 8 }}>
          <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>Account</h2>
          <div className="admin-form-row">
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
          </div>
          <div className="admin-form-row">
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
          </div>

          <h2 style={{ fontSize: 16, margin: "20px 0 12px" }}>Study profile</h2>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="profile-exam">Target exam</label>
              <input
                id="profile-exam"
                value={extra.targetExam}
                onChange={setField("targetExam")}
                placeholder="e.g. JEE Main, NEET, UPSC"
              />
            </div>
            <div className="admin-form-group">
              <label htmlFor="profile-class">Class / stage</label>
              <select id="profile-class" value={extra.studyClass} onChange={setField("studyClass")}>
                <option value="">Select</option>
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
                <option value="Dropper">Dropper</option>
                <option value="Graduate">Graduate</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="profile-state">State</label>
              <input
                id="profile-state"
                value={extra.state}
                onChange={setField("state")}
                placeholder="State"
              />
            </div>
            <div className="admin-form-group">
              <label htmlFor="profile-city">City</label>
              <input
                id="profile-city"
                value={extra.city}
                onChange={setField("city")}
                placeholder="City"
              />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="profile-gender">Gender</label>
              <select id="profile-gender" value={extra.gender} onChange={setField("gender")}>
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label htmlFor="profile-dob">Date of birth</label>
              <input
                id="profile-dob"
                type="date"
                value={extra.dateOfBirth}
                onChange={setField("dateOfBirth")}
              />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="profile-lang">Preferred language</label>
              <select
                id="profile-lang"
                value={extra.preferredLanguage}
                onChange={setField("preferredLanguage")}
              >
                <option value="">Select</option>
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label htmlFor="profile-school">School / coaching</label>
              <input
                id="profile-school"
                value={extra.schoolOrCoaching}
                onChange={setField("schoolOrCoaching")}
                placeholder="School or coaching name"
              />
            </div>
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
