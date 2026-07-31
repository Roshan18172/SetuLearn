/**
 * Local, device-only state for the festival/current-affairs popup feature.
 * Same on-device pattern as utils/notifications.js and utils/testHistory.js
 * (SetuLearn has no accounts) — nothing here ever leaves the browser.
 */

const LAST_SHOWN_KEY = "setulearn_event_modal_last_shown";
const NOTIFIED_KEY_PREFIX = "setulearn_event_notified_"; // + `${date}_${eventId}`

export const MODAL_REPEAT_MS = 20 * 60 * 1000; // every 20 minutes
export const MODAL_INITIAL_DELAY_MS = 2500; // 2.5s after the page opens

/** Routes where the popup/quiz experience should never appear. */
export const EVENT_MODAL_EXCLUDED_PATHS = [
  "/instructions",
  "/test",
  "/result",
  "/analysis",
  "/solutions",
  "/current-affairs-quiz",
];

export function isExcludedRoute(pathname) {
  if (pathname.startsWith("/admin")) return true;
  return EVENT_MODAL_EXCLUDED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function getLastShown() {
  try {
    const raw = localStorage.getItem(LAST_SHOWN_KEY);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

export function markShownNow() {
  try {
    localStorage.setItem(LAST_SHOWN_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function msUntilNextShow() {
  const last = getLastShown();
  if (!last) return 0;
  const elapsed = Date.now() - last;
  return Math.max(0, MODAL_REPEAT_MS - elapsed);
}

export function hasNotifiedToday(dateStr, eventId) {
  try {
    return localStorage.getItem(`${NOTIFIED_KEY_PREFIX}${dateStr}_${eventId}`) === "1";
  } catch {
    return false;
  }
}

export function markNotifiedToday(dateStr, eventId) {
  try {
    localStorage.setItem(`${NOTIFIED_KEY_PREFIX}${dateStr}_${eventId}`, "1");
  } catch {
    /* ignore */
  }
}
