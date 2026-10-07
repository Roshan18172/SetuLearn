import { useEffect, useMemo, useRef, useState } from "react";
import adminService from "../../api/adminService";
import { getErrorMessage } from "../../api/apiErrorHandler";
import { extractPdfStream } from "../../api/seedStreamService";
import MathContent from "../../components/MathContent";
import QuestionImage from "../../components/QuestionImage";

const LOG_ICON = { info: "ℹ️", success: "✅", error: "❌", progress: "⏳", complete: "🎉" };

function SourceBadge({ source, confidence }) {
  if (source === "pdf") return <span className="pdf-badge pdf-badge-pdf">from PDF</span>;
  if (source === "manual") return <span className="pdf-badge pdf-badge-pdf">set by you</span>;
  if (source === "ai")
    return (
      <span className={`pdf-badge pdf-badge-ai ${confidence === "low" ? "pdf-badge-warn" : ""}`}>
        AI generated{confidence ? ` · ${confidence}` : ""}
      </span>
    );
  return <span className="pdf-badge pdf-badge-warn">missing</span>;
}

function DraftCard({ draft, index, onChange, onRemove }) {
  const [editing, setEditing] = useState(false);
  const set = (patch) => onChange(index, { ...draft, ...patch });
  const setOption = (i, patch) =>
    set({ options: draft.options.map((o, k) => (k === i ? { ...o, ...patch } : o)) });
  const chooseCorrect = (label) =>
    set({
      correctOption: label,
      answerSource: draft.answerSource === "pdf" && draft.correctOption === label ? "pdf" : "manual",
      aiConfidence: undefined,
      options: draft.options.map((o) => ({ ...o, isCorrect: o.label === label })),
    });

  return (
    <div className={`pdf-draft ${draft.correctOption ? "" : "pdf-draft-incomplete"}`}>
      <div className="pdf-draft-head">
        <div className="pdf-draft-id">
          <strong>Q{draft.number || index + 1}</strong>
          <input
            className="pdf-id-input"
            value={draft.importId}
            onChange={(e) => set({ importId: e.target.value.trim() })}
            aria-label="Import ID"
          />
        </div>
        <div className="pdf-draft-actions">
          <button type="button" className="admin-btn admin-btn-sm" onClick={() => setEditing((v) => !v)}>
            {editing ? "Done" : "Edit text"}
          </button>
          <button type="button" className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => onRemove(index)}>
            Remove
          </button>
        </div>
      </div>

      {draft.warnings.map((w, i) => (
        <div key={i} className="pdf-warning">⚠️ {w}</div>
      ))}

      {/* question */}
      {editing ? (
        <textarea
          className="pdf-textarea"
          rows={3}
          value={draft.questionText}
          onChange={(e) => set({ questionText: e.target.value })}
        />
      ) : (
        <div className="pdf-question-text"><MathContent text={draft.questionText} /></div>
      )}
      {draft.questionImageUrl && (
        <div className="pdf-image-wrap">
          <QuestionImage src={draft.questionImageUrl} alt="Question figure" maxHeight={220} />
          <button type="button" className="pdf-link-btn" onClick={() => set({ questionImageUrl: null })}>
            remove image
          </button>
        </div>
      )}

      {/* options */}
      <div className="pdf-options">
        {draft.options.map((o, i) => (
          <label key={i} className={`pdf-option ${o.isCorrect ? "pdf-option-correct" : ""}`}>
            <input
              type="radio"
              name={`correct-${draft.importId}-${index}`}
              checked={o.isCorrect}
              onChange={() => chooseCorrect(o.label)}
            />
            <span className="pdf-option-label">{o.label}.</span>
            <span className="pdf-option-body">
              {editing ? (
                <input
                  className="pdf-option-input"
                  value={o.optionText}
                  onChange={(e) => setOption(i, { optionText: e.target.value })}
                />
              ) : (
                <MathContent text={o.optionText} />
              )}
              <QuestionImage src={o.optionImageUrl} alt={`Option ${o.label}`} maxHeight={110} />
            </span>
          </label>
        ))}
      </div>

      {/* answer + explanation */}
      <div className="pdf-meta-row">
        <span>
          Answer: <strong>{draft.correctOption || "—"}</strong>{" "}
          <SourceBadge source={draft.answerSource} confidence={draft.aiConfidence} />
        </span>
        <span>
          Explanation: <SourceBadge source={draft.explanationSource} />
        </span>
      </div>
      {editing ? (
        <textarea
          className="pdf-textarea"
          rows={3}
          placeholder="Explanation"
          value={draft.explanation || ""}
          onChange={(e) => set({ explanation: e.target.value })}
        />
      ) : (
        draft.explanation && (
          <div className="pdf-explanation"><MathContent text={draft.explanation} /></div>
        )
      )}
      {draft.explanationImageUrl && (
        <div className="pdf-image-wrap">
          <QuestionImage src={draft.explanationImageUrl} alt="Explanation figure" maxHeight={200} />
          <button type="button" className="pdf-link-btn" onClick={() => set({ explanationImageUrl: null })}>
            remove image
          </button>
        </div>
      )}
    </div>
  );
}

export default function QuestionSeedPdf() {
  const [file, setFile] = useState(null);
  const [importPrefix, setImportPrefix] = useState("");
  const [startNumber, setStartNumber] = useState(1);
  const [generateMissing, setGenerateMissing] = useState(true);

  const [extracting, setExtracting] = useState(false);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [stats, setStats] = useState(null);
  const [existing, setExisting] = useState([]);

  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [marks, setMarks] = useState(4);
  const [negativeMarks, setNegativeMarks] = useState(-1);
  const [source, setSource] = useState("");
  const [year, setYear] = useState("");
  const [overwrite, setOverwrite] = useState(false);

  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [problems, setProblems] = useState([]);
  const [success, setSuccess] = useState("");

  const streamRef = useRef(null);
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    (async () => {
      try {
        setSubjects((await adminService.getSubjects()) || []);
        const t = await adminService.getTopics({});
        setTopics(Array.isArray(t) ? t : t.topics || []);
      } catch (e) {
        /* the selects just stay empty */
      }
    })();
    return () => streamRef.current?.abort();
  }, []);

  const subjectTopics = useMemo(() => topics.filter((t) => t.subjectId === subjectId), [topics, subjectId]);

  const addLog = (type, message) =>
    setLogs((prev) => [...prev, { id: Date.now() + Math.random(), type, message }]);

  const startExtract = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setProblems([]);
    if (!file) return setError("Please choose a PDF file first");
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{1,60}$/.test(importPrefix.trim()))
      return setError("Enter an import ID prefix using letters, numbers, - or _ (e.g. SSC-GD-MOCK2)");

    setExtracting(true);
    setLogs([]);
    setProgress(null);
    setDrafts([]);
    setStats(null);
    streamRef.current = extractPdfStream(
      file,
      { importPrefix: importPrefix.trim(), startNumber: Number(startNumber) || 1, generateMissing },
      {
        onEvent: (ev) => {
          if (ev.type === "complete") return;
          addLog(ev.type, ev.message);
          if (ev.type === "progress" && ev.data?.percent !== undefined) setProgress(ev.data);
          if (ev.type === "error") setError(ev.message);
        },
        onError: (err) => {
          setError(err.message || "Extraction failed");
          setExtracting(false);
        },
        onComplete: (data) => {
          setExtracting(false);
          if (!data) return; // stream ended on an error event
          setDrafts(data.drafts || []);
          setStats(data.stats || null);
          setExisting(data.existingImportIds || []);
          setOverwrite(false);
          setProgress({ percent: 100 });
        },
      }
    );
  };

  const cancelExtract = () => {
    streamRef.current?.abort();
    setExtracting(false);
    addLog("error", "Cancelled");
  };

  const updateDraft = (i, next) => setDrafts((prev) => prev.map((d, k) => (k === i ? next : d)));
  const removeDraft = (i) => setDrafts((prev) => prev.filter((_, k) => k !== i));

  const missingAnswers = drafts.filter((d) => !d.correctOption).length;
  const duplicateIds = useMemo(() => {
    const seen = new Set();
    const dup = new Set();
    drafts.forEach((d) => (seen.has(d.importId) ? dup.add(d.importId) : seen.add(d.importId)));
    return dup;
  }, [drafts]);
  const existingInBatch = drafts.filter((d) => existing.includes(d.importId)).length;

  const doImport = async () => {
    setError("");
    setSuccess("");
    setProblems([]);
    if (!subjectId) return setError("Choose a subject for these questions");
    if (missingAnswers) return setError(`${missingAnswers} question(s) have no correct answer yet - select one or remove them`);
    if (duplicateIds.size) return setError(`Duplicate import IDs: ${[...duplicateIds].join(", ")}`);
    if (existingInBatch && !overwrite) return setError("Some import IDs already exist - tick 'overwrite' or change the prefix");

    setImporting(true);
    try {
      const res = await adminService.importPdfQuestions({
        subjectId,
        topicId: topicId || null,
        marks: Number(marks),
        negativeMarks: Number(negativeMarks),
        source: source.trim() || null,
        year: year ? Number(year) : null,
        overwrite,
        questions: drafts.map((d) => ({
          importId: d.importId,
          questionText: d.questionText,
          questionImageUrl: d.questionImageUrl,
          explanation: d.explanation,
          explanationImageUrl: d.explanationImageUrl,
          options: d.options.map((o) => ({
            optionText: o.optionText,
            optionImageUrl: o.optionImageUrl,
            isCorrect: o.isCorrect,
          })),
        })),
      });
      setSuccess(`Imported ${res.imported} questions${res.overwritten ? ` (${res.overwritten} overwritten)` : ""}.`);
      setDrafts([]);
      setStats(null);
      setFile(null);
    } catch (err) {
      setError(getErrorMessage(err));
      setProblems(err?.response?.data?.errors || []);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      {error && !extracting && <div className="admin-error-box">{error}</div>}
      {problems.length > 0 && (
        <div className="admin-error-box">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {problems.slice(0, 20).map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      )}
      {success && <div className="admin-success-box">{success}</div>}

      {/* Step 1: upload */}
      <div className="admin-card">
        <h2>1. Upload question paper PDF</h2>
        <p className="admin-card-sub">
          Questions, options, figures, answers and explanations are read from the PDF. Diagrams are cut out as
          images, maths is converted to MathJax ($…$), and anything the PDF does not contain (answers /
          explanations) is generated by AI and flagged for your review. Nothing is saved until you import.
        </p>
        <form onSubmit={startExtract}>
          <div className="pdf-form-grid">
            <div className="admin-form-group">
              <label>PDF file</label>
              <input type="file" accept="application/pdf,.pdf" disabled={extracting}
                onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <div className="admin-form-group">
              <label>Import ID prefix</label>
              <input type="text" placeholder="e.g. SSC-GD-MOCK2" value={importPrefix} disabled={extracting}
                onChange={(e) => setImportPrefix(e.target.value)} />
              <small className="pdf-hint">IDs become {importPrefix.trim() || "PREFIX"}-001, -002 …</small>
            </div>
            <div className="admin-form-group">
              <label>Start numbering at</label>
              <input type="number" min="1" value={startNumber} disabled={extracting}
                onChange={(e) => setStartNumber(e.target.value)} />
            </div>
          </div>
          <label className="pdf-check">
            <input type="checkbox" checked={generateMissing} disabled={extracting}
              onChange={(e) => setGenerateMissing(e.target.checked)} />
            Generate answers / explanations with AI when the PDF does not have them
          </label>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={extracting}>
              {extracting ? "Extracting…" : "Extract questions"}
            </button>
            {extracting && (
              <button type="button" className="admin-btn admin-btn-outline" onClick={cancelExtract}>Cancel</button>
            )}
          </div>
        </form>
      </div>

      {(extracting || logs.length > 0) && (
        <div className="admin-card">
          <h2>Progress</h2>
          {progress?.percent !== undefined && (
            <div className="pdf-progress"><div style={{ width: `${progress.percent}%` }} /></div>
          )}
          <div className="pdf-log">
            {logs.map((l) => (
              <div key={l.id} className={`pdf-log-line pdf-log-${l.type}`}>
                {LOG_ICON[l.type] || "•"} {l.message}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      )}

      {/* Step 2: review + import */}
      {drafts.length > 0 && (
        <>
          <div className="admin-card">
            <h2>2. Review {drafts.length} extracted questions</h2>
            {stats && (
              <p className="admin-card-sub">
                Answers: {stats.fromPdfAnswers} from PDF · {stats.aiAnswers} AI generated · {stats.missingAnswers} missing ·{" "}
                {stats.images} images cropped. Pick the correct option on any card to fix an answer; use “Edit text”
                to fix wording or maths.
              </p>
            )}
            {missingAnswers > 0 && <div className="pdf-warning">⚠️ {missingAnswers} question(s) still need a correct answer.</div>}
            {existingInBatch > 0 && (
              <div className="pdf-warning">
                ⚠️ {existingInBatch} import ID(s) already exist in the database and will be overwritten.{" "}
                <label className="pdf-check" style={{ display: "inline-flex" }}>
                  <input type="checkbox" checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)} /> overwrite
                </label>
              </div>
            )}
          </div>

          {drafts.map((d, i) => (
            <DraftCard key={`${d.importId}-${i}`} draft={d} index={i} onChange={updateDraft} onRemove={removeDraft} />
          ))}

          <div className="admin-card">
            <h2>3. Save to question bank</h2>
            <div className="pdf-form-grid">
              <div className="admin-form-group">
                <label>Subject *</label>
                <select value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setTopicId(""); }}>
                  <option value="">Select subject…</option>
                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="admin-form-group">
                <label>Topic (optional)</label>
                <select value={topicId} onChange={(e) => setTopicId(e.target.value)} disabled={!subjectId}>
                  <option value="">No topic</option>
                  {subjectTopics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="admin-form-group">
                <label>Marks</label>
                <input type="number" step="0.25" value={marks} onChange={(e) => setMarks(e.target.value)} />
              </div>
              <div className="admin-form-group">
                <label>Negative marks</label>
                <input type="number" step="0.25" value={negativeMarks} onChange={(e) => setNegativeMarks(e.target.value)} />
              </div>
              <div className="admin-form-group">
                <label>Source (optional)</label>
                <input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. SSC GD 2024" />
              </div>
              <div className="admin-form-group">
                <label>Year (optional)</label>
                <input type="number" value={year} onChange={(e) => setYear(e.target.value)} />
              </div>
            </div>
            <button type="button" className="admin-btn admin-btn-primary" onClick={doImport} disabled={importing}>
              {importing ? "Importing…" : `Import ${drafts.length} questions`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
