import { act, fireEvent, render, screen } from "@testing-library/react";
import MacbookVideo, { MACBOOK_REPLAY_DELAY_MS } from "./MacbookVideo";

const props = { src: "/videos/x.mp4", poster: "/videos/x.jpg", label: "Test video" };
const getVideo = (c) => c.querySelector("video");

describe("<MacbookVideo />", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("renders the video inside a MacBook-style frame", () => {
    const { container } = render(<MacbookVideo {...props} />);
    expect(container.querySelector(".mbv-lid")).toBeInTheDocument();
    expect(container.querySelector(".mbv-notch")).toBeInTheDocument();
    expect(container.querySelector(".mbv-base")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Test video" })).toBeInTheDocument();
  });

  it("loads lazily with a poster, muted and inline", () => {
    const { container } = render(<MacbookVideo {...props} />);
    const v = getVideo(container);
    expect(v.getAttribute("src")).toBe(props.src);
    expect(v.getAttribute("poster")).toBe(props.poster);
    expect(v.muted).toBe(true);
    expect(v.hasAttribute("playsinline")).toBe(true);
  });

  it("autoplays when in view", () => {
    const play = jest.spyOn(window.HTMLMediaElement.prototype, "play");
    render(<MacbookVideo {...props} />);
    expect(play).toHaveBeenCalled();
  });

  it("restarts by itself after it ends, but not after the visitor paused it", () => {
    const { container } = render(<MacbookVideo {...props} />);
    const v = getVideo(container);
    const play = jest.spyOn(window.HTMLMediaElement.prototype, "play");
    play.mockClear();

    fireEvent.ended(v);
    act(() => jest.advanceTimersByTime(MACBOOK_REPLAY_DELAY_MS + 50));
    expect(v.currentTime).toBe(0);
    expect(play).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getAllByRole("button", { name: /pause video/i })[0]);
    play.mockClear();
    fireEvent.ended(v);
    act(() => jest.advanceTimersByTime(MACBOOK_REPLAY_DELAY_MS + 50));
    expect(play).not.toHaveBeenCalled();
  });

  it("toggles sound and seeks", () => {
    const { container } = render(<MacbookVideo {...props} />);
    fireEvent.click(screen.getByRole("button", { name: /turn sound on/i }));
    expect(getVideo(container).muted).toBe(false);
    Object.defineProperty(getVideo(container), "duration", { configurable: true, value: 54 });
    fireEvent.loadedMetadata(getVideo(container));
    fireEvent.change(screen.getByRole("slider", { name: /seek/i }), { target: { value: "20" } });
    expect(getVideo(container).currentTime).toBe(20);
  });
});
