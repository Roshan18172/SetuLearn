import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation, useNavigationType } from "react-router-dom";
import { MathJax } from "better-react-mathjax";
import { ClockLoader } from "../data/svgs";
import Modal from "../components/Modal";
import testService from "../api/testService";

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

// Small helper screen used whenever TestInterface has nothing valid to show
// (no test in state, already-submitted test, or no questions). Auto-
// redirects to Tests after a brief moment, with a manual fallback button.
function RedirectToTests({ message }) {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/tests", { replace: true });
    }, 1200);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="empty-state"
      style={{ padding: "80px 20px", textAlign: "center" }}
    >
      <div className="empty-icon">📋</div>
      <h3>{message}</h3>
      <p>Taking you back to Tests...</p>
      <button className="btn-primary" style={{ display: "block", margin: "0 auto" }}
       onClick={() => navigate("/tests", { replace: true })}>
        Browse Tests
      </button>
    </div>
  );
}

export default function TestInterface() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType(); // 'POP' | 'PUSH' | 'REPLACE'

  const { test, mode = "timed" } = location.state || {};

  // Guards against setState firing after the component has unmounted
  // (e.g. a fast navigation mid-fetch).
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // If this test was already submitted (e.g. the user got here via Back
  // from the Result page, or a stray Forward-button press), don't re-run
  // the exam session — bounce straight to Tests instead.
  const alreadySubmitted =
    !!test?.id &&
    typeof window !== "undefined" &&
    sessionStorage.getItem(`test_submitted_${test.id}`) === "true";

  // Same idea, but for a deliberate mid-test Exit. Without this, pressing
  // Back after exiting could land on a stale history entry that still
  // holds the live exam state and silently resume the session — this flag
  // makes that entry self-redirect instead (see handleExitExam below).
  const alreadyExited =
    !!test?.id &&
    typeof window !== "undefined" &&
    sessionStorage.getItem(`test_exited_${test.id}`) === "true";

  // Tracks whether the exit modal is currently open, read/written
  // synchronously by the back-button trap below (kept as a ref, not
  // state, so a fast double back-press can't race ahead of a render).
  const modalOpenRef = useRef(false);

  // State variables for parsed data
  const [questions, setQuestions] = useState([]);
  const [subjectsMap, setSubjectsMap] = useState({});
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const dataLoadedRef = useRef(false);
  const mathJaxReadyCount = useRef(0);
  const totalMathJaxElements = useRef(0);

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
  // Tracks which question INDICES have actually been opened. Deliberately
  // separate from `current` (a single pointer) — jumping straight from Q1
  // to Q50 via the palette must NOT mark Q2–Q49 as visited, only Q1 and
  // Q50. Seeded with {0} since the first question is visited on load.
  const [visitedIndices, setVisitedIndices] = useState(() => new Set([0]));
  const [showConfirm, setShowConfirm] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Count MathJax typeset completions so we only show content when ALL
  // MathJax elements (question text + options) have rendered.
  const handleMathJaxTypeset = useCallback(() => {
    mathJaxReadyCount.current += 1;
    if (mathJaxReadyCount.current >= totalMathJaxElements.current) {
      setIsReady(true);
    }
  }, []);

  // Reset MathJax ready state when navigating to a new question, and
  // record that this specific question index has genuinely been opened.
  useEffect(() => {
    setIsReady(false);
    mathJaxReadyCount.current = 0;
    const currentQ = questions[current];
    if (currentQ) {
      // question text + options count
      totalMathJaxElements.current = 1 + ((currentQ.options || []).length || 0);
      setVisitedIndices((prev) => {
        if (prev.has(current)) return prev;
        const next = new Set(prev);
        next.add(current);
        return next;
      });
    } else {
      totalMathJaxElements.current = 0;
    }
  }, [current, questions]);

  // Combined effect to handle sub-test session initialization and question mapping seamlessly
  useEffect(() => {
    if (!test || alreadySubmitted || alreadyExited) {
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

    // Prevent re-fetching data on subsequent renders (e.g. back-button popstate)
    if (dataLoadedRef.current) {
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
            const startData = await testService.startTest(sub.id);

            let currentSubTestSubmissionId = null;
            if (startData) {
              currentSubTestSubmissionId =
                startData.submissionId ||
                startData.id ||
                (startData.data && startData.data.submissionId);
            }

            // 2. Fetch the corresponding questions data structure
            const testData = await testService.getTestQuestions(sub.id);

            if (testData) {
              const fetchedQuestions = testData.questions || [];

              // Map backend subject array to quickly look up real subject names via ID later
              const subMap = {};
              (testData.subjects || []).forEach((s) => {
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

                const correctOption = (q.options || []).find(
                  (o) => o.isCorrect,
                );

                return {
                  id: q.id,
                  subTestId: sub.id,

                  text: q.questionText,

                  marks: q.marks,
                  negativeMarks: q.negativeMarks,

                  subjectId: q.subjectId,
                  subjectName: q.subject?.name || "",

                  topicId: q.topicId,

                  // ADD THESE
                  topic: q.topic?.name || "",
                  topicName: q.topic?.name || "",
                  topicSlug: q.topic?.slug || "",

                  correct: correctOptionId,
                  correctOptionId,
                  correctOption: q.correctOption,
                  correctOptionText:
                    correctOption?.optionText || correctOption?.text,

                  options: (q.options || []).map((opt) => ({
                    id: opt.id,
                    text: opt.optionText || opt.text,
                    isCorrect: Boolean(opt.isCorrect),
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
        if (!mountedRef.current) return;
        setQuestions(results.flat());
        setSubmissionMap(internalSubmissionMapping);
      } catch (error) {
        console.error("Error aggregating master exam structure:", error);
      } finally {
        dataLoadedRef.current = true;
        if (mountedRef.current) setLoadingQuestions(false);
      }
    };

    loadExamDataStructure();
  }, [test, alreadySubmitted, alreadyExited]);

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

        const jsonData = await testService.submitTest(subTestId, payload);
        if (!jsonData) {
          alert("Submission processing failed.");
          return;
        }

        // Push individual sub-test results into the container array.
        // IMPORTANT: the `/submit` response above only contains summary
        // fields (score, correct, incorrect, subjectAnalysis, submissionId,
        // timeTaken) — it does NOT include questionAnalysis. The per-question
        // breakdown (with explanations, selected/correct options) only lives
        // behind a separate endpoint keyed by submissionId, so we fetch it
        // here and merge it in before pushing.
        if (jsonData) {
          let fullResult = jsonData;
          const submissionId = jsonData.submissionId;

          if (submissionId) {
            try {
              const resultData = await testService.getSubmissionResult(submissionId);
              if (resultData) {
                // Merge: keep submissionId/timeTaken from submit response,
                // but layer in questionAnalysis (and refreshed subjectAnalysis/
                // score fields) from the detailed result response.
                fullResult = { ...jsonData, ...resultData };
              } else {
                console.error(
                  `Failed to fetch detailed result for submission ${submissionId}`,
                );
              }
            } catch (err) {
              console.error(
                `Error fetching questionAnalysis for submission ${submissionId}:`,
                err,
              );
            }
          }

          finalMergedResultsArray.push(fullResult);
        }
      }

      // Mark this test as submitted so that if the user later hits Back
      // from the Result page (or otherwise lands back on this route), we
      // recognize it and redirect instead of re-fetching/re-running a
      // finished exam session.
      if (test?.id) {
        sessionStorage.setItem(`test_submitted_${test.id}`, "true");
      }

      // replace: true so the Result page takes TestInterface's place in
      // history — pressing Back from Result then goes straight to
      // wherever was before this exam (Tests), not into a dead session.
      navigate("/result", {
        replace: true,
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
  }, [navigate, questions, answers, test, submissionMap]);

  const handleExitExam = () => {
    // Exiting mid-test goes straight to Tests (not back to Instructions) —
    // replace so it also clears this dead TestInterface entry from history.
    modalOpenRef.current = false;
    // Mark this test as exited so that if Back later lands on a stale
    // /test history entry from before this trap logic replaced it, that
    // entry self-redirects to Tests instead of silently resuming the
    // exam (see the alreadyExited check above and its useEffect guard).
    if (test?.id) {
      sessionStorage.setItem(`test_exited_${test.id}`, "true");
    }
    navigate("/tests", { replace: true });
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

  // Show the "Exit Exam?" modal on Back — implemented entirely through
  // React Router's own `Maps()`/`useNavigationType()`, NOT the raw
  // `window.history` API. Calling `window.history.pushState` ourselves
  // fights React Router's own internal history bookkeeping (it tracks
  // each entry's key/index itself), which was corrupting `location.state`
  // — the exam would lose `test` the instant a real Back press fired,
  // unmounting mid-render before the modal could even show.
  //
  // How it works: once the exam is loaded, we push one extra duplicate
  // history entry (same route, same state) via `Maps()`. A Back
  // press then just pops back onto this same duplicate entry — the page
  // doesn't unmount at all, `useNavigationType()` flips to "POP", and we
  // catch that to show the modal and push another duplicate to stay
  // armed. A second Back press while the modal is already open is
  // treated as the confirmed exit.
  const examActive = !!test && !alreadySubmitted && !alreadyExited && !loadingQuestions && questions.length > 0;
  const trapArmedRef = useRef(false);

  // Arm the trap once, right when the exam becomes active.
  useEffect(() => {
    if (!examActive || trapArmedRef.current) return;
    trapArmedRef.current = true;
    navigate(location.pathname, { state: location.state });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examActive]);

  // React to Back/Forward presses (only meaningful once armed).
  useEffect(() => {
    if (!examActive || !trapArmedRef.current) return;
    if (navigationType !== "POP") return;

    if (modalOpenRef.current) {
      // Second back-press while the modal is already up = confirmed exit.
      setShowExitModal(false);
      handleExitExam();
      return;
    }

    modalOpenRef.current = true;
    setShowExitModal(true);
    // Re-arm: push another duplicate so the next Back press pops onto
    // this page again instead of actually leaving.
    navigate(location.pathname, { state: location.state });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationType, location.key]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Only warn on an actual tab close/refresh mid-exam (not SPA
      // navigation, which doesn't fire beforeunload).
      if (alreadySubmitted) return;
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [alreadySubmitted]);

  if (!test) {
    return <RedirectToTests message="No test data found." />;
  }

  if (alreadySubmitted) {
    return <RedirectToTests message="You have already submitted this test." />;
  }

  if (alreadyExited) {
    return <RedirectToTests message="You exited this exam." />;
  }

  if (loadingQuestions) {
    return (
      <div
        className="empty-state"
        style={{ padding: "100px 20px", textAlign: "center" }}
      >
        <div className="empty-icon">
          <ClockLoader />
        </div>
        <h2>Assembling Exam Questions...</h2>
        <p>Please wait while we prepare your master question sheet.</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <RedirectToTests message="This exam currently has no configured questions available." />
    );
  }

  const q = questions[current] || {};
  const answered = Object.keys(answers).length;
  const markedCount = Object.keys(marked).length;
  const notVisitedCount = questions.length - visitedIndices.size;

  const getQStatus = (index) => {
    const qId = questions[index].id;
    if (marked[qId] && answers[qId]) return "marked-answered";
    if (marked[qId]) return "marked";
    if (answers[qId]) return "answered";
    if (visitedIndices.has(index)) return "unanswered";
    return "not-visited";
  };

  const unansweredVisitedCount = questions.filter(
    (_, idx) => getQStatus(idx) === "unanswered"
  ).length;

  // Group questions by subject, preserving the order subjects first appear
  // in — used for the subject tabs and the subject-grouped palette.
  const subjectGroups = [];
  const subjectGroupIndex = {};
  questions.forEach((qq, idx) => {
    const sid = qq.subjectId || "unknown";
    if (subjectGroupIndex[sid] === undefined) {
      subjectGroupIndex[sid] = subjectGroups.length;
      subjectGroups.push({
        id: sid,
        name: subjectsMap[sid] || qq.subjectName || "General",
        indices: [],
      });
    }
    subjectGroups[subjectGroupIndex[sid]].indices.push(idx);
  });

  const jumpToSubject = (subjectId) => {
    const group = subjectGroups.find((g) => g.id === subjectId);
    if (!group) return;
    // Prefer the first unanswered question in that subject so switching
    // subjects is actually useful mid-attempt, not just a cosmetic jump.
    const target =
      group.indices.find((idx) => !answers[questions[idx].id]) ?? group.indices[0];
    setCurrent(target);
    setPaletteOpen(false);
  };

  // Fix #11: the Submit button stays disabled until the student has
  // either answered at least one question, or spent a minimum amount of
  // time in the exam — prevents an accidental/blank instant submission.
  const MIN_ANSWERED_TO_SUBMIT = 1;
  const MIN_SECONDS_TO_SUBMIT = 60;
  const canSubmit =
    answered >= MIN_ANSWERED_TO_SUBMIT || timeSpentSeconds >= MIN_SECONDS_TO_SUBMIT;
  const submitHint = canSubmit
    ? null
    : `Answer at least one question, or wait ${MIN_SECONDS_TO_SUBMIT - timeSpentSeconds}s more, before submitting.`;

  const currentSubjectId = questions[current]?.subjectId;

  return (
    <div className="test-interface" style={{ userSelect: "none" }}>
      {/* TOP BAR */}
      <div className="ti-topbar">
        <div className="ti-testname">
          <div className="ti-icon">{test.title?.slice(0, 4).toUpperCase()}</div>
          <span>{test.title} Master Test</span>
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
            onClick={() => {
              modalOpenRef.current = true;
              setShowExitModal(true);
            }}
          >
            {" "}
            Exit{" "}
          </button>
          <button
            className="btn-end-test"
            onClick={() => setShowConfirm(true)}
            disabled={!canSubmit}
            title={submitHint || undefined}
          >
            {" "}
            End Test{" "}
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="ti-body">
        {/* MAIN QUESTION PANEL */}
        <div className="ti-main">
          {subjectGroups.length > 1 && (
            <div className="ti-subject-tabs">
              {subjectGroups.map((g) => {
                const groupAnswered = g.indices.filter((idx) => answers[questions[idx].id]).length;
                return (
                  <button
                    key={g.id}
                    className={`ti-subject-tab ${currentSubjectId === g.id ? "active" : ""}`}
                    onClick={() => jumpToSubject(g.id)}
                  >
                    {g.name}
                    <span className="tab-count">
                      {groupAnswered}/{g.indices.length}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

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
            {subjectsMap[q.topicId]}
          </div>

          <div
            className="ti-question"
            style={{
              opacity: isReady ? 1 : 0,
              transition: "opacity 0.2s ease-in-out",
            }}
          >
            {q.text ? (
              <MathJax dynamic onTypeset={handleMathJaxTypeset}>
                {q.text}
              </MathJax>
            ) : (
              <p>Question text not available</p>
            )}
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
                  {opt.text ? (
                    <MathJax dynamic onTypeset={handleMathJaxTypeset}>
                      {opt.text}
                    </MathJax>
                  ) : (
                    "Option text not available"
                  )}
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
                disabled={!canSubmit}
                title={submitHint || undefined}
              >
                Submit Test ✓
              </button>
            )}
          </div>
          {!canSubmit && current === questions.length - 1 && (
            <p className="ti-submit-hint">{submitHint}</p>
          )}
        </div>

        {/* SIDEBAR */}
        <div className={`ti-sidebar ${paletteOpen ? "open" : ""}`}>
          <div className="ti-sidebar-header">
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
              Unanswered ({unansweredVisitedCount})
              <span
                className="pal-dot marked"
                style={{ marginLeft: 12 }}
              />{" "}
              Marked ({markedCount})
              <span
                className="pal-dot not-visited"
                style={{ marginLeft: 12 }}
              />{" "}
              Not Visited ({notVisitedCount})
            </div>
          </div>
          <div className="ti-sidebar-body">
            {subjectGroups.map((g) => (
              <div className="palette-subject-group" key={g.id}>
                {subjectGroups.length > 1 && (
                  <div className="palette-subject-label">{g.name}</div>
                )}
                <div className="palette-grid">
                  {g.indices.map((index) => (
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
              </div>
            ))}

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
              <div className="ps-row">
                <span>Not Visited</span>
                <b> {notVisitedCount} </b>
              </div>
            </div>

            <button
              className="btn-primary w-full"
              onClick={() => setShowConfirm(true)}
              disabled={!canSubmit}
              title={submitHint || undefined}
            >
              {" "}
              Submit Test{" "}
            </button>
            {!canSubmit && <p className="ti-submit-hint">{submitHint}</p>}
          </div>
        </div>
      </div>

      {/* MOBILE FAB */}
      <button className="palette-fab" onClick={() => setPaletteOpen(true)}>
        📋 Questions ({answered}/{questions.length})
      </button>

      {/* CONFIRM MODAL */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Submit Test?"
        primaryLabel="Submit Now"
        secondaryLabel="Continue Test"
        onPrimary={handleSubmit}
        onSecondary={() => setShowConfirm(false)}
      >
        <p>
          You have answered <b>{answered}</b> out of <b>{questions.length}</b>{" "}
          questions.
        </p>
        {questions.length - answered > 0 && (
          <p className="modal-warn">
            ⚠️ {questions.length - answered} questions are unanswered.
          </p>
        )}
      </Modal>

      {/* EXIT MODAL */}
      <Modal
        isOpen={showExitModal}
        onClose={() => {
          modalOpenRef.current = false;
          setShowExitModal(false);
        }}
        title="Exit Exam?"
        primaryLabel="Continue Exam"
        secondaryLabel="Exit Exam"
        onPrimary={() => {
          modalOpenRef.current = false;
          setShowExitModal(false);
        }}
        onSecondary={handleExitExam}
      >
        <p>Your current progress may be lost if you leave this exam.</p>
      </Modal>
    </div>
  );
}