/**
 * Local notifications store.
 *
 * SetuLearn has no accounts, so notifications live entirely on-device in
 * localStorage, same pattern as utils/testHistory.js. A custom window event
 * ("setulearn-notifications-updated") is dispatched on every mutation so
 * that the Navbar bell / sidebar can react instantly even though they're
 * mounted separately from wherever a notification gets created (e.g. the
 * test-completion flow in TestResult.jsx).
 */

const STORAGE_KEY = "setulearn_notifications";
const INITIAL_NOTIFS_SEEDED_KEY = "setulearn_initial_notifs_seeded_v2"; // Incremented version to re-seed for current users
const MAX_ENTRIES = 50;
const EVENT_NAME = "setulearn-notifications-updated";

function safeParseList(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readAll() {
  if (typeof window === "undefined") return [];
  return safeParseList(localStorage.getItem(STORAGE_KEY));
}

function writeAll(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Failed to persist notifications:", e);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
}

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Name used to subscribe to live notification updates via window.addEventListener */
export const NOTIFICATIONS_EVENT = EVENT_NAME;

/**
 * Returns all saved notifications, most recent first.
 */
export function getNotifications() {
  return readAll().sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

export function getUnreadCount() {
  return readAll().filter((n) => !n.read).length;
}

/**
 * Adds a new notification.
 * @param {object} params
 * @param {string} params.type - e.g. "welcome" | "test_completed" | "practice" | "contact"
 * @param {string} params.title
 * @param {string} params.message
 * @param {string} [params.link] - route to navigate to on click
 * @param {string} [params.icon] - image path shown next to the notification
 */
export function addNotification({ type = "info", title, message, link = null, icon = null }) {
  if (typeof window === "undefined") return null;

  const entry = {
    id: generateId(),
    timestamp: Date.now(),
    type,
    title,
    message,
    link,
    icon,
    read: false,
  };

  const existing = readAll();
  writeAll([entry, ...existing].slice(0, MAX_ENTRIES));
  return entry;
}

export function markAsRead(id) {
  const list = readAll();
  const idx = list.findIndex((n) => n.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], read: true };
  writeAll(list);
}

export function markAllAsRead() {
  const list = readAll().map((n) => ({ ...n, read: true }));
  writeAll(list);
}

export function removeNotification(id) {
  writeAll(readAll().filter((n) => n.id !== id));
}

export function clearAllNotifications() {
  writeAll([]);
}

/**
 * Seeds one-time initial notifications the very first time this device
 * ever loads the notification center.
 */
export function ensureWelcomeNotification() {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(INITIAL_NOTIFS_SEEDED_KEY)) return;
    localStorage.setItem(INITIAL_NOTIFS_SEEDED_KEY, "true");
  } catch {
    return;
  }

  // 1. Seed the welcome message
  addNotification({
    type: "welcome",
    title: "Welcome to SetuLearn!",
    message:
      "Explore mock tests across JEE, NEET, UPSC, SSC, CUET & BITSAT. Attempt a test to see your results and analytics show up right here.",
    link: "/tests",
  });

  // 2. Seed the practice message
  addNotification({
    type: "practice",
    title: "Daily Practice Sessions!",
    message: "Sharpen your skills with subject-wise practice questions. Track your daily streak and boost your accuracy.",
    link: "/practice",
  });

  // 3. Seed the contact message
  addNotification({
    type: "contact",
    title: "Need help or have feedback?",
    message: "We would love to hear from you! Reach out to our support team for feature requests, bug reports, or general queries.",
    link: "/contact",
  });
}

/* ------------------------------------------------------------------ */
/* Exam-submission notifications for signed-in students                */
/* ------------------------------------------------------------------ */

const NOTIFIED_KEY = "setulearn_notified_submissions";
const MAX_TRACKED = 300;
const RECENT_MS = 24 * 60 * 60 * 1000;

function readNotifiedIds() {
  try {
    const raw = localStorage.getItem(NOTIFIED_KEY);
    if (raw === null) return null; // never synced on this device
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeNotifiedIds(ids) {
  try {
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(ids.slice(-MAX_TRACKED)));
  } catch {
    /* storage full / disabled */
  }
}

/** Records submission ids that already produced a notification so the dashboard sync won't repeat them. */
export function markSubmissionsNotified(ids = []) {
  const clean = ids.filter(Boolean);
  if (clean.length === 0) return;
  const existing = readNotifiedIds() || [];
  writeNotifiedIds([...new Set([...existing, ...clean])]);
}

/**
 * Turns the student's completed server-side submissions into "Test Completed" notifications, once each.
 * Covers attempts finished on another device or in another tab. The first sync on a device only
 * announces attempts from the last 24h, so a returning student isn't flooded with old results.
 * @returns {number} how many notifications were added
 */
export function syncSubmissionNotifications(submissions = []) {
  if (typeof window === "undefined" || !Array.isArray(submissions)) return 0;

  const known = readNotifiedIds();
  const firstSync = known === null;
  const seen = new Set(known || []);
  const completed = submissions.filter((s) => s && s.id && s.submittedAt);

  // oldest first, so the newest ends up on top of the list
  const fresh = completed
    .filter((s) => !seen.has(s.id))
    .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));

  let added = 0;
  fresh.forEach((s) => {
    const recent = Date.now() - new Date(s.submittedAt).getTime() < RECENT_MS;
    if (!firstSync || recent) {
      const title = s.test?.title || "a";
      const total = s.test?.totalMarks;
      addNotification({
        type: "test_completed",
        title: "Test Completed",
        message:
          total !== undefined && total !== null
            ? `You scored ${s.score} / ${total} (${s.percentage}%) in ${title} test. Tap to see the full analysis.`
            : `You completed ${title} test. Tap to see the full analysis.`,
        link: `/dashboard/attempts/${s.id}`,
      });
      added += 1;
    }
    seen.add(s.id);
  });

  writeNotifiedIds([...seen]);
  return added;
}
