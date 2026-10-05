import { useCallback, useEffect, useRef, useState } from "react";
import { FEATURE_TOUR_CHAPTERS } from "../data/featureTour";
import Reveal from "./Reveal";

const VIDEO = {
  src: "/videos/setulearn-features.mp4",
  poster: "/videos/setulearn-features-poster.jpg",
};

/** After the tour ends, wait a moment on the closing screen, then start again by itself. */
export const TOUR_REPLAY_DELAY_MS = 2500;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isTouchDevice = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(hover: none)").matches;

const formatTime = (s) => {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

function Svg({ children, size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/**
 * "Product tour": a landscape ~90-second walkthrough of the whole platform (female voice-over, captions
 * burned into the picture) inside a laptop frame, with chapter buttons that jump to each feature.
 *
 * Playback rules mirror the phone video: lazy-loaded, autoplays muted while mostly on screen, pauses when
 * scrolled away, restarts by itself after it ends, and respects "reduce motion".
 */
export default function FeatureTourSection() {
  const screenRef = useRef(null);
  const videoRef = useRef(null);
  const replayTimer = useRef(null);
  const userPaused = useRef(false);
  const ctrlTimer = useRef(null);

  const [shouldLoad, setShouldLoad] = useState(false);
  const [inView, setInView] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ctrlVisible, setCtrlVisible] = useState(false); // touch screens: controls appear on tap, then fade

  /* ---- visibility: lazy-load early, play only while mostly on screen ---- */
  useEffect(() => {
    const node = screenRef.current;
    if (!node) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      setInView(true);
      return undefined;
    }
    const loadObserver = new IntersectionObserver(
      (entries) => entries.some((e) => e.isIntersecting) && setShouldLoad(true),
      { rootMargin: "500px 0px" }
    );
    const playObserver = new IntersectionObserver(
      (entries) => entries.forEach((e) => setInView(e.isIntersecting)),
      { threshold: 0.5 }
    );
    loadObserver.observe(node);
    playObserver.observe(node);
    return () => {
      loadObserver.disconnect();
      playObserver.disconnect();
    };
  }, []);

  const tryPlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const result = v.play?.();
    if (result && typeof result.catch === "function") result.catch(() => setPlaying(false));
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !shouldLoad) return;
    if (inView) {
      if (!userPaused.current && !prefersReducedMotion()) tryPlay();
    } else {
      window.clearTimeout(replayTimer.current);
      v.pause?.();
    }
  }, [inView, shouldLoad, tryPlay]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  useEffect(
    () => () => {
      window.clearTimeout(replayTimer.current);
      window.clearTimeout(ctrlTimer.current);
    },
    []
  );

  const revealControls = () => {
    setCtrlVisible(true);
    window.clearTimeout(ctrlTimer.current);
    ctrlTimer.current = window.setTimeout(() => setCtrlVisible(false), 3500);
  };

  // Tapping the picture: on touch screens the first tap only shows the controls (so the burned-in captions
  // aren't hidden for good); on desktop it toggles play/pause like any video.
  const handleScreenTap = () => {
    if (isTouchDevice() && playing && !ctrlVisible) {
      revealControls();
      return;
    }
    togglePlay();
  };

  /* ---- handlers ---- */
  const handleEnded = () => {
    setPlaying(false);
    window.clearTimeout(replayTimer.current);
    replayTimer.current = window.setTimeout(() => {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = 0;
      if (inView && !userPaused.current) tryPlay();
    }, TOUR_REPLAY_DELAY_MS);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (!shouldLoad) setShouldLoad(true);
    window.clearTimeout(replayTimer.current);
    if (v.paused || v.ended) {
      userPaused.current = false;
      if (v.ended) v.currentTime = 0;
      tryPlay();
    } else {
      userPaused.current = true;
      v.pause();
    }
  };

  const seekTo = (seconds, { play = true } = {}) => {
    const v = videoRef.current;
    if (!v) return;
    if (!shouldLoad) setShouldLoad(true);
    window.clearTimeout(replayTimer.current);
    v.currentTime = Math.max(0, seconds);
    setTime(v.currentTime);
    if (play) {
      userPaused.current = false;
      tryPlay();
    }
  };

  const toggleFullscreen = () => {
    const node = screenRef.current;
    if (!node) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else node.requestFullscreen?.();
  };

  const activeChapter = FEATURE_TOUR_CHAPTERS.reduce(
    (acc, c, i) => (time >= c.start - 0.2 ? i : acc),
    -1
  );

  return (
    <section className="ftv" aria-labelledby="ftv-title">
      <div className="ftv-inner">
        <Reveal>
          <div className="ftv-head">
            <div className="section-eyebrow">Product tour</div>
            <h2 className="ftv-title" id="ftv-title">
              Everything SetuLearn offers,
              <span className="ftv-title-accent"> in about a minute and a half</span>
            </h2>
            <p className="ftv-lead">
              From choosing your exam to detailed analysis, solutions, practice mode and your personal
              dashboard &mdash; watch how it all fits together, or jump straight to the part you care about.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="ftv-laptop">
            <div className="ftv-lid">
              <span className="ftv-cam" aria-hidden="true" />
              <div className="ftv-screen" ref={screenRef} role="group" aria-label="SetuLearn product tour video">
                <video
                  ref={videoRef}
                  className="ftv-video"
                  src={shouldLoad ? VIDEO.src : undefined}
                  poster={VIDEO.poster}
                  preload="metadata"
                  muted
                  playsInline
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onEnded={handleEnded}
                  onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                />

                <button
                  type="button"
                  className={`ftv-tap${playing ? "" : " is-paused"}`}
                  onClick={handleScreenTap}
                  aria-label={playing ? "Pause video" : "Play video"}
                >
                  {!playing && (
                    <span className="ftv-play">
                      <svg width="38" height="38" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
                      </svg>
                    </span>
                  )}
                </button>

                <div className={`ftv-controls${ctrlVisible ? " is-visible" : ""}`}>
                  <button
                    type="button"
                    className="ftv-btn"
                    onClick={togglePlay}
                    aria-label={playing ? "Pause video" : "Play video"}
                  >
                    {playing ? (
                      <Svg>
                        <path d="M8 5v14M16 5v14" />
                      </Svg>
                    ) : (
                      <Svg>
                        <path d="M7 4.5v15l12-7.5-12-7.5z" />
                      </Svg>
                    )}
                  </button>
                  <span className="ftv-time">
                    {formatTime(time)} / {formatTime(duration)}
                  </span>
                  <input
                    className="ftv-seek"
                    type="range"
                    min="0"
                    max={duration || 0}
                    step="0.1"
                    value={Math.min(time, duration || 0)}
                    onChange={(e) => seekTo(Number(e.target.value), { play: !userPaused.current })}
                    aria-label="Seek"
                    style={{ "--ftv-pct": `${duration ? (time / duration) * 100 : 0}%` }}
                  />
                  <button
                    type="button"
                    className={`ftv-btn${muted ? " is-muted" : ""}`}
                    onClick={() => setMuted((m) => !m)}
                    aria-label={muted ? "Turn sound on" : "Turn sound off"}
                    aria-pressed={!muted}
                    title={muted ? "Tap for sound" : "Mute"}
                  >
                    <Svg>
                      {muted ? (
                        <>
                          <path d="M11 5 6 9H3v6h3l5 4V5z" />
                          <path d="m22 9-6 6M16 9l6 6" />
                        </>
                      ) : (
                        <>
                          <path d="M11 5 6 9H3v6h3l5 4V5z" />
                          <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
                        </>
                      )}
                    </Svg>
                  </button>
                  <button type="button" className="ftv-btn" onClick={toggleFullscreen} aria-label="Full screen">
                    <Svg>
                      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
                    </Svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="ftv-base" aria-hidden="true" />
          </div>
        </Reveal>

        <nav className="ftv-chapters" aria-label="Video chapters">
          {FEATURE_TOUR_CHAPTERS.map((c, i) => (
            <button
              key={c.title}
              type="button"
              className={`ftv-chip${i === activeChapter ? " is-active" : ""}`}
              onClick={() => seekTo(c.start)}
              aria-current={i === activeChapter ? "true" : undefined}
            >
              <span className="ftv-chip-n">{String(i + 1).padStart(2, "0")}</span>
              {c.title}
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
