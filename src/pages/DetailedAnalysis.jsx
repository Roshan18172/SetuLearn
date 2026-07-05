import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { questionBank } from "../data/demoData";
import { calculateAggregatedResults } from "./TestResult";
import { MathJax } from "better-react-mathjax";

const tabs = [
  "Overview",
  "Question Analysis",
  "Subject Analysis",
  "Time Analysis",
  "Compare",
];
const statusLabels = {
  correct: "Correct",
  incorrect: "Wrong",
  unattempted: "Skipped",
  answered: "Answered",
};

function pickFirst(...values) {
  return values.find(
    (value) => value !== undefined && value !== null && value !== "",
  );
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clampPercent(value) {
  return Math.min(100, Math.max(0, Math.round(toNumber(value))));
}

function parseDurationSeconds(value) {
  if (typeof value === "number" && Number.isFinite(value))
    return Math.max(0, Math.round(value));
  if (typeof value !== "string") return 0;
  const trimmed = value.trim();
  if (!trimmed) return 0;
  if (trimmed.includes(":")) {
    const parts = trimmed.split(":").map((part) => toNumber(part, 0));
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
  }
  const hours = toNumber(trimmed.match(/(\d+)\s*h/i)?.[1], 0);
  const minutes = toNumber(trimmed.match(/(\d+)\s*m/i)?.[1], 0);
  const seconds = toNumber(trimmed.match(/(\d+)\s*s/i)?.[1], 0);
  return hours * 3600 + minutes * 60 + seconds;
}

function formatDuration(seconds, compact = false) {
  const total = Math.max(0, Math.round(toNumber(seconds)));
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (compact) {
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  }
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function getSubmissionList(result) {
  if (!result) return [];
  const source = result?.data ?? result;
  const list = Array.isArray(source) ? source : [source];
  return list.map((item) => item?.data ?? item).filter(Boolean);
}

function getConfiguredSections(test = {}) {
  return test.subTests || test.sections || test.subjects || [];
}

function findConfiguredSection(sub = {}, index, test = {}) {
  const targetId = pickFirst(sub.subTestId, sub.sectionId, sub.testId, sub.id);
  const sections = getConfiguredSections(test);
  if (targetId) {
    const match = sections.find(
      (item) => String(item?.id) === String(targetId),
    );
    if (match) return match;
  }
  return sections[index] || {};
}

function getSectionName(sub = {}, index = 0, test = {}) {
  const configuredSection = findConfiguredSection(sub, index, test);
  const firstQuestion = Array.isArray(sub.questionAnalysis)
    ? sub.questionAnalysis[0]
    : {};
  const explanationMatch =
    firstQuestion?.explanation?.match(/-\s*(.*?)\s*Question/i);
  return pickFirst(
    sub.subjectName,
    sub.sectionName,
    sub.subject,
    sub.title,
    sub.name,
    configuredSection.title,
    configuredSection.name,
    firstQuestion?.subjectName,
    firstQuestion?.sectionName,
    explanationMatch?.[1],
    `Section ${index + 1}`,
  );
}

function normalizeSubject(subject = {}, index = 0) {
  const questions = toNumber(subject.questions ?? subject.totalQuestions, 0);
  const correct = toNumber(
    subject.correct ?? subject.correctAnswers ?? subject.correctCount,
    0,
  );
  const incorrect = toNumber(
    subject.incorrect ?? subject.incorrectAnswers ?? subject.incorrectCount,
    0,
  );
  const attempted = toNumber(subject.attempted, correct + incorrect);
  const unattempted = toNumber(
    subject.unattempted,
    Math.max(questions - attempted, 0),
  );
  const total = toNumber(
    subject.total ?? subject.totalMarks ?? subject.maxMarks,
    questions * 4,
  );
  const score = toNumber(
    subject.score ?? subject.obtainedMarks ?? subject.marksObtained,
    0,
  );
  const accuracy =
    attempted > 0 ? clampPercent((correct / attempted) * 100) : 0;
  const timeSpentSeconds = parseDurationSeconds(
    pickFirst(subject.timeSpentSeconds, subject.timeSpent, subject.timeTaken),
  );
  return {
    ...subject,
    name:
      subject.name ||
      subject.title ||
      subject.subjectName ||
      `Section ${index + 1}`,
    questions,
    attempted,
    correct,
    incorrect,
    unattempted,
    score,
    total,
    accuracy: toNumber(subject.accuracy, accuracy),
    percentage: total > 0 ? clampPercent((score / total) * 100) : 0,
    timeSpentSeconds,
    timeSpent:
      timeSpentSeconds > 0 ? formatDuration(timeSpentSeconds, true) : "0s",
  };
}

function normalizeMetrics(result, metrics, test, routeTimeSpentSeconds) {
  const calculated = calculateAggregatedResults(result, test);
  const source = {
    ...calculated,
    ...(metrics || {}),
    subjects: metrics?.subjects?.length
      ? metrics.subjects
      : calculated.subjects,
  };
  const subjects = (source.subjects || []).map(normalizeSubject);
  const totalQuestions = toNumber(
    source.totalQuestions,
    subjects.reduce((sum, s) => sum + s.questions, 0),
  );
  const correct = toNumber(
    source.correct ?? source.correctCount,
    subjects.reduce((sum, s) => sum + s.correct, 0),
  );
  const incorrect = toNumber(
    source.incorrect ?? source.incorrectCount,
    subjects.reduce((sum, s) => sum + s.incorrect, 0),
  );
  const attempted = toNumber(source.attempted, correct + incorrect);
  const unattempted = toNumber(
    source.unattempted,
    Math.max(totalQuestions - attempted, 0),
  );
  const score = toNumber(
    source.score ?? source.obtainedMarks,
    subjects.reduce((sum, s) => sum + s.score, 0),
  );
  const totalMarks = toNumber(
    source.totalMarks ?? source.maxMarks,
    subjects.reduce((sum, s) => sum + s.total, 0),
  );
  const percentage =
    totalMarks > 0 ? clampPercent((score / totalMarks) * 100) : 0;
  const accuracy =
    attempted > 0 ? clampPercent((correct / attempted) * 100) : 0;
  const timeSpentSeconds =
    toNumber(
      pickFirst(
        source.timeSpentSeconds,
        parseDurationSeconds(source.timeSpent || source.timeTaken),
        routeTimeSpentSeconds,
      ),
      0,
    ) || toNumber(routeTimeSpentSeconds, 0);
  return {
    ...source,
    subjects,
    score,
    totalMarks,
    percentage: toNumber(source.percentage ?? source.scorePercent, percentage),
    scorePercent: toNumber(
      source.scorePercent ?? source.percentage,
      percentage,
    ),
    accuracy,
    correct,
    correctCount: correct,
    incorrect,
    incorrectCount: incorrect,
    attempted,
    unattempted,
    totalQuestions,
    timeSpentSeconds,
    timeSpent:
      timeSpentSeconds > 0
        ? formatDuration(timeSpentSeconds, true)
        : source.timeSpent || "00m 00s",
    timeTaken:
      timeSpentSeconds > 0
        ? formatDuration(timeSpentSeconds)
        : source.timeTaken || "00:00:00",
    percentile: toNumber(source.percentile, source.percentage ?? percentage),
  };
}

function getOptionText(options = [], optionId) {
  if (!optionId || !options.length) return "";

  // 1. Direct ID match (UUID or numeric id)
  const byId = options.find(
    (item) => String(item.id ?? item.optionId) === String(optionId),
  );
  if (byId) return byId.text || byId.optionText || byId.label || "";

  // 2. Letter match — backend sometimes returns "A", "B", "C", "D"
  const letterIndex = ["A", "B", "C", "D", "E"].indexOf(
    String(optionId).trim().toUpperCase(),
  );
  if (letterIndex !== -1 && options[letterIndex]) {
    return (
      options[letterIndex].text ||
      options[letterIndex].optionText ||
      options[letterIndex].label ||
      ""
    );
  }

  // 3. Numeric index match — backend sometimes returns 0-based or 1-based index
  const numIndex = parseInt(optionId, 10);
  if (!isNaN(numIndex)) {
    // Try 1-based first (most common in exam APIs), then 0-based
    const byOneBased = options[numIndex - 1];
    const byZeroBased = options[numIndex];
    const hit = byOneBased || byZeroBased;
    if (hit) return hit.text || hit.optionText || hit.label || "";
  }

  // 4. Direct text match — backend occasionally echoes back the option text itself as the "id"
  const byText = options.find(
    (item) =>
      String(item.text || item.optionText || "")
        .trim()
        .toLowerCase() === String(optionId).trim().toLowerCase(),
  );
  if (byText) return byText.text || byText.optionText || byText.label || "";

  return "";
}

/**
 * Extracts correct option text from a backend question/analysis item,
 * trying every field shape the backend might use before falling back to ID lookup.
 */
function resolveCorrectOptionText(
  item = {},
  question = {},
  fullQuestion = {},
  fullOptions = [],
) {
  // 1. Backend explicitly returned the answer text
  const explicitText = pickFirst(
    item.correctOptionText,
    item.correctAnswer,
    item.correctAnswerText,
    question.correctOptionText,
    question.correctAnswerText,
    fullQuestion.correctOptionText,
    fullQuestion.correctAnswerText,
  );
  if (explicitText) return explicitText;

  // 2. Backend returned a nested correctOption object  { id, text } or { optionText }
  const correctOptionObj =
    item.correctOption || question.correctOption || fullQuestion.correctOption;
  if (correctOptionObj && typeof correctOptionObj === "object") {
    const nested =
      correctOptionObj.text ||
      correctOptionObj.optionText ||
      correctOptionObj.label;
    if (nested) return nested;
  }

  // 3. isCorrect flag on individual options (very common pattern — backend marks each option)
  //    Check both the fullQuestion options and item-level options
  const allOptionSources = [
    fullOptions,
    fullQuestion.options || [],
    question.options || [],
    item.options || [],
  ];
  for (const opts of allOptionSources) {
    if (!Array.isArray(opts) || !opts.length) continue;
    const flagged = opts.find(
      (o) =>
        o.isCorrect === true ||
        o.correct === true ||
        o.isCorrect === 1 ||
        o.correct === 1,
    );
    if (flagged)
      return flagged.text || flagged.optionText || flagged.label || "";
  }

  // 4. Collect every candidate "correct" id field the backend might use
  const correctId = pickFirst(
    item.correctOptionId,
    item.correctAnswerId,
    item.correct,
    item.answer,
    correctOptionObj?.id ?? correctOptionObj?.optionId,
    question.correctOptionId,
    question.correct,
    fullQuestion.correct,
    fullQuestion.correctOptionId,
  );

  if (correctId) {
    const looked = getOptionText(fullOptions, correctId);
    if (looked) return looked;
    // If text lookup failed, surface the raw id so it's at least visible
    return String(correctId);
  }

  // 5. Debug helper — logs the item shape once so you can identify the missing field
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[DetailedAnalysis] Could not resolve correct answer for item:",
      {
        itemKeys: Object.keys(item),
        questionKeys: Object.keys(question),
        fullQuestionKeys: Object.keys(fullQuestion),
        fullOptionsCount: fullOptions.length,
        sampleOption: fullOptions[0],
      },
    );
  }

  return "";
}

function hasActualAnswer(value) {
  if (value === undefined || value === null || value === "") return false;
  return !/^(not attempted|unattempted|skipped)$/i.test(String(value).trim());
}

// Build a lookup map: questionId → full question object (with options) from the routed questions array
function buildQuestionsMap(questions = []) {
  const map = {};
  questions.forEach((q) => {
    const id = pickFirst(q.id, q.questionId);
    if (id) map[String(id)] = q;
  });
  return map;
}

function normalizeBackendQuestion(
  item = {},
  rowIndex,
  sectionName,
  answers = {},
  questionsMap = {},
) {
  const question = item.question || item.questionData || {};
  const questionId = pickFirst(item.questionId, item.id, question.id);

  // Look up the full question from the routed questions array for complete options list
  const fullQuestion = questionsMap[String(questionId)] || {};
  const fullOptions =
    fullQuestion.options || question.options || item.options || [];

  const selectedOptionId = pickFirst(
    item.selectedOptionId,
    item.selectedAnswerId,
    item.answerId,
    questionId ? answers[questionId] : undefined,
  );
  const correctOptionId = pickFirst(
    item.correctOptionId,
    item.correctAnswerId,
    item.correct,
    item.answer,
    item.correctOption?.id,
    item.correctOption?.optionId,
    question.correctOptionId,
    question.correct,
    fullQuestion.correct,
    fullQuestion.correctOptionId,
  );

  // Resolve selected answer text — try backend text first, then look up from full options
  const selectedOptionText = pickFirst(
    item.selectedOptionText,
    item.selectedAnswer,
    item.userAnswer,
    getOptionText(fullOptions, selectedOptionId),
  );

  // Resolve correct answer text — use robust resolver that handles all backend shapes
  const correctOptionText = resolveCorrectOptionText(
    item,
    question,
    fullQuestion,
    fullOptions,
  );

  const attempted =
    item.attempted !== undefined
      ? Boolean(item.attempted)
      : hasActualAnswer(selectedOptionId) ||
      hasActualAnswer(selectedOptionText);
  const canCheckById =
    hasActualAnswer(selectedOptionId) && hasActualAnswer(correctOptionId);
  const canCheckByText =
    hasActualAnswer(selectedOptionText) && hasActualAnswer(correctOptionText);
  const isCorrect =
    item.isCorrect !== undefined
      ? Boolean(item.isCorrect)
      : attempted &&
      ((canCheckById &&
        String(selectedOptionId) === String(correctOptionId)) ||
        (canCheckByText &&
          String(selectedOptionText).trim() ===
          String(correctOptionText).trim()));
  const status = !attempted
    ? "unattempted"
    : isCorrect
      ? "correct"
      : "incorrect";
  const timeSpentSeconds = parseDurationSeconds(
    pickFirst(item.timeSpentSeconds, item.timeSpent, item.timeTaken),
  );

  return {
    id: questionId || `${sectionName}-${rowIndex + 1}`,
    number: rowIndex + 1,
    text: pickFirst(
      item.questionText,
      item.text,
      question.questionText,
      question.text,
      fullQuestion.text,
      fullQuestion.questionText,
      `Question ${rowIndex + 1}`,
    ),
    topic: pickFirst(
      item.topicName,
      item.topic,
      question.topicName,
      question.topic,
      item.subjectName,
      fullQuestion.topic,
      sectionName,
    ),
    section: sectionName,
    selectedOptionText: attempted
      ? selectedOptionText || selectedOptionId || "Answered"
      : "Not Attempted",
    // Correct option text resolved via resolveCorrectOptionText (handles all backend shapes)
    correctOptionText: correctOptionText || "—",
    attempted,
    isCorrect,
    status,
    marks: toNumber(
      pickFirst(item.marksObtained, item.score, item.obtainedMarks),
      isCorrect ? toNumber(item.marks, 0) : 0,
    ),
    explanation: item.explanation || "",
    timeSpentSeconds,
    timeSpent:
      timeSpentSeconds > 0 ? formatDuration(timeSpentSeconds, true) : "",
  };
}

function buildQuestionRows(result, questions = [], answers = {}, test = {}) {
  const rows = [];
  const questionsMap = buildQuestionsMap(questions);

  getSubmissionList(result).forEach((sub, subIndex) => {
    const questionAnalysis =
      sub.questionAnalysis || sub.questionsAnalysis || sub.analysis || [];
    const sectionName = getSectionName(sub, subIndex, test);
    if (Array.isArray(questionAnalysis)) {
      questionAnalysis.forEach((item) => {
        rows.push(
          normalizeBackendQuestion(
            item,
            rows.length,
            sectionName,
            answers,
            questionsMap,
          ),
        );
      });
    }
  });

  if (rows.length > 0) return rows;

  // Fallback: build rows directly from the routed questions array
  return (questions || []).map((question, index) => {
    const userAnswer = answers[question.id];
    const attempted = hasActualAnswer(userAnswer);
    const options = question.options || [];
    const correctOptionId = question.correct || question.correctOptionId;
    const selectedOptionText = getOptionText(options, userAnswer);
    const correctOptionText = getOptionText(options, correctOptionId);
    const canCheck = hasActualAnswer(correctOptionId);
    const isCorrect =
      attempted && canCheck && String(userAnswer) === String(correctOptionId);
    const status = !attempted
      ? "unattempted"
      : canCheck
        ? isCorrect
          ? "correct"
          : "incorrect"
        : "answered";

    return {
      id: question.id || index + 1,
      number: index + 1,
      text: question.text || question.questionText || `Question ${index + 1}`,
      topic:
        question.topic?.name ||
        question.topicName ||
        question.topic ||
        question.topicSlug ||
        question.subjectName ||
        "General",
      section:
        question.sectionName ||
        question.subjectName ||
        question.subject ||
        "General",
      selectedOptionText: attempted
        ? selectedOptionText || userAnswer || "Answered"
        : "Not Attempted",
      correctOptionText: correctOptionText || correctOptionId || "—",
      attempted,
      isCorrect,
      status,
      marks: isCorrect ? toNumber(question.marks, 4) : 0,
      explanation: question.explanation || "",
      timeSpentSeconds: 0,
      timeSpent: "",
    };
  });
}

function buildTopicBreakdown(questionRows = []) {
  const topicStats = {};
  questionRows.forEach((row) => {
    const topic = row.topic || row.section || "General";
    if (!topicStats[topic]) {
      topicStats[topic] = {
        topic,
        total: 0,
        attempted: 0,
        correct: 0,
        incorrect: 0,
      };
    }
    topicStats[topic].total += 1;
    if (row.attempted) topicStats[topic].attempted += 1;
    if (row.status === "correct") topicStats[topic].correct += 1;
    if (row.status === "incorrect") topicStats[topic].incorrect += 1;
  });
  return Object.values(topicStats).map((topic) => ({
    topic: topic.topic,
    total: topic.total,
    attempted: topic.attempted,
    correct: topic.correct,
    incorrect: topic.incorrect,
    accuracy:
      topic.attempted > 0
        ? clampPercent((topic.correct / topic.attempted) * 100)
        : 0,
    score:
      topic.total > 0
        ? clampPercent((topic.correct / topic.total) * 100)
        : 0,
  }));
}

function buildTimeAnalysis(metrics, questionRows = []) {
  const totalSeconds = toNumber(
    metrics.timeSpentSeconds,
    parseDurationSeconds(metrics.timeSpent || metrics.timeTaken),
  );
  const totalQuestions = Math.max(toNumber(metrics.totalQuestions), 1);
  const subjects = metrics.subjects || [];
  const hasSectionTimes = subjects.some((s) => s.timeSpentSeconds > 0);
  const sectionRows = subjects.map((subject, index) => {
    const proportionalSeconds =
      totalSeconds > 0
        ? Math.round(totalSeconds * (subject.questions / totalQuestions))
        : 0;
    const seconds = hasSectionTimes
      ? subject.timeSpentSeconds
      : proportionalSeconds;
    return {
      name: subject.name,
      seconds,
      label: seconds > 0 ? formatDuration(seconds, true) : "0s",
      percent:
        totalSeconds > 0 ? clampPercent((seconds / totalSeconds) * 100) : 0,
      color: ["#6C63FF", "#00BFA6", "#FFA726", "#FF6B6B", "#26A69A"][index % 5],
    };
  });
  const timedRows = questionRows.filter((row) => row.timeSpentSeconds > 0);
  const correctTimedRows = timedRows.filter((row) => row.status === "correct");
  const incorrectTimedRows = timedRows.filter(
    (row) => row.status === "incorrect",
  );
  const sumSeconds = (rows) =>
    rows.reduce((sum, row) => sum + row.timeSpentSeconds, 0);
  const attempted = Math.max(toNumber(metrics.attempted), 1);
  const correct = Math.max(toNumber(metrics.correct), 1);
  const incorrect = Math.max(toNumber(metrics.incorrect), 1);
  return {
    sectionRows,
    total: totalSeconds > 0 ? formatDuration(totalSeconds, true) : "00m 00s",
    avgPerQuestion:
      totalSeconds > 0
        ? formatDuration(totalSeconds / totalQuestions, true)
        : "0s",
    avgAttempted:
      totalSeconds > 0 ? formatDuration(totalSeconds / attempted, true) : "0s",
    avgCorrect:
      correctTimedRows.length > 0
        ? formatDuration(
          sumSeconds(correctTimedRows) / correctTimedRows.length,
          true,
        )
        : totalSeconds > 0
          ? formatDuration(totalSeconds / correct, true)
          : "0s",
    avgIncorrect:
      incorrectTimedRows.length > 0
        ? formatDuration(
          sumSeconds(incorrectTimedRows) / incorrectTimedRows.length,
          true,
        )
        : totalSeconds > 0
          ? formatDuration(totalSeconds / incorrect, true)
          : "0s",
  };
}

function buildCompareData(metrics, test = {}) {
  const avgPercent = clampPercent(test.avgScore ?? 60);
  const topPercent = 90;
  const avgScore = Math.round((metrics.totalMarks * avgPercent) / 100);
  const topScore = Math.round((metrics.totalMarks * topPercent) / 100);
  return [
    {
      metric: "Score",
      you: `${metrics.score}/${metrics.totalMarks}`,
      avg: `${avgScore}/${metrics.totalMarks}`,
      top: `${topScore}/${metrics.totalMarks}`,
    },
    {
      metric: "Score %",
      you: `${metrics.percentage}%`,
      avg: `${avgPercent}%`,
      top: `${topPercent}%`,
    },
    { metric: "Accuracy", you: `${metrics.accuracy}%`, avg: "62%", top: "89%" },
    {
      metric: "Attempted",
      you: `${metrics.attempted}/${metrics.totalQuestions}`,
      avg: `${Math.round(metrics.totalQuestions * 0.72)}/${metrics.totalQuestions}`,
      top: `${Math.round(metrics.totalQuestions * 0.92)}/${metrics.totalQuestions}`,
    },
    {
      metric: "Percentile",
      you: `${metrics.percentile}`,
      avg: "50",
      top: "90+",
    },
  ];
}

function buildAnalysisData({
  result,
  metrics,
  questions,
  answers,
  test,
  timeSpentSeconds,
}) {
  const normalizedMetrics = normalizeMetrics(
    result,
    metrics,
    test,
    timeSpentSeconds,
  );
  const questionRows = buildQuestionRows(result, questions, answers, test);
  return {
    metrics: normalizedMetrics,
    subjects: normalizedMetrics.subjects,
    questionRows,
    topicBreakdown: buildTopicBreakdown(questionRows),
    timeAnalysis: buildTimeAnalysis(normalizedMetrics, questionRows),
    compareData: buildCompareData(normalizedMetrics, test),
  };
}

// Minimal HTML escaping so question/option/explanation text (which may
// contain raw LaTeX like \frac{a}{b}) doesn't break the exported markup.
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Builds one standalone, downloadable HTML report containing every tab
 * (Overview, Question Analysis, Subject Analysis, Time Analysis, Compare) —
 * not just whichever tab happens to be on screen. Includes the MathJax CDN
 * script so LaTeX in question text renders when the file is opened.
 */
function generateFullReportHtml({ test, analysis }) {
  const r = analysis.metrics;
  const subjects = analysis.subjects;
  const { questionRows, timeAnalysis, compareData } = analysis;

  const testTitle = test?.title || test?.examName || r.testTitle || "Test";

  const sectionSummaryRows = subjects
    .map(
      (s) => `
    <tr>
      <td>${escapeHtml(s.name)}</td>
      <td>${s.questions}</td>
      <td>${s.attempted}</td>
      <td class="green">${s.correct}</td>
      <td class="red">${s.incorrect}</td>
      <td>${s.score}/${s.total}</td>
      <td>${s.accuracy}%</td>
    </tr>`,
    )
    .join("");

  const questionRowsHtml = questionRows
    .map(
      (row) => `
    <tr class="${row.status}">
      <td>${row.number}</td>
      <td>${escapeHtml(row.text)}</td>
      <td>${escapeHtml(row.topic)}</td>
      <td>${escapeHtml(row.selectedOptionText)}</td>
      <td>${escapeHtml(row.correctOptionText)}</td>
      <td>${escapeHtml(statusLabels[row.status] || "Answered")}</td>
    </tr>`,
    )
    .join("");

  const subjectCards = subjects
    .map(
      (s) => `
    <div class="card">
      <h4>${escapeHtml(s.name)} <span class="acc">${s.accuracy}% Accuracy</span></h4>
      <div class="stats-row">
        <div><b>${s.correct}</b><span>Correct</span></div>
        <div><b>${s.incorrect}</b><span>Incorrect</span></div>
        <div><b>${s.unattempted}</b><span>Skipped</span></div>
        <div><b>${s.score}/${s.total}</b><span>Score</span></div>
      </div>
    </div>`,
    )
    .join("");

  const timeSectionRows = timeAnalysis.sectionRows
    .map(
      (row) => `
    <tr><td>${escapeHtml(row.name)}</td><td>${row.label}</td><td>${row.percent}%</td></tr>`,
    )
    .join("");

  const compareRows = compareData
    .map(
      (row) => `
    <tr><td>${escapeHtml(row.metric)}</td><td>${escapeHtml(row.you)}</td><td>${escapeHtml(row.avg)}</td><td>${escapeHtml(row.top)}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(testTitle)} - Detailed Analysis Report</title>
<script>
  window.MathJax = { tex: { inlineMath: [["$", "$"]] } };
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<style>
  body { font-family: Arial, sans-serif; max-width: 960px; margin: 30px auto; padding: 0 20px; color: #222; }
  h1 { font-size: 26px; margin-bottom: 4px; }
  h2 { font-size: 18px; margin: 34px 0 14px; border-bottom: 2px solid #eee; padding-bottom: 6px; }
  h3 { font-size: 15px; margin: 18px 0 10px; }
  .meta { color: #777; font-size: 13px; margin-bottom: 10px; }
  .summary-grid { display: flex; gap: 14px; flex-wrap: wrap; margin: 16px 0 24px; }
  .summary-grid .stat { background: #f8f9fb; border-radius: 10px; padding: 12px 18px; min-width: 110px; }
  .summary-grid .stat b { display: block; font-size: 20px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 10px; }
  th, td { border: 1px solid #e2e2e2; padding: 8px 10px; text-align: left; }
  th { background: #f3f4f6; }
  tr.correct td { background: #f0fdf4; }
  tr.incorrect td { background: #fef2f2; }
  tr.unattempted td { color: #888; }
  .green { color: #15803d; font-weight: 600; }
  .red { color: #dc2626; font-weight: 600; }
  .card { background: #fff; border: 1px solid #eee; border-radius: 10px; padding: 16px; margin-bottom: 14px; }
  .card h4 { display: flex; justify-content: space-between; margin: 0 0 10px; }
  .acc { font-size: 13px; font-weight: 600; }
  .stats-row { display: flex; gap: 24px; }
  .stats-row div { text-align: center; }
  .stats-row b { display: block; font-size: 16px; }
  .stats-row span { font-size: 11px; color: #777; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
  <h1>${escapeHtml(testTitle)} - Detailed Analysis Report</h1>
  <div class="meta">Generated on ${escapeHtml(new Date().toLocaleString())}</div>

  <h2>Overview</h2>
  <div class="summary-grid">
    <div class="stat"><b>${r.score}/${r.totalMarks}</b>Score</div>
    <div class="stat"><b>${r.percentage}%</b>Score %</div>
    <div class="stat"><b>${r.accuracy}%</b>Accuracy</div>
    <div class="stat"><b>${r.correct}</b>Correct</div>
    <div class="stat"><b>${r.incorrect}</b>Incorrect</div>
    <div class="stat"><b>${r.unattempted}</b>Unattempted</div>
    <div class="stat"><b>${r.percentile}</b>Percentile</div>
  </div>
  <h3>Section Summary</h3>
  <table>
    <thead><tr><th>Section</th><th>Questions</th><th>Attempted</th><th>Correct</th><th>Incorrect</th><th>Score</th><th>Accuracy</th></tr></thead>
    <tbody>${sectionSummaryRows}</tbody>
  </table>

  <h2>Question Analysis</h2>
  <table>
    <thead><tr><th>#</th><th>Question</th><th>Topic</th><th>Your Answer</th><th>Correct Answer</th><th>Status</th></tr></thead>
    <tbody>${questionRowsHtml}</tbody>
  </table>

  <h2>Subject Analysis</h2>
  ${subjectCards}

  <h2>Time Analysis</h2>
  <div class="summary-grid">
    <div class="stat"><b>${timeAnalysis.total}</b>Total Time</div>
    <div class="stat"><b>${timeAnalysis.avgPerQuestion}</b>Avg / Question</div>
    <div class="stat"><b>${timeAnalysis.avgCorrect}</b>Avg Correct</div>
    <div class="stat"><b>${timeAnalysis.avgIncorrect}</b>Avg Wrong</div>
  </div>
  <table>
    <thead><tr><th>Section</th><th>Time</th><th>% of Total</th></tr></thead>
    <tbody>${timeSectionRows}</tbody>
  </table>

  <h2>Compare</h2>
  <table>
    <thead><tr><th>Metric</th><th>You</th><th>Average</th><th>Top 10%</th></tr></thead>
    <tbody>${compareRows}</tbody>
  </table>
</body>
</html>`;
}

const ROW_STYLES = {
  correct: {
    row: {
      background: "rgba(0,191,166,0.08)",
      borderLeft: "3px solid #00BFA6",
    },
    text: { color: "#00BFA6" },
    badge: {
      background: "rgba(0,191,166,0.15)",
      color: "#00BFA6",
      padding: "3px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: 600,
      whiteSpace: "nowrap",
    },
  },
  incorrect: {
    row: {
      background: "rgba(255,107,107,0.08)",
      borderLeft: "3px solid #FF6B6B",
    },
    text: { color: "#FF6B6B" },
    badge: {
      background: "rgba(255,107,107,0.15)",
      color: "#FF6B6B",
      padding: "3px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: 600,
      whiteSpace: "nowrap",
    },
  },
  unattempted: {
    row: {
      background: "rgba(100,116,139,0.05)",
      borderLeft: "3px solid #475569",
    },
    text: { color: "#64748b" },
    badge: {
      background: "rgba(71,85,105,0.2)",
      color: "#64748b",
      padding: "3px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: 600,
      whiteSpace: "nowrap",
    },
  },
  answered: {
    row: { borderLeft: "3px solid #6C63FF" },
    text: { color: "#e2e8f0" },
    badge: {
      background: "rgba(108,99,255,0.15)",
      color: "#6C63FF",
      padding: "3px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: 600,
      whiteSpace: "nowrap",
    },
  },
};

export default function DetailedAnalysis() {
  document.title = "Detailed Analysis - SetuLearn";
  const navigate = useNavigate();
  const location = useLocation();
  const {
    test,
    result,
    answers = {},
    metrics,
    questions: routedQuestions = [],
    timeSpentSeconds = 0,
  } = location.state || {};

  const [tab, setTab] = useState("Overview");
  const [isReady, setIsReady] = useState(false);
  const questions = useMemo(
    () =>
      routedQuestions.length > 0
        ? routedQuestions
        : questionBank[test?.id] || [],
    [routedQuestions, test?.id],
  );

  const analysis = useMemo(
    () =>
      buildAnalysisData({
        result,
        metrics,
        questions,
        answers,
        test,
        timeSpentSeconds,
      }),
    [result, metrics, questions, answers, test, timeSpentSeconds],
  );

  const r = analysis.metrics;
  const subjects = analysis.subjects;

  if (!test && !result && !metrics) {
    return (
      <div className="empty-state" style={{ padding: "80px 20px" }}>
        <h2>No Analysis Found</h2>
        <p>Please complete a test first to view detailed analytics.</p>
        <button className="btn-primary" onClick={() => navigate("/tests")}>
          Browse Tests
        </button>
      </div>
    );
  }

  const routeBackToResult = () =>
    navigate("/result", {
      state: {
        test,
        result,
        answers,
        metrics: r,
        questions,
        // NOTE: TestResult.jsx reads this back out as `timeSpent`, not
        // `timeSpentSeconds` — sending the wrong key here was resetting
        // the displayed time to 0 whenever you navigated back to Results.
        timeSpent: r.timeSpentSeconds,
      },
    });

  const handleDownloadReport = () => {
    const html = generateFullReportHtml({ test, analysis });
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeTitle = (test?.title || test?.examName || r.testTitle || "Analysis")
      .toString()
      .trim()
      .replace(/\s+/g, "_");
    link.download = `${safeTitle}-Detailed-Analysis-Report.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const perfMetrics = [
    { label: "Score (%)", val: r.percentage },
    { label: "Accuracy (%)", val: r.accuracy },
    {
      label: "Attempted (%)",
      val:
        r.totalQuestions > 0
          ? clampPercent((r.attempted / r.totalQuestions) * 100)
          : 0,
    },
    { label: "Percentile", val: r.percentile },
  ];
  

  return (
    <div className="analysis-page">
      <div className="analysis-header">
        <div className="ah-left">
          <button className="back-btn" onClick={routeBackToResult}>
            Back
          </button>
          <h2>
            {test?.title ||
              test?.examName ||
              r.testTitle ||
              "Detailed Analysis"}
          </h2>
        </div>
        <button
          className="btn-outline download-btn"
          onClick={handleDownloadReport}
        >
          Download Report
        </button>
      </div>

      <div className="analysis-tabs">
        {tabs.map((t) => (
          <button
            key={t}
            className={`analysis-tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="analysis-body">
        {tab === "Overview" && (
          <div className="analysis-overview">
            <div className="ao-charts">
              <div className="ao-chart-card">
                <h4>Performance Overview</h4>
                <div className="perf-bars">
                  {perfMetrics.map((b) => (
                    <div key={b.label} className="perf-bar-col">
                      <div className="pbc-track">
                        <div
                          className="pbc-fill"
                          style={{ height: `${clampPercent(b.val)}%` }}
                        />
                        <span className="pbc-val">{clampPercent(b.val)}</span>
                      </div>
                      <span className="pbc-label">{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="ao-chart-card">
                <h4>Answer Split</h4>
                <div className="donut-wrap">
                  <svg viewBox="0 0 120 120" className="donut-svg">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#eee"
                      strokeWidth="16"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#6C63FF"
                      strokeWidth="16"
                      strokeDasharray={`${r.totalQuestions ? (r.correct / r.totalQuestions) * 314 : 0} 314`}
                      strokeDashoffset="78.5"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#FF6B6B"
                      strokeWidth="16"
                      strokeDasharray={`${r.totalQuestions ? (r.incorrect / r.totalQuestions) * 314 : 0} 314`}
                      strokeDashoffset={`${78.5 - (r.totalQuestions ? (r.correct / r.totalQuestions) * 314 : 0)}`}
                    />
                  </svg>
                  <div className="donut-center">{r.accuracy}%</div>
                </div>
                <div className="donut-legend">
                  <span>
                    <span
                      className="dl-dot"
                      style={{ background: "#6C63FF" }}
                    />{" "}
                    Correct ({r.correct})
                  </span>
                  <span>
                    <span
                      className="dl-dot"
                      style={{ background: "#FF6B6B" }}
                    />{" "}
                    Incorrect ({r.incorrect})
                  </span>
                  <span>
                    <span className="dl-dot" style={{ background: "#eee" }} />{" "}
                    Unattempted ({r.unattempted})
                  </span>
                </div>
              </div>
            </div>
            <div className="ao-section">
              <h4>Section Summary</h4>
              <div className="subject-summary-table">
                <div className="sst-head">
                  <span>Section</span>
                  <span>Questions</span>
                  <span>Attempted</span>
                  <span>Correct</span>
                  <span>Incorrect</span>
                  <span>Score</span>
                  <span>Accuracy</span>
                </div>
                {subjects.map((s, idx) => (
                  <div key={s.name || idx} className="sst-row">
                    <span className="sst-name">{s.name}</span>
                    <span>{s.questions}</span>
                    <span>{s.attempted}</span>
                    <span className="green">{s.correct}</span>
                    <span className="red">{s.incorrect}</span>
                    <span>
                      {s.score}/{s.total}
                    </span>
                    <span
                      className={
                        s.accuracy >= 75
                          ? "green"
                          : s.accuracy >= 60
                            ? "orange"
                            : "red"
                      }
                    >
                      {s.accuracy}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {analysis.topicBreakdown.length > 0 && (
              <div className="ao-section">
                <h4>Topic Breakdown</h4>
                <div className="topic-bars">
                  {analysis.topicBreakdown.map((topic) => (
                    <div key={topic.topic} className="topic-bar-row">
                      <span className="tb-label">{topic.topic}</span>
                      <div className="tb-track">
                        <div
                          className="tb-fill"
                          style={{
                            width: `${topic.score}%`,
                            background:
                              topic.score >= 70
                                ? "#00BFA6"
                                : topic.score >= 45
                                  ? "#FFA726"
                                  : "#FF6B6B",
                          }}
                        />
                      </div>
                      <span className="tb-val">{topic.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "Question Analysis" && (
          <div className="qa-section">
            <h4>Question-wise Analysis</h4>
            {analysis.questionRows.length === 0 ? (
              <div
                className="empty-state"
                style={{ padding: "40px 20px", textAlign: "center" }}
              >
                <div className="empty-icon">📭</div>
                <p>No question data available.</p>
              </div>
            ) : (
              <div className="qa-table">
                <div className="qat-head">
                  <span>#</span>
                  <span>Question</span>
                  <span>Topic</span>
                  <span>Your Answer</span>
                  <span>Correct Answer</span>
                  <span>Status</span>
                </div>
                {analysis.questionRows.map((row) => {
                  const style = ROW_STYLES[row.status] || ROW_STYLES.answered;
                  return (
                    <div key={row.id} className="qat-row" style={style.row}>
                      <span style={style.text}>{row.number}</span>
                      <span className="qat-q" style={style.text}>
                        <MathJax dynamic onTypeset={() => setIsReady(true)}>
                          {row.text.length > 70
                            ? `${row.text.substring(0, 70)}...`
                            : row.text}
                        </MathJax>
                      </span>
                      <span className="qat-topic">{row.topic}</span>
                      {/* Your Answer — red if wrong, green if correct, grey if skipped */}
                      <span style={style.text}>
                        <MathJax dynamic onTypeset={() => setIsReady(true)}>
                          {row.selectedOptionText}
                        </MathJax>
                      </span>
                      {/* Correct Answer — always green */}
                      <span style={{ color: "#00BFA6", fontWeight: 500, opacity: isReady ? 1 : 0, transition: "opacity 0.2s" }}>
                        <MathJax dynamic onTypeset={() => setIsReady(true)}>
                          {row.correctOptionText}
                        </MathJax>
                      </span>
                      <span style={style.badge}>
                        {statusLabels[row.status] || "Answered"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "Subject Analysis" && (
          <div className="subject-analysis">
            {subjects.map((s, idx) => (
              <div key={s.name || idx} className="sa-card">
                <div className="sa-header">
                  <h4>{s.name}</h4>
                  <span
                    className={`sa-acc ${s.accuracy >= 75 ? "green" : s.accuracy >= 60 ? "orange" : "red"}`}
                  >
                    {s.accuracy}% Accuracy
                  </span>
                </div>
                <div className="sa-stats">
                  <div className="sa-stat">
                    <div className="sa-stat-val">{s.correct}</div>
                    <div className="sa-stat-lbl">Correct</div>
                  </div>
                  <div className="sa-stat">
                    <div className="sa-stat-val red">{s.incorrect}</div>
                    <div className="sa-stat-lbl">Incorrect</div>
                  </div>
                  <div className="sa-stat">
                    <div className="sa-stat-val">{s.unattempted}</div>
                    <div className="sa-stat-lbl">Skipped</div>
                  </div>
                  <div className="sa-stat">
                    <div className="sa-stat-val">
                      {s.score}/{s.total}
                    </div>
                    <div className="sa-stat-lbl">Score</div>
                  </div>
                </div>
                <div className="sa-bar-track">
                  <div
                    className="sa-bar-fill correct-fill"
                    style={{
                      width: `${s.questions ? (s.correct / s.questions) * 100 : 0}%`,
                    }}
                  />
                  <div
                    className="sa-bar-fill incorrect-fill"
                    style={{
                      width: `${s.questions ? (s.incorrect / s.questions) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Time Analysis" && (
          <div className="time-analysis">
            <div className="ta-summary">
              <div className="tas-card">
                <div className="tas-val">{analysis.timeAnalysis.total}</div>
                <div className="tas-lbl">Total Time Taken</div>
              </div>
              <div className="tas-card">
                <div className="tas-val">
                  {analysis.timeAnalysis.avgPerQuestion}
                </div>
                <div className="tas-lbl">Avg per Question</div>
              </div>
              <div className="tas-card">
                <div className="tas-val">
                  {analysis.timeAnalysis.avgCorrect}
                </div>
                <div className="tas-lbl">Avg Correct Answer</div>
              </div>
              <div className="tas-card">
                <div className="tas-val">
                  {analysis.timeAnalysis.avgIncorrect}
                </div>
                <div className="tas-lbl">Avg Wrong Answer</div>
              </div>
            </div>
            <div className="ta-table-section">
              <h4>Time per Section</h4>
              {analysis.timeAnalysis.sectionRows.map((row) => (
                <div key={row.name} className="ta-row">
                  <span>{row.name}</span>
                  <div className="ta-bar-track">
                    <div
                      className="ta-bar-fill"
                      style={{
                        width: `${row.percent}%`,
                        background: row.color,
                      }}
                    />
                  </div>
                  <span>{row.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Compare" && (
          <div className="compare-section">
            <h4>Your Performance vs Average</h4>
            <div className="compare-table">
              <div className="ct-head">
                <span>Metric</span>
                <span>You</span>
                <span>Average</span>
                <span>Top 10%</span>
              </div>
              {analysis.compareData.map((row) => (
                <div key={row.metric} className="ct-row">
                  <span className="ct-metric">{row.metric}</span>
                  <span className="ct-you">{row.you}</span>
                  <span>{row.avg}</span>
                  <span className="ct-top">{row.top}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="analysis-footer-actions">
        <button className="btn-outline" onClick={routeBackToResult}>
          Back to Results
        </button>
        <button className="btn-primary" onClick={() => navigate("/tests")}>
          Browse More Tests
        </button>
      </div>
    </div>
  );
}