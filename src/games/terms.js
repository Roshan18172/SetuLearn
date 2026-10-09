import api from "../api/axios";
import { FALLBACK_TERMS } from "./fallbackTerms";
import { prettyAnswer, shuffle, toLetters } from "./utils";

const normalise = (t) => ({
  answer: prettyAnswer(t.answer),
  letters: toLetters(t.answer),
  clue: t.clue,
  subject: t.subject || null,
  topic: t.topic || null,
});

/**
 * Terms for the games. Real terms come from the mock-test question bank (GET /games/terms);
 * if there are not enough of them (or the request fails) the built-in vocabulary fills the gap.
 * @returns {{ terms: object[], source: "tests" | "mixed" | "builtin" }}
 */
export async function loadTerms({ subjectId, min = 12, limit = 80 } = {}) {
  let fromTests = [];
  try {
    const res = await api.get("/games/terms", { params: { ...(subjectId ? { subjectId } : {}), limit } });
    fromTests = (res.data?.data?.terms || []).map(normalise);
  } catch {
    /* offline / backend without the games route: use the built-in list */
  }

  const seen = new Set(fromTests.map((t) => t.letters));
  let terms = fromTests;
  let source = "tests";
  if (terms.length < min) {
    const filler = shuffle(FALLBACK_TERMS.map(normalise)).filter((t) => !seen.has(t.letters));
    terms = [...fromTests, ...filler.slice(0, Math.max(min, 30) - fromTests.length)];
    source = fromTests.length ? "mixed" : "builtin";
  }
  return { terms: terms.filter((t) => t.letters.length >= 3), source };
}
