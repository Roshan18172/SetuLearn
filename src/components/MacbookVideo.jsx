import { useCallback, useEffect, useRef, useState } from "react";

/** After the video ends, wait a moment on the closing screen, then start again by itself. */
export const MACBOOK_REPLAY_DELAY_MS = 2500;

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
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

function Svg({ children, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

/**
 * A video player inside a MacBook-style frame (aluminium rim, thin black bezel, camera notch, hinge base).
 *
 * - The file is only requested when the player is about to scroll into view.
 * - Autoplays (muted, as browsers require) while at least half of it is visible; pauses when scrolled away.
 * - Starts over by itself a moment after it ends, unless the visitor paused it.
 * - Visitors who prefer reduced motion get the poster with a play button instead of autoplay.
 * - Desktop: hover for controls, click to pause. Touch: first tap shows the controls, which then fade.
 * The control-bar styling is shared with the home-page tour player (`ftv-*` classes).
 */
export default function MacbookVideo({
  src,
  poster,
  label = "Video",
  replayDelayMs = MACBOOK_REPLAY_DELAY_MS,
}) {
  const screenRef = useRef(null);
  const videoRef = useRef(null);
  const replayTimer = useRef(null);
  const ctrlTimer = useRef(null);
  const userPaused = useRef(false);

  const [shouldLoad, setShouldLoad] = useState(false);
  const [inView, setInView] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ctrlVisible, setCtrlVisible] = useState(false);

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

  const handleEnded = () => {
    setPlaying(false);
    window.clearTimeout(replayTimer.current);
    replayTimer.current = window.setTimeout(() => {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = 0;
      if (inView && !userPaused.current) tryPlay();
    }, replayDelayMs);
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

  const handleScreenTap = () => {
    if (isTouchDevice() && playing && !ctrlVisible) {
      setCtrlVisible(true);
      window.clearTimeout(ctrlTimer.current);
      ctrlTimer.current = window.setTimeout(() => setCtrlVisible(false), 3500);
      return;
    }
    togglePlay();
  };

  const seekTo = (seconds) => {
    const v = videoRef.current;
    if (!v) return;
    if (!shouldLoad) setShouldLoad(true);
    window.clearTimeout(replayTimer.current);
    v.currentTime = Math.max(0, seconds);
    setTime(v.currentTime);
  };

  const toggleFullscreen = () => {
    const node = screenRef.current;
    if (!node) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else node.requestFullscreen?.();
  };

  return (
    <div className="mbv">
      <div className="mbv-lid">
        <span className="mbv-notch" aria-hidden="true"><i /></span>
        <div className="ftv-screen mbv-screen" ref={screenRef} role="group" aria-label={label}>
          <video
            ref={videoRef}
            className="ftv-video"
            src={shouldLoad ? src : undefined}
            poster={poster}
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
            <button type="button" className="ftv-btn" onClick={togglePlay} aria-label={playing ? "Pause video" : "Play video"}>
              {playing ? (
                <Svg><path d="M8 5v14M16 5v14" /></Svg>
              ) : (
                <Svg><path d="M7 4.5v15l12-7.5-12-7.5z" /></Svg>
              )}
            </button>
            <span className="ftv-time">{formatTime(time)} / {formatTime(duration)}</span>
            <input
              className="ftv-seek"
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={Math.min(time, duration || 0)}
              onChange={(e) => seekTo(Number(e.target.value))}
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
              <Svg><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></Svg>
            </button>
          </div>
        </div>
      </div>
      <div className="mbv-base" aria-hidden="true"><span /></div>
    </div>
  );
}
