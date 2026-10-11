import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import studyService from "../../api/studyService";
import { getErrorMessage } from "../../api/apiErrorHandler";
import { GAMES } from "../../games/gamesConfig";
import "../../components/study/study.css";

const gameName = (id) => GAMES.find((g) => g.id === id)?.title || id;
const Bar = ({ value, max, tone = "" }) => (
  <div className={`study-bar ${tone}`}><div style={{ width: `${Math.min(100, (value / Math.max(1, max)) * 100)}%` }} /></div>
);

export default function StudentProgress() {
  document.title = "My Progress - SetuLearn";
  const [p, setP] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { studyService.progress().then(setP).catch((e) => setError(getErrorMessage(e))); }, []);

  if (error) return <div className="admin-page"><div className="admin-error-box">{error}</div></div>;
  if (!p) return <div className="admin-page"><div className="admin-loading">Loading your progress…</div></div>;

  const maxAct = Math.max(1, ...p.activity.map((a) => a.count));
  const earned = p.badges.filter((b) => b.earned).length;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>My Progress</h1>
          <p className="admin-page-sub">Your streak, level, goals and badges</p>
        </div>
        <Link className="admin-btn admin-btn-primary" to="/dashboard/daily">📅 Today's challenge</Link>
      </div>

      <div className="study-cards">
        <div className="study-card hot"><span className="streak-flame">🔥</span><b>{p.streak.current}</b><span>day streak{p.streak.activeToday ? " · done today ✔" : " · study today to keep it!"}</span></div>
        <div className="study-card"><b>Level {p.xp.level}</b><span>{p.xp.xp} XP · {p.xp.next - p.xp.xp} to next level</span><Bar value={p.xp.xp - p.xp.floor} max={p.xp.next - p.xp.floor} /></div>
        <div className="study-card"><b>{p.totals.tests}</b><span>tests submitted · avg {p.totals.averagePercentage}% · best {p.totals.bestPercentage}%</span></div>
        <div className="study-card"><b>{p.streak.longest}</b><span>longest streak (days)</span></div>
      </div>

      <div className="admin-card">
        <h3 style={{ marginTop: 0 }}>🎯 This week's goals</h3>
        <div className="row-split"><span>Tests submitted</span><b>{p.weekly.tests} / {p.weekly.testTarget}</b></div>
        <Bar value={p.weekly.tests} max={p.weekly.testTarget} tone="green" />
        <div className="row-split" style={{ marginTop: 12 }}><span>Questions answered</span><b>{p.weekly.questions} / {p.weekly.questionTarget}</b></div>
        <Bar value={p.weekly.questions} max={p.weekly.questionTarget} tone="green" />
      </div>

      <div className="admin-card" style={{ marginTop: 14 }}>
        <h3 style={{ marginTop: 0 }}>Last 14 days</h3>
        <div className="bar-chart" role="img" aria-label="Study activity in the last 14 days">
          {p.activity.map((a) => (
            <div key={a.date} className="bar-col" title={`${a.date}: ${a.count} activities`}><div className="bar" style={{ height: `${(a.count / maxAct) * 100}%` }} /></div>
          ))}
        </div>
        <div className="bar-axis"><span>{p.activity[0].date}</span><span>{p.activity[p.activity.length - 1].date}</span></div>
      </div>

      <div className="admin-card" style={{ marginTop: 14 }}>
        <h3 style={{ marginTop: 0 }}>🏅 Badges <small style={{ fontWeight: 500, color: "#6a6285" }}>{earned}/{p.badges.length} earned</small></h3>
        <div className="badge-grid">
          {p.badges.map((b) => (
            <div key={b.id} className={`badge-tile ${b.earned ? "" : "locked"}`} title={b.description}>
              <div className="icon">{b.icon}</div><b>{b.title}</b><small>{b.earned ? "Earned!" : `${b.progress}/${b.target} · ${b.description}`}</small>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14, marginTop: 14 }}>
        <div className="admin-card">
          <h3 style={{ marginTop: 0 }}>Topics to work on</h3>
          {p.weakTopics.length === 0 ? <p className="activity-sub">Take a few more tests and your weakest topics will show up here.</p> : p.weakTopics.map((t) => (
            <div key={t.topic} style={{ marginBottom: 10 }}>
              <div className="row-split"><span>{t.topic} <small className="activity-sub">{t.subject}</small></span><b>{t.accuracy}%</b></div>
              <Bar value={t.accuracy} max={100} tone="orange" />
            </div>
          ))}
          {p.weakTopics.length > 0 && <Link to="/practice" className="admin-btn" style={{ marginTop: 8 }}>Practice now</Link>}
        </div>
        <div className="admin-card">
          <h3 style={{ marginTop: 0 }}>Accuracy by subject</h3>
          {p.subjects.length === 0 ? <p className="activity-sub">No answered questions yet.</p> : p.subjects.map((s) => (
            <div key={s.subject} style={{ marginBottom: 10 }}>
              <div className="row-split"><span>{s.subject} <small className="activity-sub">{s.attempts} answered</small></span><b>{s.accuracy}%</b></div>
              <Bar value={s.accuracy} max={100} />
            </div>
          ))}
        </div>
        <div className="admin-card">
          <h3 style={{ marginTop: 0 }}>🎮 Your game scores</h3>
          {p.games.length === 0 ? <p className="activity-sub">Play a game while logged in and your best scores appear here.</p> : (
            <ul className="lb-list">{p.games.map((g) => <li key={g.gameId}><span>{gameName(g.gameId)}</span><b>{g.best}</b></li>)}</ul>
          )}
          <Link to="/games" className="admin-btn" style={{ marginTop: 10 }}>Play a game</Link>
        </div>
      </div>
      <p className="activity-sub" style={{ marginTop: 18 }}>
        Your data is yours:{" "}
        <button type="button" className="qa-btn" onClick={() => studyService.exportMyData().catch((e) => setError(getErrorMessage(e)))}>⬇ Download my data (JSON)</button>
      </p>
    </div>
  );
}
