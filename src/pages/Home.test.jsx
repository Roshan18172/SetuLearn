import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Home from "./Home";
import { addTestHistoryEntry } from "../utils/testHistory";
import { StudentAuthProvider } from "../context/StudentAuthContext";

// Plain async functions (not jest.fn): CRA's default `resetMocks: true` would wipe mockResolvedValue before each test.
jest.mock("../api/examService", () => ({
  __esModule: true,
  default: {
    getExams: async () => [],
    getAllTests: async () => [],
  },
}));

function renderHome() {
  return render(
    <HelmetProvider>
      <StudentAuthProvider>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test-history" element={<div>Test History Page</div>} />
        </Routes>
      </MemoryRouter>
      </StudentAuthProvider>
    </HelmetProvider>,
  );
}

describe("<Home /> recent attempts", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("invites a first-time visitor to take a test when there is no history", async () => {
    renderHome();

    expect(await screen.findByText(/take your first mock test/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start a test/i })).toBeInTheDocument();
  });

  it("shows the most recent attempt from this device", async () => {
    addTestHistoryEntry({
      testId: "t1",
      testTitle: "JEE Main Mock 1",
      examName: "JEE Main",
      score: 84,
      totalMarks: 100,
      percentage: 84,
      correct: 21,
      incorrect: 4,
      submissions: [{ testId: "t1", submissionId: "s1" }],
    });

    renderHome();

    expect(await screen.findByText("JEE Main Mock 1")).toBeInTheDocument();
    expect(screen.getByText("84/100")).toBeInTheDocument();
  });

  it('navigates to /test-history when "View All Test History" is clicked', async () => {
    addTestHistoryEntry({
      testId: "t1",
      testTitle: "JEE Main Mock 1",
      score: 10,
      totalMarks: 100,
      percentage: 10,
      correct: 2,
      incorrect: 1,
      submissions: [{ testId: "t1", submissionId: "s1" }],
    });

    renderHome();

    fireEvent.click(await screen.findByRole("button", { name: /view all test history/i }));

    await waitFor(() => expect(screen.getByText("Test History Page")).toBeInTheDocument());
  });
});
