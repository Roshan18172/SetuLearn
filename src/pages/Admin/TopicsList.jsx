import { useState, useEffect } from "react";
import adminService from "../../api/adminService";
import { getErrorMessage } from "../../api/apiErrorHandler";
import { Pencil, Trash2 } from "../../data/svgs";

export default function TopicsList() {
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTopic, setEditTopic] = useState(null);
  const [form, setForm] = useState({ subjectId: "", name: "", slug: "", description: "", sortOrder: 0, isActive: true });

  document.title = "Manage Topics - Admin";

  const fetchTopics = async () => {
    try {
      setLoading(true);
      setTopics(await adminService.getTopics());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      setSubjects(await adminService.getSubjects());
    } catch (err) { /* ignore */ }
  };

  useEffect(() => { fetchTopics(); fetchSubjects(); }, []);

  const selectedSubjectName = subjects.find((s) => s.id === form.subjectId)?.name || "Select Subject";

  const openCreate = () => {
    setEditTopic(null);
    setForm({ subjectId: subjects[0]?.id || "", name: "", slug: "", description: "", sortOrder: 0, isActive: true });
    setShowForm(true);
  };

  const openEdit = (t) => {
    setEditTopic(t);
    setForm({
      subjectId: t.subjectId,
      name: t.name,
      slug: t.slug,
      description: t.description || "",
      sortOrder: t.sortOrder || 0,
      isActive: t.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, sortOrder: Number(form.sortOrder) };
      if (editTopic) await adminService.updateTopic(editTopic.id, payload);
      else await adminService.createTopic(payload);
      setShowForm(false);
      fetchTopics();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this topic? Associated questions will have topic set to null.")) return;
    try {
      await adminService.deleteTopic(id);
      fetchTopics();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Topics</h1>
          <p className="admin-page-sub">Manage question bank topics</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Create Topic</button>
      </div>

      {error && <div className="admin-error-box">{error}</div>}

      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editTopic ? "Edit Topic" : "Create Topic"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Subject *</label>
                <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} required>
                  <option value="">{selectedSubjectName}</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
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
                <button type="submit" className="admin-btn admin-btn-primary">{editTopic ? "Update" : "Create"}</button>
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
                <th>Subject</th>
                <th>Slug</th>
                <th>Questions</th>
                <th>Sort</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((t) => (
                <tr key={t.id}>
                  <td className="admin-td-bold">{t.name}</td>
                  <td>{t.subject?.name || "—"}</td>
                  <td><code>{t.slug}</code></td>
                  <td>{t._count?.questions || 0}</td>
                  <td>{t.sortOrder}</td>
                  <td>
                    <span className={`admin-badge ${t.isActive ? "admin-badge-success" : "admin-badge-danger"}`}>
                      {t.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="admin-actions">
                    <button className="admin-btn-sm" onClick={() => openEdit(t)}><Pencil /></button>
                    <button className="admin-btn-sm admin-btn-danger" onClick={() => handleDelete(t.id)}><Trash2 /></button>
                  </td>
                </tr>
              ))}
              {topics.length === 0 && <tr><td colSpan="7" className="admin-empty">No topics found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}