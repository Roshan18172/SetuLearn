/**
 * Local test-history store.
 *
 * SetuLearn has no student accounts, so submissions aren't tied to a user
 * on the backend (see Submission model — no userId). "Test History" is
 * therefore tracked entirely on-device: every completed attempt is saved
 * here as a lightweight pointer (testId + submissionId) plus a cached
 * summary for the list view. The heavy per-question data (question text,
 * options, which one was selected, which one was correct) is intentionally
 * NOT stored — it's re-fetched on demand from the backend (which keeps
 * submissions forever) via testService, keyed off these ids. This keeps
 * localStorage small and always in sync with the source of truth.
 */

import { addNotification } from "./notifications";

const STORAGE_KEY = "setulearn_test_history";
const MAX_ENTRIES = 100;

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
    console.error("Failed to persist test history:", e);
  }
}

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Returns all saved history entries, most recent first.
 */
export function getTestHistory() {
  return readAll().sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

/**
 * Returns a single history entry by id, or null if not found.
 */
export function getTestHistoryEntry(id) {
  if (!id) return null;
  return readAll().find((entry) => entry.id === id) || null;
}

/**
 * Saves a completed test attempt to history.
 * @param {object} entry
 * @param {string} entry.testTitle
 * @param {string} [entry.examName]
 * @param {string|null} [entry.testId] - the composite/parent test id
 * @param {number} entry.score
 * @param {number} entry.totalMarks
 * @param {number} entry.percentage
 * @param {number} entry.correct
 * @param {number} entry.incorrect
 * @param {number} entry.unattempted
 * @param {number} entry.totalQuestions
 * @param {number} [entry.timeSpentSeconds]
 * @param {Array<{testId: string, submissionId: string}>} entry.submissions
 * @returns {object|null} the saved entry, or null if it was a duplicate / couldn't be saved
 */
export function addTestHistoryEntry(entry) {
  if (typeof window === "undefined") return null;
  if (!Array.isArray(entry?.submissions) || entry.submissions.length === 0) {
    return null;
  }

  const existing = readAll();

  // Guard against writing the same attempt twice (e.g. component re-render).
  const submissionKey = entry.submissions
    .map((s) => s.submissionId)
    .filter(Boolean)
    .sort()
    .join(",");

  if (submissionKey) {
    const isDuplicate = existing.some((item) => {
      const itemKey = (item.submissions || [])
        .map((s) => s.submissionId)
        .filter(Boolean)
        .sort()
        .join(",");
      return itemKey && itemKey === submissionKey;
    });
    if (isDuplicate) return null;
  }

  const newEntry = {
    id: generateId(),
    timestamp: Date.now(),
    ...entry,
  };

  writeAll([newEntry, ...existing].slice(0, MAX_ENTRIES));

  addNotification({
    type: "test_completed",
    title: "Test Completed",
    message: `You have completed ${newEntry.testTitle || "a"} test. Click to view results.`,
    link: `/test-history/${newEntry.id}`,
  });

  return newEntry;
}

/**
 * Removes a single history entry by id.
 */
export function removeTestHistoryEntry(id) {
  writeAll(readAll().filter((entry) => entry.id !== id));
}

/**
 * Clears all saved test history.
 */
export function clearTestHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear test history:", e);
  }
}
