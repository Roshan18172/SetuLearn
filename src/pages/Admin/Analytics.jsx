import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import adminService from "../../api/adminService";
import { getErrorMessage } from "../../api/apiErrorHandler";

const Card = ({ label, value, hint, tone }) => (
  <div className={`stat-card ${tone ? `stat-card-${tone}` : ""}`}>
    <div className="stat-value">{value ?? "—"}</div><div className="stat-label">{label}</div>{hint && <div className="stat-hint">{hint}</div>}
  </div>
);

const Chart = ({ days, field, label }) => {
  const max = Math.max(1, ...days.map((d) => d[field]));
  return (
    <div className="admin-card">
      <h3 style={{ marginTop: 0 }}>{label}</h3>
      <div className="bar-chart" role="img" aria-label={label}>
        {days.map((d) => <div key={d.date} className="bar-col" title={`${d.date}: ${d[field]}`}><div className="bar" style={{ height: `${(d[field] / max) * 100}%` }} /></div>)}
      </div>
      <div className="bar-axis"><span>{days[0].date}</span><span>{days[days.length - 1].date}</span></div>
    </div>
  );
};

export default function Analytics() {
  document.title = "Analytics - Admin";
  const [ov, setOv] = useState(null);
  const [qs, setQs] = useState(null);
  const [sort, setSort] = useState("flagged");
  const [error, setError] = useState("");

  useEffect(() => { adminService.getAnalyticsOverview().then(setOv).catch((e) => setError(getErrorMessage(e))); }, []);
  useEffect(() => { setQs(null); adminService.getQuestionAnalytics({ sort, minAttempts: 5, limit: 30 }).then(setQs).catch((e) => setError(getErrorMessage(e))); }, [sort]);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1>Analytics</h1><p className="admin-page-sub">Who is using SetuLearn, and which questions need attention</p></div>
      </div>
      {error && <div className="admin-error-box">{error}</div>}

      {!ov ? <div className="admin-loading">Loading…</div> : (
        <>
          <div className="stat-grid">
            <Card label="Active today" value={ov.active.dau} tone="primary" hint="DAU" />
            <Card label="Active this week" value={ov.active.wau} hint="WAU (7 days)" />
            <Card label="Active this month" value={ov.active.mau} hint="MAU (30 days)" />
            <Card label="Returning students" value={ov.retention.rate === null ? "—" : `${ov.retention.rate}%`} hint={`${ov.retention.returned} of ${ov.retention.cohort} who joined >7 days ago were active this week`} />
            <Card label="Registered students" value={ov.totals.students} />
            <Card label="Tests submitted" value={ov.totals.testsSubmitted} />
            <Card label="Mistakes in notebooks" value={ov.totals.mistakeEntries} />
            <Card label="Open question reports" value={ov.totals.openReports} tone={ov.totals.openReports ? "warn" : ""} hint={<Link to="/admin/question-reports">review →</Link>} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14, margin: "14px 0" }}>
            <Chart days={ov.days} field="activeStudents" label="Active students per day (30 days)" />
            <Chart days={ov.days} field="testsSubmitted" label="Tests submitted per day (30 days)" />
          </div>

          <div className="admin-card" style={{ marginBottom: 14 }}>
            <h3 style={{ marginTop: 0 }}>Most-attempted tests (30 days)</h3>
            {ov.topTests.length === 0 ? <p className="activity-sub">No submissions yet.</p> : (
              <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Test</th><th>Attempts</th><th>Average score</th></tr></thead>
                <tbody>{ov.topTests.map((t) => <tr key={t.title}><td className="admin-td-bold">{t.title}</td><td>{t.attempts}</td><td>{t.averagePercentage}%</td></tr>)}</tbody></table></div>
            )}
          </div>
        </>
      )}

      <div className="admin-card">
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Question quality</h3>
          <div className="seed-tabs" style={{ margin: 0 }}>
            {[["flagged", "Needs attention"], ["hardest", "Hardest"], ["easiest", "Easiest"]].map(([v, l]) => (
              <button key={v} className={`seed-tab ${sort === v ? "active" : ""}`} onClick={() => setSort(v)}>{l}</button>
            ))}
          </div>
        </div>
        <p className="activity-sub">Based on every submitted answer (questions with at least 5 attempts). "Needs attention" flags questions where most students pick the same wrong option (the answer key may be wrong), almost nobody is right, or students reported a problem.</p>
        {!qs ? <div className="admin-loading">Loading…</div> : qs.questions.length === 0 ? <div className="admin-empty">Nothing to show yet.</div> : (
          <div className="admin-table-wrap"><table className="admin-table">
            <thead><tr><th>Question</th><th>Subject</th><th>Attempts</th><th>Correct</th><th>Flags</th></tr></thead>
            <tbody>{qs.questions.map((q) => (
              <tr key={q.id}>
                <td style={{ maxWidth: 380 }}><Link to={`/admin/questions?search=${encodeURIComponent(q.importId)}`}>{q.text}</Link><div className="activity-sub">{q.importId}</div></td>
                <td>{q.subject || "—"}</td><td>{q.attempts}</td>
                <td><b style={{ color: q.accuracy < 30 ? "#b91c1c" : q.accuracy > 80 ? "#15803d" : "inherit" }}>{q.accuracy}%</b></td>
                <td>{q.flags.map((f) => <div key={f}><span className="admin-badge admin-badge-danger">{f}</span></div>)}</td>
              </tr>))}</tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}
