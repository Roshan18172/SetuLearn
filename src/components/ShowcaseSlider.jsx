/**
 * Fully automatic, side-by-side scrolling showcase strip.
 * No arrows, no dots, no drag handles — it just glides continuously
 * (pure CSS transform animation, pauses gently on hover for readability).
 * The slide list is duplicated once so the loop is seamless.
 */
const slides = [
  {
    icon: "/icons/target.png",
    tint: "#5A1EAD",
    title: "Practice Like the Real Exam",
    desc: "Every mock test mirrors the actual exam pattern — same sections, same marking scheme, same time pressure.",
  },
  {
    icon: "/icons/features/analytics.png",
    tint: "#FD860D",
    title: "Improve With Real Analytics",
    desc: "Subject-wise and topic-wise breakdowns show you exactly where marks are slipping away.",
  },
  {
    icon: "/icons/clock.png",
    tint: "#4CAF50",
    title: "Master Your Timing",
    desc: "Built-in timers and pacing insights help you stop running out of time on the last section.",
  },
  {
    icon: "/icons/tips/analyze.png",
    tint: "#FF6B6B",
    title: "Learn From Every Mistake",
    desc: "Detailed solutions and explanations turn every wrong answer into a lesson you won't forget.",
  },
  {
    icon: "/icons/trophy.png",
    tint: "#5A1EAD",
    title: "Succeed on Exam Day",
    desc: "Thousands of students use SetuLearn to walk into their exam hall calm, prepared, and confident.",
  },
];

export default function ShowcaseSlider() {
  const loop = [...slides, ...slides];

  return (
    <section className="showcase-section" aria-label="Why students practice on SetuLearn">
      <div className="showcase-heading">
        <div className="section-eyebrow">Practice. Improve. Succeed.</div>
        <h2 className="section-title">Everything That Gets You Exam-Ready</h2>
      </div>

      <div className="showcase-track-wrap">
        <div className="showcase-track">
          {loop.map((s, i) => (
            <div className="showcase-card" key={i} style={{ "--tint": s.tint }}>
              <div className="showcase-card-glow" />
              <div className="showcase-emoji">
                {s.icon && s.icon.startsWith("/") ? (
                  <img src={s.icon} alt={s.title} height={40} />
                ) : (
                  s.icon || s.emoji
                )}
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
