import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import eventsService from "../api/eventsService";
import SEO from "../components/SEO";
import "../components/EventQuiz.css";

export default function CurrentAffairsQuiz() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let cancelled = false;
    eventsService
      .getToday()
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setAnswers(new Array(res.quiz.length).fill(null));
      })
      .catch((err) => {
        console.error("[CurrentAffairsQuiz] Failed to load quiz:", err);
        if (!cancelled) setError("Couldn't load today's quiz. Please try again in a moment.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="caq-wrap">
        <div className="caq-error">
          <p>{error}</p>
          <button className="btn-primary" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="caq-wrap">
        <div className="caq-loading">Loading today's quiz…</div>
      </div>
    );
  }

  const { event, quizTitle, quiz, funFacts } = data;
  const total = quiz.length;

  function handleSelect(optIdx) {
    if (selected !== null) return; // lock in first choice
    setSelected(optIdx);
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = optIdx;
      return next;
    });
  }

  function handleNext() {
    if (index + 1 < total) {
      setIndex((i) => i + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  }

  function handleRetake() {
    setIndex(0);
    setSelected(null);
    setAnswers(new Array(total).fill(null));
    setFinished(false);
  }

  if (finished) {
    const score = answers.reduce(
      (sum, ans, i) => sum + (ans === quiz[i].correctIndex ? 1 : 0),
      0
    );
    return (
      <div className="caq-wrap">
        <SEO title={`${quizTitle} Result | SetuLearn`} canonical="/current-affairs-quiz" noindex />
        <div className="caq-result">
          <span className="caq-header-emoji">{event.emoji}</span>
          <div className="caq-result-score">
            {score}/{total}
          </div>
          <div className="caq-result-label">You scored on the {quizTitle}</div>

          {funFacts && funFacts.length > 0 && (
            <div className="caq-facts">
              <h3>Did you know?</h3>
              <ul>
                {funFacts.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="caq-review">
            {quiz.map((q, i) => {
              const correct = answers[i] === q.correctIndex;
              return (
                <div className="caq-review-item" key={i}>
                  <div className="caq-review-q">
                    {i + 1}. {q.question}
                  </div>
                  <div className={`caq-review-ans ${correct ? "right" : "wrong"}`}>
                    Your answer: {answers[i] !== null ? q.options[answers[i]] : "Skipped"}
                    {!correct && ` · Correct: ${q.options[q.correctIndex]}`}
                  </div>
                  {q.explanation && (
                    <div className="caq-explanation">{q.explanation}</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="caq-result-actions">
            <button className="btn-outline" onClick={() => navigate("/")}>
              Back to Home
            </button>
            <button className="btn-primary" onClick={handleRetake}>
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = quiz[index];

  return (
    <div className="caq-wrap">
      <SEO title={`${quizTitle} | SetuLearn`} canonical="/current-affairs-quiz" noindex />
      <div className="caq-header">
        <span className="caq-header-emoji">{event.emoji}</span>
        <h1>{quizTitle}</h1>
      </div>

      <div className="caq-progress">
        <div
          className="caq-progress-fill"
          style={{ width: `${((index + (selected !== null ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      <div className="caq-question-card">
        <div className="caq-question-count">
          Question {index + 1} of {total}
        </div>
        <p className="caq-question-text">{q.question}</p>

        <div className="caq-options">
          {q.options.map((opt, optIdx) => {
            let cls = "caq-option";
            if (selected !== null) {
              if (optIdx === q.correctIndex) cls += " correct";
              else if (optIdx === selected) cls += " incorrect";
            }
            return (
              <button
                key={optIdx}
                className={cls}
                onClick={() => handleSelect(optIdx)}
                disabled={selected !== null}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {selected !== null && q.explanation && (
          <div className="caq-explanation">{q.explanation}</div>
        )}

        <div className="caq-nav">
          <span />
          <button
            className="btn-primary"
            onClick={handleNext}
            disabled={selected === null}
          >
            {index + 1 < total ? "Next Question" : "See Result"}
          </button>
        </div>
      </div>
    </div>
  );
}
