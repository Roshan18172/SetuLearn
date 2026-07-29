import { useEffect, useRef, useState } from "react";

/**
 * Wraps any content and fades/slides it into view the first time it
 * scrolls into the viewport. Pure CSS transition driven by a single
 * IntersectionObserver — cheap, no animation libraries needed.
 *
 * Usage: <Reveal delay={100}><div className="feature-card">...</div></Reveal>
 */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  y = 24,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // If the user already scrolled past it before hydration, or reduced
    // motion is requested, just show it immediately.
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "reveal-visible" : ""} ${className}`}
      style={{
        "--reveal-delay": `${delay}ms`,
        "--reveal-y": `${y}px`,
      }}
    >
      {children}
    </Tag>
  );
}
