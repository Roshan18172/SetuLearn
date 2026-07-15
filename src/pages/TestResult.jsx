import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpenCheck, ChartPie, Repeat } from "../data/svgs";

/**
 * Aggregates and calculates metrics across multiple backend submissions
 * @param {Array|Object} resultsData - A single result object or an array of result objects from the backend
 * @param {Object} test - The parent test configuration metadata containing section/subtest details
 * @returns {Object} Combined metrics summary
 */
export function calculateAggregatedResults(resultsData, test = {}) {
  // Normalize input into an array of submission data items
  // console.log("Calculating aggregated results for:", resultsData, test);
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

  submissionsList.forEach((sub, index) => {
    if (!sub) return;

    // Direct performance summary fields per submission chunk
    const subScore = sub.score ?? sub.obtainedMarks ?? 0;
    const subCorrect = sub.correct ?? sub.correctAnswers ?? 0;
    const subIncorrect = sub.incorrect ?? sub.incorrectAnswers ?? 0;
    const subUnattempted = sub.unattempted ?? 0;
    totalTimeSpent += Number(sub.timeSpent ?? sub.timeSpentSeconds ?? 0);

    // Safely deduce question quantity per module context
    let subQuestionsCount = 0;
    if (sub.questionAnalysis && Array.isArray(sub.questionAnalysis)) {
      subQuestionsCount = sub.questionAnalysis.length;
    } else if (sub.totalQuestions) {
      subQuestionsCount = sub.totalQuestions;
    } else {
      subQuestionsCount = subCorrect + subIncorrect + subUnattempted;
    }

    totalScore += subScore;
    totalCorrect += subCorrect;
    totalIncorrect += subIncorrect;
    totalUnattempted += subUnattempted;
    totalQuestionsCount += subQuestionsCount;

    // Backend now provides subject-wise analysis
    if (Array.isArray(sub.subjectAnalysis) && sub.subjectAnalysis.length > 0) {

      sub.subjectAnalysis.forEach((subject) => {

        const attempted = subject.attempted || 0;
        const correct = subject.correct || 0;
        const incorrect = subject.incorrect || 0;
        const totalQuestions = subject.totalQuestions || 0;

        // Find configured marks from test.subjects
        const config =
          test.subjects?.find(
            s => String(s.id) === String(subject.subjectId)
          ) || {};

        const totalMarks = config.marks || totalQuestions * 4;

        // Estimate score
        const score =
          correct * 4 -
          incorrect * 1;

        const accuracy =
          attempted === 0
            ? 0
            : Math.round((correct / attempted) * 100);

        displaySubjects.push({
          name: subject.subjectName,
          questions: totalQuestions,
          attempted,
          correct,
          incorrect,
          score,
          total: totalMarks,
          accuracy,
          topics: Array.isArray(subject.topics) ? subject.topics : []
        });

      });

      return;
    }

    // --- STRATEGY TO FIND THE REAL SUBJECT NAME ---
    let sectionName = "";

    // Step A: Check if the backend explicitly returned a name directly on this result element
    // include `title` which some pages (instruction) use for subject/paper section
    if (sub.subjectName || sub.sectionName || sub.subject || sub.title) {
      sectionName = sub.subjectName || sub.sectionName || sub.subject || sub.title;
    }

    // Step B: Match via ID mapping against test layout configuration schema
    if (!sectionName && test) {
      const targetId = sub.subTestId || sub.sectionId || sub.id;
      const originalSubtestArray = test.subTests || test.sections || [];
      const foundMatch = originalSubtestArray.find(
        (item) => item && String(item.id) === String(targetId)
      );
      if (foundMatch && (foundMatch.name || foundMatch.title)) {
        sectionName = foundMatch.name || foundMatch.title;
      } else if (originalSubtestArray[index] && (originalSubtestArray[index].name || originalSubtestArray[index].title)) {
        // Fallback positional configuration index matching
        sectionName = originalSubtestArray[index].name || originalSubtestArray[index].title;
      }
    }

    // Step C: Automated RegEx extraction from dummy solution explanations string matching
    if (!sectionName && sub.questionAnalysis && sub.questionAnalysis[0]?.explanation) {
      const match = sub.questionAnalysis[0].explanation.match(/SSC CGL - (.*?) Question/);
      if (match && match[1]) sectionName = match[1];
    }

    // Default Fallback if completely undetected
    if (!sectionName) {
      sectionName = `Section ${index + 1}`;
    }

    const subAttempted = subCorrect + subIncorrect;
    const subAccuracy = subAttempted === 0 ? 0 : Math.round((subCorrect / subAttempted) * 100);

    displaySubjects.push({
      name: sectionName,
      questions: subQuestionsCount,
      attempted: subAttempted,
      correct: subCorrect,
      incorrect: subIncorrect,
      score: subScore,
      total: subQuestionsCount * 4,
      accuracy: subAccuracy
    });
  });

  const grandTotalMarks = totalQuestionsCount * 4;
  const grandPercentage = grandTotalMarks > 0
    ? Math.max(0, Math.round((totalScore / grandTotalMarks) * 100))
    : 0;

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
    // Some pages (e.g. DetailedAnalysis' "Back to Results") may pass the
    // elapsed time under `timeSpentSeconds` instead of `timeSpent` — accept
    // either so the displayed time doesn't reset to 0 depending on origin.
    timeSpentSeconds: passedTimeSpentSeconds,
  } = location.state || {};

  document.title = "Test Performance Result - SetuLearn";

  // Parse and aggregate cross-sectional metrics seamlessly passing the test context
  const metrics = calculateAggregatedResults(result, test);
  // calculateAggregatedResults sums sub.timeSpent from the backend per section.
  // If the backend doesn't return per-section time, we fall back to the total
  // timeSpentSeconds passed directly from TestInterface via location.state.
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
        <div className="result-trophy">🏆</div>
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
                <span className="green">{metrics.percentage}%</span>
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