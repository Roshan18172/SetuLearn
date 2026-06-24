// src/utils/analysisUtils.js

export const processAnalysisData = (result, questions, answers) => {
  if (!result || !result.subjects) return null;

  const subjects = result.subjects.map((s) => ({
    ...s,
    // Add any extra computed fields here if needed
    accuracy: s.accuracy || 0
  }));

  const compareData = [
    { metric: "Score", you: `${result.score}/${result.totalMarks}`, avg: "185/300", top: "268/300" },
    { metric: "Accuracy", you: `${result.scorePercent}%`, avg: "62%", top: "89%" },
    { metric: "Percentile", you: result.percentile, avg: "50", top: "90+" },
    ...subjects.map((s) => ({
      metric: `${s.name} Score`,
      you: `${s.score}/${s.total}`,
      avg: `${Math.floor(s.total * 0.6)}/${s.total}`,
      top: `${Math.floor(s.total * 0.9)}/${s.total}`,
    })),
  ];

  return { subjects, compareData };
};