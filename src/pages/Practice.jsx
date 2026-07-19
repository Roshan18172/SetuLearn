import { useState, useEffect } from "react";
import { MathJax } from "better-react-mathjax";
import practiceService from "../api/practiceService";
import {
  mapPracticeSubjectToFrontend,
  mapTopicToFrontend,
  mapQuestionToFrontend,
  getSubjectColor,
} from "../api/dataMapper";
import { getErrorMessage } from "../api/apiErrorHandler";
import {
  ClockLoader, BookOpen, Tag, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Eye, EyeOff, ArrowLeft,
} from "../data/svgs";

export default function Practice() {
  document.title = "Start Practicing - SetuLearn";

  // Wizard step: "subjects" -> "topics" -> "practice"
  const [step, setStep] = useState("subjects");

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // questionId -> selectedOptionId
  const [showSolution, setShowSolution] = useState({}); // questionId -> bool

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Step 1: fetch all subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);
        const raw = await practiceService.getSubjects();
        setSubjects((raw || []).map(mapPracticeSubjectToFrontend));
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
        setFetchError(
          getErrorMessage(err, "Could not load subjects. Please make sure the backend is running.")
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const openSubject = async (subject) => {
    setSelectedSubject(subject);
    setStep("topics");
    setTopics([]);
    try {
      setIsLoading(true);
      setFetchError(null);
      const raw = await practiceService.getTopics(subject.id);
      setTopics((raw || []).map(mapTopicToFrontend));
    } catch (err) {
      console.error("Failed to fetch topics:", err);
      setFetchError(
        getErrorMessage(err, "Could not load topics for this subject.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startPractice = async (topic) => {
    setSelectedTopic(topic);
    try {
      setIsLoading(true);
      setFetchError(null);
      const raw = await practiceService.getQuestionsByTopic(topic.id);
      const mapped = (raw?.questions || raw || []).map(mapQuestionToFrontend);
      setQuestions(mapped);
      setCurrentIndex(0);
      setAnswers({});
      setShowSolution({});
      setStep("practice");
    } catch (err) {
      console.error("Failed to fetch practice questions:", err);
      setFetchError(
        getErrorMessage(err, "Could not load questions for this topic.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const backToSubjects = () => {
    setStep("subjects");
    setSelectedSubject(null);
    setTopics([]);
  };

  const backToTopics = () => {
    setStep("topics");
    setSelectedTopic(null);
    setQuestions([]);
  };

  const selectOption = (question, optionId) => {
    // Once answered, the choice is locked in — clicking again shouldn't change it.
    if (answers[question.id]) return;
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
  };

  const toggleSolution = (questionId) => {
    setShowSolution((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const goNext = () => setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
  const goPrev = () => setCurrentIndex((i) => Math.max(i - 1, 0));

  const attemptedCount = Object.keys(answers).length;
  const correctCount = questions.filter((q) => answers[q.id] === q.correct).length;

  // ─── Loading / Error states ───────────────────────────────
  if (isLoading && step === "subjects" && subjects.length === 0) {
    return (
      <div className="tests-page">
        <div className="tests-header">
          <h1>Start Practicing</h1>
        </div>
        <div className="empty-state" style={{ padding: "80px 20px" }}>
          <div className="empty-icon"><ClockLoader /></div>
          <h3>Loading subjects...</h3>
          <p>Please wait while we fetch the available subjects.</p>
        </div>
      </div>
    );
  }

  if (fetchError && step === "subjects" && subjects.length === 0) {
    return (
      <div className="tests-page">
        <div className="tests-header">
          <h1>Start Practicing</h1>
        </div>
        <div className="empty-state" style={{ padding: "80px 20px" }}>
          <div className="empty-icon">⚠️</div>
          <h3>Could not load subjects</h3>
          <p style={{ maxWidth: 500, margin: "0 auto 20px" }}>{fetchError}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Step 1: Subjects ───────────────────────────────
  if (step === "subjects") {
    return (
      <div className="tests-page">
        <div className="tests-header">
          <h1>Start Practicing</h1>
          <p>Pick a subject to see its topics and begin practicing.</p>
        </div>

        <div className="all-categories-grid">
          {subjects.map((s) => (
            <div
              key={s.id}
              className="category-card"
              style={{ "--cat-color": getSubjectColor(s.name) }}
              onClick={() => openSubject(s)}
            >
              <div className="cat-icon" style={{ color: getSubjectColor(s.name) }}>
                <BookOpen size={40} />
              </div>
              <div>
                <div className="cat-name">{s.name}</div>
                {s.description && <div className="cat-exams">{s.description}</div>}
                <div className="cat-count">
                  {s.topicCount ? `${s.topicCount} Topics` : "Browse Topics"}
                </div>
              </div>
            </div>
          ))}

          {subjects.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No subjects found</h3>
              <p>Check back soon — subjects will appear here once added.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Step 2: Topics ───────────────────────────────
  if (step === "topics") {
    return (
      <div className="tests-page">
        <div className="tests-header">
          <button className="prac-back-link" onClick={backToSubjects}>
            <ArrowLeft /> All Subjects
          </button>
          <h1>{selectedSubject?.name}</h1>
          <p>Pick a topic to start practicing.</p>
        </div>

        {isLoading && (
          <div className="empty-state" style={{ padding: "60px 20px" }}>
            <div className="empty-icon"><ClockLoader /></div>
            <h3>Loading topics...</h3>
          </div>
        )}

        {!isLoading && fetchError && (
          <div className="empty-state" style={{ padding: "60px 20px" }}>
            <div className="empty-icon">⚠️</div>
            <h3>Could not load topics</h3>
            <p style={{ maxWidth: 500, margin: "0 auto 20px" }}>{fetchError}</p>
            <button className="btn-primary" onClick={() => openSubject(selectedSubject)}>
              🔄 Retry
            </button>
          </div>
        )}

        {!isLoading && !fetchError && (
          <div className="prac-topic-list">
            {topics.map((t) => (
              <div key={t.id} className="prac-topic-row">
                <div className="prac-topic-left">
                  <div className="prac-topic-icon"><Tag size={18} /></div>
                  <div>
                    <div className="prac-topic-name">{t.name}</div>
                    {!!t.questionCount && (
                      <div className="prac-topic-meta">{t.questionCount} Questions</div>
                    )}
                  </div>
                </div>
                <button className="btn-primary" onClick={() => startPractice(t)}>
                  Start Practice
                </button>
              </div>
            ))}

            {topics.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No topics found</h3>
                <p>This subject doesn't have any topics yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ─── Step 3: Practice Questions ───────────────────────────────
  if (isLoading) {
    return (
      <div className="tests-page">
        <div className="empty-state" style={{ padding: "80px 20px" }}>
          <div className="empty-icon"><ClockLoader /></div>
          <h3>Loading questions...</h3>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="tests-page">
        <div className="empty-state" style={{ padding: "80px 20px" }}>
          <div className="empty-icon">⚠️</div>
          <h3>Could not load questions</h3>
          <p style={{ maxWidth: 500, margin: "0 auto 20px" }}>{fetchError}</p>
          <button className="btn-primary" onClick={() => startPractice(selectedTopic)}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="tests-page">
        <button className="prac-back-link" onClick={backToTopics}>
          <ArrowLeft /> Back to Topics
        </button>
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No questions available</h3>
          <p>This topic doesn't have any practice questions yet.</p>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const selectedOptionId = answers[q.id];
  const isAnswered = !!selectedOptionId;
  const isSolutionOpen = !!showSolution[q.id];

  return (
    <div className="tests-page prac-page">
      <button className="prac-back-link" onClick={backToTopics}>
        <ArrowLeft /> Back to Topics
      </button>

      <div className="prac-header">
        <div>
          <h1>{selectedSubject?.name} — {selectedTopic?.name}</h1>
          <p>Question {currentIndex + 1} of {questions.length}</p>
        </div>
        <div className="prac-score">
          <CheckCircle2 size={16} /> {correctCount} correct · {attemptedCount}/{questions.length} attempted
        </div>
      </div>

      <div className="prac-progress-bar">
        <div
          className="prac-progress-fill"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="prac-question-card">
        <div className="prac-question-text">
          {q.text ? <MathJax dynamic>{q.text}</MathJax> : <p>Question text not available</p>}
        </div>

        <div className="prac-options">
          {(q.options || []).map((opt, i) => {
            const isCorrectOpt = opt.id === q.correct;
            const isSelected = selectedOptionId === opt.id;

            let optClass = "prac-option";
            if (isAnswered) {
              if (isCorrectOpt) optClass += " correct";
              else if (isSelected) optClass += " incorrect";
            }

            return (
              <button
                type="button"
                key={opt.id || i}
                className={optClass}
                onClick={() => selectOption(q, opt.id)}
                disabled={isAnswered}
              >
                <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                <span className="opt-text">
                  {opt.text ? <MathJax dynamic>{opt.text}</MathJax> : "Option text not available"}
                </span>
                {isAnswered && isCorrectOpt && <CheckCircle2 size={18} />}
                {isAnswered && isSelected && !isCorrectOpt && <XCircle size={18} />}
              </button>
            );
          })}
        </div>

        <div className="prac-solution-toggle-wrap">
          <button className="btn-outline prac-solution-toggle" onClick={() => toggleSolution(q.id)}>
            {isSolutionOpen ? <EyeOff size={15} /> : <Eye size={15} />}
            {isSolutionOpen ? "Hide Solution" : "View Solution"}
          </button>
        </div>

        {isSolutionOpen && (
          <div className="prac-solution">
            <strong>Solution:</strong>{" "}
            {q.explanation ? (
              <MathJax dynamic>{q.explanation}</MathJax>
            ) : (
              <span>No explanation provided for this question.</span>
            )}
          </div>
        )}
      </div>

      <div className="prac-nav">
        <button className="btn-outline" onClick={goPrev} disabled={currentIndex === 0}>
          <ChevronLeft size={16} /> Previous
        </button>
        {currentIndex < questions.length - 1 ? (
          <button className="btn-primary" onClick={goNext}>
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button className="btn-primary" onClick={backToTopics}>
            Finish Topic
          </button>
        )}
      </div>
    </div>
  );
}
