import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import adminService from "../../api/adminService";
import { getErrorMessage } from "../../api/apiErrorHandler";
import { formatDateTime } from "../../utils/activity";
import AdminPagination from "./AdminPagination";

const REASONS = { wrong_answer: "Answer looks wrong", typo: "Typo", unclear: "Unclear", image: "Image problem", other: "Other" };
const TABS = [["OPEN", "Open"], ["RESOLVED", "Resolved"], ["DISMISSED", "Dismissed"], ["", "All"]];

export default function QuestionReports() {
  document.title = "Question Reports - Admin";
  const [status, setStatus] = useState("OPEN");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState({});
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      setError("");
      setData(await adminService.getQuestionReports({ ...(status ? { status } : {}), page, limit: 15 }));
    } catch (e) { setError(getErrorMessage(e)); }
  }, [status, page]);
  useEffect(() => { load(); }, [load]);

  const act = async (id, newStatus) => {
    setBusyId(id);
    try { await adminService.updateQuestionReport(id, { status: newStatus, adminNote: notes[id] || undefined }); await load(); }
    catch (e) { setError(getErrorMessage(e)); } finally { setBusyId(null); }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Question Reports</h1>
          <p className="admin-page-sub">Mistakes students flagged in questions - fix the question, then mark the report resolved{data ? ` · ${data.open} open` : ""}</p>
        </div>
      </div>

      <div className="seed-tabs" role="tablist">
        {TABS.map(([v, l]) => (
          <button key={l} role="tab" aria-selected={status === v} className={`seed-tab ${status === v ? "active" : ""}`} onClick={() => { setStatus(v); setPage(1); }}>{l}</button>
        ))}
      </div>

      {error && <div className="admin-error-box">{error}</div>}
      {!data ? <div className="admin-loading">Loading…</div> : data.reports.length === 0 ? <div className="admin-empty">No reports here.</div> : (
        <>
          {data.reports.map((r) => (
            <div className="admin-card" key={r.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <span className="admin-badge admin-badge-info">{REASONS[r.reason] || r.reason}</span>
                <span className="activity-sub">{formatDateTime(r.createdAt)} · {r.student?.name || "deleted student"}</span>
              </div>
              <p style={{ margin: "10px 0 4px", fontWeight: 600 }}>{r.question.questionText}</p>
              <div className="activity-sub">
                {r.question.subject?.name} · import ID {r.question.importId} · marked correct: <b>{r.question.options.find((o) => o.isCorrect)?.optionText ?? "none"}</b>
              </div>
              {r.message && <p style={{ background: "#fff7e0", borderRadius: 10, padding: "8px 12px", margin: "10px 0" }}>"{r.message}"</p>}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
                <input className="track-input" style={{ flex: 1, minWidth: 180 }} placeholder="Admin note (optional)" value={notes[r.id] ?? r.adminNote ?? ""} onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))} />
                <Link className="admin-btn" to={`/admin/questions?search=${encodeURIComponent(r.question.importId)}`}>Find question</Link>
                {r.status !== "RESOLVED" && <button className="admin-btn admin-btn-primary" disabled={busyId === r.id} onClick={() => act(r.id, "RESOLVED")}>Mark resolved</button>}
                {r.status !== "DISMISSED" && <button className="admin-btn" disabled={busyId === r.id} onClick={() => act(r.id, "DISMISSED")}>Dismiss</button>}
                {r.status !== "OPEN" && <button className="admin-btn" disabled={busyId === r.id} onClick={() => act(r.id, "OPEN")}>Reopen</button>}
              </div>
            </div>
          ))}
          <AdminPagination page={page} totalPages={data.pagination.totalPages} totalItems={data.pagination.total} pageSize={15} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
