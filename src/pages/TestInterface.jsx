import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MathJax } from "better-react-mathjax";

function padTwo(n) {
  return String(n).padStart(2, "0");
}

function formatTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${padTwo(h)}:${padTwo(m)}:${padTwo(s)}`;
}

function pickFirstAnswerValue(...values) {
  return values.find(
    (value) => value !== undefined && value !== null && value !== "",
  );
}

export default function TestInterface() {
  const navigate = useNavigate();
  const location = useLocation();

  const { test, mode = "timed" } = location.state || {};

  // State variables for parsed data
  const [questions, setQuestions] = useState([]);
  const [subjectsMap, setSubjectsMap] = useState({});
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Key fix: Maintain a dictionary mapping questionId to its corresponding backend sub-test submission UUID
  const [submissionMap, setSubmissionMap] = useState({});

  const totalSecs = (test?.duration || 30) * 60;
  const [timeLeft, setTimeLeft] = useState(totalSecs);
  const timeSpentSeconds = totalSecs - timeLeft;

  // Keep a ref that always holds the latest timeSpentSeconds.
  // useCallback closures capture stale state, so reading from a ref
  // ensures handleSubmit always submits the real elapsed time.
  const timeSpentRef = useRef(timeSpentSeconds);
  useEffect(() => {
    timeSpentRef.current = timeSpentSeconds;
  }, [timeSpentSeconds]);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Helper function to dynamically retrieve standard auth tokens securely
  const getAuthHeaders = useCallback(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }, []);

  // Combined effect to handle sub-test session initialization and question mapping seamlessly
  useEffect(() => {
    if (!test) {
      setLoadingQuestions(false);
      return;
    }

    // Identify routing endpoints across container groups or fallback options
    let subTestsToFetch = [];
    if (Array.isArray(test.subTests) && test.subTests.length > 0) {
      subTestsToFetch = test.subTests;
    } else if (test.id) {
      subTestsToFetch = [{ id: test.id }];
    } else {
      setLoadingQuestions(false);
      return;
    }

    const loadExamDataStructure = async () => {
      try {
        setLoadingQuestions(true);

        const internalSubmissionMapping = {};

        const questionPromises = subTestsToFetch.map(async (sub) => {
          try {
            // 1. Initialize session at sub-test scope level
            const startResponse = await fetch(
              `https://setulearn-backend.onrender.com/api/v1/tests/${sub.id}/start`,
              {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({}),
              },
            );
            const startJson = await startResponse.json();

            let currentSubTestSubmissionId = null;
            if (startJson.success && startJson.data) {
              currentSubTestSubmissionId =
                startJson.data.submissionId ||
                startJson.data.id ||
                (startJson.data.data && startJson.data.data.submissionId);
            }

            // 2. Fetch the corresponding questions data structure
            const dataResponse = await fetch(
              `https://setulearn-backend.onrender.com/api/v1/tests/${sub.id}`,
              {
                headers: getAuthHeaders(),
              },
            );
            const dataJson = await dataResponse.json();

            if (dataJson.success && dataJson.data) {
              const fetchedQuestions = dataJson.data.questions || [];

              // Map backend subject array to quickly look up real subject names via ID later
              const subMap = {};
              (dataJson.data.subjects || []).forEach((s) => {
                subMap[s.id] = s.name;
              });
              setSubjectsMap((prev) => ({ ...prev, ...subMap }));

              // Process questions and link them with the correct sub-test session identifier
              return fetchedQuestions.map((q) => {
                if (currentSubTestSubmissionId) {
                  internalSubmissionMapping[q.id] = currentSubTestSubmissionId;
                }

                const correctOptionId = pickFirstAnswerValue(
                  q.correctOptionId,
                  q.correctAnswerId,
                  q.correct,
                  q.answer,
                  q.correctOption?.id,
                  q.correctOption?.optionId,
                  (q.options || []).find(
                    (opt) =>
                      opt.isCorrect === true ||
                      opt.correct === true ||
                      opt.isCorrect === 1 ||
                      opt.correct === 1,
                  )?.id,
                );

                return {
                  id: q.id,
                  subTestId: sub.id, // Save reference to the parenting sub-test
                  text: q.questionText,
                  marks: q.marks,
                  negativeMarks: q.negativeMarks,
                  subjectId: q.subjectId,
                  topicId: q.topicId,
                  // Preserve correct answer fields so DetailedAnalysis can look them up
                  correct: correctOptionId,
                  correctOptionId,
                  correctOption: q.correctOption,
                  correctOptionText: q.correctOptionText || q.correctAnswerText,
                  options: (q.options || []).map((opt) => ({
                    id: opt.id,
                    text: opt.optionText || opt.text,
                    // Keep isCorrect flag if backend provides it per-option
                    isCorrect: opt.isCorrect ?? opt.correct ?? false,
                  })),
                };
              });
            }
            return [];
          } catch (err) {
            console.error(
              `Failed loading workflow actions for chunk element ${sub.id}:`,
              err,
            );
            return [];
          }
        });

        const results = await Promise.all(questionPromises);
        setQuestions(results.flat());
        setSubmissionMap(internalSubmissionMapping);
      } catch (error) {
        console.error("Error aggregating master exam structure:", error);
      } finally {
        setLoadingQuestions(false);
      }
    };

    loadExamDataStructure();
  }, [test, getAuthHeaders]);

  useEffect(() => {
    const disableRightClick = (e) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", disableRightClick);
    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
    };
  }, []);

  useEffect(() => {
    if (test) {
      document.title = `${test.examName || "Exam"} - SetuLearn`;
    }
  }, [test]);

  // 3. Final Submission Sync (Aggregated Subject Array Fix)
  const handleSubmit = useCallback(async () => {
    try {
      const submissionsGrouped = {};

      questions.forEach((question) => {
        const targetSubmissionId = submissionMap[question.id];
        const selectedOptionId = answers[question.id];

        if (!targetSubmissionId) return;

        if (!submissionsGrouped[question.subTestId]) {
          submissionsGrouped[question.subTestId] = {
            submissionId: targetSubmissionId,
            answers: [],
          };
        }

        // Add to payload only if an answer is selected
        if (selectedOptionId) {
          submissionsGrouped[question.subTestId].answers.push({
            questionId: question.id,
            selectedOptionId: selectedOptionId,
          });
        }
      });

      // Handle completely blank sections cleanly
      questions.forEach((question) => {
        const targetSubmissionId = submissionMap[question.id];
        if (targetSubmissionId && !submissionsGrouped[question.subTestId]) {
          submissionsGrouped[question.subTestId] = {
            submissionId: targetSubmissionId,
            answers: [],
          };
        }
      });

      const submissionTargets = Object.keys(submissionsGrouped);
      if (submissionTargets.length === 0) {
        alert("Submission aborted: No operational tracking IDs found.");
        return;
      }

      // Fix: Accumulate all responses instead of overwriting a single variable
      const finalMergedResultsArray = [];

      for (const subTestId of submissionTargets) {
        const payload = {
          ...submissionsGrouped[subTestId],
          timeSpent: timeSpentRef.current,
        };
        console.log("Submitting payload structure:", payload);

        const response = await fetch(
          `https://setulearn-backend.onrender.com/api/v1/tests/${subTestId}/submit`,
          {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
          },
        );

        const json = await response.json();
        if (!json.success) {
          console.error("Validation details:", json.errors || json.message);
          alert(
            `Submission processing failed: ${json.message || "Validation Error"}`,
          );
          return;
        }

        // Push individual sub-test results into the container array
        if (json.data) {
          finalMergedResultsArray.push(json.data);
        }
      }

      // Navigate to the results display page with the consolidated responses array
      navigate("/result", {
        state: {
          test,
          result: finalMergedResultsArray,
          answers,
          questions, // full question list for Question Analysis tab
          subjectsMap, // id→name map for topic labels
          timeSpent: timeSpentRef.current, // Always the real elapsed seconds, not stale closure
        },
      });
    } catch (err) {
      console.error("Error submitting exam:", err);
      alert("An error occurred while submitting your test.");
    }
    //eslint-disable-next-line
  }, [navigate, questions, answers, test, submissionMap, getAuthHeaders]);

  const handleExitExam = () => {
    navigate("/instructions", {
      state: { test },
    });
  };
  //eslint-disable-next-line
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

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

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
    window.history.pushState(null, "", window.location.pathname);

    const handlePopState = () => {
      setShowExitModal(true);
      window.history.pushState(null, "", window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  if (!test || loadingQuestions) {
    return (
      <div
        className="empty-state"
        style={{ padding: "100px 20px", textAlign: "center" }}
      >
        <div className="empty-icon">⏳</div>
        <h2>Assembling Exam Questions...</h2>
        <p>Please wait while we prepare your master question sheet.</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div
        className="empty-state"
        style={{ padding: "80px 20px", textAlign: "center" }}
      >
        <div className="empty-icon">📝</div>
        <h2>No Questions Found</h2>
        <p>This exam currently has no configured questions available.</p>
        <button className="btn-primary" onClick={() => navigate("/tests")}>
          {" "}
          Browse Tests{" "}
        </button>
      </div>
    );
  }

  const q = questions[current] || {};
  const answered = Object.keys(answers).length;
  const markedCount = Object.keys(marked).length;

  const getQStatus = (index) => {
    const qId = questions[index].id;
    if (marked[qId] && answers[qId]) return "marked-answered";
    if (marked[qId]) return "marked";
    if (answers[qId]) return "answered";
    if (index < current) return "visited";
    return "unanswered";
  };

  return (
    <div className="test-interface" style={{ userSelect: "none" }}>
      {/* TOP BAR */}
      <div className="ti-topbar">
        <div className="ti-testname">
          <div className="ti-icon">
            {test.examName?.slice(0, 3).toUpperCase()}
          </div>
          <span>{test.examName} Master Test</span>
        </div>

        <div className="ti-timer-wrap">
          {mode === "timed" ? (
            <div className={`ti-timer ${timeLeft < 300 ? "timer-warn" : ""}`}>
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

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="btn-outline"
            onClick={() => setShowExitModal(true)}
          >
            {" "}
            Exit{" "}
          </button>
          <button className="btn-end-test" onClick={() => setShowConfirm(true)}>
            {" "}
            End Test{" "}
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="ti-body">
        {/* MAIN QUESTION PANEL */}
        <div className="ti-main">
          <div className="ti-q-header">
            <div className="ti-q-num">
              Question {current + 1} of {questions.length}
            </div>

            <button
              className={`mark-review-btn ${marked[q.id] ? "active" : ""}`}
              onClick={() =>
                setMarked((prev) => ({
                  ...prev,
                  [q.id]: !prev[q.id],
                }))
              }
            >
              {marked[q.id] ? "🔖 Marked" : "🏷️ Mark for Review"}
            </button>
          </div>

          <div className="ti-q-topic">
            {" "}
            Section: {subjectsMap[q.subjectId] || "General Section"}{" "}
          </div>

          <div
            className="ti-question"
            style={{
              opacity: isReady ? 1 : 0,
              transition: "opacity 0.2s ease-in-out",
            }}
          >
            <MathJax dynamic onTypeset={() => setIsReady(true)}>
              {q.text}
            </MathJax>
          </div>

          <div className="ti-options">
            {(q.options || []).map((opt, i) => (
              <label
                key={opt.id || i}
                className={`ti-option ${answers[q.id] === opt.id ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  checked={answers[q.id] === opt.id}
                  onChange={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      [q.id]: opt.id,
                    }))
                  }
                />
                <span className="opt-letter">
                  {String.fromCharCode(65 + i)}
                </span>
                <span
                  className="opt-text"
                  style={{
                    opacity: isReady ? 1 : 0,
                  }}
                >
                  <MathJax dynamic onTypeset={() => setIsReady(true)}>
                    {opt.text}
                  </MathJax>
                </span>
              </label>
            ))}
          </div>

          <div className="ti-q-actions">
            <button
              className="btn-outline"
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
            <button
              className="btn-outline"
              disabled={current === 0}
              onClick={() => setCurrent((prev) => prev - 1)}
            >
              ← Previous
            </button>

            {current < questions.length - 1 ? (
              <button
                className="btn-primary"
                onClick={() => setCurrent((prev) => prev + 1)}
              >
                {" "}
                Next →{" "}
              </button>
            ) : (
              <button
                className="btn-primary"
                onClick={() => setShowConfirm(true)}
              >
                Submit Test ✓
              </button>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className={`ti-sidebar ${paletteOpen ? "open" : ""}`}>
          <div className="palette-header">
            <span>Questions</span>
            <button
              className="palette-close"
              onClick={() => setPaletteOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="palette-legend">
            <span className="pal-dot answered" /> Answered ({answered})
            <span
              className="pal-dot unanswered"
              style={{ marginLeft: 12 }}
            />{" "}
            Unanswered ({questions.length - answered})
            <span className="pal-dot marked" style={{ marginLeft: 12 }} />{" "}
            Marked ({markedCount})
          </div>

          <div className="palette-grid">
            {questions.map((_, index) => (
              <button
                key={index}
                className={`pal-btn ${getQStatus(index)} ${current === index ? "current" : ""}`}
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
              <span>Total Questions</span>
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

          <button
            className="btn-primary w-full"
            onClick={() => setShowConfirm(true)}
          >
            {" "}
            Submit Test{" "}
          </button>
        </div>
      </div>

      {/* MOBILE FAB */}
      <button className="palette-fab" onClick={() => setPaletteOpen(true)}>
        📋 Questions ({answered}/{questions.length})
      </button>

      {/* CONFIRM MODAL */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Submit Test?</h3>
            <p>
              You have answered <b>{answered}</b> out of{" "}
              <b>{questions.length}</b> questions.
            </p>
            {questions.length - answered > 0 && (
              <p className="modal-warn">
                ⚠️ {questions.length - answered} questions are unanswered.
              </p>
            )}
            <div className="modal-actions">
              <button
                className="btn-outline"
                onClick={() => setShowConfirm(false)}
              >
                {" "}
                Continue Test{" "}
              </button>
              <button className="btn-primary" onClick={handleSubmit}>
                {" "}
                Submit Now{" "}
              </button>
            </div>
          </div>
        </div>
      )}

      {showExitModal && (
        <div className="modal-overlay" onClick={() => setShowExitModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Exit Exam?</h3>
            <p>Your current progress may be lost if you leave this exam.</p>
            <div className="modal-actions">
              <button
                className="btn-primary"
                onClick={() => setShowExitModal(false)}
              >
                {" "}
                Continue Exam{" "}
              </button>
              <button className="btn-outline" onClick={handleExitExam}>
                {" "}
                Exit Exam{" "}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
