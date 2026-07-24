import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MathJax } from "better-react-mathjax";
import SEO from "../components/SEO";
import testService from "../api/testService";
import { getErrorMessage } from "../api/apiErrorHandler";
import { getTestHistoryEntry } from "../utils/testHistory";
import { ArrowLeft } from "../data/svgs";

function formatDate(timestamp) {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(seconds) {
  const total = Number(seconds) || 0;
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}m ${secs}s`;
}

/**
 * Re-fetches the question text/options (from testService.getTestQuestions,
 * which never carries answer data) and the selected/correct-option +
 * explanation data (from testService.getSubmissionResult, which only has
 * ids/status — no question text) for every sub-test submission that made
 * up this attempt, then merges them into one flat, renderable list. This
 * mirrors how Solutions.jsx reconciles the two halves of the same data,
 * but re-fetches both instead of relying on data passed via router state
 * — Test History entries can be opened long after the live TestInterface
 * session (and its in-memory `questions`) is gone.
 */
async function loadAttemptDetails(entry) {
  const combinedQuestions = [];
  const combinedAnswers = {};
  const combinedInfo = {};
  const subjectNameMap = {};

  for (const sub of entry.submissions || []) {
    if (!sub.testId || !sub.submissionId) continue;

    const [testData, resultData] = await Promise.all([
      testService.getTestQuestions(sub.testId),
      testService.getSubmissionResult(sub.submissionId),
    ]);

    (testData?.subjects || []).forEach((s) => {
      subjectNameMap[s.id] = s.name;
    });

    const questionAnalysis = resultData?.questionAnalysis || [];
    questionAnalysis.forEach((item) => {
      if (!item?.questionId) return;
      combinedInfo[item.questionId] = {
        correctId: item.correctOption?.id ?? null,
        correctText: item.correctOption?.text ?? null,
        selectedId: item.selectedOption?.id ?? null,
        selectedText: item.selectedOption?.text ?? null,
        status: item.status,
        explanation: item.explanation || "",
        marks: item.marks,
        negativeMarks: item.negativeMarks,
      };
      if (item.selectedOption?.id) {
        combinedAnswers[item.questionId] = item.selectedOption.id;
      }
    });

    (testData?.questions || []).forEach((q) => {
      combinedQuestions.push({
        id: q.id,
        text: q.questionText,
        subjectName: subjectNameMap[q.subjectId] || "",
        options: (q.options || []).map((opt) => ({
          id: opt.id,
          text: opt.optionText || opt.text,
        })),
      });
    });
  }

  return { questions: combinedQuestions, answers: combinedAnswers, infoMap: combinedInfo };
}

export default function TestHistoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [entry] = useState(() => getTestHistoryEntry(id));
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [infoMap, setInfoMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  document.title = entry
    ? `${entry.testTitle} - Test History - SetuLearn`
    : "Test History - SetuLearn";

  useEffect(() => {
    if (!entry) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const { questions: q, answers: a, infoMap: m } = await loadAttemptDetails(entry);
        if (cancelled) return;
        setQuestions(q);
        setAnswers(a);
        setInfoMap(m);
      } catch (err) {
        if (!cancelled) {
          setLoadError(getErrorMessage(err, "Failed to load this test's details."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [entry]);

  if (!entry) {
    return (
      <div className="empty-state" style={{ padding: "80px 20px", textAlign: "center" }}>
        <div className="empty-icon">📋</div>
        <h3>Test not found in history</h3>
        <p>This attempt may have been cleared from this device.</p>
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/test-history")}>
          Back to Test History
        </button>
      </div>
    );
  }

  const totalAttempted = (entry.correct || 0) + (entry.incorrect || 0);
  const accuracy = totalAttempted > 0 ? Math.round(((entry.correct || 0) / totalAttempted) * 100) : 0;

  return (
    <div className="solution-page history-detail-page">
      <SEO
        title={`${entry.testTitle} - Test History`}
        description="Review your answers, the correct options, and explanations for a past SetuLearn mock test attempt."
        canonical="/test-history"
      />

      <div className="solution-header">
        <button className="btn-outline" onClick={() => navigate("/test-history")}>
          <ArrowLeft /> <span>Back to History</span>
        </button>
        <h1>{entry.testTitle}</h1>
      </div>

      {/* Cached attempt summary — always available even if the detailed
          per-question re-fetch below is still loading or fails. */}
      <div className="history-detail-summary">
        <div className="hds-date">{formatDate(entry.timestamp)}</div>
        <div className="hds-stats">
          <div className="hds-item">
            <span className="hds-label">Score</span>
            <span className="hds-val">{entry.score} / {entry.totalMarks}</span>
          </div>
          <div className="hds-item">
            <span className="hds-label">Percentage</span>
            <span className="hds-val">{entry.percentage}%</span>
          </div>
          <div className="hds-item">
            <span className="hds-label">Accuracy</span>
            <span className="hds-val">{accuracy}%</span>
          </div>
          <div className="hds-item">
            <span className="hds-label green">Correct</span>
            <span className="hds-val green">{entry.correct || 0}</span>
          </div>
          <div className="hds-item">
            <span className="hds-label red">Incorrect</span>
            <span className="hds-val red">{entry.incorrect || 0}</span>
          </div>
          <div className="hds-item">
            <span className="hds-label">Unattempted</span>
            <span className="hds-val">{entry.unattempted || 0}</span>
          </div>
          <div className="hds-item">
            <span className="hds-label">Time Taken</span>
            <span className="hds-val">{formatDuration(entry.timeSpentSeconds)}</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="empty-state">
          <p>Loading your answers and the correct options…</p>
        </div>
      )}

      {!loading && loadError && (
        <div className="empty-state">
          <h3>Couldn't load question details</h3>
          <p>{loadError}</p>
        </div>
      )}

      {!loading && !loadError && questions.length === 0 && (
        <div className="empty-state">
          <h3>No question details available</h3>
          <p>This test may no longer be available.</p>
        </div>
      )}

      {!loading &&
        !loadError &&
        questions.map((q, index) => {
          const userSelectedId = answers[q.id];
          const info = infoMap[q.id] || {};
          const correctId = info.correctId;
          const correctText = info.correctText;
          const status = info.status; // 'correct' | 'incorrect' | 'unattempted'

          return (
            <div key={q.id} className="solution-card">
              <div className="solution-card-top">
                <h3 className="solution-question">
                  Q{index + 1}. <MathJax dynamic>{q.text}</MathJax>
                </h3>
                {status && (
                  <span className={`qa-status-badge ${status}`}>
                    {status === "correct" && "✓ Correct"}
                    {status === "incorrect" && "✗ Incorrect"}
                    {status === "unattempted" && "Unattempted"}
                  </span>
                )}
              </div>
              {q.subjectName && <div className="solution-subject">{q.subjectName}</div>}

              <div className="solution-options">
                {q.options.map((opt) => {
                  const isCorrect = correctId
                    ? String(opt.id) === String(correctId)
                    : correctText
                      ? String(opt.text).trim() === String(correctText).trim()
                      : false;
                  const isSelected = String(opt.id) === String(userSelectedId);

                  let className = "option-item";
                  if (isCorrect) className += " correct-answer";
                  else if (isSelected && !isCorrect) className += " wrong-answer";

                  return (
                    <div key={opt.id} className={className}>
                      <MathJax dynamic>{opt.text}</MathJax>
                      {isCorrect && isSelected && (
                        <span className="correct-badge">✓ Your Answer</span>
                      )}
                      {isCorrect && !isSelected && (
                        <span className="correct-badge">✓ Correct</span>
                      )}
                      {isSelected && !isCorrect && (
                        <span className="wrong-badge">✗ Your Answer</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {info.explanation && (
                <div className="solution-explanation">
                  <b>Explanation: </b>
                  <MathJax dynamic>{info.explanation}</MathJax>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
