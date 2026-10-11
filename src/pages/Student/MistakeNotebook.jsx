import { useCallback, useEffect, useState } from "react";
import studyService from "../../api/studyService";
import { getErrorMessage } from "../../api/apiErrorHandler";
import MathContent from "../../components/MathContent";
import QuestionImage from "../../components/QuestionImage";
import QuestionActions from "../../components/study/QuestionActions";
import AdminPagination from "../Admin/AdminPagination";
import "../../components/study/study.css";

const box = (n) => ["New", "Learning", "Familiar", "Strong", "Almost there", "Mastered"][Math.min(n, 5)];
const fmtDue = (d) => {
  const diff = Math.round((new Date(d) - Date.now()) / 86400000);
  return diff <= 0 ? "Due now" : `Due in ${diff} day${diff === 1 ? "" : "s"}`;
};

function Options({ q, chosen, result, onPick }) {
  return (
    <div className="study-opts">
      {q.options.map((o) => {
        const correctId = result?.correctOptionId ?? (onPick ? null : q.options.find((x) => x.isCorrect)?.id);
        const right = correctId === o.id;
        const wrong = result && chosen === o.id && !right;
        return (
          <button key={o.id} type="button" disabled={!onPick || !!result} onClick={() => onPick?.(o.id)}
            className={`study-opt ${(result || !onPick) && right ? "right" : ""} ${wrong ? "wrong" : ""}`}>
            <MathContent text={o.text} />
            <QuestionImage src={o.imageUrl} alt="Option figure" maxHeight={120} />
          </button>
        );
      })}
    </div>
  );
}

function Revise({ summary, onDone }) {
  const [queue, setQueue] = useState(null);
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [result, setResult] = useState(null);
  const [right, setRight] = useState(0);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (all) => {
    setError(""); setQueue(null); setI(0); setChosen(null); setResult(null); setRight(0); setFinished(false);
    try { setQueue(await studyService.reviewDue({ limit: 10, all: all ? "true" : "false" })); } catch (e) { setError(getErrorMessage(e)); setQueue([]); }
  }, []);
  useEffect(() => { load(false); }, [load]);

  const pick = async (optionId) => {
    const q = queue[i];
    setChosen(optionId);
    try {
      const r = await studyService.reviewAnswer(q.id, optionId, "review");
      setResult(r);
      if (r.correct) setRight((n) => n + 1);
    } catch (e) { setError(getErrorMessage(e)); }
  };
  const next = () => {
    if (i + 1 >= queue.length) { setFinished(true); onDone?.(); return; }
    setI(i + 1); setChosen(null); setResult(null);
  };

  if (!queue) return <div className="admin-loading">Loading…</div>;
  if (error) return <div className="admin-error-box">{error}</div>;
  if (finished) {
    return (
      <div className="admin-card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "3rem" }}>🎉</div>
        <h2>Revision done!</h2>
        <p>You got <b>{right}</b> of <b>{queue.length}</b> right. Questions you missed come back tomorrow; the ones you got right come back later.</p>
        <button className="admin-btn admin-btn-primary" onClick={() => load(false)}>Check for more</button>
      </div>
    );
  }
  if (!queue.length) {
    return (
      <div className="admin-card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "3rem" }}>{summary?.total ? "✅" : "📓"}</div>
        <h2>{summary?.total ? "Nothing due right now!" : "Your notebook is empty"}</h2>
        <p>{summary?.total ? "You're all caught up. Come back tomorrow, or revise early." : "Questions you get wrong in tests, practice and the daily challenge are saved here automatically."}</p>
        {summary?.total > 0 && <button className="admin-btn" onClick={() => load(true)}>Revise anyway</button>}
      </div>
    );
  }

  const q = queue[i];
  return (
    <div className="study-q">
      <div className="row-split"><span>Question {i + 1} of {queue.length}</span><span>{right} correct so far</span></div>
      <div className="study-bar" style={{ marginBottom: 12 }}><div style={{ width: `${(i / queue.length) * 100}%` }} /></div>
      <div className="study-meta">
        {q.subject && <span className="study-pill">{q.subject}</span>}
        {q.topic && <span className="study-pill">{q.topic}</span>}
        <span className="study-pill warn">Missed {q.timesWrong}×</span>
        <span className="study-pill">{box(q.box)}</span>
      </div>
      <div className="study-q-text"><MathContent text={q.text} /><QuestionImage src={q.imageUrl} alt="Question figure" /></div>
      <Options q={q} chosen={chosen} result={result} onPick={pick} />
      {result && (
        <>
          <div className={`study-expl`}>
            <b>{result.correct ? "✔ Correct!" : "✘ Not quite."}</b>{" "}
            {result.schedule && (result.schedule.mastered ? "You've mastered this one! 🏆" : `You'll see it again: ${fmtDue(result.schedule.dueAt).toLowerCase()}.`)}
            {(result.explanation || result.explanationImageUrl) && (
              <div style={{ marginTop: 6 }}><MathContent text={result.explanation} /><QuestionImage src={result.explanationImageUrl} alt="Solution figure" /></div>
            )}
          </div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <QuestionActions questionId={q.id} />
            <button className="admin-btn admin-btn-primary" onClick={next}>{i + 1 >= queue.length ? "Finish" : "Next →"}</button>
          </div>
        </>
      )}
    </div>
  );
}

function QuestionList({ fetcher, empty, showStatus }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    setData(null);
    fetcher(page).then((d) => alive && setData(d)).catch((e) => alive && setError(getErrorMessage(e)));
    return () => { alive = false; };
  }, [fetcher, page]);

  if (error) return <div className="admin-error-box">{error}</div>;
  if (!data) return <div className="admin-loading">Loading…</div>;
  if (!data.items.length) return <div className="admin-empty">{empty}</div>;
  return (
    <>
      {data.items.map((q) => (
        <div className="study-q" key={q.id}>
          <div className="study-meta">
            {q.subject && <span className="study-pill">{q.subject}</span>}
            {showStatus && <span className={`study-pill ${q.mastered ? "good" : "warn"}`}>{q.mastered ? "Mastered" : `${box(q.box)} · ${fmtDue(q.dueAt)}`}</span>}
            {showStatus && <span className="study-pill">Wrong {q.timesWrong}× · Right {q.timesRight}×</span>}
          </div>
          <div className="study-q-text"><MathContent text={q.text} /><QuestionImage src={q.imageUrl} alt="Question figure" maxHeight={200} /></div>
          <button className="admin-btn" onClick={() => setOpen(open === q.id ? null : q.id)}>{open === q.id ? "Hide answer" : "Show answer & solution"}</button>
          {open === q.id && (
            <>
              <div style={{ marginTop: 10 }}><Options q={q} /></div>
              {(q.explanation || q.explanationImageUrl) && (
                <div className="study-expl"><MathContent text={q.explanation} /><QuestionImage src={q.explanationImageUrl} alt="Solution figure" /></div>
              )}
            </>
          )}
          <QuestionActions questionId={q.id} />
        </div>
      ))}
      <AdminPagination page={page} totalPages={data.pagination.totalPages} totalItems={data.pagination.total} pageSize={data.pagination.limit} onPageChange={setPage} />
    </>
  );
}

export default function MistakeNotebook() {
  document.title = "Mistake Notebook - SetuLearn";
  const [tab, setTab] = useState("revise");
  const [filter, setFilter] = useState("all");
  const [summary, setSummary] = useState(null);
  const refresh = useCallback(() => studyService.reviewSummary().then(setSummary).catch(() => undefined), []);
  useEffect(() => { refresh(); }, [refresh]);

  const mistakesFetcher = useCallback((page) => studyService.reviewList({ filter, page, limit: 10 }), [filter]);
  const bookmarksFetcher = useCallback((page) => studyService.bookmarkList({ page, limit: 10 }), []);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Mistake Notebook</h1>
          <p className="admin-page-sub">Every question you got wrong, scheduled for revision at the right time so it sticks</p>
        </div>
      </div>

      {summary && (
        <div className="study-cards">
          <div className={`study-card ${summary.due ? "hot" : ""}`}><b>{summary.due}</b><span>Due for revision now</span></div>
          <div className="study-card"><b>{summary.learning}</b><span>Still learning</span></div>
          <div className="study-card"><b>{summary.mastered}</b><span>Mastered 🏆</span></div>
          <div className="study-card"><b>{summary.bookmarks}</b><span>Bookmarked ⭐</span></div>
        </div>
      )}

      <div className="study-tabs" role="tablist">
        {[["revise", "Revise now"], ["mistakes", "All mistakes"], ["bookmarks", "Bookmarks"]].map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={`study-tab ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === "revise" && <Revise summary={summary} onDone={refresh} />}
      {tab === "mistakes" && (
        <>
          <div className="chips" style={{ marginBottom: 12, display: "flex", gap: 8 }}>
            {[["all", "All"], ["due", "Due now"], ["mastered", "Mastered"]].map(([v, l]) => (
              <button key={v} className={`admin-btn ${filter === v ? "admin-btn-primary" : ""}`} onClick={() => setFilter(v)}>{l}</button>
            ))}
          </div>
          <QuestionList key={filter} fetcher={mistakesFetcher} empty="No mistakes here - keep it up!" showStatus />
        </>
      )}
      {tab === "bookmarks" && <QuestionList fetcher={bookmarksFetcher} empty="You haven't bookmarked any questions yet. Tap ☆ Save on a question to keep it here." />}
    </div>
  );
}
