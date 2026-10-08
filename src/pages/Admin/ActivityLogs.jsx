import { useCallback, useEffect, useState } from "react";
import adminService from "../../api/adminService";
import { getErrorMessage } from "../../api/apiErrorHandler";
import { Download, Search } from "../../data/svgs";
import { actionLabel } from "../../utils/activity";
import AdminPagination from "./AdminPagination";
import ActivityTable from "./ActivityTable";

const EMPTY = { actorType: "", status: "", action: "", from: "", to: "" };

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState(EMPTY);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  document.title = "Activity Logs - Admin";

  const params = useCallback(
    () => Object.fromEntries(Object.entries({ ...filters, search }).filter(([, v]) => v)),
    [filters, search]
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminService.getActivityLogs({ ...params(), page, limit: 25 });
      setLogs(data.logs || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalItems(data.pagination?.total || 0);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [params, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    adminService.getActivitySummary().then(setSummary).catch(() => undefined);
  }, []);

  const setFilter = (key, value) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const exportCsv = async () => {
    try {
      setExporting(true);
      await adminService.downloadCsv("/admin/activity/export", params(), "activity-logs.csv");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setExporting(false);
    }
  };

  const hasFilters = Object.values(filters).some(Boolean) || search;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Activity Logs</h1>
          <p className="admin-page-sub">What students and admins did - sign-ups, logins, tests, admin actions</p>
        </div>
        <button className="admin-btn" onClick={exportCsv} disabled={exporting}>
          <Download size={15} /> {exporting ? "Exporting…" : "Export CSV"}
        </button>
      </div>

      {summary && (
        <div className="stat-grid" style={{ marginBottom: 16 }}>
          <div className="stat-card"><div className="stat-value">{summary.last24h.registrations}</div><div className="stat-label">Registrations (24h)</div></div>
          <div className="stat-card"><div className="stat-value">{summary.last24h.logins}</div><div className="stat-label">Logins (24h)</div></div>
          <div className="stat-card stat-card-warn"><div className="stat-value">{summary.last24h.failedLogins}</div><div className="stat-label">Failed logins (24h)</div></div>
          <div className="stat-card"><div className="stat-value">{summary.last24h.testsSubmitted}</div><div className="stat-label">Tests submitted (24h)</div></div>
          <div className="stat-card"><div className="stat-value">{summary.totalLogs}</div><div className="stat-label">Total log entries</div></div>
        </div>
      )}

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
          <input className="track-input" style={{ paddingLeft: 36, width: "100%" }} placeholder="Name, email, IP or details"
            value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        </div>
        <select className="track-input" value={filters.actorType} onChange={(e) => setFilter("actorType", e.target.value)}>
          <option value="">Students + admins</option>
          <option value="STUDENT">Students only</option>
          <option value="ADMIN">Admins only</option>
        </select>
        <select className="track-input" value={filters.action} onChange={(e) => setFilter("action", e.target.value)}>
          <option value="">All actions</option>
          {(summary?.actions || []).map((a) => (
            <option key={a.action} value={a.action}>{actionLabel(a.action)} ({a.count})</option>
          ))}
        </select>
        <select className="track-input" value={filters.status} onChange={(e) => setFilter("status", e.target.value)}>
          <option value="">Any result</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILURE">Failed</option>
        </select>
        <input className="track-input" type="date" value={filters.from} onChange={(e) => setFilter("from", e.target.value)} title="From date" />
        <input className="track-input" type="date" value={filters.to} onChange={(e) => setFilter("to", e.target.value)} title="To date" />
        <button type="submit" className="admin-btn admin-btn-primary">Search</button>
        {hasFilters && (
          <button type="button" className="admin-btn" onClick={() => { setFilters(EMPTY); setSearch(""); setSearchInput(""); setPage(1); }}>
            Clear
          </button>
        )}
      </form>

      {error && <div className="admin-error-box">{error}</div>}

      {loading ? (
        <div className="admin-loading">Loading...</div>
      ) : (
        <>
          <ActivityTable logs={logs} />
          <AdminPagination page={page} totalPages={totalPages} totalItems={totalItems} pageSize={25} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
