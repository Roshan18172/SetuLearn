export const ACTION_LABELS = {
  "student.signup_otp_requested": "Sign-up code requested",
  "student.register": "Registered (email)",
  "student.google_register": "Registered (Google)",
  "student.login": "Logged in",
  "student.google_login": "Logged in (Google)",
  "student.forgot_password": "Requested password reset",
  "student.password_reset": "Reset password",
  "student.profile_updated": "Updated profile",
  "test.started": "Started a test",
  "test.submitted": "Submitted a test",
  "admin.login": "Admin login",
  "admin.student_status_changed": "Changed student status",
  "admin.questions_imported": "Imported questions",
};

export const actionLabel = (action) => ACTION_LABELS[action] || action;

export const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(+d) ? "—" : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

/** "5 minutes ago" style text for last-login columns. */
export const timeAgo = (value) => {
  if (!value) return "Never";
  const diff = Date.now() - new Date(value).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} day${day === 1 ? "" : "s"} ago`;
  return new Date(value).toLocaleDateString();
};

/** Very small user-agent summary: "Chrome · Windows". */
export const shortUserAgent = (ua) => {
  if (!ua) return "—";
  const browser = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Chrome\//.test(ua) ? "Chrome"
    : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS"
    : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "";
  return os ? `${browser} · ${os}` : browser;
};
