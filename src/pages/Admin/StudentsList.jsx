import { useState, useEffect, useCallback } from "react";
import adminService from "../../api/adminService";
import { getErrorMessage } from "../../api/apiErrorHandler";
import { Eye, Search } from "../../data/svgs";
import AdminPagination from "./AdminPagination";

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  document.title = "Manage Students - Admin";

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminService.getStudents({
        page,
        limit: 20,
        search: search || undefined,
      });
      setStudents(data.students || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalItems(data.pagination?.total || 0);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const toggleStatus = async (student) => {
    try {
      setTogglingId(student.id);
      await adminService.updateStudentStatus(student.id, !student.isActive);
      await fetchStudents();
      if (selected?.id === student.id) {
        setSelected((prev) => (prev ? { ...prev, isActive: !prev.isActive } : prev));
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Students</h1>
          <p className="admin-page-sub">Registered student accounts</p>
        </div>
      </div>

      <form className="admin-toolbar" onSubmit={handleSearch} style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
          <Search
            size={16}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.5 }}
          />
          <input
            className="admin-input"
            style={{ width: "100%", paddingLeft: 36 }}
            placeholder="Search name, email, or phone"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <button type="submit" className="admin-btn admin-btn-primary">
          Search
        </button>
        {search && (
          <button
            type="button"
            className="admin-btn"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setPage(1);
            }}
          >
            Clear
          </button>
        )}
      </form>

      {error && <div className="admin-error-box">{error}</div>}

      {selected && (
        <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Student Details</h2>
            <div className="admin-detail-view">
              <div className="admin-detail-row">
                <strong>Name:</strong> {selected.name}
              </div>
              <div className="admin-detail-row">
                <strong>Email:</strong> {selected.email}
              </div>
              <div className="admin-detail-row">
                <strong>Phone:</strong> {selected.phone}
              </div>
              <div className="admin-detail-row">
                <strong>Status:</strong>{" "}
                {selected.isActive ? (
                  <span className="admin-badge admin-badge-success">Active</span>
                ) : (
                  <span className="admin-badge admin-badge-secondary">Disabled</span>
                )}
              </div>
              <div className="admin-detail-row">
                <strong>Google:</strong> {selected.hasGoogle ? "Linked" : "No"}
              </div>
              <div className="admin-detail-row">
                <strong>Attempts:</strong> {selected.submissionsCount}
              </div>
              <div className="admin-detail-row">
                <strong>Target exam:</strong> {selected.targetExam || "—"}
              </div>
              <div className="admin-detail-row">
                <strong>Class:</strong> {selected.studyClass || "—"}
              </div>
              <div className="admin-detail-row">
                <strong>State:</strong> {selected.state || "—"}
              </div>
              <div className="admin-detail-row">
                <strong>City:</strong> {selected.city || "—"}
              </div>
              <div className="admin-detail-row">
                <strong>Gender:</strong> {selected.gender || "—"}
              </div>
              <div className="admin-detail-row">
                <strong>DOB:</strong>{" "}
                {selected.dateOfBirth
                  ? new Date(selected.dateOfBirth).toLocaleDateString()
                  : "—"}
              </div>
              <div className="admin-detail-row">
                <strong>Language:</strong> {selected.preferredLanguage || "—"}
              </div>
              <div className="admin-detail-row">
                <strong>School / coaching:</strong> {selected.schoolOrCoaching || "—"}
              </div>
              <div className="admin-detail-row">
                <strong>Joined:</strong> {new Date(selected.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="admin-modal-actions">
              <button
                className="admin-btn"
                onClick={() => toggleStatus(selected)}
                disabled={togglingId === selected.id}
              >
                {selected.isActive ? "Disable account" : "Enable account"}
              </button>
              <button className="admin-btn" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="admin-loading">Loading...</div>
      ) : students.length === 0 ? (
        <div className="admin-empty">No students found.</div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Attempts</th>
                  <th>Auth</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="admin-td-bold">{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.phone}</td>
                    <td>{s.submissionsCount}</td>
                    <td>{s.hasGoogle ? "Google" : "Email"}</td>
                    <td>
                      <span
                        className={`admin-badge ${
                          s.isActive ? "admin-badge-success" : "admin-badge-secondary"
                        }`}
                      >
                        {s.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          className="admin-icon-btn"
                          title="View"
                          onClick={() => setSelected(s)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="admin-btn"
                          style={{ padding: "4px 10px", fontSize: 12 }}
                          disabled={togglingId === s.id}
                          onClick={() => toggleStatus(s)}
                        >
                          {s.isActive ? "Disable" : "Enable"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
