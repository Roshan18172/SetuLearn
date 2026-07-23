import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpenCheck, ChartPie, Repeat } from "../data/svgs";

/**
 * Aggregates metrics across multiple backend submission results.
 * The backend now returns all computed fields (score, percentage, totalMarks,
 * totalQuestions, subjectAnalysis with per-subject score/totalMarks, and
 * questionAnalysis with marks/negativeMarks). This function only needs to
 * sum up the already-calculated values from each submission chunk.
 * @param {Array|Object} resultsData - A single result object or an array of result objects from the backend
 * @param {Object} test - The parent test configuration metadata containing section/subtest details
 * @param {Array} _questions - Not needed for calculation; backend already computed everything
 * @param {Object} _answers - Not needed for calculation; backend already computed everything
 * @returns {Object} Combined metrics summary
 */
export function calculateAggregatedResults(resultsData, test = {}, _questions = [], _answers = {}) {
  // Normalize input into an array of submission data items
  const submissionsList = Array.isArray(resultsData)
    ? resultsData
    : (resultsData?.data ? [resultsData.data] : [resultsData]);

  let totalScore = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalUnattempted = 0;
  let totalQuestionsCount = 0;
  let totalTimeSpent = 0;

  const displaySubjects = [];
  const seenSubjectKeys = new Set();

  submissionsList.forEach((sub, index) => {
    if (!sub) return;

    // Use backend-computed totals
    totalScore += Number(sub.score ?? 0);
    totalCorrect += Number(sub.correct ?? 0);
    totalIncorrect += Number(sub.incorrect ?? 0);
    totalUnattempted += Number(sub.unattempted ?? 0);
    totalQuestionsCount += Number(sub.totalQuestions ?? 0);
    totalTimeSpent += Number(sub.timeTaken ?? sub.timeSpent ?? sub.timeSpentSeconds ?? 0);

    // Backend now returns subjectAnalysis with score and totalMarks per subject
    if (Array.isArray(sub.subjectAnalysis) && sub.subjectAnalysis.length > 0) {
      sub.subjectAnalysis.forEach((subject) => {
        const attempted = subject.attempted || 0;
        const correct = subject.correct || 0;
        const incorrect = subject.incorrect || 0;
        const totalQuestions = subject.totalQuestions || 0;

        const subjectScore = Number(subject.score ?? 0);
        const totalMarks = Number(subject.totalMarks ?? 0);

        const accuracy =
          attempted === 0
            ? 0
            : Math.round((correct / attempted) * 100);

        // Use a composite key to avoid duplicates when multiple submissions include the same subject
        const subjectKey = subject.subjectId || subject.subjectName || `section-${index}`;
        if (!seenSubjectKeys.has(subjectKey)) {
          seenSubjectKeys.add(subjectKey);
          displaySubjects.push({
            name: subject.subjectName,
            questions: totalQuestions,
            attempted,
            correct,
            incorrect,
            score: subjectScore,
            total: totalMarks,
            accuracy,
            topics: Array.isArray(subject.topics) ? subject.topics : []
          });
        }
      });

      return;
    }

    // --- Legacy path: no subjectAnalysis from backend ---
    // This is only reached for very old data that predates backend subjectAnalysis.
    let sectionName = "";

    if (sub.subjectName || sub.sectionName || sub.subject || sub.title) {
      sectionName = sub.subjectName || sub.sectionName || sub.subject || sub.title;
    }

    if (!sectionName && test) {
      const targetId = sub.subTestId || sub.sectionId || sub.id;
      const originalSubtestArray = test.subTests || test.sections || [];
      const foundMatch = originalSubtestArray.find(
        (item) => item && String(item.id) === String(targetId)
      );
      if (foundMatch && (foundMatch.name || foundMatch.title)) {
        sectionName = foundMatch.name || foundMatch.title;
      } else if (originalSubtestArray[index] && (originalSubtestArray[index].name || originalSubtestArray[index].title)) {
        sectionName = originalSubtestArray[index].name || originalSubtestArray[index].title;
      }
    }

    if (!sectionName) {
      sectionName = `Section ${index + 1}`;
    }

    const subAttempted = sub.correct + sub.incorrect;
    const subAccuracy = subAttempted === 0 ? 0 : Math.round((sub.correct / subAttempted) * 100);

    displaySubjects.push({
      name: sectionName,
      questions: sub.totalQuestions ?? 0,
      attempted: subAttempted,
      correct: sub.correct ?? 0,
      incorrect: sub.incorrect ?? 0,
      score: sub.score ?? 0,
      total: sub.totalMarks ?? sub.totalQuestions * 4,
      accuracy: subAccuracy
    });
  });

  // Calculate grand total marks from displaySubjects
  let grandTotalMarks = displaySubjects.reduce((sum, s) => sum + Number(s.total), 0);
  if (grandTotalMarks === 0) {
    grandTotalMarks = totalQuestionsCount * 4;
  }

  const grandPercentage = grandTotalMarks > 0
    ? Math.max(0, Math.round((totalScore / grandTotalMarks) * 100))
    : 0;

  const totalAttempted = totalCorrect + totalIncorrect;
  const overallAccuracy =
    totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  // Format timeSpent into human readable string
  const hrs = Math.floor(totalTimeSpent / 3600);
  const mins = Math.floor((totalTimeSpent % 3600) / 60);
  const secs = totalTimeSpent % 60;
  const formattedTime = hrs > 0
    ? `${hrs}h ${mins}m ${secs}s`
    : `${mins}m ${secs}s`;

  return {
    score: totalScore,
    totalMarks: grandTotalMarks,
    percentage: grandPercentage,
    accuracy: overallAccuracy,
    correct: totalCorrect,
    incorrect: totalIncorrect,
    unattempted: totalUnattempted,
    totalQuestions: totalQuestionsCount,
    timeSpent: totalTimeSpent > 0 ? formattedTime : "00m 00s",
    subjects: displaySubjects
  };
}

function formatTime(secondsValue) {
  const totalSeconds = Number(secondsValue) || 0;
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }
  return `${mins}m ${secs}s`;
}

export default function TestResult() {
  const navigate = useNavigate();
  const location = useLocation();

  // Safely grab payload variables passed via state routing engine
  const {
    test,
    result,   // Can now safely be an array of multi-subject submission responses
    answers = {},
    questions = [],
    subjectsMap = {},
    timeSpent: passedTimeSpent,
    timeSpentSeconds: passedTimeSpentSeconds,
  } = location.state || {};


  document.title = "Test Performance Result - SetuLearn";

  const hasValidResult = !!(test && result);
  useEffect(() => {
    if (hasValidResult) return;
    const timer = setTimeout(() => {
      navigate("/tests", { replace: true });
    }, 1200);
    return () => clearTimeout(timer);
  }, [hasValidResult, navigate]);

  if (!hasValidResult) {
    return (
      <div className="empty-state" style={{ padding: "80px 20px", textAlign: "center" }}>
        <div className="empty-icon">📋</div>
        <h3>No result to show</h3>
        <p>Taking you back to Tests...</p>
        <button className="btn-primary" onClick={() => navigate("/tests", { replace: true })}>
          Browse Tests
        </button>
      </div>
    );
  }

  // Parse and aggregate cross-sectional metrics seamlessly passing the test context
  // Backend now provides all computed values; no need for questions/answers recalculation
  const metrics = calculateAggregatedResults(result, test, questions, answers);
  const aggregatedTime = metrics.timeSpent;
  const hasAggregatedTime = aggregatedTime && aggregatedTime !== "00m 00s" && aggregatedTime !== "0m 0s";
  const fallbackTimeSpent = passedTimeSpent ?? passedTimeSpentSeconds ?? 0;
  const displayTime = hasAggregatedTime ? aggregatedTime : formatTime(fallbackTimeSpent);

  // Sync aggregate summaries back into persistent storage for dashboard widgets
  try {
    const multiExamLog = {
      securedScore: metrics.score,
      totalScore: metrics.totalMarks,
      totalQuestions: metrics.totalQuestions,
      correct: metrics.correct,
      incorrect: metrics.incorrect,
      unattempted: metrics.unattempted,
      percentile: metrics.percentage,
      testId: test?.id || null,
      testTitle: test?.title || test?.examName || "Comprehensive Mock Test",
      timestamp: Date.now(),
    };
    localStorage.setItem('lastexam', JSON.stringify(multiExamLog));
  } catch (e) {
    console.error("Local storage summary sync failed:", e);
  }

  return (
    <div className="result-page">
      {/* Visual Header Banner */}
      <div className="result-banner">        
        <div className="result-trophy">
          <img src="/icons/trophy.png" alt="🏆" />
        </div>
        
        <h2>Test Completed Successfully!</h2>
        <p>Combined performance summary compiled from all subject submissions.</p>
        <div className="result-test-name">
          {test?.title || test?.examName || "SSC CGL Composite Assessment"}
        </div>
      </div>

      <div className="result-body">
        {/* Core Consolidated Scorecard Metrics */}
        <div className="scorecard">
          <div className="sc-circle-wrap">
            <div className="sc-circle">
              <div className="sc-big-score">{metrics.score}</div>
              <div className="sc-total">/{metrics.totalMarks}</div>
              <div className="sc-pct">{metrics.percentage}%</div>
            </div>
          </div>

          <div className="sc-details">
            <div className="sc-detail-row">
              <div className="scd-item correct">
                <span className="scd-icon">
                  <img src="/icons/correct.png"  alt="Correct Icon"/>
                </span>
                <div>
                  <div className="scd-label">Correct Answers</div>
                  <div className="scd-val">{metrics.correct} / {metrics.totalQuestions}</div>
                </div>
              </div>

              <div className="scd-item incorrect">
                <span className="scd-icon">
                  <img src="/icons/incorrect.png"  alt="Incorrect Icon"/>
                </span>
                <div>
                  <div className="scd-label">Incorrect Answers</div>
                  <div className="scd-val">{metrics.incorrect} / {metrics.totalQuestions}</div>
                </div>
              </div>

              <div className="scd-item unattempted">
                <span className="scd-icon">
                  <img src="/icons/circle.png"  alt="Unchecked Icon"/>
                </span>
                <div>
                  <div className="scd-label">Unattempted</div>
                  <div className="scd-val">{metrics.unattempted}</div>
                </div>
              </div>

              <div className="scd-item total">
                <span className="scd-icon">
                  <img src="/icons/question-icon.png"  alt="Checkbox Icon"/>
                </span>
                <div>
                  <div className="scd-label">Total Questions</div>
                  <div className="scd-val">{metrics.totalQuestions}</div>
                </div>
              </div>
            </div>

            <div className="sc-extra">
              <div className="sce-item">
                <div className="sce-label">Status</div>
                <div className="sce-val" style={{ color: '#00BFA6' }}>Completed Sync</div>
              </div>
              <div className="sce-item">
                <div className="sce-label">Time Spent</div>
                <div className="sce-val"><img src="/icons/clock.png" width={24} height={24}  alt="Clock Icon"/> {displayTime}</div>
              </div>
              <div className="sce-item">
                <div className="sce-label">Overall Accuracy</div>
                <div className="sce-val"><img src="/icons/accuracy.png" width={24} height={24}  alt="Target Icon"/> {metrics.correct + metrics.incorrect > 0 ? Math.round((metrics.correct / (metrics.correct + metrics.incorrect)) * 100) : 0}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Aggregated Cross-Section Summary Matrix */}
        {metrics.subjects.length > 0 && (
          <div className="result-section">
            <h3 className="rs-title">Subject-wise Breakdown Matrix</h3>
            <div className="subject-summary-table">
              <div className="sst-head">
                <span>Subject / Section</span>
                <span>Questions</span>
                <span>Attempted</span>
                <span>Correct</span>
                <span>Incorrect</span>
                <span>Score Contribution</span>
                <span>Accuracy</span>
              </div>

              {metrics.subjects.map((s, idx) => (
                <div key={s.name || idx} className="sst-row">
                  <span className="sst-name"><b>{s.name || test?.title || test?.examName || `Section ${idx + 1}`}</b></span>
                  <span>{s.questions}</span>
                  <span>{s.attempted}</span>
                  <span className="green">{s.correct}</span>
                  <span className="red">{s.incorrect}</span>
                  <span>{s.score} / {s.total}</span>
                  <span className={s.accuracy >= 75 ? "green" : s.accuracy >= 50 ? "orange" : "red"}>
                    {s.accuracy}%
                  </span>
                </div>
              ))}

              {/* Matrix Evaluation Footer Row Summary */}
              <div className="sst-row sst-total">
                <span className="sst-name">Total Consolidated</span>
                <span>{metrics.totalQuestions}</span>
                <span>{metrics.correct + metrics.incorrect}</span>
                <span className="green">{metrics.correct}</span>
                <span className="red">{metrics.incorrect}</span>
                <span>{metrics.score} / {metrics.totalMarks}</span>
                <span className="green">{metrics.accuracy}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Form Interactive Operational Buttons */}
        <div className="result-actions">
          <button className="btn-outline" onClick={() => navigate("/instructions", { state: { test, mode: "timed" } })}>
            <Repeat /> <span>Retake Test</span>
          </button>
          <button className="btn-primary" onClick={() => navigate("/analysis", { state: { test, result, answers, metrics, questions, subjectsMap, timeSpentSeconds: fallbackTimeSpent } })}>
            <ChartPie /> <span>View Detailed Analysis</span>
          </button>
          <button className="btn-primary" onClick={() => navigate("/solutions", { state: { test, answers, questions, result } })}>
            <BookOpenCheck /> <span>View Solutions</span>
          </button>
          <button className="btn-outline" onClick={() => navigate("/tests")}>
            Browse More Tests
          </button>
        </div>
      </div>
    </div>
  );
}