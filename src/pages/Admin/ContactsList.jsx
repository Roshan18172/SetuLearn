import { useState, useEffect } from "react";
import adminService from "../../api/adminService";
import { getErrorMessage } from "../../api/apiErrorHandler";
import { Eye, Trash2, CheckCircle2, XCircle } from "../../data/svgs";

export default function ContactsList() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);

  document.title = "Manage Contacts - Admin";

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await adminService.getContacts({ page, limit: 20 });
      setContacts(data.contacts);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) { setError(getErrorMessage(err)); } finally { setLoading(false); }
  };
 // eslint-disable-next-line
  useEffect(() => { fetchContacts(); }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this contact message?")) return;
    try { await adminService.deleteContact(id); fetchContacts(); } catch (err) { setError(getErrorMessage(err)); }
  };

  const toggleEmailSent = async (contact, field) => {
    try {
      await adminService.updateContact(contact.id, { [field]: !contact[field] });
      fetchContacts();
    } catch (err) { setError(getErrorMessage(err)); }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Contacts</h1>
          <p className="admin-page-sub">User contact messages</p>
        </div>
      </div>

      {error && <div className="admin-error-box">{error}</div>}

      {selected && (
        <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Contact Details</h2>
            <div className="admin-detail-view">
              <div className="admin-detail-row"><strong>Name:</strong> {selected.name}</div>
              <div className="admin-detail-row"><strong>Email:</strong> {selected.email}</div>
              <div className="admin-detail-row"><strong>Subject:</strong> {selected.subject}</div>
              <div className="admin-detail-row"><strong>Date:</strong> {new Date(selected.createdAt).toLocaleString()}</div>
              <div className="admin-detail-row"><strong>Admin Email:</strong> {selected.adminEmailSent ? <span style={{ color: "var(--success, #2e7d32)", display: "inline-flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={14} /> Sent</span> : <span style={{ color: "var(--danger, #c62828)", display: "inline-flex", alignItems: "center", gap: 4 }}><XCircle size={14} /> Not sent</span>}</div>
              <div className="admin-detail-row"><strong>User Email:</strong> {selected.userEmailSent ? <span style={{ color: "var(--success, #2e7d32)", display: "inline-flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={14} /> Sent</span> : <span style={{ color: "var(--danger, #c62828)", display: "inline-flex", alignItems: "center", gap: 4 }}><XCircle size={14} /> Not sent</span>}</div>
              <div className="admin-detail-row" style={{ gridColumn: "1/-1" }}>
                <strong>Message:</strong>
                <p style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>{selected.message}</p>
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
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Admin Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id}>
                    <td className="admin-td-bold">{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.subject}</td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`admin-badge ${c.adminEmailSent ? "admin-badge-success" : "admin-badge-secondary"}`}
                        onClick={() => toggleEmailSent(c, "adminEmailSent")} style={{ cursor: "pointer" }}>
                        {c.adminEmailSent ? "Sent" : "Pending"}
                      </span>
                    </td>
                    <td className="admin-actions">
                      <button className="admin-btn-sm" onClick={() => setSelected(c)}><Eye /></button>
                      <button className="admin-btn-sm admin-btn-danger" onClick={() => handleDelete(c.id)}><Trash2 /></button>
                    </td>
                  </tr>
                ))}
                {contacts.length === 0 && <tr><td colSpan="6" className="admin-empty">No contacts found</td></tr>}
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