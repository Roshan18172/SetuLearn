import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Home from "./Home";

jest.mock("../api/examService", () => ({
  __esModule: true,
  default: {
    getExams: jest.fn().mockResolvedValue([]),
    getAllTests: jest.fn().mockResolvedValue([]),
  },
}));

function renderHome() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test-history" element={<div>Test History Page</div>} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe("<Home /> last-result scorecard", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows a placeholder scorecard when no test has been taken yet", async () => {
    renderHome();

    expect(await screen.findByText("N/A")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /view all test history/i })).toBeInTheDocument();
  });

  it("shows the last test's real score once one exists in localStorage", async () => {
    window.localStorage.setItem(
      "lastexam",
      JSON.stringify({
        testTitle: "JEE Main Mock 1",
        securedScore: 84,
        totalScore: 100,
        correct: 21,
        incorrect: 4,
        unattempted: 0,
        totalQuestions: 25,
        percentile: 92,
      }),
    );

    renderHome();

    expect(await screen.findByText("JEE Main Mock 1")).toBeInTheDocument();
    expect(screen.getByText("84")).toBeInTheDocument();
  });

  it('navigates to /test-history when "View All Test History" is clicked', async () => {
    renderHome();

    fireEvent.click(await screen.findByRole("button", { name: /view all test history/i }));

    await waitFor(() => expect(screen.getByText("Test History Page")).toBeInTheDocument());
  });
});
