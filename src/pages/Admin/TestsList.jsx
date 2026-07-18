import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import adminService from "../../api/adminService";
import { getErrorMessage } from "../../api/apiErrorHandler";
import { Pencil, ClipboardList, Trash2 } from "../../data/svgs";

export default function TestsList() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exams, setExams] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTest, setEditTest] = useState(null);
  const [form, setForm] = useState({
    examId: "", title: "", description: "", durationMinutes: 60,
    totalMarks: 100, totalQuestions: 25, negativeMarking: true,
    difficulty: "MEDIUM", isPublished: true, instructions: "",
  });

  document.title = "Manage Tests - Admin";

  const fetchTests = async () => {
    try { setLoading(true); setTests(await adminService.getTests()); } catch (err) { setError(getErrorMessage(err)); } finally { setLoading(false); }
  };
  const fetchExams = async () => {
    try { setExams(await adminService.getExams()); } catch (err) { /* ignore */ }
  };

  useEffect(() => { fetchTests(); fetchExams(); }, []);

  const openCreate = () => {
    setEditTest(null);
    setForm({ examId: exams[0]?.id || "", title: "", description: "", durationMinutes: 60, totalMarks: 100, totalQuestions: 25, negativeMarking: true, difficulty: "MEDIUM", isPublished: true, instructions: "" });
    setShowForm(true);
  };

  const openEdit = (test) => {
    setEditTest(test);
    setForm({
      examId: test.examId, title: test.title, description: test.description || "",
      durationMinutes: test.durationMinutes, totalMarks: test.totalMarks,
      totalQuestions: test.totalQuestions, negativeMarking: test.negativeMarking,
      difficulty: test.difficulty, isPublished: test.isPublished, instructions: test.instructions || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editTest) await adminService.updateTest(editTest.id, form);
      else await adminService.createTest(form);
      setShowForm(false);
      fetchTests();
    } catch (err) { setError(getErrorMessage(err)); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this test?")) return;
    try { await adminService.deleteTest(id); fetchTests(); } catch (err) { setError(getErrorMessage(err)); }
  };

  const getDiffBadge = (d) => {
    const cls = d === "HARD" ? "admin-badge-danger" : d === "MEDIUM" ? "admin-badge-warning" : "admin-badge-success";
    return <span className={`admin-badge ${cls}`}>{d}</span>;
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Tests</h1>
          <p className="admin-page-sub">Manage mock tests</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Create Test</button>
      </div>

      {error && <div className="admin-error-box">{error}</div>}

      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <h2>{editTest ? "Edit Test" : "Create Test"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Exam</label>
                <select value={form.examId} onChange={(e) => setForm({ ...form, examId: e.target.value })} required>
                  <option value="">Select Exam</option>
                  {exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="admin-form-group">
                <label>Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="admin-form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Duration (min)</label>
                  <input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: +e.target.value })} required />
                </div>
                <div className="admin-form-group">
                  <label>Total Marks</label>
                  <input type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: +e.target.value })} required />
                </div>
                <div className="admin-form-group">
                  <label>Total Questions</label>
                  <input type="number" value={form.totalQuestions} onChange={(e) => setForm({ ...form, totalQuestions: +e.target.value })} required />
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Difficulty</label>
                  <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Negative Marking</label>
                  <select value={form.negativeMarking} onChange={(e) => setForm({ ...form, negativeMarking: e.target.value === "true" })}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Published</label>
                  <select value={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.value === "true" })}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              <div className="admin-form-group">
                <label>Instructions</label>
                <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} rows={3} />
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">{editTest ? "Update" : "Create"}</button>
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
                <th>Title</th>
                <th>Exam</th>
                <th>Duration</th>
                <th>Marks</th>
                <th>Difficulty</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.id}>
                  <td className="admin-td-bold">{test.title}</td>
                  <td>{test.exam?.name || "—"}</td>
                  <td>{test.durationMinutes}m</td>
                  <td>{test.totalMarks}</td>
                  <td>{getDiffBadge(test.difficulty)}</td>
                  <td>
                    <span className={`admin-badge ${test.isPublished ? "admin-badge-success" : "admin-badge-secondary"}`}>
                      {test.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="admin-actions">
                    <button className="admin-btn-sm" onClick={() => openEdit(test)}><Pencil /></button>
                    <button className="admin-btn-sm" onClick={() => navigate(`/admin/tests/${test.id}/questions`)}><ClipboardList /></button>
                    <button className="admin-btn-sm admin-btn-danger" onClick={() => handleDelete(test.id)}><Trash2 /></button>
                  </td>
                </tr>
              ))}
              {tests.length === 0 && <tr><td colSpan="7" className="admin-empty">No tests found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}