import {
  getNotifications,
  getUnreadCount,
  syncSubmissionNotifications,
  markSubmissionsNotified,
  clearAllNotifications,
} from "./notifications";

const sub = (id, hoursAgo, extra = {}) => ({
  id,
  submittedAt: new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString(),
  score: 42,
  percentage: 70,
  test: { title: "JEE Main Mock 1", totalMarks: 60 },
  ...extra,
});

describe("syncSubmissionNotifications", () => {
  beforeEach(() => {
    localStorage.clear();
    clearAllNotifications();
  });

  it("first sync only announces attempts from the last 24h", () => {
    const added = syncSubmissionNotifications([sub("a", 2), sub("old", 100)]);
    expect(added).toBe(1);
    const [n] = getNotifications();
    expect(n.type).toBe("test_completed");
    expect(n.message).toContain("42 / 60");
    expect(n.link).toBe("/dashboard/attempts/a");
  });

  it("never notifies the same attempt twice", () => {
    syncSubmissionNotifications([sub("a", 1)]);
    expect(syncSubmissionNotifications([sub("a", 1)])).toBe(0);
    expect(getNotifications()).toHaveLength(1);
  });

  it("announces new attempts on later syncs, even old-looking ones, and skips unfinished ones", () => {
    syncSubmissionNotifications([sub("a", 1)]);
    const added = syncSubmissionNotifications([sub("a", 1), sub("b", 1), sub("c", 50), { id: "d", submittedAt: null }]);
    expect(added).toBe(2);
    expect(getUnreadCount()).toBe(3);
  });

  it("skips attempts already announced by the test-result screen", () => {
    markSubmissionsNotified(["x"]);
    expect(syncSubmissionNotifications([sub("x", 1)])).toBe(0);
  });

  it("tolerates bad input", () => {
    expect(syncSubmissionNotifications(undefined)).toBe(0);
    expect(syncSubmissionNotifications([null, {}])).toBe(0);
  });
});
