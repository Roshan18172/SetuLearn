import { act, fireEvent, render, screen } from "@testing-library/react";
import FeatureTourSection, { TOUR_REPLAY_DELAY_MS } from "./FeatureTourSection";
import { FEATURE_TOUR_CHAPTERS } from "../data/featureTour";

const getVideo = (c) => c.querySelector("video");

describe("<FeatureTourSection />", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("introduces the tour and lists a chapter for every feature", () => {
    render(<FeatureTourSection />);
    expect(screen.getByRole("heading", { level: 2, name: /everything setulearn offers/i })).toBeInTheDocument();
    FEATURE_TOUR_CHAPTERS.forEach((c) =>
      expect(screen.getByRole("button", { name: new RegExp(c.title, "i") })).toBeInTheDocument()
    );
  });

  it("loads the video lazily with a poster, muted and inline", () => {
    const { container } = render(<FeatureTourSection />);
    const v = getVideo(container);
    expect(v.getAttribute("src")).toBe("/videos/setulearn-features.mp4");
    expect(v.getAttribute("poster")).toBe("/videos/setulearn-features-poster.jpg");
    expect(v.muted).toBe(true);
    expect(v.hasAttribute("playsinline")).toBe(true);
  });

  it("autoplays when scrolled into view", () => {
    const play = jest.spyOn(window.HTMLMediaElement.prototype, "play");
    render(<FeatureTourSection />);
    expect(play).toHaveBeenCalled();
  });

  it("jumps to a chapter and plays from there", () => {
    const { container } = render(<FeatureTourSection />);
    const v = getVideo(container);
    const play = jest.spyOn(window.HTMLMediaElement.prototype, "play");
    play.mockClear();
    const target = FEATURE_TOUR_CHAPTERS.find((c) => c.title === "Analysis");
    fireEvent.click(screen.getByRole("button", { name: /analysis/i }));
    expect(v.currentTime).toBe(target.start);
    expect(play).toHaveBeenCalled();
  });

  it("highlights the chapter that is currently playing", () => {
    const { container } = render(<FeatureTourSection />);
    const v = getVideo(container);
    const results = FEATURE_TOUR_CHAPTERS.find((c) => c.title === "Results");
    v.currentTime = results.start + 1;
    fireEvent.timeUpdate(v);
    expect(screen.getByRole("button", { name: /results/i })).toHaveAttribute("aria-current", "true");
  });

  it("starts over by itself after it ends, but not if the visitor paused it", () => {
    const { container } = render(<FeatureTourSection />);
    const v = getVideo(container);
    const play = jest.spyOn(window.HTMLMediaElement.prototype, "play");
    play.mockClear();

    fireEvent.ended(v);
    act(() => jest.advanceTimersByTime(TOUR_REPLAY_DELAY_MS + 50));
    expect(v.currentTime).toBe(0);
    expect(play).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getAllByRole("button", { name: /pause video/i })[0]); // visitor pauses
    play.mockClear();
    fireEvent.ended(v);
    act(() => jest.advanceTimersByTime(TOUR_REPLAY_DELAY_MS + 50));
    expect(play).not.toHaveBeenCalled();
  });

  it("toggles sound", () => {
    const { container } = render(<FeatureTourSection />);
    fireEvent.click(screen.getByRole("button", { name: /turn sound on/i }));
    expect(getVideo(container).muted).toBe(false);
    expect(screen.getByRole("button", { name: /turn sound off/i })).toBeInTheDocument();
  });
});
