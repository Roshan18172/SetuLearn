import {
  addTestHistoryEntry,
  clearTestHistory,
  getTestHistory,
  getTestHistoryEntry,
  removeTestHistoryEntry,
} from "./testHistory";

const baseEntry = () => ({
  testId: "test-1",
  testTitle: "JEE Main Mock 1",
  examName: "JEE Main",
  score: 80,
  totalMarks: 100,
  percentage: 80,
  correct: 20,
  incorrect: 5,
  unattempted: 0,
  totalQuestions: 25,
  timeSpentSeconds: 3600,
  submissions: [{ testId: "test-1", submissionId: "sub-1" }],
});

describe("testHistory utils", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns an empty array when nothing has been saved", () => {
    expect(getTestHistory()).toEqual([]);
  });

  it("saves an entry and can read it back by id", () => {
    const saved = addTestHistoryEntry(baseEntry());

    expect(saved).not.toBeNull();
    expect(saved.id).toBeTruthy();
    expect(saved.timestamp).toBeTruthy();

    const history = getTestHistory();
    expect(history).toHaveLength(1);
    expect(history[0].testTitle).toBe("JEE Main Mock 1");

    const fetched = getTestHistoryEntry(saved.id);
    expect(fetched).toEqual(saved);
  });

  it("returns null for an id that was never saved", () => {
    expect(getTestHistoryEntry("does-not-exist")).toBeNull();
  });

  it("does not save an entry with no submissions", () => {
    const result = addTestHistoryEntry({ ...baseEntry(), submissions: [] });
    expect(result).toBeNull();
    expect(getTestHistory()).toHaveLength(0);
  });

  it("de-duplicates entries with the exact same submission ids", () => {
    addTestHistoryEntry(baseEntry());
    const second = addTestHistoryEntry(baseEntry());

    expect(second).toBeNull();
    expect(getTestHistory()).toHaveLength(1);
  });

  it("does not de-duplicate genuinely different attempts", () => {
    addTestHistoryEntry(baseEntry());
    addTestHistoryEntry({
      ...baseEntry(),
      submissions: [{ testId: "test-1", submissionId: "sub-2" }],
    });

    expect(getTestHistory()).toHaveLength(2);
  });

  it("sorts history most-recent-first", () => {
    addTestHistoryEntry({
      ...baseEntry(),
      submissions: [{ testId: "test-1", submissionId: "sub-old" }],
      timestamp: 1000,
    });
    addTestHistoryEntry({
      ...baseEntry(),
      submissions: [{ testId: "test-1", submissionId: "sub-new" }],
      timestamp: 2000,
    });

    const history = getTestHistory();
    expect(history[0].submissions[0].submissionId).toBe("sub-new");
    expect(history[1].submissions[0].submissionId).toBe("sub-old");
  });

  it("removes a single entry by id", () => {
    const saved = addTestHistoryEntry(baseEntry());
    addTestHistoryEntry({
      ...baseEntry(),
      submissions: [{ testId: "test-1", submissionId: "sub-2" }],
    });

    removeTestHistoryEntry(saved.id);

    const history = getTestHistory();
    expect(history).toHaveLength(1);
    expect(history[0].submissions[0].submissionId).toBe("sub-2");
  });

  it("clears everything", () => {
    addTestHistoryEntry(baseEntry());
    clearTestHistory();
    expect(getTestHistory()).toEqual([]);
  });

  it("survives corrupted localStorage content instead of throwing", () => {
    window.localStorage.setItem("setulearn_test_history", "{not valid json");
    expect(getTestHistory()).toEqual([]);
    expect(() => addTestHistoryEntry(baseEntry())).not.toThrow();
  });
});
