import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import TestHistory from "./TestHistory";
import { addTestHistoryEntry } from "../utils/testHistory";

function renderPage() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={["/test-history"]}>
        <Routes>
          <Route path="/test-history" element={<TestHistory />} />
          <Route path="/test-history/:id" element={<div>Detail page</div>} />
          <Route path="/tests" element={<div>Tests page</div>} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe("<TestHistory />", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows an empty state with a link to Tests when there's no history", () => {
    renderPage();

    expect(screen.getByText(/no test history yet/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /browse tests/i }));
    expect(screen.getByText("Tests page")).toBeInTheDocument();
  });

  it("lists saved attempts with their summary stats", () => {
    addTestHistoryEntry({
      testId: "test-1",
      testTitle: "JEE Main Mock 1",
      score: 84,
      totalMarks: 100,
      percentage: 84,
      correct: 21,
      incorrect: 4,
      unattempted: 0,
      totalQuestions: 25,
      timeSpentSeconds: 1800,
      submissions: [{ testId: "test-1", submissionId: "sub-1" }],
    });

    renderPage();

    expect(screen.getByText("JEE Main Mock 1")).toBeInTheDocument();
    expect(screen.getByText("84 / 100")).toBeInTheDocument();
    expect(screen.queryByText(/no test history yet/i)).not.toBeInTheDocument();
  });

  it("navigates to the detail page when a history card is clicked", () => {
    const saved = addTestHistoryEntry({
      testId: "test-1",
      testTitle: "JEE Main Mock 1",
      score: 84,
      totalMarks: 100,
      percentage: 84,
      correct: 21,
      incorrect: 4,
      unattempted: 0,
      totalQuestions: 25,
      timeSpentSeconds: 1800,
      submissions: [{ testId: "test-1", submissionId: "sub-1" }],
    });

    renderPage();
    fireEvent.click(screen.getByText("JEE Main Mock 1").closest("button"));

    expect(screen.getByText("Detail page")).toBeInTheDocument();
    expect(saved.id).toBeTruthy();
  });

  it("clears all history when the Clear History button is confirmed", () => {
    addTestHistoryEntry({
      testId: "test-1",
      testTitle: "JEE Main Mock 1",
      score: 84,
      totalMarks: 100,
      percentage: 84,
      correct: 21,
      incorrect: 4,
      unattempted: 0,
      totalQuestions: 25,
      timeSpentSeconds: 1800,
      submissions: [{ testId: "test-1", submissionId: "sub-1" }],
    });

    window.confirm = jest.fn().mockReturnValue(true);
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /clear history/i }));

    expect(screen.getByText(/no test history yet/i)).toBeInTheDocument();
  });

  it("keeps history when Clear History is not confirmed", () => {
    addTestHistoryEntry({
      testId: "test-1",
      testTitle: "JEE Main Mock 1",
      score: 84,
      totalMarks: 100,
      percentage: 84,
      correct: 21,
      incorrect: 4,
      unattempted: 0,
      totalQuestions: 25,
      timeSpentSeconds: 1800,
      submissions: [{ testId: "test-1", submissionId: "sub-1" }],
    });

    window.confirm = jest.fn().mockReturnValue(false);
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /clear history/i }));

    expect(screen.getByText("JEE Main Mock 1")).toBeInTheDocument();
  });
});
