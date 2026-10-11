/* eslint-disable testing-library/no-container, testing-library/no-node-access, testing-library/prefer-find-by */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MistakeNotebook from "./Student/MistakeNotebook";
import StudentProgress from "./Student/StudentProgress";
import DailyChallenge from "./Student/DailyChallenge";
import QuestionReports from "./Admin/QuestionReports";
import Analytics from "./Admin/Analytics";
import QuestionActions from "../components/study/QuestionActions";

jest.mock("better-react-mathjax", () => ({ MathJax: ({ children }) => <span>{children}</span> }));
jest.mock("../context/StudentAuthContext", () => ({ __esModule: true, getStudentToken: () => "token" }));

const mockStudy = {
  reviewSummary: () => Promise.resolve({ total: 3, due: 1, mastered: 1, learning: 2, bookmarks: 4, bySubject: [] }),
  reviewDue: () => Promise.resolve([{ itemId: "i1", id: "q1", box: 0, timesWrong: 2, text: "Capital of India?", imageUrl: null, subject: "GK", topic: "India",
    options: [{ id: "o1", text: "Delhi", isCorrect: true }, { id: "o2", text: "Pune", isCorrect: false }] }]),
  reviewAnswer: jest.fn(),
  reviewList: () => Promise.resolve({ items: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } }),
  bookmarkIds: () => Promise.resolve(["q1"]),
  bookmarkList: () => Promise.resolve({ items: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } }),
  toggleBookmark: jest.fn(),
  reportQuestion: jest.fn(),
  progress: () => Promise.resolve({
    streak: { current: 4, longest: 9, activeToday: true }, xp: { level: 3, xp: 450, floor: 400, next: 900, pct: 10 },
    totals: { tests: 6, correct: 80, incorrect: 20, averagePercentage: 72, bestPercentage: 95, dailyDone: 2, gamePlays: 3, mastered: 1 },
    weekly: { tests: 2, testTarget: 3, questions: 30, questionTarget: 50 },
    badges: [{ id: "first-test", title: "First Steps", description: "Submit your first test", icon: "🎯", earned: true, progress: 1, target: 1 }, { id: "streak-30", title: "Unstoppable", description: "30 days", icon: "👑", earned: false, progress: 9, target: 30 }],
    weakTopics: [{ topic: "Algebra", subject: "Maths", attempts: 12, accuracy: 33 }], subjects: [{ subject: "Maths", attempts: 40, accuracy: 70 }],
    games: [{ gameId: "blitz", best: 900, plays: 2 }], activity: Array.from({ length: 14 }, (_, i) => ({ date: `2026-10-${String(i + 1).padStart(2, "0")}`, count: i % 3 })), lastDaily: null,
  }),
  daily: jest.fn(),
  submitDaily: jest.fn(),
};
jest.mock("../api/studyService", () => ({ __esModule: true, default: new Proxy({}, { get: (_t, k) => mockStudy[k] }) }));

const mockAdmin = {
  getQuestionReports: () => Promise.resolve({ open: 1, reports: [{ id: "r1", reason: "wrong_answer", message: "Answer should be Mumbai", status: "OPEN", createdAt: "2026-10-08T10:00:00Z", student: { name: "Asha", email: "a@x.com" },
    question: { id: "q1", importId: "GK-001", questionText: "Capital of Maharashtra?", subject: { name: "GK" }, options: [{ optionText: "Pune", isCorrect: true }] } }], pagination: { page: 1, limit: 15, total: 1, totalPages: 1 } }),
  updateQuestionReport: jest.fn().mockResolvedValue({}),
  getAnalyticsOverview: () => Promise.resolve({ timezone: "Asia/Kolkata", active: { dau: 5, wau: 20, mau: 60 }, totals: { students: 100, testsSubmitted: 250, mistakeEntries: 900, openReports: 2 },
    retention: { cohort: 40, returned: 10, rate: 25 }, days: Array.from({ length: 30 }, (_, i) => ({ date: `2026-09-${String(i + 1).padStart(2, "0")}`, activeStudents: i, testsSubmitted: i % 4 })), topTests: [{ title: "SSC Mock 1", attempts: 30, averagePercentage: 61 }] }),
  getQuestionAnalytics: () => Promise.resolve({ sort: "flagged", minAttempts: 5, questions: [{ id: "q9", importId: "GK-009", text: "Who wrote the anthem?", subject: "GK", attempts: 40, accuracy: 10, flags: ["Almost nobody answers correctly"] }] }),
};
jest.mock("../api/adminService", () => ({ __esModule: true, default: new Proxy({}, { get: (_t, k) => mockAdmin[k] }) }));

describe("student study pages", () => {
  it("Mistake Notebook: summary, revise a question, see the result and schedule", async () => {
    mockStudy.reviewAnswer.mockResolvedValue({ correct: true, correctOptionId: "o1", explanation: "Delhi is the capital.", explanationImageUrl: null, schedule: { box: 1, dueAt: new Date(Date.now() + 86400000 * 1.1).toISOString(), mastered: false } });
    render(<MemoryRouter><MistakeNotebook /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText("Due for revision now")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("Capital of India?")).toBeInTheDocument());
    expect(screen.getByText(/Missed 2×/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delhi" }));
    await waitFor(() => expect(screen.getByText(/Correct!/)).toBeInTheDocument());
    expect(mockStudy.reviewAnswer).toHaveBeenCalledWith("q1", "o1", "review");
    expect(screen.getByText(/see it again/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Finish" }));
    await waitFor(() => expect(screen.getByText(/Revision done!/)).toBeInTheDocument());
  });

  it("Progress: streak, level, goals, badges and weak topics", async () => {
    render(<MemoryRouter><StudentProgress /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/day streak/)).toBeInTheDocument());
    expect(screen.getByText("Level 3")).toBeInTheDocument();
    expect(screen.getByText("First Steps")).toBeInTheDocument();
    expect(screen.getByText("Algebra")).toBeInTheDocument();
    expect(screen.getByText("2 / 3")).toBeInTheDocument(); // weekly tests
  });

  it("Daily Challenge: answer, submit, see results", async () => {
    const qs = ["a", "b"].map((k) => ({ id: `q${k}`, text: `Question ${k}?`, imageUrl: null, subject: "GK", options: [{ id: `${k}1`, text: `${k} right` }, { id: `${k}2`, text: `${k} wrong` }] }));
    mockStudy.daily.mockResolvedValue({ date: "2026-10-08", available: true, questions: qs, done: false, result: null, streak: 2, leaderboard: [] });
    mockStudy.submitDaily.mockResolvedValue({ date: "2026-10-08", score: 150, correct: 1, total: 2, perfectBonus: 0, streak: 3, leaderboard: [{ rank: 1, name: "Asha", score: 150, correct: 1 }],
      review: [{ questionId: "qa", chosenOptionId: "a1", correctOptionId: "a1", correct: true }, { questionId: "qb", chosenOptionId: "b2", correctOptionId: "b1", correct: false }] });
    render(<MemoryRouter><DailyChallenge /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText("Question a?")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "a right" }));
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    fireEvent.click(screen.getByRole("button", { name: "b wrong" }));
    fireEvent.click(screen.getByRole("button", { name: /Submit answers/ }));
    await waitFor(() => expect(screen.getByText(/1\/2 correct · 150 points/)).toBeInTheDocument());
    expect(mockStudy.submitDaily).toHaveBeenCalledWith([{ questionId: "qa", optionId: "a1" }, { questionId: "qb", optionId: "b2" }]);
    expect(screen.getByText("1. Asha")).toBeInTheDocument();
  });

  it("Daily Challenge: already done today shows the result instead of the questions", async () => {
    mockStudy.daily.mockResolvedValue({ date: "2026-10-08", available: true, questions: [], done: true, result: { score: 300, correct: 3, total: 5 }, streak: 5, leaderboard: [] });
    render(<MemoryRouter><DailyChallenge /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/You finished today's challenge/)).toBeInTheDocument());
  });

  it("QuestionActions: bookmark toggles and a report can be sent", async () => {
    mockStudy.toggleBookmark.mockResolvedValue({ bookmarked: false });
    mockStudy.reportQuestion.mockResolvedValue({ message: "Thanks! Our team will check this question." });
    render(<QuestionActions questionId="q1" />);
    await waitFor(() => expect(screen.getByRole("button", { name: /Saved/ })).toBeInTheDocument()); // q1 is in the bookmark list
    fireEvent.click(screen.getByRole("button", { name: /Saved/ }));
    await waitFor(() => expect(screen.getByRole("button", { name: /☆ Save/ })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /Report/ }));
    fireEvent.change(screen.getByLabelText(/What is wrong/), { target: { value: "typo" } });
    fireEvent.click(screen.getByRole("button", { name: "Send report" }));
    await waitFor(() => expect(screen.getByText(/Thanks! Our team/)).toBeInTheDocument());
    expect(mockStudy.reportQuestion).toHaveBeenCalledWith({ questionId: "q1", reason: "typo", message: undefined });
  });
});

describe("admin pages", () => {
  it("Question Reports lists a report and resolves it", async () => {
    render(<MemoryRouter><QuestionReports /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText("Capital of Maharashtra?")).toBeInTheDocument());
    expect(screen.getByText(/Answer should be Mumbai/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mark resolved" }));
    await waitFor(() => expect(mockAdmin.updateQuestionReport).toHaveBeenCalledWith("r1", { status: "RESOLVED", adminNote: undefined }));
  });

  it("Analytics shows DAU/MAU, retention and flagged questions", async () => {
    render(<MemoryRouter><Analytics /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText("Active today")).toBeInTheDocument());
    expect(screen.getByText("25%")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Who wrote the anthem?")).toBeInTheDocument());
    expect(screen.getByText("Almost nobody answers correctly")).toBeInTheDocument();
  });
});
