import { useEffect, useState } from "react";
import studyService from "../../api/studyService";
import { getErrorMessage } from "../../api/apiErrorHandler";
import { getStudentToken } from "../../context/StudentAuthContext";
import "./study.css";

// one fetch of the student's bookmarked ids, shared by every button on the page
let bookmarkCache = null;
let bookmarkPromise = null;
const loadBookmarks = () => {
  if (bookmarkCache) return Promise.resolve(bookmarkCache);
  bookmarkPromise ||= studyService.bookmarkIds().then((ids) => (bookmarkCache = new Set(ids))).catch(() => (bookmarkCache = new Set()));
  return bookmarkPromise;
};

const REASONS = [
  ["wrong_answer", "The marked answer looks wrong"],
  ["typo", "Spelling / typing mistake"],
  ["unclear", "Question is unclear"],
  ["image", "Image missing or wrong"],
  ["other", "Something else"],
];

/** ⭐ Save + 🚩 Report buttons for one question (logged-in students). */
export default function QuestionActions({ questionId, className = "" }) {
  const loggedIn = !!getStudentToken();
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("wrong_answer");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loggedIn || !questionId) return undefined;
    let alive = true;
    loadBookmarks().then((set) => alive && setSaved(set.has(questionId)));
    return () => { alive = false; };
  }, [loggedIn, questionId]);

  if (!questionId) return null;
  const needLogin = () => setStatus("Please log in to use this.");

  const toggle = async () => {
    if (!loggedIn) return needLogin();
    try {
      const r = await studyService.toggleBookmark(questionId);
      setSaved(r.bookmarked);
      if (bookmarkCache) r.bookmarked ? bookmarkCache.add(questionId) : bookmarkCache.delete(questionId);
      setStatus(r.bookmarked ? "Saved to your bookmarks" : "Removed from bookmarks");
    } catch (e) { setStatus(getErrorMessage(e)); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await studyService.reportQuestion({ questionId, reason, message: message.trim() || undefined });
      setStatus(r.message || "Thanks for the report!");
      setOpen(false);
      setMessage("");
    } catch (err) { setStatus(getErrorMessage(err)); } finally { setBusy(false); }
  };

  return (
    <div className={`qa-bar ${className}`}>
      <button type="button" className={`qa-btn ${saved ? "on" : ""}`} onClick={toggle} aria-pressed={saved} title="Bookmark this question">
        {saved ? "★ Saved" : "☆ Save"}
      </button>
      <button type="button" className="qa-btn" onClick={() => (loggedIn ? setOpen(true) : needLogin())} title="Tell us if something is wrong">
        🚩 Report
      </button>
      {status && <span className="qa-status" role="status">{status}</span>}

      {open && (
        <div className="qa-overlay" onClick={() => setOpen(false)}>
          <form className="qa-modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
            <h3>Report this question</h3>
            <label>What is wrong?
              <select value={reason} onChange={(e) => setReason(e.target.value)}>
                {REASONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <label>Details (optional)
              <textarea rows={3} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us what you noticed" />
            </label>
            <div className="qa-actions">
              <button type="button" className="qa-btn" onClick={() => setOpen(false)}>Cancel</button>
              <button type="submit" className="qa-btn primary" disabled={busy}>{busy ? "Sending…" : "Send report"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
