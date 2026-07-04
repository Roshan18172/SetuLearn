/**
 * Maps backend API data shapes to the frontend's expected shape.
 * The frontend pages were built around demoData.js shapes.
 * This mapper transforms backend responses so existing pages work without major rewrites.
 */

/**
 * Map a backend exam to the frontend category shape.
 * @param {object} exam - Backend exam object
 * @returns {object} Frontend category object
 */
export function mapExamToCategory(exam) {
  return {
    id: exam.id,
    name: exam.name,
    icon: exam.icon ? `/icons/exam-icons/${exam.icon}.png` : "/icons/graduation-cap.png",
    exams: [], // populated later if needed
    tests: 0,
    color: getCategoryColor(exam.name),
    slug: exam.slug,
    description: exam.description,
  };
}

/**
 * Map a backend test to the frontend test shape.
 * @param {object} test - Backend test object
 * @param {string} examName - The exam/category name this test belongs to
 * @returns {object} Frontend test object
 */
export function mapTestToFrontend(test, examName = "") {
  return {
    id: test.id,
    title: test.title,
    category: examName || "",
    exam: examName,
    subject: "",
    questions: test.totalQuestions,
    duration: test.durationMinutes,
    difficulty: capitalizeDifficulty(test.difficulty),
    marks: test.totalMarks,
    tags: [],
    description: test.description || "",

    subjects: (test.subjects || []).map((subject) => ({
      id: subject.id,
      name: subject.name,
      questions: subject.count,
      marks: subject.count * 4,
    })),

    instructions: parseInstructions(test.instructions),
    attemptedBy: 0,
    avgScore: 0,
    negativeMarking: test.negativeMarking,
  };
}

/**
 * Map a backend question to the frontend question shape.
 * @param {object} q - Backend question object with options
 * @returns {object} Frontend question object
 */
export function mapQuestionToFrontend(q) {
  return {
    id: q.id,
    text: q.questionText,
    topic: q.topic?.name || q.subject?.name || "General",
    options: (q.options || []).map((opt) => ({
      id: opt.id,
      text: opt.optionText,
    })),
    correct: q.options?.find((opt) => opt.isCorrect)?.id || null,
    marks: q.marks,
    negativeMarks: q.negativeMarks,
    explanation: q.explanation || "",
  };
}

/**
 * Map backend submission/result to frontend result shape.
 * @param {object} result - Backend result object
 * @returns {object} Frontend result object
 */
export function mapResultToFrontend(result) {
  return {
    score: result.score,
    totalMarks: result.totalMarks,
    totalQuestions: result.totalQuestions,
    correctCount: result.totalCorrect,
    incorrectCount: result.totalIncorrect,
    unattempted: result.totalUnattempted,
    scorePercent: result.percentage,
    timeTaken: result.timeTaken ? `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s` : "0m 0s",
    percentile: result.percentile || 0,
    subjects: result.subjects || [],
    topicBreakdown: result.topicBreakdown || [],
    testTitle: result.testTitle || "",
    testId: result.testId || "",
  };
}

// ─── Helpers ────────────────────────────────────────────────

function capitalizeDifficulty(diff) {
  if (!diff) return "Medium";
  const map = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };
  return map[diff.toUpperCase()] || "Medium";
}

function parseInstructions(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    return raw.split("\n").filter(Boolean);
  }
  return ["Attempt all questions. Each question carries 4 marks. Wrong answers carry -1."];
}

function getCategoryColor(name) {
  const colorMap = {
    "Engineering Entrances": "#7c7c7c",
    "Management Entrances": "#4083ff",
    "Medical Entrances": "#00BFA6",
    "Railways Recruitment": "#31adff",
    "Teaching Eligibility": "#ff9151",
    "Higher Education & Research": "#2659ff",
    "Staff Selection": "#328dc2",
    "Banking & Insurance": "#ffd563",
    "Civil Services & Bureaucracy": "#ac63ff",
    "Defense Services": "#ff6363",
  };
  return colorMap[name] || "#5A1EAD";
}