import { useState, useEffect } from "react";
import { ClipboardCheck, CreditCardSlash, Group } from "iconoir-react";
import { useNavigate } from "react-router-dom";
import examService from "../api/examService";
import { mapExamToCategory, mapTestToFrontend } from "../api/dataMapper";
import { getErrorMessage } from "../api/apiErrorHandler";
import { ArrowRight, QuestionMarkRound, Time } from "../data/svgs";
import SEO from "../components/SEO";

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
export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredTests, setFeaturedTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


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

  const lastExam = JSON.parse(localStorage.getItem("lastexam")) || {};
  const lastExamTitle = lastExam.testTitle || "N/A";
  const lastExamScore = lastExam.securedScore || 0;
  const lastExamTotal = lastExam.totalScore || 0;
  const lastExamPercentage = lastExam.totalScore
    ? ((lastExam.securedScore / lastExam.totalScore) * 100).toFixed(2)
    : 0;
  const lastExamCorrect = lastExam.correct || 0;
  const lastExamIncorrect = lastExam.incorrect || 0;
  const lastExamUnattempted = lastExam.unattempted || 0;
  const lastExamQuestions =
    lastExam.totalQuestions ||
    lastExam.correct + lastExam.incorrect + lastExam.unattempted;
  const lastExamPercentile = lastExam.percentile || 0;

  return (
    <div className="home-page">
      <SEO
        title="Home"
        description="SetuLearn - India's #1 free mock test platform for government jobs (SSC, UPSC, Banking), engineering (JEE, BITSAT), medical (NEET), and college entrance exams. Practice with real exam patterns, get detailed analytics, and track your progress."
        canonical="/"
      />
      {/* Hero */}
      <section className="hero">
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              🎯 India's #1 Free Mock Test Platform
            </div>
            <h1 className="hero-title">
              Practice. Improve.
              <br />
              <span className="hero-accent">Succeed.</span>
            </h1>
            <p className="hero-desc">
              Explore and attempt mock tests for various government and college
              entrance exams. Real exam patterns, instant results, detailed
              analytics — all free.
            </p>
            <div className="hero-actions">
              <button
                className="btn-primary btn-lg"
                onClick={() => navigate("/tests")}
              >
                Browse All Tests
              </button>
              <button
                className="btn-outline btn-lg"
                onClick={() => navigate("/exams")}
              >
                View Categories <ArrowRight />
              </button>
            </div>
            <div className="hero-stats">
              <div className="hstat">
                <ClipboardCheck color="#5A1EAD" width={32} height={32} />
                <div>
                  <h3>45+</h3>
                  <span>Mock Tests</span>
                </div>
              </div>
              <div className="hstat-div" />
              <div className="hstat">
                <Group color="#5A1EAD" height={32} width={32} />
                <div>
                  <h3>20K+</h3>
                  <span>Students</span>
                </div>
              </div>
              <div className="hstat-div" />
              <div className="hstat">
                <CreditCardSlash color="#5A1EAD" width={32} height={32} />
                <div>
                  <h3>Free</h3>
                  <span>No Sign-up</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <img src="/img/hero-image.png" alt="Mock Test Illustration" />
          </div>
        </div>
      </section>

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
                    <div className="why-point-desc">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="why-visual">
            <div className="score-card">
              <div className="sc-header">Test Completed!</div>
              <div className="sc-header">{lastExamTitle}</div>
              <div className="sc-score">
                {lastExamScore} <span>/ {lastExamTotal}</span>
              </div>
              <div className="sc-percent">{lastExamPercentage}% Score</div>
              <div className="sc-row">
                <span>✅ Correct</span>
                <b>
                  {lastExamCorrect}/{lastExamQuestions}
                </b>
              </div>
              <div className="sc-row">
                <span>❌ Incorrect</span>
                <b>
                  {lastExamIncorrect}/{lastExamQuestions}
                </b>
              </div>
              <div className="sc-row">
                <span>⬜ Unattempted</span>
                <b>
                  {lastExamUnattempted}/{lastExamQuestions}
                </b>
              </div>
              <div className="sc-percentile">
                Percentile: <b>{lastExamPercentile}</b>
              </div>
            </div>
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
