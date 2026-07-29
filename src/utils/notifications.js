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
const WELCOME_SEEDED_KEY = "setulearn_welcome_notif_seeded";
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
 * @param {string} params.type - e.g. "welcome" | "test_completed"
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
 * Seeds a one-time welcome notification the very first time this device
 * ever loads the notification center (won't re-add itself after the user
 * clears or reads it).
 */
export function ensureWelcomeNotification() {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(WELCOME_SEEDED_KEY)) return;
    localStorage.setItem(WELCOME_SEEDED_KEY, "true");
  } catch {
    return;
  }

  addNotification({
    type: "welcome",
    title: "Welcome to SetuLearn!",
    message:
      "Explore mock tests across JEE, NEET, UPSC, SSC, CUET & BITSAT. Attempt a test to see your results and analytics show up right here.",
    link: "/tests",
  });
}
