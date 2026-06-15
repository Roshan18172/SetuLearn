export function calculateResult(
  questions,
  answers,
  test,
  timeTakenSeconds
) {
  let correctCount = 0;
  let incorrectCount = 0;
  let unattempted = 0;

  const topicStats = {};
  const subjectStats = {};

  questions.forEach((q) => {
    const userAnswer = answers[q.id];

    if (!subjectStats[q.topic]) {
      subjectStats[q.topic] = {
        name: q.topic,
        questions: 0,
        attempted: 0,
        correct: 0,
        incorrect: 0,
        score: 0,
        total: 0,
      };
    }

    if (!topicStats[q.topic]) {
      topicStats[q.topic] = {
        topic: q.topic,
        total: 0,
        correct: 0,
      };
    }

    subjectStats[q.topic].questions += 1;
    subjectStats[q.topic].total += 4;

    topicStats[q.topic].total += 1;

    if (!userAnswer) {
      unattempted++;
      return;
    }

    subjectStats[q.topic].attempted++;

    if (userAnswer === q.correct) {
      correctCount++;

      subjectStats[q.topic].correct++;
      subjectStats[q.topic].score += 4;

      topicStats[q.topic].correct++;
    } else {
      incorrectCount++;

      subjectStats[q.topic].incorrect++;

      if (
        test.exam.includes("JEE") ||
        test.exam.includes("NEET") ||
        test.exam.includes("SSC") ||
        test.exam.includes("UPSC")
      ) {
        subjectStats[q.topic].score -= 1;
      }
    }
  });

  const score =
    correctCount * 4 -
    incorrectCount * 1;

  const totalMarks =
    questions.length * 4;

  const scorePercent = Math.max(
    0,
    Math.round(
      (score / totalMarks) * 100
    )
  );

  const subjects = Object.values(
    subjectStats
  ).map((s) => ({
    ...s,
    accuracy:
      s.attempted === 0
        ? 0
        : Math.round(
            (s.correct /
              s.attempted) *
              100
          ),
  }));

  const topicBreakdown =
    Object.values(topicStats).map(
      (t) => ({
        topic: t.topic,
        score: Math.round(
          (t.correct /
            t.total) *
            100
        ),
      })
    );

  const hrs = Math.floor(
    timeTakenSeconds / 3600
  );

  const mins = Math.floor(
    (timeTakenSeconds % 3600) /
      60
  );

  const secs =
    timeTakenSeconds % 60;

  const timeTaken = `${String(
    hrs
  ).padStart(2, "0")}:${String(
    mins
  ).padStart(2, "0")}:${String(
    secs
  ).padStart(2, "0")}`;

  return {
    testId: test.id,
    testTitle: test.title,
    score,
    totalMarks,
    scorePercent,
    correctCount,
    incorrectCount,
    unattempted,
    totalQuestions: questions.length,
    timeTaken,

    percentile: Math.min(
      99,
      Math.round(
        scorePercent +
          Math.random() * 8
      )
    ),

    subjects,

    topicBreakdown,
  };
}