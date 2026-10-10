/* eslint-disable testing-library/no-container, testing-library/no-node-access, testing-library/prefer-find-by, jest/no-conditional-expect */
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import GamePage from "../pages/Games/GamePage";
import GamesHub from "../pages/Games/GamesHub";
import GamesSection from "../components/games/GamesSection";
import { GAMES } from "./gamesConfig";
import { FALLBACK_TERMS } from "./fallbackTerms";
import BUILTIN from "./builtinQuestions.json";

// no backend: questions/terms fall back to the built-in sets (plain functions, CRA resets jest.fn mocks)
jest.mock("../api/axios", () => ({
  __esModule: true,
  default: {
    get: () => Promise.reject(new Error("offline")),
    post: (url) =>
      Promise.resolve({
        data: { data: url.endsWith("/join") ? { pin: "123456", token: "ptoken-12345678", playerId: "p1", name: "Asha" } : { pin: "123456", hostToken: "htoken-12345678", total: 5, seconds: 20 } },
      }),
  },
}));
jest.mock("../api/practiceService", () => ({ __esModule: true, default: { getSubjects: () => Promise.resolve([]) } }));
jest.mock("better-react-mathjax", () => ({ MathJax: ({ children }) => <span>{children}</span> }));

const correctTextFor = (qText) => BUILTIN.find((b) => b.text === qText)?.options[0];
const renderGame = (id) =>
  render(
    <MemoryRouter initialEntries={[`/games/${id}`]}>
      <Routes>
        <Route path="/games/:gameId" element={<GamePage />} />
        <Route path="/games" element={<div>HUB</div>} />
      </Routes>
    </MemoryRouter>
  );
const start = async (container, level = /Easy/) => {
  const radios = screen.queryAllByRole("radio", { name: level });
  if (radios.length) fireEvent.click(radios[0]);
  fireEvent.click(screen.getByRole("button", { name: /Start game|Continue/ }));
  await waitFor(() => expect(container.querySelector(".mcq-question, .hm-word")).toBeTruthy(), { timeout: 4000 });
};
const currentQuestion = (container) => container.querySelector(".mcq-question").textContent;
const clickOption = (text) => fireEvent.click(screen.getAllByRole("button").find((b) => b.classList.contains("mcq-option") && b.textContent.endsWith(text)));
const clickWrongOption = (container, rightText) => fireEvent.click([...container.querySelectorAll(".mcq-option")].find((b) => !b.textContent.endsWith(rightText)));

describe("catalogue", () => {
  it("has all 12 games in the four categories, and the home block shows the featured ones", () => {
    expect(GAMES).toHaveLength(12);
    expect(new Set(GAMES.map((g) => g.category))).toEqual(new Set(["speed", "board", "word", "social"]));
    render(<MemoryRouter><GamesHub /></MemoryRouter>);
    for (const g of GAMES) expect(screen.getByRole("button", { name: `Play ${g.title}` })).toBeInTheDocument();
    for (const t of ["Speed & Focus", "Progression & Board", "Word & Language", "Social & Competitive"]) expect(screen.getByText(t)).toBeInTheDocument();
    render(<MemoryRouter><GamesSection /></MemoryRouter>);
    expect(screen.getAllByRole("button", { name: /^Play / }).length).toBeGreaterThanOrEqual(GAMES.length + GAMES.filter((g) => g.featured).length);
  });

  it.each(["blitz", "survival", "asteroids", "boardrace", "hangman", "economy", "livebattle"])("%s shows how-to-play and rules first", (id) => {
    renderGame(id);
    expect(screen.getByText(/How to play/)).toBeInTheDocument();
    expect(screen.getByText(/Rules/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Start game/ })).toBeInTheDocument();
  });
});

describe("quiz games", () => {
  it("Time Attack: a right answer scores and the question limit shrinks", async () => {
    const { container } = renderGame("blitz");
    await start(container);
    expect(screen.getByText(/12s per question/)).toBeInTheDocument();
    clickOption(correctTextFor(currentQuestion(container)));
    await waitFor(() => expect(screen.getByText(/⭐ 1\d\d|⭐ 2\d\d/)).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText(/11\.5s per question/)).toBeInTheDocument(), { timeout: 3000 });
  });

  it("Survival: a wrong answer costs a heart", async () => {
    const { container } = renderGame("survival");
    await start(container);
    const right = correctTextFor(currentQuestion(container));
    expect(screen.getByLabelText("3 lives left")).toBeInTheDocument();
    clickWrongOption(container, right);
    await waitFor(() => expect(screen.getByLabelText("2 lives left")).toBeInTheDocument());
  });

  it("Asteroid Blaster: the right answer blasts the asteroid", async () => {
    const { container } = renderGame("asteroids");
    await start(container);
    clickOption(correctTextFor(currentQuestion(container)));
    await waitFor(() => expect(screen.getByText(/Direct hit!/)).toBeInTheDocument());
    expect(screen.getByText(/1 destroyed/)).toBeInTheDocument();
  });

  it("Asteroid Blaster: a wrong answer damages a shield but allows another try", async () => {
    const { container } = renderGame("asteroids");
    await start(container);
    const right = correctTextFor(currentQuestion(container));
    clickWrongOption(container, right);
    await waitFor(() => expect(screen.getByText(/shield damaged/)).toBeInTheDocument());
    expect(screen.getByLabelText("2 shields")).toBeInTheDocument();
  });

  it("Board Race: a right answer moves the avatar forward", async () => {
    const { container } = renderGame("boardrace");
    await start(container);
    clickOption(correctTextFor(currentQuestion(container)));
    await waitFor(() => expect(screen.getByText(/You \+[23]/)).toBeInTheDocument());
    expect(screen.getByText(/🦊 tile [2-9]\//)).toBeInTheDocument();
  });

  it("Quiz Market: correct answers earn coins and the market is open", async () => {
    const { container } = renderGame("economy");
    await start(container);
    expect(screen.getByText(/Market/)).toBeInTheDocument();
    clickOption(correctTextFor(currentQuestion(container)));
    await waitFor(() => expect(screen.getByText(/🪙 \$100/)).toBeInTheDocument());
    // not enough coins for anything yet except nothing >= 250
    expect(screen.getByRole("button", { name: /Shield/ })).toBeDisabled();
  });
});

describe("hangman", () => {
  it("guessing every letter solves the term and scores", async () => {
    const { container } = renderGame("hangman");
    fireEvent.click(screen.getByRole("button", { name: /Start game/ }));
    await waitFor(() => expect(container.querySelector(".hm-word")).toBeTruthy(), { timeout: 4000 });
    const clue = container.querySelector(".quick-clue").textContent.replace(/^Clue/, "");
    const answer = FALLBACK_TERMS.find((t) => clue.includes(t.clue)).answer;
    for (const ch of new Set(answer.toUpperCase().replace(/[^A-Z]/g, ""))) fireEvent.keyDown(window, { key: ch });
    await waitFor(() => expect(screen.getByText(/Yes! It's/)).toBeInTheDocument());
    expect(screen.getByText(/⭐ 1[2-9]\d|⭐ 2\d\d/)).toBeInTheDocument();
  });

  it("too many wrong letters loses the term", async () => {
    const { container } = renderGame("hangman");
    fireEvent.click(screen.getByRole("radio", { name: /Hard/ })); // 5 mistakes
    fireEvent.click(screen.getByRole("button", { name: /Start game/ }));
    await waitFor(() => expect(container.querySelector(".hm-word")).toBeTruthy(), { timeout: 4000 });
    const clue = container.querySelector(".quick-clue").textContent.replace(/^Clue/, "");
    const answer = FALLBACK_TERMS.find((t) => clue.includes(t.clue)).answer.toUpperCase();
    const wrong = "QZXJKVWYFBGPMUCDHLNRSTOIAE".split("").filter((l) => !answer.includes(l)).slice(0, 5);
    for (const ch of wrong) fireEvent.keyDown(window, { key: ch });
    await waitFor(() => expect(screen.getByText(/✘ It was/)).toBeInTheDocument());
  });
});

describe("live battle (player + host screens against a fake event stream)", () => {
  let sources;
  beforeEach(() => {
    sources = [];
    sessionStorage.clear();
    global.EventSource = class {
      constructor(url) { this.url = url; this.l = {}; sources.push(this); }
      addEventListener(n, fn) { this.l[n] = fn; }
      close() { this.closed = true; }
      emit(n, data) { act(() => this.l[n]?.({ data: JSON.stringify(data) })); }
    };
  });

  it("player: join with a PIN, play a question, see the result and final rank", async () => {
    renderGame("livebattle");
    fireEvent.click(screen.getByRole("button", { name: /Start game/ }));
    await waitFor(() => screen.getByPlaceholderText("Game PIN"));
    fireEvent.change(screen.getByPlaceholderText("Game PIN"), { target: { value: "123456" } });
    fireEvent.change(screen.getByPlaceholderText("Your nickname"), { target: { value: "Asha" } });
    fireEvent.click(screen.getByRole("button", { name: "Join" }));
    await waitFor(() => expect(sources.length).toBe(1));
    expect(sources[0].url).toContain("/games/live/123456/events?token=ptoken-12345678");

    const es = sources[0];
    es.emit("lobby", { pin: "123456", status: "lobby", players: [{ id: "p1", name: "Asha" }], total: 2, seconds: 20 });
    expect(screen.getByText(/You're in, Asha!/)).toBeInTheDocument();

    es.emit("question", { index: 0, total: 2, text: "Capital of India?", imageUrl: null, options: ["Delhi", "Mumbai", "Pune", "Agra"], seconds: 20, startedAt: Date.now(), endsAt: Date.now() + 20000, now: Date.now() });
    expect(screen.getByText("Capital of India?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Delhi/ }));
    expect(screen.getByText(/Answer locked in/)).toBeInTheDocument();

    es.emit("reveal", { index: 0, total: 2, correct: 0, counts: [3, 1, 0, 0], leaderboard: [{ rank: 1, id: "p1", name: "Asha", score: 950, streak: 1 }], last: false, you: { answered: true, correct: true, points: 950, score: 950, streak: 1, rank: 1 } });
    expect(screen.getByText(/Correct! \+950/)).toBeInTheDocument();

    es.emit("finished", { leaderboard: [{ rank: 1, id: "p1", name: "Asha", score: 1900, streak: 2 }], players: 4, you: { score: 1900, rank: 1 } });
    expect(screen.getByText(/You finished #1!/)).toBeInTheDocument();
    expect(screen.getAllByText("1900").length).toBeGreaterThan(0);
  });

  it("host: create a game, see the PIN and players, start button enables", async () => {
    renderGame("livebattle");
    fireEvent.click(screen.getByRole("radio", { name: "Host a game" }));
    fireEvent.click(screen.getByRole("button", { name: /Start game/ }));
    await waitFor(() => screen.getByRole("button", { name: "Create game" }));
    fireEvent.click(screen.getByRole("button", { name: "Create game" }));
    await waitFor(() => expect(sources.length).toBe(1));
    expect(screen.getByLabelText("Game PIN 123456")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Start game/ })).toBeDisabled();
    sources[0].emit("lobby", { pin: "123456", status: "lobby", players: [{ id: "a", name: "Ravi" }, { id: "b", name: "Meena" }], total: 5, seconds: 20 });
    expect(screen.getByText("Ravi")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Start game/ })).toBeEnabled();
  });
});
