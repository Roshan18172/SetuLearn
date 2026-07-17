import { useState, useEffect } from "react";
import adminService from "../../api/adminService";
import { getErrorMessage } from "../../api/apiErrorHandler";

export default function ReportsList() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);

  document.title = "Manage Reports - Admin";

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await adminService.getReports({ page, limit: 20 });
      setReports(data.reports);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) { setError(getErrorMessage(err)); } finally { setLoading(false); }
  };
 // eslint-disable-next-line
  useEffect(() => { fetchReports(); }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this report?")) return;
    try { await adminService.deleteReport(id); fetchReports(); } catch (err) { setError(getErrorMessage(err)); }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Reports</h1>
          <p className="admin-page-sub">User-submitted issue reports</p>
        </div>
      </div>

      {error && <div className="admin-error-box">{error}</div>}

      {selected && (
        <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Report Details</h2>
            <div className="admin-detail-view">
              <div className="admin-detail-row"><strong>Name:</strong> {selected.name}</div>
              <div className="admin-detail-row"><strong>Email:</strong> {selected.email}</div>
              <div className="admin-detail-row"><strong>Issue Type:</strong> {selected.issueType}</div>
              <div className="admin-detail-row"><strong>Page:</strong> {selected.page || "N/A"}</div>
              <div className="admin-detail-row"><strong>Date:</strong> {new Date(selected.createdAt).toLocaleString()}</div>
              <div className="admin-detail-row" style={{ gridColumn: "1/-1" }}>
                <strong>Description:</strong>
                <p style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>{selected.description}</p>
              </div>
            </div>
            <div className="admin-modal-actions">
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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Issue Type</th>
                  <th>Page</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td className="admin-td-bold">{r.name}</td>
                    <td>{r.email}</td>
                    <td><span className="admin-badge">{r.issueType}</span></td>
                    <td>{r.page || "—"}</td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="admin-actions">
                      <button className="admin-btn-sm" onClick={() => setSelected(r)}>👁️</button>
                      <button className="admin-btn-sm admin-btn-danger" onClick={() => handleDelete(r.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && <tr><td colSpan="6" className="admin-empty">No reports found</td></tr>}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="admin-pagination">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}