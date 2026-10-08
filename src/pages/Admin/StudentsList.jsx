import { useState, useEffect, useCallback } from "react";
import adminService from "../../api/adminService";
import { getErrorMessage } from "../../api/apiErrorHandler";
import { Eye, Search, Download } from "../../data/svgs";
import { formatDateTime, timeAgo } from "../../utils/activity";
import AdminPagination from "./AdminPagination";
import ActivityTable from "./ActivityTable";
import StudentStats from "./StudentStats";

const EMPTY_FILTERS = { status: "", method: "", verified: "", from: "", to: "", sort: "createdAt", order: "desc" };

function StudentModal({ student, onClose, onToggle, toggling }) {
  const [tab, setTab] = useState("details");
  const [activity, setActivity] = useState(null);
  const [activityPage, setActivityPage] = useState(1);
  const [attempts, setAttempts] = useState(null);
  const [tabError, setTabError] = useState("");

  useEffect(() => {
    if (tab !== "activity") return;
    let cancelled = false;
    setActivity(null);
    adminService
      .getStudentActivity(student.id, { page: activityPage, limit: 15 })
      .then((d) => !cancelled && setActivity(d))
      .catch((e) => !cancelled && setTabError(getErrorMessage(e)));
    return () => {
      cancelled = true;
    };
  }, [tab, activityPage, student.id]);

  useEffect(() => {
    if (tab !== "attempts" || attempts) return;
    adminService
      .getStudentSubmissions(student.id)
      .then(setAttempts)
      .catch((e) => setTabError(getErrorMessage(e)));
  }, [tab, attempts, student.id]);

  const row = (label, value) => (
    <div className="admin-detail-row">
      <strong>{label}:</strong> {value || "—"}
    </div>
  );

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal-wide" onClick={(e) => e.stopPropagation()}>
        <h2>{student.name}</h2>
        <div className="seed-tabs" role="tablist" style={{ marginBottom: 12 }}>
          {[
            ["details", "Details"],
            ["activity", "Activity log"],
            ["attempts", `Test attempts (${student.submissionsCount})`],
          ].map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} className={`seed-tab ${tab === id ? "active" : ""}`}
              onClick={() => { setTab(id); setTabError(""); }}>
              {label}
            </button>
          ))}
        </div>

        {tabError && <div className="admin-error-box">{tabError}</div>}

        {tab === "details" && (
          <div className="admin-detail-view">
            {row("Email", `${student.email}${student.emailVerified ? " (verified)" : " (not verified)"}`)}
            {row("Phone", student.phone && `${student.phone}${student.phoneVerified ? " (verified)" : " (not verified)"}`)}
            <div className="admin-detail-row">
              <strong>Status:</strong>{" "}
              <span className={`admin-badge ${student.isActive ? "admin-badge-success" : "admin-badge-secondary"}`}>
                {student.isActive ? "Active" : "Disabled"}
              </span>
            </div>
            {row("Signed up with", student.signupMethod === "google" ? "Google" : "Email + password")}
            {row("Registered", formatDateTime(student.createdAt))}
            {row("Last login", student.lastLoginAt ? `${formatDateTime(student.lastLoginAt)} (${timeAgo(student.lastLoginAt)})` : "Never")}
            {row("Total logins", String(student.loginCount))}
            {row("Test attempts", String(student.submissionsCount))}
            {row("Target exam", student.targetExam)}
            {row("Class", student.studyClass)}
            {row("State", student.state)}
            {row("City", student.city)}
            {row("Gender", student.gender)}
            {row("Date of birth", student.dateOfBirth && new Date(student.dateOfBirth).toLocaleDateString())}
            {row("Language", student.preferredLanguage)}
            {row("School / coaching", student.schoolOrCoaching)}
          </div>
        )}

        {tab === "activity" &&
          (activity ? (
            <>
              <ActivityTable logs={activity.logs} showActor={false} />
              <AdminPagination page={activityPage} totalPages={activity.pagination.totalPages}
                totalItems={activity.pagination.total} pageSize={15} onPageChange={setActivityPage} />
            </>
          ) : (
            !tabError && <div className="admin-loading">Loading…</div>
          ))}

        {tab === "attempts" &&
          (attempts ? (
            attempts.length === 0 ? (
              <div className="admin-empty">No test attempts yet.</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>Test</th><th>Started</th><th>Status</th><th>Score</th><th>Correct / Wrong / Skipped</th></tr>
                  </thead>
                  <tbody>
                    {attempts.map((a) => (
                      <tr key={a.id}>
                        <td className="admin-td-bold">{a.test?.title}</td>
                        <td>{formatDateTime(a.startedAt)}</td>
                        <td>
                          <span className={`admin-badge ${a.submittedAt ? "admin-badge-success" : "admin-badge-secondary"}`}>
                            {a.submittedAt ? "Submitted" : "Not submitted"}
                          </span>
                        </td>
                        <td>{a.submittedAt ? `${a.score} / ${a.test?.totalMarks} (${Math.round(a.percentage)}%)` : "—"}</td>
                        <td>{a.submittedAt ? `${a.totalCorrect} / ${a.totalIncorrect} / ${a.totalUnattempted}` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            !tabError && <div className="admin-loading">Loading…</div>
          ))}

        <div className="admin-modal-actions">
          <button className="admin-btn" onClick={() => onToggle(student)} disabled={toggling}>
            {student.isActive ? "Disable account" : "Enable account"}
          </button>
          <button className="admin-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selected, setSelected] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [statsKey, setStatsKey] = useState(0);
  const [exporting, setExporting] = useState(false);

  document.title = "Manage Students - Admin";

  const queryParams = useCallback(
    () => Object.fromEntries(Object.entries({ ...filters, search }).filter(([, v]) => v)),
    [filters, search]
  );

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminService.getStudents({ ...queryParams(), page, limit: 20 });
      setStudents(data.students || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalItems(data.pagination?.total || 0);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [queryParams, page]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const setFilter = (key, value) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const toggleStatus = async (student) => {
    try {
      setTogglingId(student.id);
      await adminService.updateStudentStatus(student.id, !student.isActive);
      await fetchStudents();
      setStatsKey((k) => k + 1);
      if (selected?.id === student.id) {
        setSelected((prev) => (prev ? { ...prev, isActive: !prev.isActive } : prev));
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  const exportCsv = async () => {
    try {
      setExporting(true);
      await adminService.downloadCsv("/admin/students/export", queryParams(), "students.csv");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  const hasFilters = search || JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Students</h1>
          <p className="admin-page-sub">Registered accounts, sign-up numbers and what each student has been doing</p>
        </div>
        <button className="admin-btn" onClick={exportCsv} disabled={exporting}>
          <Download size={15} /> {exporting ? "Exporting…" : "Export CSV"}
        </button>
      </div>

      <StudentStats refreshKey={statsKey} />

      <form
        className="track-filters"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setSearch(searchInput.trim());
        }}
      >
        <div style={{ position: "relative", minWidth: 220, flex: 1 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.5 }} />
          <input className="track-input" style={{ paddingLeft: 36, width: "100%" }} placeholder="Search name, email, or phone"
            value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        </div>
        <select className="track-input" value={filters.status} onChange={(e) => setFilter("status", e.target.value)}>
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="inactive">Disabled</option>
        </select>
        <select className="track-input" value={filters.method} onChange={(e) => setFilter("method", e.target.value)}>
          <option value="">Any sign-up method</option>
          <option value="email">Email</option>
          <option value="google">Google</option>
        </select>
        <select className="track-input" value={filters.verified} onChange={(e) => setFilter("verified", e.target.value)}>
          <option value="">Any verification</option>
          <option value="email">Email verified</option>
          <option value="phone">Phone verified</option>
          <option value="none">Nothing verified</option>
        </select>
        <input className="track-input" type="date" value={filters.from} onChange={(e) => setFilter("from", e.target.value)} title="Registered from" />
        <input className="track-input" type="date" value={filters.to} onChange={(e) => setFilter("to", e.target.value)} title="Registered until" />
        <select className="track-input" value={`${filters.sort}:${filters.order}`}
          onChange={(e) => { const [sort, order] = e.target.value.split(":"); setPage(1); setFilters((f) => ({ ...f, sort, order })); }}>
          <option value="createdAt:desc">Newest first</option>
          <option value="createdAt:asc">Oldest first</option>
          <option value="lastLoginAt:desc">Recently active</option>
          <option value="loginCount:desc">Most logins</option>
          <option value="name:asc">Name A-Z</option>
        </select>
        <button type="submit" className="admin-btn admin-btn-primary">Search</button>
        {hasFilters && (
          <button type="button" className="admin-btn"
            onClick={() => { setFilters(EMPTY_FILTERS); setSearch(""); setSearchInput(""); setPage(1); }}>
            Clear
          </button>
        )}
      </form>

      {error && <div className="admin-error-box">{error}</div>}

      {selected && (
        <StudentModal student={selected} onClose={() => setSelected(null)} onToggle={toggleStatus} toggling={togglingId === selected.id} />
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
                  <th>Sign-up</th>
                  <th>Logins</th>
                  <th>Last login</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="admin-td-bold">{s.name}</td>
                    <td>
                      {s.email}{" "}
                      {!s.emailVerified && <span className="admin-badge admin-badge-secondary" title="Email not verified">unverified</span>}
                    </td>
                    <td>{s.phone || "—"}</td>
                    <td>{s.submissionsCount}</td>
                    <td>{s.signupMethod === "google" ? "Google" : "Email"}</td>
                    <td>{s.loginCount}</td>
                    <td title={formatDateTime(s.lastLoginAt)}>{timeAgo(s.lastLoginAt)}</td>
                    <td>
                      <span className={`admin-badge ${s.isActive ? "admin-badge-success" : "admin-badge-secondary"}`}>
                        {s.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button className="admin-icon-btn" title="View details & activity" onClick={() => setSelected(s)}>
                          <Eye size={16} />
                        </button>
                        <button className="admin-btn" style={{ padding: "4px 10px", fontSize: 12 }}
                          disabled={togglingId === s.id} onClick={() => toggleStatus(s)}>
                          {s.isActive ? "Disable" : "Enable"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AdminPagination page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
