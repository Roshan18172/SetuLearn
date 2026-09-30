import { useState } from "react";
import { useStudentAuth } from "../context/StudentAuthContext";
import { getErrorMessage } from "../api/apiErrorHandler";
import "../pages/StudentAuth.css";

const DISMISS_KEY = "setulearn_phone_prompt_dismissed";

/**
 * Shown on the dashboard when the signed-in student has no phone number
 * (i.e. they registered with Google, which skips the phone step at signup).
 * "Maybe later" hides it for the current browser session only.
 */
export default function AddPhoneModal() {
  const { student, updateProfile } = useStudentAuth();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!student || student.phone || dismissed) return null;

  const digits = phone.replace(/\D/g, "");

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateProfile({ phone: phone.trim() });
      // student.phone is now set, so the modal unmounts itself.
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const later = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div className="student-phone-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="add-phone-title">
      <form className="student-phone-modal" onSubmit={save}>
        <h2 id="add-phone-title">Add your phone number</h2>
        <p>
          Welcome to SetuLearn! Add your mobile number to secure your account and get important
          updates about your tests.
        </p>
        <div className="student-form-group">
          <label htmlFor="dash-phone">Mobile number</label>
          <input
            id="dash-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit mobile number"
            autoComplete="tel"
            autoFocus
          />
        </div>
        {error && <div className="student-auth-error">{error}</div>}
        <button
          type="submit"
          className="student-auth-btn student-auth-btn-primary"
          disabled={saving || digits.length < 10}
        >
          {saving ? "Saving..." : "Save number"}
        </button>
        <button
          type="button"
          className="student-auth-btn"
          style={{ marginTop: 8, background: "transparent", color: "#6f6a85" }}
          onClick={later}
        >
          Maybe later
        </button>
      </form>
    </div>
  );
}
