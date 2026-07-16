import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import adminService from "../../api/adminService";
import { getErrorMessage } from "../../api/apiErrorHandler";

export default function ExamsList() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editExam, setEditExam] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", icon: "", isActive: true });

  document.title = "Manage Exams - Admin";

  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await adminService.getExams();
      setExams(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExams(); }, []);

  const openCreate = () => {
    setEditExam(null);
    setForm({ name: "", slug: "", description: "", icon: "", isActive: true });
    setShowForm(true);
  };

  const openEdit = (exam) => {
    setEditExam(exam);
    setForm({ name: exam.name, slug: exam.slug, description: exam.description || "", icon: exam.icon || "", isActive: exam.isActive });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editExam) {
        await adminService.updateExam(editExam.id, form);
      } else {
        await adminService.createExam(form);
      }
      setShowForm(false);
      fetchExams();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    try {
      await adminService.deleteExam(id);
      fetchExams();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleToggle = async (exam) => {
    try {
      await adminService.updateExam(exam.id, { isActive: !exam.isActive });
      fetchExams();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Exams</h1>
          <p className="admin-page-sub">Manage exam categories</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Create Exam</button>
      </div>

      {error && <div className="admin-error-box">{error}</div>}

      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editExam ? "Edit Exam" : "Create Exam"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="admin-form-group">
                <label>Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Icon</label>
                  <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
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
                <button type="submit" className="admin-btn admin-btn-primary">{editExam ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="admin-loading">Loading...</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Icon</th>
                <th>Tests</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id}>
                  <td className="admin-td-bold">{exam.name}</td>
                  <td><code>{exam.slug}</code></td>
                  <td>{exam.icon || "—"}</td>
                  <td>{exam._count?.tests || 0}</td>
                  <td>
                    <span className={`admin-badge ${exam.isActive ? "admin-badge-success" : "admin-badge-danger"}`}
                      onClick={() => handleToggle(exam)} style={{ cursor: "pointer" }}>
                      {exam.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="admin-actions">
                    <button className="admin-btn-sm" onClick={() => openEdit(exam)}>✏️</button>
                    <button className="admin-btn-sm admin-btn-danger" onClick={() => handleDelete(exam.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {exams.length === 0 && (
                <tr><td colSpan="6" className="admin-empty">No exams found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}