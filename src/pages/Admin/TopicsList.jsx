import { useState, useEffect } from "react";
import adminService from "../../api/adminService";
import { getErrorMessage } from "../../api/apiErrorHandler";
import { Pencil, Trash2 } from "../../data/svgs";
import DeleteConfirmModal from "./DeleteConfirmModal";
import AdminPagination from "./AdminPagination";

export default function TopicsList() {
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allTopics, setAllTopics] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTopic, setEditTopic] = useState(null);
  const [form, setForm] = useState({ subjectId: "", name: "", slug: "", description: "", sortOrder: 0, isActive: true });
  const [deleteTarget, setDeleteTarget] = useState(null);

  document.title = "Manage Topics - Admin";

  const PAGE_SIZE = 20;

  // Load all topics once (for client-side search)
  const loadAllTopics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getTopics({});
      const list = Array.isArray(data) ? data : (data.topics || []);
      setAllTopics(list);
      return list;
    } catch (err) {
      setError(getErrorMessage(err));
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Server-side pagination (no search)
  const loadPage = async () => {
    try {
      setLoading(true);
      const data = await adminService.getTopics({ page, limit: PAGE_SIZE });
      const list = data.topics || data;
      if (Array.isArray(list)) {
        // Plain array response — do client-side pagination
        const total = list.length;
        const start = (page - 1) * PAGE_SIZE;
        setTopics(list.slice(start, start + PAGE_SIZE));
        setTotalItems(total);
        setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
      } else {
        setTopics([]);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.total || 0);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Apply client-side filter and pagination
  const applyClientFilter = (sourceTopics, query) => {
    if (!query) {
      const start = (page - 1) * PAGE_SIZE;
      setTopics(sourceTopics.slice(start, start + PAGE_SIZE));
      setTotalItems(sourceTopics.length);
      setTotalPages(Math.ceil(sourceTopics.length / PAGE_SIZE));
      return;
    }
    const term = query.toLowerCase();
    const filtered = sourceTopics.filter(t =>
      (t.name || "").toLowerCase().includes(term) ||
      (t.slug || "").toLowerCase().includes(term)
    );
    const start = (page - 1) * PAGE_SIZE;
    setTopics(filtered.slice(start, start + PAGE_SIZE));
    setTotalItems(filtered.length);
    setTotalPages(Math.ceil(filtered.length / PAGE_SIZE));
  };

  // Initial load
  useEffect(() => {
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle search changes
  useEffect(() => {
    if (searchQuery) {
      loadAllTopics().then(list => {
        applyClientFilter(list, searchQuery);
      });
    } else {
      loadPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Re-apply filter when page changes (only if searching)
  useEffect(() => {
    if (searchQuery && allTopics.length > 0) {
      applyClientFilter(allTopics, searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery, allTopics.length]);

  const fetchSubjects = async () => {
    try {
      setSubjects(await adminService.getSubjects());
    } catch (err) { /* ignore */ }
  };
  useEffect(() => { fetchSubjects(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const value = e.target.elements.search.value.trim();
    setSearchQuery(value);
    setPage(1);
  };

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

  const refresh = async () => {
    if (searchQuery) {
      const list = await loadAllTopics();
      applyClientFilter(list, searchQuery);
    } else {
      await loadPage();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, sortOrder: Number(form.sortOrder) };
      if (editTopic) await adminService.updateTopic(editTopic.id, payload);
      else await adminService.createTopic(payload);
      setShowForm(false);
      refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deleteTopic(id);
      refresh();
      setDeleteTarget(null);
    } catch (err) {
      setError(getErrorMessage(err));
      setDeleteTarget(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Topics</h1>
          <p className="admin-page-sub">Manage question bank topics</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <form className="admin-search-form" onSubmit={handleSearch}>
            <input
              name="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search topics..."
            />
            <button type="submit" className="admin-btn admin-btn-primary">
              Search
            </button>
          </form>
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Create Topic</button>
        </div>
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
        <>
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
                      <button className="admin-btn-sm admin-btn-danger" onClick={() => setDeleteTarget(t.id)}><Trash2 /></button>
                    </td>
                  </tr>
                ))}
                {topics.length === 0 && <tr><td colSpan="7" className="admin-empty">No topics found</td></tr>}
              </tbody>
            </table>
          </div>

          <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={totalItems} />
        </>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Topic"
        message="Delete this topic? Associated questions will have topic set to null."
        onConfirm={() => handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}