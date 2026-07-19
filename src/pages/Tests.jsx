import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import examService from "../api/examService";
import { mapExamToCategory, mapTestToFrontend } from "../api/dataMapper";
import { getErrorMessage } from "../api/apiErrorHandler";
import { ClockLoader, QuestionMarkRound, Time } from "../data/svgs";
import SEO from "../components/SEO";

const difficulties = ["All Difficulty", "Easy", "Medium", "Hard"];
const durations = ["All Duration", "< 60 Mins", "60-120 Mins", "> 120 Mins"];

export default function Tests() {
  const navigate = useNavigate();
  const location = useLocation();

  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Filters
  const [examFilter, setExamFilter] = useState(
    location.state?.selectedExam || "All Exams"
  );
  const [diffFilter, setDiffFilter] = useState("All Difficulty");
  const [durFilter, setDurFilter] = useState("All Duration");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(6);

  document.title = "Tests - SetuLearn";
  useEffect(() => {
    if (location.state?.selectedExam) {
      setExamFilter(location.state.selectedExam);

      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);

        const [exams, rawTests] = await Promise.all([
          examService.getExams(),
          examService.getAllTests(),
        ]);

        // Build exam lookup by id for fast name resolution
        const examMap = Object.fromEntries(
          exams.map((e) => [String(e.id), e.name])
        );

        const mappedCategories = exams.map((e) => mapExamToCategory(e));
        setCategories(mappedCategories);

        // Map each individual test, resolving exam name from flat examId or nested exam object
        const mappedTests = rawTests.map((t) => {
          const examName =
            t.exam?.name ||
            examMap[String(t.examId)] ||
            examMap[String(t.exam_id)] ||
            "";
          return mapTestToFrontend(t, examName);
        });

        setTests(mappedTests);
      } catch (err) {
        console.error("Failed to fetch tests:", err);
        setFetchError(
          getErrorMessage(err, "Could not load tests. Please make sure the backend is running.")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const resetVisible = () => setVisible(8);

  const handleStartTest = async (test) => {
    try {
      const fullTest = await examService.getTestById(test.id);

      // Pass questions array so per-subject marks can be calculated
      // by summing individual question marks (which may vary e.g. 4, 1)
      const questions = fullTest.questions || [];
      const mappedTest = mapTestToFrontend(
        fullTest,
        fullTest.exam?.name || test.exam,
        questions
      );

      navigate("/instructions", {
        state: {
          test: mappedTest,
          mode: "timed",
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = tests.filter((t) => {
    const matchExam = examFilter === "All Exams" || t.exam === examFilter;
    const matchDiff =
      diffFilter === "All Difficulty" || t.difficulty === diffFilter;
    const matchDur =
      durFilter === "All Duration" ||
      (durFilter === "< 60 Mins" && t.duration < 60) ||
      (durFilter === "60-120 Mins" && t.duration >= 60 && t.duration <= 120) ||
      (durFilter === "> 120 Mins" && t.duration > 120);
    const matchSearch =
      search === "" ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.exam.toLowerCase().includes(search.toLowerCase());
    return matchExam && matchDiff && matchDur && matchSearch;
  });

  if (isLoading) {
    return (
      <div className="tests-page">
        <div className="tests-header">
          <h1>All Tests</h1>
        </div>
        <div className="empty-state" style={{ padding: "80px 20px" }}>
          <div className="empty-icon">
            <ClockLoader />
          </div>
          <h3>Loading tests...</h3>
          <p>Please wait while we fetch the available tests.</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="tests-page">
        <div className="tests-header">
          <h1>All Tests</h1>
        </div>
        <div className="empty-state" style={{ padding: "80px 20px" }}>
          <div className="empty-icon">⚠️</div>
          <h3>Could not load tests</h3>
          <p style={{ maxWidth: 500, margin: "0 auto 20px" }}>{fetchError}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tests-page">
      <SEO
        title="All Mock Tests"
        description="Browse and practice free mock tests for government jobs (SSC CGL, UPSC, Banking), engineering (JEE Main, JEE Advanced, BITSAT), medical (NEET), and college entrance exams (CUET). Filter by exam, difficulty, and duration."
        canonical="/tests"
      />
      <div className="tests-header">
        <h1>All Tests</h1>
        <p>{filtered.length} test{filtered.length !== 1 ? "s" : ""} available</p>
      </div>

      {/* Filters bar */}
      <div className="filters-bar">
        <div className="filter-group">
          {/* Exam name filter — replaces the old category filter */}
          <select
            value={examFilter}
            onChange={(e) => { setExamFilter(e.target.value); resetVisible(); }}
          >
            <option>All Exams</option>
            {categories.map((c) => (
              <option key={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={diffFilter}
            onChange={(e) => { setDiffFilter(e.target.value); resetVisible(); }}
          >
            {difficulties.map((d) => <option key={d}>{d}</option>)}
          </select>

          <select
            value={durFilter}
            onChange={(e) => { setDurFilter(e.target.value); resetVisible(); }}
          >
            {durations.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>

        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search tests..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetVisible(); }}
          />
        </div>
      </div>

      {/* Tests list */}
      <div className="tests-list-page">
        {filtered.slice(0, visible).map((test) => {
          const category = categories.find((c) => c.name === test.exam);
          const catColor = category?.color || "#6C63FF";
          const catIcon = category?.icon || "/icons/default.png";
          return (
            <div key={test.id} className="test-card">
              <div className="tr-left">
                <div className="tr-icon" style={{ border: `2px solid ${catColor}`, backgroundColor: catColor + "22" }}>
                  <img src={catIcon} alt={test.exam} width={34} height={34} />
                </div>
                <div className="tr-info">
                  <div className="tr-title">{test.title}</div>
                  <div className="tr-meta">
                    <span className="tr-cat">{test.exam}</span>                    
                    <QuestionMarkRound />
                    <span>{test.questions} Questions</span>                    
                    <Time />
                    <span>{test.duration} Mins</span>
                    <span className={`diff-badge ${test.difficulty.toLowerCase()}`}>
                      {test.difficulty}
                    </span>
                  </div>
                  {/* <div className="tr-sub-info">
                    <span>Total Marks: {test.marks}</span>
                    {test.negativeMarking && (
                      <>
                        <span>•</span>
                        <span>Negative Marking</span>
                      </>
                    )}
                  </div> */}
                </div>
              </div>

              <button className="btn-primary" onClick={() => handleStartTest(test)} >
                Start Test
              </button>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No tests found</h3>
            <p>Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      {visible < filtered.length && (
        <div className="load-more-wrap">
          <button className="btn-outline" onClick={() => setVisible((v) => v + 6)}>
            Load More Tests
          </button>
        </div>
      )}
    </div>
  );
}