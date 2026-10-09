import { useMemo } from "react";

/** Animated, themed full-page background: gradient + floating glyphs (pure CSS, no images). */
export default function GameBackdrop({ glyphs = ["★"], count = 26 }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        glyph: glyphs[i % glyphs.length],
        left: Math.random() * 100,
        size: 16 + Math.random() * 44,
        duration: 14 + Math.random() * 22,
        delay: -Math.random() * 30,
        drift: (Math.random() - 0.5) * 120,
        spin: (Math.random() - 0.5) * 360,
        opacity: 0.08 + Math.random() * 0.2,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, glyphs.join("")]
  );

  return (
    <div className="gb-backdrop" aria-hidden="true">
      <div className="gb-orb gb-orb-1" />
      <div className="gb-orb gb-orb-2" />
      <div className="gb-orb gb-orb-3" />
      <div className="gb-grid" />
      {items.map((it) => (
        <span
          key={it.id}
          className="gb-float"
          style={{
            left: `${it.left}%`,
            fontSize: it.size,
            opacity: it.opacity,
            animationDuration: `${it.duration}s`,
            animationDelay: `${it.delay}s`,
            "--drift": `${it.drift}px`,
            "--spin": `${it.spin}deg`,
          }}
        >
          {it.glyph}
        </span>
      ))}
    </div>
  );
}
