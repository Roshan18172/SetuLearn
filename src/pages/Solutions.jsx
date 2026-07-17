import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { MathJax } from "better-react-mathjax";

/**
 * The `questions` array (built while the test is in progress) never contains
 * the correct answer — the backend correctly withholds it until submission.
 * The real correct-answer AND explanation data only live in the submitted
 * result's `questionAnalysis[]`. This builds a questionId -> { correct,
 * explanation } lookup from that data so Solutions can highlight answers
 * and show explanations properly.
 */
function buildQuestionInfoMap(result) {
  const map = {};
  const submissions = Array.isArray(result) ? result : result ? [result] : [];

  submissions.forEach((sub) => {
    const questionAnalysis =
      sub?.questionAnalysis || sub?.data?.questionAnalysis || [];
    if (!Array.isArray(questionAnalysis)) return;

    questionAnalysis.forEach((item) => {
      if (!item?.questionId) return;
      map[item.questionId] = {
        correctId: item.correctOption?.id,
        correctText: item.correctOption?.text,
        explanation: item.explanation || "",
      };
    });
  });

  return map;
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
 * Builds a standalone, downloadable HTML document with every question,
 * options (correct answer highlighted, your answer flagged), and
 * explanation. Includes the MathJax CDN script so LaTeX in questions
 * renders when the file is opened in a browser.
 */
function generateSolutionsHtml(test, questions, answers, infoMap) {
  const cards = questions
    .map((q, index) => {
      const userSelectedId = answers[q.id];
      const info = infoMap[q.id] || {};
      const correctId = info.correctId ?? q.correct ?? q.correctOptionId;
      const correctText = info.correctText ?? q.correctOptionText;
      const explanation = info.explanation || q.explanation || "";

      const optionsHtml = (q.options || [])
        .map((opt) => {
          const isCorrect = correctId
            ? String(opt.id) === String(correctId)
            : correctText
              ? String(opt.text).trim() === String(correctText).trim()
              : false;
          const isSelected = String(opt.id) === String(userSelectedId);

          let cls = "opt";
          let tag = "";
          if (isCorrect && isSelected) {
            cls += " correct";
            tag = " &#10003; Your Answer";
          } else if (isCorrect) {
            cls += " correct";
            tag = " &#10003; Correct";
          } else if (isSelected) {
            cls += " wrong";
            tag = " &#10007; Your Answer";
          }

          return `<div class="${cls}">${escapeHtml(opt.text)}${tag}</div>`;
        })
        .join("\n");

      return `
        <div class="q-card">
          <h3>Q${index + 1}. ${escapeHtml(q.text)}</h3>
          <div class="opts">${optionsHtml}</div>
          ${
            explanation
              ? `<div class="explanation"><b>Explanation:</b> ${escapeHtml(explanation)}</div>`
              : ""
          }
        </div>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(test.title || "Exam")} - Solutions</title>
<script>
  window.MathJax = { tex: { inlineMath: [["$", "$"]] } };
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<style>
  body { font-family: Arial, sans-serif; max-width: 860px; margin: 30px auto; padding: 0 20px; color: #222; }
  h1 { font-size: 24px; margin-bottom: 24px; }
  .q-card { background: #fff; border-radius: 12px; padding: 20px; margin-bottom: 18px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
  .q-card h3 { margin-bottom: 14px; }
  .opts { display: flex; flex-direction: column; gap: 10px; }
  .opt { padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; background: #fafafa; }
  .opt.correct { background: #e8fff0; border: 2px solid #22c55e; color: #15803d; font-weight: 600; }
  .opt.wrong { background: #fef2f2; border: 2px solid #ef4444; color: #b91c1c; font-weight: 600; }
  .explanation { margin-top: 14px; padding: 12px 14px; background: #f3f4f6; border-radius: 8px; font-size: 14px; }
</style>
</head>
<body>
  <h1>${escapeHtml(test.title || "Exam")} - Solutions</h1>
  ${cards}
</body>
</html>`;
}

export default function Solutions() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  // 1. Destructure 'questions' directly from state, plus 'result' which
  // carries the actual correct-answer + explanation data (questionAnalysis)
  const { test, answers = {}, questions = [], result } = location.state || {};

  // 2. Guard clause: check if questions exist
  if (!test || !questions || questions.length === 0) {
    return (
      <div className="empty-state">
        <h2>No Solutions Found</h2>
        <button className="btn-primary" onClick={() => navigate("/tests")}>
          {" "}
          Browse Tests{" "}
        </button>
      </div>
    );
  }

  const questionInfoMap = buildQuestionInfoMap(result);

  document.title = `${test?.title || "Exam"} Solutions - SetuLearn`;

  const handleDownload = () => {
    const html = generateSolutionsHtml(test, questions, answers, questionInfoMap);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeTitle = (test.title || test.examName || "solutions")
      .toString()
      .trim()
      .replace(/\s+/g, "_");
    link.download = `${safeTitle}-Solutions.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="solution-page">
      <div className="solution-header">
        <button className="btn-outline" onClick={() => navigate(-1)}>
          {" "}
          ← Back{" "}
        </button>
        <h1>{test.title || "Exam"} - Solutions</h1>
        <button
          className="btn-primary"
          style={{ marginLeft: "auto" }}
          onClick={handleDownload}
        >
          ⬇ Download Solutions
        </button>
      </div>

      {/* 3. Map over the 'questions' array directly */}
      {questions.map((q, index) => {
        const userSelectedId = answers[q.id];

        // Prefer the correct-answer / explanation data resolved from the
        // submitted result; fall back to anything already on the question.
        const info = questionInfoMap[q.id] || {};
        const correctId = info.correctId ?? q.correct ?? q.correctOptionId;
        const correctText = info.correctText ?? q.correctOptionText;
        const explanation = info.explanation || q.explanation || "";

        return (
          <div key={q.id} className="solution-card">
            <h3
              className="solution-question"
              style={{
                opacity: isReady ? 1 : 0,
                transition: "opacity 0.2s ease-in-out",
              }}
            >
              Q{index + 1}.{" "}
              <MathJax dynamic onTypeset={() => setIsReady(true)}>
                {q.text}
              </MathJax>
            </h3>

            <div className="solution-options">
              {q.options.map((opt) => {
                // Match by option id when we have one; otherwise fall back
                // to matching option text against the correct option's text.
                const isCorrect = correctId
                  ? String(opt.id) === String(correctId)
                  : correctText
                    ? String(opt.text).trim() === String(correctText).trim()
                    : false;
                // FIX: Coerce both to String to avoid type mismatch (e.g., 1 vs "1")
                const isSelected = String(opt.id) === String(userSelectedId);

                let className = "option-item";
                if (isCorrect) className += " correct-answer";
                else if (isSelected && !isCorrect) className += " wrong-answer";

                return (
                  <div
                    key={opt.id}
                    className={className}
                    style={{
                      opacity: isReady ? 1 : 0,
                      transition: "opacity 0.2s ease-in-out",
                    }}
                  >
                    <MathJax dynamic onTypeset={() => setIsReady(true)}>
                      {opt.text}
                    </MathJax>
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

            {/* Explanation shown after all options for this question */}
            {explanation && (
              <div
                className="solution-explanation"
                style={{
                  marginTop: "16px",
                  padding: "14px 16px",
                  background: "#f3f4f6",
                  borderRadius: "8px",
                  fontSize: "14px",
                  lineHeight: 1.5,
                  opacity: isReady ? 1 : 0,
                  transition: "opacity 0.2s ease-in-out",
                }}
              >
                <b>Explanation: </b>
                <MathJax dynamic onTypeset={() => setIsReady(true)}>
                  {explanation}
                </MathJax>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}