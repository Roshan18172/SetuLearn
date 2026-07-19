import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import examService from "../api/examService";
import { mapExamToCategory } from "../api/dataMapper";
import { getErrorMessage } from "../api/apiErrorHandler";
import SEO from "../components/SEO";
import { ClockLoader } from "../data/svgs";

export default function Exams() {
  const navigate = useNavigate();

  // State for raw data and aggregated exams
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  document.title = "All Exam Categories - SetuLearn";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(false);
        setFetchError(null);

        const [exams, tests] = await Promise.all([
          examService.getExams(),
          examService.getAllTests(),
        ]);

        const mappedCategories = exams.map((exam) => {
          const cat = mapExamToCategory(exam);
          cat.tests = tests.filter(
            (t) => t.exam?.id === exam.id || t.examId === exam.id,
          );
          cat.exams = [exam.name];
          return cat;
        });

        setCategories(mappedCategories);
      } catch (err) {
        console.error(
          "Failed to fetch home data:",
          getErrorMessage(
            err,
            "Could not load test data. Please make sure the backend is running.",
          ),
        );
        setFetchError("Failed to load exam data. Please try again.");
      }
    };
    fetchData();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="tests-page">
        <div className="tests-header">
          <h1>All Exam Categories</h1>
        </div>
        <div className="empty-state" style={{ padding: "80px 20px" }}>
          <div className="empty-icon">
                    <ClockLoader />
                  </div>
          <h3>Loading exam categories...</h3>
          <p>Please wait while we fetch the available exam categories.</p>
        </div>
      </div>
    );
  }

  // Show error state with retry
  if (fetchError) {
    return (
      <div className="tests-page">
        <div className="tests-header">
          <h1>All Exam Categories</h1>
        </div>
        <div className="empty-state" style={{ padding: "80px 20px" }}>
          <div className="empty-icon">⚠️</div>
          <h3>Could not load exam categories</h3>
          <p style={{ maxWidth: 500, margin: "0 auto 20px" }}>{fetchError}</p>
          <button
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tests-page">
      <SEO
        title="All Exam Categories"
        description="Browse all exam categories on SetuLearn including Engineering (JEE Main, JEE Advanced, BITSAT), Medical (NEET), Government Jobs (SSC, UPSC, Banking), and College Entrance exams (CUET)."
        canonical="/exams"
      />
      <div className="tests-header">
        <h1>All Exam Categories</h1>
        <p>{categories.length} exam Categories available</p>
      </div>

      {/* Exams Render List */}
      <div className="all-categories-grid">
        {categories.map((cat) => {
          return (
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
                  width={96}
                  height={96}
                />
              </div>
              <div>
                <div className="cat-name">{cat.name}</div>
                <div className="cat-exams">{cat.exams.join(", ")}</div>
                <div className="cat-count">{cat.tests.length} Tests</div>
              </div>
            </div>
          );
        })}

        {categories.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No exams found</h3>
            <p>Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
