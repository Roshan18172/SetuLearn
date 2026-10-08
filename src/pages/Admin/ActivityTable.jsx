import { useState } from "react";
import { actionLabel, formatDateTime, shortUserAgent } from "../../utils/activity";

/** Rows of activity logs with an expandable details row. Used by Activity Logs and the student modal. */
export default function ActivityTable({ logs, showActor = true }) {
  const [openId, setOpenId] = useState(null);

  if (!logs.length) return <div className="admin-empty">No activity found.</div>;

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Time</th>
            {showActor && <th>Who</th>}
            <th>Action</th>
            <th>Result</th>
            <th>IP</th>
            <th>Device</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => {
            const open = openId === l.id;
            const hasDetails = l.description || l.metadata || l.userAgent;
            return [
              <tr
                key={l.id}
                className={hasDetails ? "activity-row-clickable" : ""}
                onClick={() => hasDetails && setOpenId(open ? null : l.id)}
              >
                <td style={{ whiteSpace: "nowrap" }}>{formatDateTime(l.createdAt)}</td>
                {showActor && (
                  <td>
                    <div className="admin-td-bold">{l.actorName || "—"}</div>
                    <div className="activity-sub">
                      <span className={`admin-badge ${l.actorType === "ADMIN" ? "admin-badge-info" : "admin-badge-secondary"}`}>
                        {l.actorType.toLowerCase()}
                      </span>{" "}
                      {l.actorEmail}
                    </div>
                  </td>
                )}
                <td>{actionLabel(l.action)}</td>
                <td>
                  <span className={`admin-badge ${l.status === "SUCCESS" ? "admin-badge-success" : "admin-badge-danger"}`}>
                    {l.status === "SUCCESS" ? "Success" : "Failed"}
                  </span>
                </td>
                <td>{l.ip || "—"}</td>
                <td>{shortUserAgent(l.userAgent)}</td>
              </tr>,
              open && (
                <tr key={`${l.id}-details`} className="activity-details-row">
                  <td colSpan={showActor ? 6 : 5}>
                    {l.description && <div><strong>Details:</strong> {l.description}</div>}
                    {l.metadata && (
                      <pre className="activity-json">{JSON.stringify(l.metadata, null, 2)}</pre>
                    )}
                    {l.userAgent && <div className="activity-sub"><strong>User agent:</strong> {l.userAgent}</div>}
                  </td>
                </tr>
              ),
            ];
          })}
        </tbody>
      </table>
    </div>
  );
}
