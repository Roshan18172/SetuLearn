import { useState, useEffect } from "react";
import adminService from "../../api/adminService";
import { getErrorMessage } from "../../api/apiErrorHandler";

export default function SubjectsList() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", sortOrder: 0, isActive: true });

  document.title = "Manage Subjects - Admin";

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setSubjects(await adminService.getSubjects());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubjects(); }, []);

  const openCreate = () => {
    setEditSubject(null);
    setForm({ name: "", slug: "", description: "", sortOrder: 0, isActive: true });
    setShowForm(true);
  };

  const openEdit = (s) => {
    setEditSubject(s);
    setForm({
      name: s.name,
      slug: s.slug,
      description: s.description || "",
      sortOrder: s.sortOrder || 0,
      isActive: s.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, sortOrder: Number(form.sortOrder) };
      if (editSubject) await adminService.updateSubject(editSubject.id, payload);
      else await adminService.createSubject(payload);
      setShowForm(false);
      fetchSubjects();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subject? This will also delete all associated topics and questions.")) return;
    try {
      await adminService.deleteSubject(id);
      fetchSubjects();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Subjects</h1>
          <p className="admin-page-sub">Manage question bank subjects</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Create Subject</button>
      </div>

      {error && <div className="admin-error-box">{error}</div>}

      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editSubject ? "Edit Subject" : "Create Subject"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="admin-form-group">
                  <label>Slug *</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
                </div>
                <div className="admin-form-group">
                  <label>Active</label>
                  <select value={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              <div className="admin-form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">{editSubject ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="admin-loading">Loading...</div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Topics</th>
                <th>Questions</th>
                <th>Sort</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id}>
                  <td className="admin-td-bold">{s.name}</td>
                  <td><code>{s.slug}</code></td>
                  <td>{s._count?.topics || 0}</td>
                  <td>{s._count?.questions || 0}</td>
                  <td>{s.sortOrder}</td>
                  <td>
                    <span className={`admin-badge ${s.isActive ? "admin-badge-success" : "admin-badge-danger"}`}>
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="admin-actions">
                    <button className="admin-btn-sm" onClick={() => openEdit(s)}>✏️</button>
                    <button className="admin-btn-sm admin-btn-danger" onClick={() => handleDelete(s.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && <tr><td colSpan="7" className="admin-empty">No subjects found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}