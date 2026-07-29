import { useEffect, useState } from "react";

const STORAGE_KEY = "setulearn_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Small delay so it slides in after the page settles, not on paint.
        const t = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(t);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const respond = (value) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ choice: value, ts: Date.now() }),
      );
    } catch {
      /* ignore storage errors, still dismiss */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent" role="dialog" aria-label="Cookie notice">
      <div className="cookie-consent-icon"><img src="/icons/misc/cookie.png" alt="cookie"/></div>
      <div className="cookie-consent-text">
        <h4>We use cookies</h4>
        <p>
          SetuLearn uses local storage and cookies to remember your test
          history and preferences on this device. We don't sell your data.
          See our{" "}
          <a href="/privacy-policy" target="_blank" rel="noreferrer">
            Privacy Policy
          </a>{" "}
          for details.
        </p>
      </div>
      <div className="cookie-consent-actions">
        <button className="btn-outline" onClick={() => respond("necessary-only")}>
          Necessary Only
        </button>
        <button className="btn-primary" onClick={() => respond("accepted")}>
          Accept All
        </button>
      </div>
    </div>
  );
}
