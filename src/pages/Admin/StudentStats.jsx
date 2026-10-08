import { useEffect, useState } from "react";
import adminService from "../../api/adminService";
import { getErrorMessage } from "../../api/apiErrorHandler";

const Card = ({ label, value, hint, tone }) => (
  <div className={`stat-card ${tone ? `stat-card-${tone}` : ""}`}>
    <div className="stat-value">{value ?? "—"}</div>
    <div className="stat-label">{label}</div>
    {hint && <div className="stat-hint">{hint}</div>}
  </div>
);

/** Registration numbers + a 30-day sign-up chart. */
export default function StudentStats({ refreshKey = 0 }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    adminService
      .getStudentStats()
      .then((d) => !cancelled && setStats(d))
      .catch((e) => !cancelled && setError(getErrorMessage(e)));
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (error) return <div className="admin-error-box">{error}</div>;
  if (!stats) return <div className="admin-loading">Loading statistics…</div>;

  const max = Math.max(1, ...stats.dailySignups.map((d) => d.count));
  const total30 = stats.dailySignups.reduce((a, d) => a + d.count, 0);

  return (
    <div style={{ marginBottom: 20 }}>
      <div className="stat-grid">
        <Card label="Registered students" value={stats.total} tone="primary" />
        <Card label="New today" value={stats.newToday} hint={`${stats.new7d} in 7 days · ${stats.new30d} in 30 days`} />
        <Card label="Active accounts" value={stats.active} hint={`${stats.inactive} disabled`} />
        <Card label="Logged in (24h)" value={stats.loggedIn24h} hint={`${stats.loggedIn7d} in the last 7 days`} />
        <Card label="Email verified" value={stats.emailVerified} hint={`${stats.phoneVerified} phone verified`} />
        <Card label="Sign-up method" value={`${stats.emailSignups} / ${stats.googleSignups}`} hint="email / Google" />
        <Card label="Never logged in" value={stats.neverLoggedIn} hint="registered before login tracking too" />
        <Card label="Sign-ups in progress" value={stats.pendingSignups} hint="OTP sent, not verified yet" />
      </div>

      <div className="admin-card" style={{ marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
          <h3 style={{ margin: 0 }}>New registrations - last 30 days</h3>
          <span className="activity-sub">{total30} total · {stats.timezone} time</span>
        </div>
        <div className="bar-chart" role="img" aria-label="Registrations per day for the last 30 days">
          {stats.dailySignups.map((d) => (
            <div key={d.date} className="bar-col" title={`${d.date}: ${d.count}`}>
              <div className="bar" style={{ height: `${(d.count / max) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="bar-axis">
          <span>{stats.dailySignups[0].date}</span>
          <span>{stats.dailySignups[stats.dailySignups.length - 1].date}</span>
        </div>
        {stats.topTargetExams.length > 0 && (
          <div className="activity-sub" style={{ marginTop: 10 }}>
            Top target exams: {stats.topTargetExams.map((t) => `${t.exam} (${t.count})`).join(" · ")}
          </div>
        )}
      </div>
    </div>
  );
}
