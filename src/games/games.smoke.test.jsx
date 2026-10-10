/* eslint-disable testing-library/no-container, testing-library/no-node-access, testing-library/prefer-find-by, jest/no-conditional-expect */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import GamePage from "../pages/Games/GamePage";
import GamesHub from "../pages/Games/GamesHub";
import GamesSection from "../components/games/GamesSection";
import { FALLBACK_TERMS } from "./fallbackTerms";

const answerFor = (clue) => FALLBACK_TERMS.find((t) => clue.includes(t.clue))?.answer;

// no backend in tests: terms fall back to the built-in vocabulary, subjects list is empty
// (plain functions, not jest.fn: CRA resets jest mocks between tests)
jest.mock("../api/axios", () => ({ __esModule: true, default: { get: () => Promise.reject(new Error("offline")) } }));
jest.mock("../api/practiceService", () => ({ __esModule: true, default: { getSubjects: () => Promise.resolve([]) } }));

const renderGame = (id) =>
  render(
    <MemoryRouter initialEntries={[`/games/${id}`]}>
      <Routes>
        <Route path="/games/:gameId" element={<GamePage />} />
        <Route path="/games" element={<div>HUB</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("games", () => {
  it("home section shows the featured games under the 'Bored now?' heading", () => {
    render(<MemoryRouter><GamesSection /></MemoryRouter>);
    expect(screen.getByText(/Bored now\?/)).toBeInTheDocument();
    for (const t of ["Crossword", "Matching Pairs", "Time Attack", "Live Battle"]) {
      expect(screen.getByRole("button", { name: `Play ${t}` })).toBeInTheDocument();
    }
    render(<MemoryRouter><GamesHub /></MemoryRouter>);
    expect(screen.getAllByRole("button", { name: "Play Word Search" }).length).toBe(1); // hub only
  });

  it.each([
    ["crossword", { label: "Crossword grid" }],
    ["wordsearch", { label: /Word search grid/ }],
    ["matching", { text: /Tap two cards/ }],
    ["unscramble", { text: /^Clue/ }],
    ["fillblanks", { text: /Complete the concept/ }],
  ])("%s: shows how-to-play + rules first, then starts", async (id, marker) => {
    renderGame(id);
    expect(screen.getByText(/How to play/)).toBeInTheDocument();
    expect(screen.getByText(/Rules/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Start game/ }));
    await waitFor(
      () => {
        const found = marker.label ? screen.queryAllByLabelText(marker.label) : screen.queryAllByText(marker.text);
        expect(found.length).toBeGreaterThan(0);
      },
      { timeout: 4000 }
    );
  });

  it("matching in link mode can be completed by tapping pairs", async () => {
    renderGame("matching");
    fireEvent.click(screen.getByRole("radio", { name: "Link terms" }));
    fireEvent.click(screen.getByRole("radio", { name: "Dates & events" }));
    fireEvent.click(screen.getByRole("radio", { name: /Easy/ }));
    fireEvent.click(screen.getByRole("button", { name: /Start game/ }));
    await waitFor(() => screen.getByText("Terms"));
    const pairs = { "1857": "First War of Independence", "1947": "India gains independence", "1950": "Constitution comes into force", "1919": "Jallianwala Bagh massacre", "1930": "Dandi Salt March", "1526": "First Battle of Panipat", "1757": "Battle of Plassey", "1905": "Partition of Bengal", "1942": "Quit India Movement", "1991": "Economic liberalisation in India", "1885": "Indian National Congress founded", "1764": "Battle of Buxar" };
    // easy = 6 pairs; click every visible year with its event
    for (const [year, event] of Object.entries(pairs)) {
      const y = screen.queryByRole("button", { name: year });
      if (!y) continue;
      fireEvent.click(y);
      fireEvent.click(screen.getByRole("button", { name: event }));
    }
    await waitFor(() => expect(screen.getByText(/All pairs matched!/)).toBeInTheDocument(), { timeout: 4000 });
  });

  it("unscramble: typing the right letters scores and shows feedback", async () => {
    const { container } = renderGame("unscramble");
    fireEvent.click(screen.getByRole("radio", { name: /Easy/ }));
    fireEvent.click(screen.getByRole("button", { name: /Start game/ }));
    await waitFor(() => expect(container.querySelector(".quick-clue")).toBeTruthy(), { timeout: 4000 });
    const clue = container.querySelector(".quick-clue").textContent.replace(/^Clue/, "");
    const answer = answerFor(clue);
    expect(answer).toBeTruthy();
    for (const ch of answer.replace(/[^A-Za-z]/g, "")) fireEvent.keyDown(window, { key: ch });
    await waitFor(() => expect(screen.getByText(/Correct!/)).toBeInTheDocument());
    expect(screen.getByText(/⭐ 1\d\d|⭐ 2\d\d/)).toBeInTheDocument(); // 100 + speed bonus
  });

  it("fill the blanks (easy): the right choice is accepted, a wrong one is not", async () => {
    const { container } = renderGame("fillblanks");
    fireEvent.click(screen.getByRole("radio", { name: /Easy/ }));
    fireEvent.click(screen.getByRole("button", { name: /Start game/ }));
    await waitFor(() => expect(container.querySelector(".quick-clue")).toBeTruthy(), { timeout: 4000 });
    const clue = container.querySelector(".quick-clue").textContent.replace(/^Complete the concept/, "");
    const answer = answerFor(clue);
    expect(answer).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: answer }));
    await waitFor(() => expect(screen.getByText(/Correct!/)).toBeInTheDocument());
  });

  it("crossword: typing fills the selected clue's squares and Finish shows the result", async () => {
    const { container } = renderGame("crossword");
    fireEvent.click(screen.getByRole("radio", { name: /Easy/ }));
    fireEvent.click(screen.getByRole("button", { name: /Start game/ }));
    await waitFor(() => expect(container.querySelector(".active-clue")).toBeTruthy(), { timeout: 4000 });
    const text = container.querySelector(".active-clue").textContent;
    const answer = answerFor(text);
    expect(answer).toBeTruthy();
    const input = container.querySelector(".cw-hidden-input");
    for (const ch of answer.replace(/[^A-Za-z]/g, "")) fireEvent.keyDown(input, { key: ch });
    const typed = screen.getAllByRole("gridcell").filter((c) => /letter [A-Z]/.test(c.getAttribute("aria-label")));
    expect(typed.length).toBe(answer.replace(/[^A-Za-z]/g, "").length);
    fireEvent.click(screen.getByRole("button", { name: "Finish" }));
    await waitFor(() => expect(screen.getByText(/points/)).toBeInTheDocument());
  });
});
