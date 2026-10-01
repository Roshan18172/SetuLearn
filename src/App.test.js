import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

// Home (the "/" route) fetches exams/tests on mount — mock the service so
// this stays a fast, offline smoke test instead of hitting a real API.
// Plain async functions (not jest.fn): CRA's default `resetMocks: true` would wipe mockResolvedValue before each test.
jest.mock("./api/examService", () => ({
  __esModule: true,
  default: {
    getExams: async () => [],
    getTestsByExam: async () => [],
    getAllTests: async () => [],
  },
}));

beforeEach(() => {
  // The app shows a one-time human-verification gate first; start as an already-verified visitor.
  window.localStorage.setItem("setulearn_human_verified", JSON.stringify({ ts: Date.now() }));
});

test("renders the app shell (navbar + logo) without crashing", async () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>,
  );

  // The navbar (and its logo) render on every non-admin, non-test-taking
  // route, so this is a good "did the whole tree mount" smoke check.
  expect(await screen.findByAltText("SetuLearn")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /home/i })).toBeInTheDocument();
});
