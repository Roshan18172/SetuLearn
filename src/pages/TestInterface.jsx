import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { questionBank } from "../data/demoData";
import { calculateResult } from "../utils/calculateResult";

function padTwo(n) {
  return String(n).padStart(2, "0");
}

function formatTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  return `${padTwo(h)}:${padTwo(m)}:${padTwo(s)}`;
}

export default function TestInterface() {
  const navigate = useNavigate();
  const location = useLocation();

  const { test, mode = "timed" } = location.state || {};
  const questions = useMemo(() => {
    if (!test) return [];
    return questionBank[test.id] || [];
  }, [test]);

  const totalSecs = (test?.duration || 30) * 60;

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [timeLeft, setTimeLeft] = useState(totalSecs);
  const [showConfirm, setShowConfirm] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    const disableRightClick = (e) => {
      e.preventDefault();
    };

    document.addEventListener( "contextmenu", disableRightClick );

    return () => {
      document.removeEventListener( "contextmenu", disableRightClick );
    };
  }, []);

  useEffect(() => {
    if (test) {
      document.title = `${test.title} - TestFlow`;
    }
  }, [test]);

  const handleSubmit = useCallback(() => {
    const result = calculateResult(
      questions,
      answers,
      test,
      totalSecs - timeLeft
    );
    navigate("/result", {
      state: {
        test,
        result,
        answers,
      },
    });
  }, [
    navigate,
    questions,
    answers,
    test,
    totalSecs,
    timeLeft,
  ]);
  const handleExitExam = () => {
    navigate("/instructions", {
      state: { test }
    });
  };
  //eslint-disable-next-line 
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
// Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const count = prev + 1;
          if (count >= 3) {
            alert("Maximum tab switches exceeded. Test submitted.");
            handleSubmit();
          } else {
            alert(`Warning ${count}/3: Do not switch tabs.`);
          }
          return count;
        });
      }
    };

    document.addEventListener( "visibilitychange", handleVisibilityChange );

    return () => {
      document.removeEventListener( "visibilitychange", handleVisibilityChange );
    };
  }, [handleSubmit]);

  useEffect(() => {
    if (mode !== "timed") return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, mode, handleSubmit]);

  useEffect(() => {
    // Push current page into history
    window.history.pushState(
      null,
      "",
      window.location.pathname
    );

    const handlePopState = () => {
      setShowExitModal(true);

      // Stay on current page
      window.history.pushState(
        null,
        "",
        window.location.pathname
      );
    };

    window.addEventListener( "popstate", handlePopState );

    return () => {
      window.removeEventListener( "popstate", handlePopState );
    };
  }, []);
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnVaue = "";
    };

    window.addEventListener( "beforeunload", handleBeforeUnload );

    return () => {
      window.removeEventListener( "beforeunload", handleBeforeUnload );
    };
  }, []);

  if (!test || questions.length === 0) {
    return (
      <div className="empty-state" style={{ padding: "80px 20px", textAlign: "center" }}>
        <div className="empty-icon">📝</div>
        <h2>No Test Selected</h2>
        <p>Please select a test first.</p>

        <button className="btn-primary" onClick={() => navigate("/tests")} > Browse Tests </button>
      </div>
    );
  }

  const q = questions[current] || {};

  const answered = Object.keys(answers).length;
  const markedCount = Object.keys(marked).length;

  const getQStatus = (index) => {
    const qId = questions[index].id;

    if (marked[qId] && answers[qId]) {
      return "marked-answered";
    }

    if (marked[qId]) {
      return "marked";
    }

    if (answers[qId]) {
      return "answered";
    }

    if (index < current) {
      return "visited";
    }

    return "unanswered";
  };
  


  return (
    <div className="test-interface">
      {/* TOP BAR */}

      <div className="ti-topbar">
        <div className="ti-testname">
          <div className="ti-icon">
            {test.exam?.slice(0, 3).toUpperCase()}
          </div>
          <span>{test.title}</span>
        </div>

        <div className="ti-timer-wrap">
          {mode === "timed" ? (
            <div className={`ti-timer ${timeLeft < 300 ? "timer-warn" : "" }`} >
              <span className="timer-label"> Time Left </span>
              <span className="timer-value"> {formatTime(timeLeft)} </span>
            </div>
          ) : (
            <div className="ti-timer">
              <span className="timer-label"> Practice Mode </span>

              <span className="timer-value"> ∞ </span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px" }} >
          <button className="btn-outline" onClick={() => setShowExitModal(true)} > Exit </button>

          <button className="btn-end-test" onClick={() => setShowConfirm(true)} > End Test </button>
        </div>
      </div>

      {/* BODY */}

      <div className="ti-body">
        {/* MAIN QUESTION PANEL */}

        <div className="ti-main">
          <div className="ti-q-header">
            <div className="ti-q-num">
              Question {current + 1}
            </div>

            <button className={`mark-review-btn ${marked[q.id] ? "active" : "" }`}
              onClick={() =>
                setMarked((prev) => ({
                  ...prev,
                  [q.id]: !prev[q.id],
                }))
              }
            >
              {marked[q.id]
                ? "🔖 Marked"
                : "🏷️ Mark for Review"}
            </button>
          </div>

          <div className="ti-q-topic"> Topic: {q.topic || q.subject || "General"} </div>

          <div className="ti-question"> {q.text} </div>

          <div className="ti-options">
            {(q.options || []).map((opt, i) => (
              <label key={opt.id}
                className={`ti-option ${answers[q.id] === opt.id
                  ? "selected"
                  : ""
                  }`}
              >
                <input type="radio"
                  name={`q-${q.id}`}
                  checked={
                    answers[q.id] === opt.id
                  }
                  onChange={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      [q.id]: opt.id,
                    }))
                  }
                />

                <span className="opt-letter"> {String.fromCharCode(65 + i)} </span>
                <span className="opt-text"> {opt.text} </span>
              </label>
            ))}
          </div>

          <div className="ti-q-actions">
            <button className="btn-outline"
              onClick={() =>
                setAnswers((prev) => {
                  const copy = { ...prev };
                  delete copy[q.id];
                  return copy;
                })
              }
            >
              Clear Response
            </button>
          </div>

          <div className="ti-nav">
            <button className="btn-outline" disabled={current === 0} onClick={() => setCurrent((prev) => prev - 1)} >
              ← Previous
            </button>

            {current < questions.length - 1 ? (
              <button className="btn-primary" onClick={() => setCurrent((prev) => prev + 1)} > Next → </button>
            ) : (
              <button className="btn-primary" onClick={() => setShowConfirm(true)}>
                Submit Test ✓
              </button>
            )}
          </div>
        </div>

        {/* SIDEBAR */}

        <div className={`ti-sidebar ${paletteOpen ? "open" : ""}`}>
          <div className="palette-header">
            <span>Questions</span>
            <button className="palette-close" onClick={() => setPaletteOpen(false)}>✕</button>
          </div>

          <div className="palette-legend">
            <span className="pal-dot answered" />
            Answered ({answered})

            <span className="pal-dot unanswered" style={{ marginLeft: 12 }} />
            Unanswered (
            {questions.length - answered})

            <span className="pal-dot marked" style={{ marginLeft: 12 }} />
            Marked ({markedCount})
          </div>

          <div className="palette-grid">
            {questions.map((_, index) => (
              <button key={index} className={`pal-btn ${getQStatus(
                index
              )} ${current === index
                ? "current"
                : ""
                }`}
                onClick={() => {
                  setCurrent(index);
                  setPaletteOpen(false);
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="palette-summary">
            <div className="ps-row">
              <span>Total</span>
              <b>{questions.length}</b>
            </div>

            <div className="ps-row">
              <span>Answered</span>
              <b className="green"> {answered} </b>
            </div>

            <div className="ps-row">
              <span>Not Answered</span>
              <b className="red"> {questions.length - answered} </b>
            </div>

            <div className="ps-row">
              <span>Marked</span>
              <b className="orange"> {markedCount} </b>
            </div>
          </div>

          <button className="btn-primary w-full" onClick={() => setShowConfirm(true)}> Submit Test </button>
        </div>
      </div>

      {/* MOBILE FAB */}

      <button className="palette-fab" onClick={() => setPaletteOpen(true)} >
        📋 Questions ({answered}/
        {questions.length})
      </button>

      {/* CONFIRM MODAL */}

      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Submit Test?</h3>
            <p>
              You have answered{" "}
              <b>{answered}</b> out of{" "}
              <b>{questions.length}</b>
              {" "}questions.
            </p>

            {questions.length -
              answered >
              0 && (
                <p className="modal-warn">
                  ⚠️{" "}
                  {questions.length -
                    answered}{" "}
                  questions are unanswered.
                </p>
              )}

            <div className="modal-actions">
              <button className="btn-outline" onClick={() => setShowConfirm(false)}> Continue Test </button>
              <button className="btn-primary" onClick={handleSubmit}> Submit Now </button>
            </div>
          </div>
        </div>
      )}

      {showExitModal && (
        <div className="modal-overlay" onClick={() => setShowExitModal(false)} >
          <div className="modal-box" onClick={(e) => e.stopPropagation()} >
            <h3>Exit Exam?</h3>
            <p>
              Your current progress may be lost if you
              leave this exam.
            </p>

            <div className="modal-actions">
              <button className="btn-primary" onClick={() => setShowExitModal(false) } > Continue Exam </button>
              <button className="btn-outline" onClick={handleExitExam} > Exit Exam </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}