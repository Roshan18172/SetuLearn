import MacbookVideo from "./MacbookVideo";
import Reveal from "./Reveal";

const VIDEO = {
  src: "/videos/setulearn-about.mp4",
  poster: "/videos/setulearn-about-poster.jpg",
};

const HIGHLIGHTS = [
  "Real exam simulation",
  "Instant results & analytics",
  "Detailed solutions",
  "Built for serious aspirants",
];

/** About page: "See SetuLearn in action" — the overview video in a MacBook frame. */
export default function AboutVideoSection() {
  return (
    <section className="avs" aria-labelledby="avs-title">
      <div className="avs-inner">
        <Reveal>
          <div className="avs-head">
            <span className="section-eyebrow">See SetuLearn in action</span>
            <h2 id="avs-title">
              One platform for your <span className="avs-accent">whole exam preparation</span>
            </h2>
            <p>
              A quick look at how SetuLearn helps you practise on real exam patterns, understand your
              performance the moment you finish, and learn from every mistake.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <MacbookVideo
            src={VIDEO.src}
            poster={VIDEO.poster}
            label="SetuLearn features overview video"
          />
        </Reveal>

        <ul className="avs-pills" aria-label="What the video covers">
          {HIGHLIGHTS.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
