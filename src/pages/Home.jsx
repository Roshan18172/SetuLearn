import { useState, useEffect, useRef } from "react";
// import { ClipboardCheck, CreditCardSlash, Group } from "iconoir-react";
import { useNavigate } from "react-router-dom";
import examService from "../api/examService";
import { mapExamToCategory, mapTestToFrontend } from "../api/dataMapper";
import { getErrorMessage } from "../api/apiErrorHandler";
import { ArrowRight, QuestionMarkRound, Time } from "../data/svgs";
import SEO from "../components/SEO";
import ShowcaseSlider from "../components/ShowcaseSlider";
import RecentTestsCarousel from "../components/RecentTestsCarousel";
import EventQuizCarousel from "../components/EventQuizCarousel";
import NewsSection from "../components/NewsSection";
import Reveal from "../components/Reveal";



/* ── Skeleton helpers ──────────────────────────────────── */
function SkeletonBox({ width, height, borderRadius = "8px" }) {
  return (
    <div className="skeleton-box" style={{ width, height, borderRadius }} />
  );
}

function CategorySkeleton() {
  return (
    <div className="category-card category-skeleton">
      <SkeletonBox width={80} height={80} borderRadius="50%" />
      <SkeletonBox width="70%" height="18px" />
      <SkeletonBox width="50%" height="14px" />
      <SkeletonBox width="40%" height="14px" />
    </div>
  );
}

function TestCardSkeleton() {
  return (
    <div className="test-card-home test-card-skeleton">
      <div className="tc-left">
        <SkeletonBox width={48} height={48} borderRadius="50%" />
        <div className="tc-info">
          <SkeletonBox width="240px" height="18px" />
          <SkeletonBox width="320px" height="14px" />
        </div>
      </div>
      <SkeletonBox width="120px" height="40px" borderRadius="8px" />
    </div>
  );
}

/* ── Main component ────────────────────────────────────── */
const SLIDES = [
  {
    badge: "🎯 India's #1 Free Mock Test Platform",
    title: (
      <>
        Practice.<br />
        Improve.
        <br />
        <span className="hero-accent">Succeed.</span>
      </>
    ),
    desc: "Take free mock tests built around real exam patterns. Practice questions, manage your time, and build confidence for your next exam.",
    primaryCta: "Browse All Tests",
    secondaryCta: "Explore Exams",
    image: "/img/slide-1.avif",
    imageAlt: "Student practicing a mock test on SetuLearn",
    features: [
      { value: "45+", label: "Mock Tests" },
      { value: "20K+", label: "Students" },
      { value: "Free", label: "No Sign-up" },
    ],
    primaryRoute: "/tests",
    secondaryRoute: "/exams",
  },
  {
    badge: "📊 Know Your Performance",
    title: (
      <>
        Don't Just Test.
        Understand<span className="hero-accent"> Your Score.</span>
      </>
    ),
    desc: "Get instant results and detailed insights into your performance. Discover your strengths, identify weak areas, and know exactly where to improve.",
    primaryCta: "View Sample Analysis",
    secondaryCta: "Start a Mock Test",
    image: "/img/slide-2.avif",
    imageAlt: "Student analyzing mock test performance on SetuLearn",
    features: [
      { value: "Instant", label: "Results" },
      { value: "Detailed", label: "Analysis" },
      { value: "Subject-wise", label: "Performance" },
    ],
    primaryRoute: "/tests",
    secondaryRoute: "/tests",
  },
  {
    badge: "🚀 Your Progress. Your Success.",
    title: (
      <>
        Every Test
        <br />Makes You         
        <span className="hero-accent"> Stronger.</span>
      </>
    ),
    desc: "Track your progress, improve your weak areas, and get closer to your goal with every test.",
    primaryCta: "Start Practicing",
    secondaryCta: "Explore Exams",
    image: "/img/slide-3.avif",
    imageAlt: "Student tracking progress and improving exam performance on SetuLearn",
    features: [
      { value: "Track", label: "Your Progress" },
      { value: "Improve", label: "Your Accuracy" },
      { value: "Achieve", label: "Your Goals" },
    ],
    primaryRoute: "/tests",
    secondaryRoute: "/exams",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredTests, setFeaturedTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // ── Seamless infinite loop ──────────────────────────────
  // Two copies of the slides are rendered per track. A continuous
  // `pos` counter drives the translateX offset; when it crosses the
  // edge we teleport (no transition) to an identical slide so the
  // carousel loops in one direction forever with no reverse swipe.
  const N = SLIDES.length;
  const LOOP = [...SLIDES, ...SLIDES];
  const MAX = 2 * N;
  const posRef = useRef(0);

  const syncActive = () => {
    const tracks = document.querySelectorAll(".hero-carousel-track");
    tracks.forEach((t) => {
      t.querySelectorAll(".hero-slide").forEach((s) => {
        const on = Number(s.dataset.slide) === posRef.current;
        s.classList.toggle("active", on);
        s.setAttribute("aria-hidden", String(!on));
      });
    });
  };

  const setSlidePos = (p, animate) => {
    const tracks = document.querySelectorAll(".hero-carousel-track");
    tracks.forEach((t) => {
      t.style.transition = animate ? "" : "none";
      t.style.transform = `translateX(-${p * 100}%)`;
    });
    if (tracks.length) void tracks[0].offsetWidth;
  };

  const commit = () => {
    setActiveSlide(((posRef.current % N) + N) % N);
  };

  const step = (dir) => {
    const cur = posRef.current;
    const next = cur + dir;
    if (next >= MAX || next < 0) {
      const p2 = next - dir * N; // wrap to the other, identical copy
      setSlidePos(p2 - dir, false); // teleport seamlessly
      setSlidePos(p2, true); // then animate into view
      posRef.current = p2;
    } else {
      setSlidePos(next, true);
      posRef.current = next;
    }
    syncActive();
    commit();
  };
  const stepRef = useRef(step);
  stepRef.current = step;

  // const goTo = (idx) => {
  //   const curSlide = ((posRef.current % N) + N) % N;
  //   const steps = ((idx - curSlide) + N) % N;
  //   for (let k = 1; k <= steps; k++) {
  //     setTimeout(() => step(1), k * 380);
  //   }
  // };

  useEffect(() => {
    // Initial active state (marks slide 0 visible before first advance)
    syncActive();
    commit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      stepRef.current(1);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  useEffect(() => {
    const indicators = document.querySelectorAll(".indicator");
    indicators.forEach((btn, i) => {
      const isActive = i === activeSlide;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }, [activeSlide]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [exams, tests] = await Promise.all([
          examService.getExams(),
          examService.getAllTests(),
        ]);

        const mappedCategories = exams.map((exam) => {
          const cat = mapExamToCategory(exam);
          cat.tests = tests.filter(
            (t) => t.exam?.id === exam.id || t.examId === exam.id,
          ).length;
          cat.exams = [exam.name];
          return cat;
        });

        const mappedTests = tests.map((t) =>
          mapTestToFrontend(t, t.exam?.name || ""),
        );

        setCategories(mappedCategories.slice(0, 4));
        setFeaturedTests(mappedTests.slice(0, 3));
      } catch (err) {
        console.error(
          "Failed to fetch home data:",
          getErrorMessage(
            err,
            "Could not load test data. Please make sure the backend is running.",
          ),
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="home-page">
      <SEO
        title="Home"
        description="SetuLearn - India's #1 free mock test platform for government jobs (SSC, UPSC, Banking), engineering (JEE, BITSAT), medical (NEET), and college entrance exams. Practice with real exam patterns, get detailed analytics, and track your progress."
        canonical="/"
      />
      {/* Hero Carousel */}
      <section className="hero">
        {/* Decorative background: randomly scattered SVG ring + dot shapes */}
         <img alt="Hero background" src="img/hero-background.svg" style={{position:"absolute", inset:0, width:"100%", height:"100%", opacity: "0.5" }} />
        <div className="hero-section">
          <div className="hero-content">
            <div
              className="hero-carousel"
              role="region"
              aria-label="Featured content"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="hero-carousel-track" id="heroCarouselTrack">
                {LOOP.map((slide, idx) => (
                  <div
                    className={`hero-slide${idx === 0 ? " active" : ""}`}
                    data-slide={idx}
                    key={`txt-${idx}`}
                  >
                    <div className="hero-badge">
                      <img src="/icons/target.png" alt="target" height={20} />
                      {slide.badge.split(' ').slice(1).join(' ')}
                    </div>
                    <h1 className="hero-title">{slide.title}</h1>
                    <p className="hero-desc">{slide.desc}</p>
                    <div className="hero-actions">
                      <button
                        className="btn-primary btn-lg"
                        onClick={() => navigate(slide.primaryRoute)}
                      >
                        {slide.primaryCta}
                      </button>
                      <button
                        className="btn-outline btn-lg"
                        onClick={() => navigate(slide.secondaryRoute)}
                      >
                        {slide.secondaryCta} <ArrowRight />
                      </button>
                    </div>
                    <div className="hero-stats">
                      {slide.features.map((f) => (
                        <div className="hstat" key={f.label}>
                          <div>
                            <h3>{f.value}</h3>
                            <span>{f.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {/* <div className="hero-carousel-controls">
                <button
                  className="carousel-btn carousel-prev"
                  aria-label="Previous slide"
                  onClick={() => step(-1)}
                >
                  ‹
                </button>
                <div className="hero-carousel-indicators">
                  {SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      className={`indicator ${idx === activeSlide ? 'active' : ''}`}
                      aria-label={`Slide ${idx + 1}`}
                      aria-current={idx === activeSlide ? 'true' : 'false'}
                      onClick={() => goTo(idx)}
                    />
                  ))}
                </div>
                <button
                  className="carousel-btn carousel-next"
                  aria-label="Next slide"
                  onClick={() => step(1)}
                >
                  ›
                </button>
              </div> */}
            </div>
          </div>
                    <div className="hero-visual">
            <div className="hero-image-wrap" id="heroImageWrap">
              <div className="hero-carousel-track" id="heroSlideImageTrack">
                {LOOP.map((slide, idx) => (
                  <div
                    className={`hero-slide${idx === 0 ? " active" : ""}`}
                    data-slide={idx}
                    key={`hero-img-${idx}`}
                  >
                    <img src={slide.image} alt={slide.imageAlt} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Auto-scrolling Practice/Improve/Succeed showcase */}
      <ShowcaseSlider />

      {/* Categories */}
      <section className="section">
        <div className="section-header">
          <div>
            <div className="section-eyebrow">Explore by Category</div>
            <h2 className="section-title">Popular Exam Categories</h2>
          </div>
          <button className="btn-text" onClick={() => navigate("/exams")}>
            View All <ArrowRight />
          </button>
        </div>
        <div className="categories-grid">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <CategorySkeleton key={i} />
              ))
            : categories.map((cat) => (
                <div
                  key={cat.id}
                  className="category-card"
                  onClick={() =>
                    navigate("/tests", {
                      state: {
                        selectedExam: cat.name,
                      },
                    })
                  }
                  style={{ "--cat-color": cat.color }}
                >
                  <div className="cat-icon">
                    <img
                      src={`${cat.icon}`}
                      alt={`${cat.name}-icon`}
                      width={80}
                      height={80}
                    />
                  </div>
                  <div>
                    <div className="cat-name">{cat.name}</div>
                    <div className="cat-exams">
                      {cat.exams.slice(0, 3).join(", ")}
                    </div>
                    <div className="cat-count">{cat.tests} Tests</div>
                  </div>
                </div>
              ))}
        </div>
      </section>

      {/* Why */}
      <section className="why-section">
        <div className="why-inner">
          <div className="why-text">
            <div className="section-eyebrow">Why SetuLearn?</div>
            <h2 className="section-title">Why Take Mock Tests?</h2>
            <div className="why-points">
              {[
                {
                  icon: "/icons/online-test.png",
                  title: "Real Exam Experience",
                  desc: "Tests follow exact patterns of actual exams with same difficulty and time constraints.",
                },
                {
                  icon: "/icons/document.png",
                  title: "Improve Speed & Accuracy",
                  desc: "Practice under timed conditions to build pace and reduce silly mistakes.",
                },
                {
                  icon: "/icons/business.png",
                  title: "Identify Strengths & Weaknesses",
                  desc: "Detailed analytics after every test help you focus on areas that need improvement.",
                },
                {
                  icon: "/icons/free.png",
                  title: "Completely Free",
                  desc: "No registration, no fees. Just open a test and start practicing.",
                },
              ].map((p) => (
                <div key={p.title} className="why-point">
                  <div className="why-icon">
                    <img
                      src={p.icon}
                      alt={`${p.icon}-icon`}
                      width={32}
                      height={32}
                    />
                  </div>
                  <div>
                    <div className="why-point-title">{p.title}</div>
                    <div className="why-point-desc">
                      {p.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="why-visual">
            <RecentTestsCarousel />
          </div>
        </div>
      </section>

      {/* Featured Tests */}
      <section className="section">
        <div className="section-header">
          <div>
            <div className="section-eyebrow">Recommended</div>
            <h2 className="section-title">Featured Tests</h2>
          </div>
          <button className="btn-text" onClick={() => navigate("/tests")}>
            <span>View All Tests</span> <ArrowRight />
          </button>
        </div>
        <div className="tests-list">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <TestCardSkeleton key={i} />
              ))
            : featuredTests.map((test) => {
                const category =
                  categories.find((cat) => cat.name === test.category) || {};
                const catColor = category.color || "#5A1EAD";
                const catIcon =
                  category.icon || "/icons/exam-icons/graduation-cap.png";

                return (
                  <div key={test.id} className="test-card-home">
                    <div className="tc-left">
                      <div
                        className="tr-icon"
                        style={{
                          border: `2px solid ${catColor}`,
                          backgroundColor: catColor + "22",
                        }}
                      >
                        <img
                          src={catIcon}
                          alt={test.exam}
                          width={34}
                          height={34}
                        />
                      </div>
                      <div className="tc-info">
                        <div className="tc-title">{test.title}</div>
                        <span className="tc-cat">{test.category}</span>
                        <div className="tc-meta">
                          <QuestionMarkRound />
                          <span>{test.questions} Questions</span>
                          <Time />
                          <span>{test.duration} Mins</span>
                          <span
                            className={`diff-badge ${test.difficulty.toLowerCase()}`}
                          >
                            {test.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      className="btn-primary"
                      onClick={() =>
                        navigate("/instructions", {
                          state: { test, mode: "timed" },
                        })
                      }
                    >
                      Start Test
                    </button>
                  </div>
                );
              })}
        </div>
      </section>

      <EventQuizCarousel />

      <NewsSection />

      {/* Trust / Commitment */}
      <section className="section trust-section">
        <div className="section-header-center">
          <div className="section-eyebrow">Our Promise</div>
          <h2 className="section-title">Built to Be On Your Side</h2>
        </div>
        <div className="trust-grid">
          {[
            {
              icon: "/icons/misc/shield.png",
              title: "Your Data Stays Yours",
              desc: "Test history lives on your own device. We don't sell or share your practice data.",
            },
            {
              icon: "/icons/free.png",
              title: "Free, Forever",
              desc: "No paywalls, no premium tiers, no surprise charges — every test stays free.",
            },
            {
              icon: "/icons/features/analytics.png",
              title: "Real Exam Analytics",
              desc: "Question-level, topic-level, and time-based analysis after every single attempt.",
            },
            {
              icon: "/icons/misc/puzzle.png",
              title: "Built by Students, for Students",
              desc: "Designed around how JEE, NEET, UPSC, SSC & CUET aspirants actually prepare.",
            },
          ].map((t, i) => (
            <Reveal key={t.title} delay={i * 90}>
              <div className="trust-card">
                <div className="trust-icon">
                  {t.icon && typeof t.icon === 'string' && t.icon.startsWith('/') ? (
                    <img src={t.icon} alt={t.title} height={35} />
                  ) : (
                    t.icon
                  )}
                </div>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Journey / testimonials */}
      <section className="section journey-section">
        <div className="section-header-center">
          <div className="section-eyebrow">Your Journey</div>
          <h2 className="section-title">From First Attempt to Exam Day</h2>
        </div>
        <div className="journey-strip">
            {[
            { icon: "/icons/how-works/search.png", label: "Browse Tests" },
            { icon: "/icons/how-works/give-test.png", label: "Attempt Mock Test" },
            { icon: "/icons/features/quick.png", label: "Instant Results" },
            { icon: "/icons/features/analytics.png", label: "Deep Analysis" },
            { icon: "/icons/trophy.png", label: "Ace the Exam" },
          ].map((step, i, arr) => (
            <div className="journey-step-wrap" key={step.label}>
              <Reveal delay={i * 100}>
                <div className="journey-step">
                  <div className="journey-step-icon">{step.icon && typeof step.icon === 'string' && step.icon.startsWith('/') ? <img src={step.icon} alt={step.label} height={30}/> : step.icon}</div>
                  <span>{step.label}</span>
                </div>
              </Reveal>
              {i < arr.length - 1 && <div className="journey-arrow">→</div>}
            </div>
          ))}
        </div>

        <div className="testimonial-grid">
          {[
            {
              quote:
                "The topic-wise breakdown showed me I was losing marks in Organic Chemistry, not Physics like I thought.",
              name: "Aditi, NEET Aspirant",
            },
            {
              quote:
                "Practicing under the real timer stopped me from running out of time in my actual SSC exam.",
              name: "Rohit, SSC CGL",
            },
            {
              quote:
                "Free, no login, no ads — I could just open a test and start practicing between classes.",
              name: "Meera, JEE Aspirant",
            },
          ].map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <div className="testimonial-card">
                <div className="testimonial-quote-mark">“</div>
                <p>{t.quote}</p>
                <div className="testimonial-name">{t.name}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="cta-content">
          <h2>Ready to ace your exam?</h2>
          <p>
            Join thousands of students who practice with SetuLearn every day.
          </p>
          <button className="btn-white" onClick={() => navigate("/tests")}>
            Browse All Tests <ArrowRight />
          </button>
        </div>
      </section>
    </div>
  );
}