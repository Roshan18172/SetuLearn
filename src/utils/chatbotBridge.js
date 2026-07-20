/**
 * Lightweight pub-sub bridge between the Practice page and the Setu chatbot.
 *
 * Why this exists: the chatbot is mounted once at the App level (so it can
 * float on every page), while the "current practice question" lives inside
 * the Practice page's own state. Rather than lifting that state up through
 * context/providers for a single feature, this tiny module lets Practice.jsx
 * publish "here's the question the student is looking at" and lets the
 * chatbot subscribe to it — only while the Practice page is mounted.
 */

let currentQuestion = null;
const listeners = new Set();

export function setCurrentPracticeQuestion(question) {
  currentQuestion = question;
  listeners.forEach((fn) => fn(currentQuestion));
}

export function clearCurrentPracticeQuestion() {
  setCurrentPracticeQuestion(null);
}

export function getCurrentPracticeQuestion() {
  return currentQuestion;
}

export function subscribeToPracticeQuestion(fn) {
  listeners.add(fn);
  fn(currentQuestion);
  return () => listeners.delete(fn);
}

/**
 * Reads the most recently completed test's summary, which TestResult.jsx
 * writes to localStorage (key "lastexam") right after a submission. Lets
 * the chatbot answer "how did I do on my last test?" without needing a
 * fresh API round trip.
 */
export function getLastTestResult() {
  try {
    const raw = localStorage.getItem("lastexam");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
