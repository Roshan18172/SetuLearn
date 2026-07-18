import { useState, useEffect } from "react";
import adminService from "../../api/adminService";
import { getErrorMessage } from "../../api/apiErrorHandler";
import { Eye, Trash2, CheckCircle2, XCircle } from "../../data/svgs";
import DeleteConfirmModal from "./DeleteConfirmModal";
import AdminPagination from "./AdminPagination";

export default function SubmissionsList() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [totalItems, setTotalItems] = useState(0);

  document.title = "Manage Submissions - Admin";

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSubmissions({ page, limit: 20 });
      setSubmissions(data.submissions);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalItems(data.pagination?.total || 0);
    } catch (err) { setError(getErrorMessage(err)); } finally { setLoading(false); }
  };
 // eslint-disable-next-line
  useEffect(() => { fetchSubmissions(); }, [page]);

  const viewDetail = async (id) => {
    try {
      const data = await adminService.getSubmission(id);
      setSelected(data);
    } catch (err) { setError(getErrorMessage(err)); }
  };

  const handleDelete = async (id) => {
    try { await adminService.deleteSubmission(id); fetchSubmissions(); setSelected(null); setDeleteTarget(null); } catch (err) { setError(getErrorMessage(err)); setDeleteTarget(null); }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Submissions</h1>
          <p className="admin-page-sub">Student test submissions</p>
        </div>
      </div>

      {error && <div className="admin-error-box">{error}</div>}

      {selected && (
        <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <h2>Submission Details</h2>
            <div className="admin-detail-view">
              <div className="admin-detail-row"><strong>Test:</strong> {selected.test?.title}</div>
              <div className="admin-detail-row"><strong>Score:</strong> {selected.score} / {selected.test?.totalMarks}</div>
              <div className="admin-detail-row"><strong>Percentage:</strong> {selected.percentage?.toFixed(1)}%</div>
              <div className="admin-detail-row"><strong>Correct:</strong> {selected.totalCorrect}</div>
              <div className="admin-detail-row"><strong>Incorrect:</strong> {selected.totalIncorrect}</div>
              <div className="admin-detail-row"><strong>Unattempted:</strong> {selected.totalUnattempted}</div>
              <div className="admin-detail-row"><strong>Time Taken:</strong> {selected.timeTaken ? `${Math.floor(selected.timeTaken / 60)}m ${selected.timeTaken % 60}s` : "N/A"}</div>
              <div className="admin-detail-row"><strong>Started:</strong> {new Date(selected.startedAt).toLocaleString()}</div>
              <div className="admin-detail-row"><strong>Submitted:</strong> {selected.submittedAt ? new Date(selected.submittedAt).toLocaleString() : "N/A"}</div>
            </div>

            {selected.answers?.length > 0 && (
              <>
                <h3 style={{ marginTop: 20, marginBottom: 10 }}>Answers ({selected.answers.length})</h3>
                <div className="admin-answers-list">
                  {selected.answers.map((a, i) => (
                    <div key={a.id} className={`admin-answer-card ${a.isCorrect ? "correct" : "incorrect"}`}>
                      <div className="admin-answer-q">Q{i + 1}: {a.question?.questionText?.substring(0, 100)}</div>
                      <div className="admin-answer-status" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        {a.isCorrect ? <><CheckCircle2 size={14} /> Correct</> : <><XCircle size={14} /> Incorrect {a.selectedOption ? `(Selected: ${a.selectedOption.optionText?.substring(0, 50)})` : "(Unattempted)"}</>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="admin-modal-actions">
              <button className="admin-btn admin-btn-danger" onClick={() => setDeleteTarget(selected.id)}>Delete</button>
              <button className="admin-btn" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <div className="admin-loading">Loading...</div> : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Score</th>
                  <th>%</th>
                  <th>Correct</th>
                  <th>Incorrect</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id}>
                    <td className="admin-td-bold">{s.test?.title || "—"}</td>
                    <td>{s.score}</td>
                    <td>{s.percentage?.toFixed(1)}%</td>
                    <td><span className="admin-badge admin-badge-success">{s.totalCorrect}</span></td>
                    <td><span className="admin-badge admin-badge-danger">{s.totalIncorrect}</span></td>
                    <td>{new Date(s.startedAt).toLocaleDateString()}</td>
                    <td className="admin-actions">
                      <button className="admin-btn-sm" onClick={() => viewDetail(s.id)}><Eye /></button>
                      <button className="admin-btn-sm admin-btn-danger" onClick={() => setDeleteTarget(s.id)}><Trash2 /></button>
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && <tr><td colSpan="7" className="admin-empty">No submissions found</td></tr>}
              </tbody>
            </table>
          </div>

          <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={totalItems} />
        </>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Submission"
        message="Delete this submission?"
        onConfirm={() => handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
