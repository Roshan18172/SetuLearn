import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
<<<<<<< Updated upstream
import examService from "../api/examService";
import submissionService from "../api/submissionService";
import { mapQuestionToFrontend, mapResultToFrontend } from "../api/dataMapper";
import { getErrorMessage } from "../api/apiErrorHandler";
=======
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
  const [questions, setQuestions] = useState([]);
  const [submissionId, setSubmissionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
=======
  // State variables for parsed data
  const [questions, setQuestions] = useState([]);
  const [subjectsMap, setSubjectsMap] = useState({});
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  // Key fix: Maintain a dictionary mapping questionId to its corresponding backend sub-test submission UUID
  const [submissionMap, setSubmissionMap] = useState({});
>>>>>>> Stashed changes

  const totalSecs = (test?.duration || 30) * 60;

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [timeLeft, setTimeLeft] = useState(totalSecs);
  const [showConfirm, setShowConfirm] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

<<<<<<< Updated upstream
  // Start test on mount — fetch questions from backend
  useEffect(() => {
    if (!test) {
      setLoading(false);
      return;
    }

    const startTest = async () => {
      try {
        const data = await examService.startTest(test.id);
        setSubmissionId(data.submissionId);

        const mappedQuestions = (data.test?.questions || []).map((q) =>
          mapQuestionToFrontend(q)
        );
        setQuestions(mappedQuestions);
      } catch (err) {
        console.error("Failed to start test:", err);
        setError("Could not load test questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    startTest();
  }, [test]);
=======
  // Helper function to dynamically retrieve standard auth tokens securely
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
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
            const startResponse = await fetch(`https://setulearn-backend.onrender.com/api/v1/tests/${sub.id}/start`, {
              method: "POST",
              headers: getAuthHeaders(),
              body: JSON.stringify({})
            });
            const startJson = await startResponse.json();

            let currentSubTestSubmissionId = null;
            if (startJson.success && startJson.data) {
              currentSubTestSubmissionId = startJson.data.submissionId || startJson.data.id || (startJson.data.data && startJson.data.data.submissionId);
            }

            // 2. Fetch the corresponding questions data structure
            const dataResponse = await fetch(`https://setulearn-backend.onrender.com/api/v1/tests/${sub.id}`, {
              headers: getAuthHeaders()
            });
            const dataJson = await dataResponse.json();

            if (dataJson.success && dataJson.data) {
              const fetchedQuestions = dataJson.data.questions || [];

              // Map backend subject array to quickly look up real subject names via ID later
              const subMap = {};
              (dataJson.data.subjects || []).forEach(s => {
                subMap[s.id] = s.name;
              });
              setSubjectsMap(prev => ({ ...prev, ...subMap }));

              // Process questions and link them with the correct sub-test session identifier
              return fetchedQuestions.map(q => {
                if (currentSubTestSubmissionId) {
                  internalSubmissionMapping[q.id] = currentSubTestSubmissionId;
                }

                return {
                  id: q.id,
                  subTestId: sub.id, // Save reference to the parenting sub-test
                  text: q.questionText,
                  marks: q.marks,
                  negativeMarks: q.negativeMarks,
                  subjectId: q.subjectId,
                  topicId: q.topicId,
                  options: (q.options || []).map(opt => ({
                    id: opt.id,
                    text: opt.optionText
                  }))
                };
              });
            }
            return [];
          } catch (err) {
            console.error(`Failed loading workflow actions for chunk element ${sub.id}:`, err);
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
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
  // Submit to backend
  const handleSubmit = useCallback(async () => {
    if (!submissionId || !test) return;

    try {
      const payload = {
        submissionId,
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        })),
      };

      // Submit the test
      await submissionService.submitTest(test.id, payload);

      // Get full result
      const resultData = await submissionService.getResult(submissionId);
      const result = mapResultToFrontend(resultData);

      navigate("/result", {
        state: {
          test,
          result,
          answers,
        },
      });
    } catch (err) {
      const message = getErrorMessage(err, "Failed to submit your test. Please try again.");
      console.error("Failed to submit test:", err);
      alert(message);
    }
  }, [navigate, submissionId, test, answers]);
=======
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
            answers: []
          };
        }

        // Add to payload only if an answer is selected
        if (selectedOptionId) {
          submissionsGrouped[question.subTestId].answers.push({
            questionId: question.id,
            selectedOptionId: selectedOptionId
          });
        }
      });

      // Handle completely blank sections cleanly
      questions.forEach((question) => {
        const targetSubmissionId = submissionMap[question.id];
        if (targetSubmissionId && !submissionsGrouped[question.subTestId]) {
          submissionsGrouped[question.subTestId] = {
            submissionId: targetSubmissionId,
            answers: []
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
        const payload = submissionsGrouped[subTestId];
        console.log("Submitting payload structure:", payload);

        const response = await fetch(`https://setulearn-backend.onrender.com/api/v1/tests/${subTestId}/submit`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });

        const json = await response.json();
        if (!json.success) {
          console.error("Validation details:", json.errors || json.message);
          alert(`Submission processing failed: ${json.message || "Validation Error"}`);
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
          questions,     // full question list for Question Analysis tab
          subjectsMap,   // id→name map for topic labels
        }
      });
    } catch (err) {
      console.error("Error submitting exam:", err);
      alert("An error occurred while submitting your test.");
    }
    //eslint-disable-next-line
  }, [navigate, questions, answers, test, submissionMap, getAuthHeaders]);
>>>>>>> Stashed changes

  const handleExitExam = () => {
    navigate("/instructions", {
      state: { test },
    });
  };
<<<<<<< Updated upstream

  // eslint-disable-next-line
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  // Tab switch detection
=======
//eslint-disable-next-line 
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
  // Loading / Error / No-test states
  if (!test) {
    return (
      <div className="empty-state" style={{ padding: "80px 20px", textAlign: "center" }}>
        <div className="empty-icon">📝</div>
        <h2>No Test Selected</h2>
        <p>Please select a test first.</p>
        <button className="btn-primary" onClick={() => navigate("/tests")}>
          Browse Tests
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="empty-state" style={{ padding: "80px 20px", textAlign: "center" }}>
        <div className="empty-icon">⏳</div>
        <h2>Loading Test...</h2>
        <p>Please wait while we prepare your test.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state" style={{ padding: "80px 20px", textAlign: "center" }}>
        <div className="empty-icon">⚠️</div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button className="btn-primary" onClick={() => navigate("/tests")}>
          Browse Tests
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="empty-state" style={{ padding: "80px 20px", textAlign: "center" }}>
        <div className="empty-icon">📝</div>
        <h2>No Questions Available</h2>
        <p>This test has no questions yet.</p>
        <button className="btn-primary" onClick={() => navigate("/tests")}>
          Browse Tests
        </button>
=======
  if (!test || loadingQuestions) {
    return (
      <div className="empty-state" style={{ padding: "100px 20px", textAlign: "center" }}>
        <div className="empty-icon">⏳</div>
        <h2>Assembling Exam Questions...</h2>
        <p>Please wait while we prepare your master question sheet.</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="empty-state" style={{ padding: "80px 20px", textAlign: "center" }}>
        <div className="empty-icon">📝</div>
        <h2>No Questions Found</h2>
        <p>This exam currently has no configured questions available.</p>
        <button className="btn-primary" onClick={() => navigate("/tests")}> Browse Tests </button>
>>>>>>> Stashed changes
      </div>
    );
  }

  const q = questions[current] || {};
  const answered = Object.keys(answers).length;
  const markedCount = Object.keys(marked).length;

  const getQStatus = (index) => {
    const qId = questions[index].id;
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
          <div className="ti-icon">{test.exam?.slice(0, 3).toUpperCase()}</div>
          <span>{test.title}</span>
=======
          <div className="ti-icon">
            {test.examName?.slice(0, 3).toUpperCase()}
          </div>
          <span>{test.examName} Master Test</span>
>>>>>>> Stashed changes
        </div>

        <div className="ti-timer-wrap">
          {mode === "timed" ? (
<<<<<<< Updated upstream
            <div className={`ti-timer ${timeLeft < 300 ? "timer-warn" : ""}`}>
              <span className="timer-label">Time Left</span>
              <span className="timer-value">{formatTime(timeLeft)}</span>
            </div>
          ) : (
            <div className="ti-timer">
              <span className="timer-label">Practice Mode</span>
              <span className="timer-value">∞</span>
=======
            <div className={`ti-timer ${timeLeft < 300 ? "timer-warn" : ""}`} >
              <span className="timer-label"> Time Left </span>
              <span className="timer-value"> {formatTime(timeLeft)} </span>
            </div>
          ) : (
            <div className="ti-timer">
              <span className="timer-label"> Practice Mode </span>
              <span className="timer-value"> ∞ </span>
>>>>>>> Stashed changes
            </div>
          )}
        </div>

<<<<<<< Updated upstream
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn-outline" onClick={() => setShowExitModal(true)}>
            Exit
          </button>
          <button className="btn-end-test" onClick={() => setShowConfirm(true)}>
            End Test
          </button>
=======
        <div style={{ display: "flex", gap: "10px" }} >
          <button className="btn-outline" onClick={() => setShowExitModal(true)} > Exit </button>
          <button className="btn-end-test" onClick={() => setShowConfirm(true)} > End Test </button>
>>>>>>> Stashed changes
        </div>
      </div>

      {/* BODY */}
      <div className="ti-body">
        {/* MAIN QUESTION PANEL */}
        <div className="ti-main">
          <div className="ti-q-header">
<<<<<<< Updated upstream
            <div className="ti-q-num">Question {current + 1}</div>
            <button
              className={`mark-review-btn ${marked[q.id] ? "active" : ""}`}
=======
            <div className="ti-q-num">
              Question {current + 1} of {questions.length}
            </div>

            <button className={`mark-review-btn ${marked[q.id] ? "active" : ""}`}
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
          <div className="ti-q-topic">Topic: {q.topic || "General"}</div>
          <div className="ti-question">{q.text}</div>

          <div className="ti-options">
            {(q.options || []).map((opt, i) => (
              <label
                key={opt.id}
=======
          <div className="ti-q-topic"> Section: {subjectsMap[q.subjectId] || "General Section"} </div>

          <div className="ti-question"> {q.text} </div>

          <div className="ti-options">
            {(q.options || []).map((opt, i) => (
              <label key={opt.id || i}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                <span className="opt-text">{opt.text}</span>
=======
                <span className="opt-letter"> {String.fromCharCode(65 + i)} </span>
                <span className="opt-text"> {opt.text} </span>
>>>>>>> Stashed changes
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
              <button className="btn-primary" onClick={() => setCurrent((prev) => prev + 1)}>
                Next →
              </button>
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
<<<<<<< Updated upstream
            <span className="pal-dot answered" />
            Answered ({answered})
            <span className="pal-dot unanswered" style={{ marginLeft: 12 }} />
            Unanswered ({questions.length - answered})
            <span className="pal-dot marked" style={{ marginLeft: 12 }} />
            Marked ({markedCount})
=======
            <span className="pal-dot answered" /> Answered ({answered})
            <span className="pal-dot unanswered" style={{ marginLeft: 12 }} /> Unanswered ({questions.length - answered})
            <span className="pal-dot marked" style={{ marginLeft: 12 }} /> Marked ({markedCount})
>>>>>>> Stashed changes
          </div>

          <div className="palette-grid">
            {questions.map((_, index) => (
<<<<<<< Updated upstream
              <button
                key={index}
                className={`pal-btn ${getQStatus(index)} ${current === index ? "current" : ""}`}
=======
              <button key={index} className={`pal-btn ${getQStatus(index)} ${current === index ? "current" : ""}`}
>>>>>>> Stashed changes
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
              <b className="green">{answered}</b>
            </div>
            <div className="ps-row">
              <span>Not Answered</span>
              <b className="red">{questions.length - answered}</b>
            </div>
            <div className="ps-row">
              <span>Marked</span>
              <b className="orange">{markedCount}</b>
            </div>
          </div>

          <button className="btn-primary w-full" onClick={() => setShowConfirm(true)}>
            Submit Test
          </button>
        </div>
      </div>

      {/* MOBILE FAB */}
<<<<<<< Updated upstream
      <button className="palette-fab" onClick={() => setPaletteOpen(true)}>
=======
      <button className="palette-fab" onClick={() => setPaletteOpen(true)} >
>>>>>>> Stashed changes
        📋 Questions ({answered}/{questions.length})
      </button>

      {/* CONFIRM MODAL */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Submit Test?</h3>
            <p>
              You have answered <b>{answered}</b> out of <b>{questions.length}</b> questions.
            </p>
            {questions.length - answered > 0 && (
              <p className="modal-warn">
                ⚠️ {questions.length - answered} questions are unanswered.
              </p>
            )}
            <div className="modal-actions">
              <button className="btn-outline" onClick={() => setShowConfirm(false)}>
                Continue Test
              </button>
              <button className="btn-primary" onClick={handleSubmit}>
                Submit Now
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
<<<<<<< Updated upstream
              <button className="btn-primary" onClick={() => setShowExitModal(false)}>
                Continue Exam
              </button>
              <button className="btn-outline" onClick={handleExitExam}>
                Exit Exam
              </button>
=======
              <button className="btn-primary" onClick={() => setShowExitModal(false)} > Continue Exam </button>
              <button className="btn-outline" onClick={handleExitExam} > Exit Exam </button>
>>>>>>> Stashed changes
            </div>
          </div>
        </div>
      )}
    </div>
  );
}