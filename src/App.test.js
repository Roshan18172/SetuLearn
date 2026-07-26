import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

// Home (the "/" route) fetches exams/tests on mount — mock the service so
// this stays a fast, offline smoke test instead of hitting a real API.
jest.mock("./api/examService", () => ({
  __esModule: true,
  default: {
    getExams: jest.fn().mockResolvedValue([]),
    getTestsByExam: jest.fn().mockResolvedValue([]),
    getAllTests: jest.fn().mockResolvedValue([]),
  },
}));

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
