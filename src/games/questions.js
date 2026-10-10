import api from "../api/axios";
import BUILTIN from "./builtinQuestions.json";
import { shuffle } from "./utils";

/** The builtin bank lists the correct option first; shuffle so position carries no hint. */
const fromBuiltin = (b, i) => {
  const opts = shuffle(b.options.map((text, k) => ({ text, ok: k === 0 })));
  return { id: `builtin-${i}`, text: b.text, imageUrl: null, options: opts.map((o) => o.text), correct: opts.findIndex((o) => o.ok), subject: b.subject };
};

/**
 * Multiple-choice questions for the quiz-style games. They come from the mock-test question bank
 * (GET /games/questions); built-in general-knowledge questions top the pool up.
 * @returns {{ questions: object[], source: "tests" | "mixed" | "builtin" }}
 */
export async function loadQuestions({ subjectId, limit = 40, min = 12 } = {}) {
  let fromTests = [];
  try {
    const res = await api.get("/games/questions", { params: { ...(subjectId ? { subjectId } : {}), limit } });
    fromTests = (res.data?.data?.questions || []).filter((q) => !q.builtin);
  } catch {
    /* backend without the games routes / offline: use the built-in questions */
  }
  let questions = fromTests;
  let source = "tests";
  if (questions.length < min) {
    const seen = new Set(fromTests.map((q) => q.text.toLowerCase()));
    const filler = shuffle(BUILTIN.map(fromBuiltin)).filter((q) => !seen.has(q.text.toLowerCase()));
    questions = [...fromTests, ...filler.slice(0, Math.max(min, 20) - fromTests.length)];
    source = fromTests.length ? "mixed" : "builtin";
  }
  return { questions: shuffle(questions), source };
}
