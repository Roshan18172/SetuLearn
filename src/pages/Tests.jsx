import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const difficulties = ["All Difficulty", "Easy", "Medium", "Hard"];
const durations = ["All Duration", "< 60 Mins", "60-120 Mins", "> 120 Mins"];

export default function Tests() {
  const navigate = useNavigate();
  
  // State for raw data and aggregated exams
  const [exams, setExams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Filter and Search States
  const [catFilter, setCatFilter] = useState("All Categories");
  const [diffFilter, setDiffFilter] = useState("All Difficulty");
  const [durFilter, setDurFilter] = useState("All Duration");
  const [fetchError, setFetchError] = useState(null);
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(4);

  document.title = "Exams - SetuLearn";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);

        // 1. Fetch categories/exams definitions
        const examsResponse = await fetch("https://setulearn-backend.onrender.com/api/v1/exams");
        const examsJson = await examsResponse.json();
        
        const staticColors = ["#6C63FF", "#00C49F", "#FFBB28", "#FF8042"];
        const mappedCategories = examsJson.data.map((exam, index) => ({
          id: exam.id,
          name: exam.name,
          color: staticColors[index % staticColors.length]
        }));
        setCategories(mappedCategories);

        // 2. Fetch all individual tests to aggregate them by Exam
        const testsResponse = await fetch("https://setulearn-backend.onrender.com/api/v1/tests");
        const testsJson = await testsResponse.json();
        
        // Group individual component tests by their Parent Exam ID
        const examGroups = {};

        testsJson.data.forEach((test) => {
          const examId = test.examId || test.exam?.id;
          if (!examId) return;

          if (!examGroups[examId]) {
            examGroups[examId] = {
              id: examId,
              examName: test.exam?.name || "Unknown Exam",
              category: test.exam?.name || "Uncategorized",
              questions: 0,
              duration: 0,
              marks: 0,
              highestDifficulty: "MEDIUM", 
              subTests: [] // Holds all test parts (e.g., Reasoning, Quant, etc.)
            };
          }

          // Accumulate test properties to reflect the total master Exam requirements
          examGroups[examId].questions += test.totalQuestions || 0;
          examGroups[examId].duration += test.durationMinutes || 0;
          examGroups[examId].marks += test.totalMarks || 0;
          examGroups[examId].subTests.push(test);
          
          if (test.difficulty === "HARD") {
            examGroups[examId].highestDifficulty = "HARD";
          }
        });

        // Convert grouped object back to a structured array for UI rendering
        const aggregatedExams = Object.values(examGroups).map((exam) => ({
          ...exam,
          difficulty: exam.highestDifficulty.charAt(0) + exam.highestDifficulty.slice(1).toLowerCase(),
          attemptedBy: Math.floor(Math.random() * 3000) + 4000, 
          avgScore: Math.floor(Math.random() * 10) + 70 
        }));

        setExams(aggregatedExams);
      } catch (error) {
        console.error("Error aggregating exam data:", error);
        setFetchError("Failed to load exam data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter Operations on aggregate Exams
  const filtered = exams.filter((e) => {
    const matchCat = catFilter === "All Categories" || e.category === catFilter;
    const matchDiff = diffFilter === "All Difficulty" || e.difficulty === diffFilter;
    const matchDur =
      durFilter === "All Duration" ||
      (durFilter === "< 60 Mins" && e.duration < 60) ||
      (durFilter === "60-120 Mins" && e.duration >= 60 && e.duration <= 120) ||
      (durFilter === "> 120 Mins" && e.duration > 120);
    const matchSearch =
      search === "" || e.examName.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchDiff && matchDur && matchSearch;
  });

   // Show loading state
  if (isLoading) {
    return (
      <div className="tests-page">
        <div className="tests-header">
          <h1>All Tests</h1>
        </div>
        <div className="empty-state" style={{ padding: "80px 20px" }}>
          <div className="empty-icon">⏳</div>
          <h3>Loading tests...</h3>
          <p>Please wait while we fetch the available tests.</p>
        </div>
      </div>
    );
  }

  // Show error state with retry
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
      <div className="tests-header">
        <h1>All Exams</h1>
        <p>{filtered.length} exams available</p>
      </div>

      {/* Filters bar */}
      <div className="filters-bar">
        <div className="filter-group">
          <select value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setVisible(4); }}>
            <option>All Categories</option>
            {categories.map((c) => <option key={c.id}>{c.name}</option>)}
          </select>

          <select value={diffFilter} onChange={(e) => { setDiffFilter(e.target.value); setVisible(4); }}>
            {difficulties.map((d) => <option key={d}>{d}</option>)}
          </select>

          <select value={durFilter} onChange={(e) => { setDurFilter(e.target.value); setVisible(4); }}>
            {durations.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>

        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search exams..." value={search}
            onChange={(e) => { setSearch(e.target.value); setVisible(4); }} />
        </div>
      </div>

      {/* Exams Render List */}
      <div className="tests-list-page">
        {filtered.slice(0, visible).map((exam) => {
          const catColor = categories.find((c) => c.name === exam.category)?.color || "#6C63FF";
          return (
            <div key={exam.id} className="test-row">
              <div className="tr-left">
                <div className="tr-icon" style={{ background: catColor }}>
                  {exam.examName.slice(0, 3).toUpperCase()}
                </div>
                <div className="tr-info">
                  <div className="tr-title">{exam.examName} Master Test</div>
                  
                  <div className="tr-meta">
                    <span className="tr-cat">
                      {exam.subTests.length} Combined Papers
                    </span>
                    <span>•</span>
                    <span>{exam.questions} Total Questions</span>
                    <span>•</span>
                    <span>{exam.duration} Mins Total</span>
                    <span>•</span>
                    <span className={`diff-badge ${exam.difficulty.toLowerCase()}`}>{exam.difficulty}</span>
                  </div>
                  
                  <div className="tr-sub-info">
                    <span>📊 {exam.attemptedBy.toLocaleString()} attempted</span>
                    <span>•</span>
                    <span>Avg Score: {exam.avgScore}%</span>
                    <span>•</span>
                    <span>Total Marks: {exam.marks}</span>
                  </div>
                </div>
              </div>
              
              <button 
                className="btn-primary"
                onClick={() => navigate("/instructions", { state: { test: exam, mode: "master_timed" } })}
              >
                Start Test
              </button>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No exams found</h3>
            <p>Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      {visible < filtered.length && (
        <div className="load-more-wrap">
          <button className="btn-outline" onClick={() => setVisible((v) => v + 4)}>
            Load More Exams
          </button>
        </div>
      )}
    </div>
  );
}