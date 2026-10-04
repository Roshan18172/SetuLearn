import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentAuth } from "../context/StudentAuthContext";
import Reveal from "./Reveal";

const VIDEO = {
  src: "/videos/setulearn-intro.mp4",
  poster: "/videos/setulearn-intro-poster.jpg",
  captions: "/videos/setulearn-intro.vtt",
};

/** Pause on the end screen for a moment, then start over by itself. */
export const REPLAY_DELAY_MS = 1500;

const FEATURES = [
  {
    title: "Real exam-style mock tests",
    text: "Timed papers that follow actual exam patterns — or practise at your own pace.",
    icon: (
      <path d="M12 6v6l4 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z" />
    ),
  },
  {
    title: "Instant score & analysis",
    text: "See your score, mistakes and performance insights the moment you submit.",
    icon: <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />,
  },
  {
    title: "Know exactly where to improve",
    text: "Subject and topic breakdowns show what to revise next, so every test counts.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="12" cy="12" r="0.8" />
      </>
    ),
  },
  {
    title: "Free to start, on any device",
    text: "Works on your phone, tablet or laptop. Take your first test in a minute.",
    icon: (
      <>
        <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
        <path d="M11 18.5h2" />
      </>
    ),
  },
];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Icon({ children, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/**
 * "See SetuLearn in action": marketing copy on the left, the intro video inside a phone frame on the right.
 *
 * Playback rules
 *  - The file is only requested when the section is about to scroll into view.
 *  - It autoplays (muted, as browsers require) while at least half of the phone is visible, and pauses
 *    when scrolled away.
 *  - When it ends it waits a moment and plays again automatically.
 *  - Visitors who prefer reduced motion get the poster with a play button instead of autoplay.
 *  - Tap the screen to pause/play; buttons toggle sound and captions.
 */
export default function IntroVideoSection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useStudentAuth();

  const phoneRef = useRef(null);
  const videoRef = useRef(null);
  const replayTimer = useRef(null);
  const userPaused = useRef(false);

  const [shouldLoad, setShouldLoad] = useState(false);
  const [inView, setInView] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [progress, setProgress] = useState(0);

  /* ---- visibility: lazy-load early, play only when mostly on screen ---- */
  useEffect(() => {
    const node = phoneRef.current;
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
    if (result && typeof result.catch === "function") {
      // Autoplay can be refused (data saver, strict browser settings). The play button stays visible then.
      result.catch(() => setPlaying(false));
    }
  }, []);

  /* ---- start / stop with visibility ---- */
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

  /* ---- keep the DOM in sync with state React can't set reliably ---- */
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  const applyCaptionMode = useCallback(() => {
    const track = videoRef.current?.textTracks?.[0];
    if (track) track.mode = captionsOn ? "showing" : "hidden";
  }, [captionsOn]);

  useEffect(() => {
    applyCaptionMode();
  }, [applyCaptionMode, shouldLoad]);

  useEffect(() => () => window.clearTimeout(replayTimer.current), []);

  /* ---- handlers ---- */
  const handleEnded = () => {
    setPlaying(false);
    setProgress(1);
    window.clearTimeout(replayTimer.current);
    // "Automatically after the video ends": go again, unless the visitor scrolled away.
    replayTimer.current = window.setTimeout(() => {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = 0;
      if (inView && !userPaused.current) tryPlay();
    }, REPLAY_DELAY_MS);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (!shouldLoad) setShouldLoad(true);
    if (v.paused || v.ended) {
      userPaused.current = false;
      if (v.ended) v.currentTime = 0;
      tryPlay();
    } else {
      userPaused.current = true;
      v.pause();
    }
  };

  const handleTimeUpdate = (e) => {
    const { currentTime, duration } = e.currentTarget;
    if (duration > 0) setProgress(currentTime / duration);
  };

  return (
    <section className="ivs" aria-labelledby="ivs-title">
      <div className="ivs-inner">
        {/* ------------------------- left: content ------------------------- */}
        <div className="ivs-copy">
          <Reveal>
            <div className="section-eyebrow">See SetuLearn in action</div>
            <h2 className="ivs-title" id="ivs-title">
              Practice like it&apos;s the real exam.
              <span className="ivs-title-accent"> Improve after every test.</span>
            </h2>
            <p className="ivs-lead">
              Studying matters, but practice is what prepares you for the real test. SetuLearn is
              your online mock test platform for JEE, NEET, SSC, UPSC, banking and more &mdash; so
              you can practise smarter and walk into exam day with confidence.
            </p>
          </Reveal>

          <ul className="ivs-features">
            {FEATURES.map((f, i) => (
              <li key={f.title}>
                <Reveal delay={i * 80} y={16}>
                  <div className="ivs-feature">
                    <span className="ivs-feature-icon">
                      <Icon>{f.icon}</Icon>
                    </span>
                    <div>
                      <h3>{f.title}</h3>
                      <p>{f.text}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>

          <Reveal delay={200}>
            <div className="ivs-actions">
              <button className="btn-primary btn-lg" onClick={() => navigate("/tests")}>
                Take your first free test
              </button>
              {isAuthenticated ? (
                <button className="btn-outline btn-lg" onClick={() => navigate("/dashboard")}>
                  Open my dashboard
                </button>
              ) : (
                <button className="btn-outline btn-lg" onClick={() => navigate("/signup")}>
                  Create free account
                </button>
              )}
            </div>
          </Reveal>
        </div>

        {/* ------------------------ right: phone + video ------------------------ */}
        <div className="ivs-stage">
          <div className="ivs-blob ivs-blob-a" aria-hidden="true" />
          <div className="ivs-blob ivs-blob-b" aria-hidden="true" />
          <span className="ivs-chip ivs-chip-a" aria-hidden="true">
            <i /> Timed tests
          </span>
          <span className="ivs-chip ivs-chip-b" aria-hidden="true">
            <i /> Instant analysis
          </span>

          <div className="ivs-phone" ref={phoneRef} role="group" aria-label="SetuLearn intro video">
            <div className="ivs-screen">
              <video
                ref={videoRef}
                className="ivs-video"
                src={shouldLoad ? VIDEO.src : undefined}
                poster={VIDEO.poster}
                preload="metadata"
                muted
                playsInline
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={handleEnded}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={applyCaptionMode}
              >
                <track
                  kind="captions"
                  srcLang="en"
                  label="English"
                  src={VIDEO.captions}
                  default
                />
              </video>

              <span className="ivs-island" aria-hidden="true" />

              {/* tap anywhere on the screen to pause / play */}
              <button
                type="button"
                className={`ivs-tap${playing ? "" : " is-paused"}`}
                onClick={togglePlay}
                aria-label={playing ? "Pause video" : "Play video"}
              >
                {!playing && (
                  <span className="ivs-play">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
                    </svg>
                  </span>
                )}
              </button>

              <div className="ivs-controls">
                <button
                  type="button"
                  className={`ivs-ctl${muted ? " is-muted" : ""}`}
                  onClick={() => setMuted((m) => !m)}
                  aria-label={muted ? "Turn sound on" : "Turn sound off"}
                  aria-pressed={!muted}
                  title={muted ? "Tap for sound" : "Mute"}
                >
                  <Icon size={18}>
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
                  </Icon>
                </button>
                <button
                  type="button"
                  className={`ivs-ctl ivs-ctl-cc${captionsOn ? " is-on" : ""}`}
                  onClick={() => setCaptionsOn((c) => !c)}
                  aria-label={captionsOn ? "Hide captions" : "Show captions"}
                  aria-pressed={captionsOn}
                  title="Captions"
                >
                  CC
                </button>
              </div>

              <div className="ivs-progress" aria-hidden="true">
                <span style={{ transform: `scaleX(${progress})` }} />
              </div>
              <span className="ivs-home-bar" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
