import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { StudentAuthProvider } from "../context/StudentAuthContext";
import IntroVideoSection, { REPLAY_DELAY_MS } from "./IntroVideoSection";

function renderSection() {
  return render(
    <StudentAuthProvider>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<IntroVideoSection />} />
          <Route path="/tests" element={<div>Tests page</div>} />
          <Route path="/signup" element={<div>Signup page</div>} />
        </Routes>
      </MemoryRouter>
    </StudentAuthProvider>
  );
}

const getVideo = (container) => container.querySelector("video");

describe("<IntroVideoSection />", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("shows the marketing copy on the left with working call-to-actions", () => {
    renderSection();
    expect(screen.getByRole("heading", { level: 2, name: /practice like it's the real exam/i })).toBeInTheDocument();
    expect(screen.getByText(/instant score & analysis/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /take your first free test/i }));
    expect(screen.getByText("Tests page")).toBeInTheDocument();
  });

  it("offers sign-up to visitors who are not logged in", () => {
    renderSection();
    fireEvent.click(screen.getByRole("button", { name: /create free account/i }));
    expect(screen.getByText("Signup page")).toBeInTheDocument();
  });

  it("loads the video lazily, muted and inline, with a poster and English captions", () => {
    const { container } = renderSection();
    const video = getVideo(container);
    expect(video.getAttribute("src")).toBe("/videos/setulearn-intro.mp4"); // observer stub reports "visible"
    expect(video.getAttribute("poster")).toBe("/videos/setulearn-intro-poster.jpg");
    expect(video.muted).toBe(true);
    expect(video.hasAttribute("playsinline")).toBe(true);
    const track = video.querySelector("track");
    expect(track.getAttribute("src")).toBe("/videos/setulearn-intro.vtt");
    expect(track.getAttribute("kind")).toBe("captions");
  });

  it("autoplays when it scrolls into view", () => {
    const play = jest.spyOn(window.HTMLMediaElement.prototype, "play");
    renderSection();
    expect(play).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /pause video/i })).toBeInTheDocument();
  });

  it("starts over by itself after it ends", () => {
    const { container } = renderSection();
    const video = getVideo(container);
    const play = jest.spyOn(window.HTMLMediaElement.prototype, "play");
    play.mockClear();

    video.currentTime = 45;
    fireEvent.ended(video);
    expect(play).not.toHaveBeenCalled(); // waits a beat on the end screen first

    act(() => {
      jest.advanceTimersByTime(REPLAY_DELAY_MS + 50);
    });
    expect(video.currentTime).toBe(0);
    expect(play).toHaveBeenCalledTimes(1);
  });

  it("does not auto-restart if the visitor paused it", () => {
    const { container } = renderSection();
    const video = getVideo(container);

    fireEvent.click(screen.getByRole("button", { name: /pause video/i })); // user pauses
    expect(screen.getByRole("button", { name: /play video/i })).toBeInTheDocument();

    const play = jest.spyOn(window.HTMLMediaElement.prototype, "play");
    play.mockClear();
    fireEvent.ended(video);
    act(() => {
      jest.advanceTimersByTime(REPLAY_DELAY_MS + 50);
    });
    expect(play).not.toHaveBeenCalled();
  });

  it("toggles sound and captions", () => {
    const { container } = renderSection();
    const video = getVideo(container);

    fireEvent.click(screen.getByRole("button", { name: /turn sound on/i }));
    expect(video.muted).toBe(false);
    expect(screen.getByRole("button", { name: /turn sound off/i })).toBeInTheDocument();

    const cc = screen.getByRole("button", { name: /hide captions/i });
    fireEvent.click(cc);
    expect(screen.getByRole("button", { name: /show captions/i })).toBeInTheDocument();
  });
});
