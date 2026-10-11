import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import studyService from "../../api/studyService";
import { getErrorMessage } from "../../api/apiErrorHandler";
import MathContent from "../../components/MathContent";
import QuestionImage from "../../components/QuestionImage";
import "../../components/study/study.css";

const Board = ({ rows }) => (
  <ol className="lb-list">
    {rows.length === 0 ? <li><span>Nobody yet - be the first!</span></li> : rows.map((r) => <li key={r.rank}><span>{r.rank}. {r.name}</span><b>{r.score}</b></li>)}
  </ol>
);

export default function DailyChallenge() {
  document.title = "Daily Challenge - SetuLearn";
  const [daily, setDaily] = useState(null);
  const [error, setError] = useState("");
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => { studyService.daily().then(setDaily).catch((e) => setError(getErrorMessage(e))); }, []);

  const submit = async () => {
    setBusy(true);
    try {
      const payload = daily.questions.map((q) => ({ questionId: q.id, optionId: answers[q.id] || null }));
      setResult(await studyService.submitDaily(payload));
    } catch (e) { setError(getErrorMessage(e)); } finally { setBusy(false); }
  };

  if (error) return <div className="admin-page"><div className="admin-error-box">{error}</div></div>;
  if (!daily) return <div className="admin-page"><div className="admin-loading">Loading today's challenge…</div></div>;

  const head = (
    <div className="admin-page-header">
      <div>
        <h1>📅 Daily Challenge</h1>
        <p className="admin-page-sub">{daily.date} · 5 questions · same for every student · one try a day</p>
      </div>
      <span className="study-pill">🔥 {result?.streak ?? daily.streak}-day challenge streak</span>
    </div>
  );

  if (!daily.available) {
    return <div className="admin-page">{head}<div className="admin-card">Today's challenge isn't ready yet - the question bank needs at least 5 suitable questions. Check back soon!</div></div>;
  }

  // ----- results (just submitted) -----
  if (result) {
    return (
      <div className="admin-page">
        {head}
        <div className="admin-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem" }}>{result.correct === result.total ? "🏆" : "🎉"}</div>
          <h2>{result.correct}/{result.total} correct · {result.score} points</h2>
          {result.perfectBonus > 0 && <p>Perfect score bonus: +{result.perfectBonus}!</p>}
          <p className="activity-sub">Questions you missed were added to your Mistake Notebook.</p>
          <Link className="admin-btn admin-btn-primary" to="/dashboard/notebook">Open notebook</Link>
        </div>
        {daily.questions.map((q, idx) => {
          const r = result.review[idx];
          return (
            <div className="study-q" key={q.id}>
              <div className="study-meta"><span className={`study-pill ${r.correct ? "good" : "warn"}`}>{r.correct ? "Correct" : r.chosenOptionId ? "Wrong" : "Skipped"}</span></div>
              <div className="study-q-text"><MathContent text={q.text} /><QuestionImage src={q.imageUrl} alt="Question figure" maxHeight={200} /></div>
              <div className="study-opts">
                {q.options.map((o) => (
                  <div key={o.id} className={`study-opt ${o.id === r.correctOptionId ? "right" : ""} ${o.id === r.chosenOptionId && !r.correct ? "wrong" : ""}`}><MathContent text={o.text} /></div>
                ))}
              </div>
              {(r.explanation || r.explanationImageUrl) && <div className="study-expl"><MathContent text={r.explanation} /><QuestionImage src={r.explanationImageUrl} alt="Solution figure" /></div>}
            </div>
          );
        })}
        <div className="admin-card"><h3 style={{ marginTop: 0 }}>Today's leaderboard</h3><Board rows={result.leaderboard} /></div>
      </div>
    );
  }

  // ----- already done today -----
  if (daily.done) {
    return (
      <div className="admin-page">
        {head}
        <div className="admin-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem" }}>✅</div>
          <h2>You finished today's challenge!</h2>
          <p>{daily.result.correct}/{daily.result.total} correct · {daily.result.score} points. Come back tomorrow for a new one.</p>
        </div>
        <div className="admin-card" style={{ marginTop: 14 }}><h3 style={{ marginTop: 0 }}>Today's leaderboard</h3><Board rows={daily.leaderboard} /></div>
      </div>
    );
  }

  // ----- playing -----
  const q = daily.questions[i];
  const answered = Object.keys(answers).length;
  return (
    <div className="admin-page">
      {head}
      <div className="study-q">
        <div className="row-split"><span>Question {i + 1} of {daily.questions.length}</span><span>{answered} answered</span></div>
        <div className="study-bar" style={{ marginBottom: 12 }}><div style={{ width: `${((i + 1) / daily.questions.length) * 100}%` }} /></div>
        {q.subject && <div className="study-meta"><span className="study-pill">{q.subject}</span></div>}
        <div className="study-q-text"><MathContent text={q.text} /><QuestionImage src={q.imageUrl} alt="Question figure" /></div>
        <div className="study-opts">
          {q.options.map((o) => (
            <button key={o.id} type="button" className={`study-opt ${answers[q.id] === o.id ? "right" : ""}`} style={answers[q.id] === o.id ? { background: "#efe8ff", borderColor: "#7a5cff" } : undefined}
              onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}><MathContent text={o.text} /></button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <button className="admin-btn" disabled={i === 0} onClick={() => setI(i - 1)}>← Back</button>
          {i + 1 < daily.questions.length ? (
            <button className="admin-btn admin-btn-primary" onClick={() => setI(i + 1)}>Next →</button>
          ) : (
            <button className="admin-btn admin-btn-primary" disabled={busy} onClick={submit}>{busy ? "Submitting…" : "Submit answers"}</button>
          )}
        </div>
        <p className="activity-sub" style={{ marginTop: 10 }}>You'll see the answers after you submit. You can only play once a day.</p>
      </div>
    </div>
  );
}
