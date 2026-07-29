import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, X } from "../data/svgs";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
  ensureWelcomeNotification,
  NOTIFICATIONS_EVENT,
} from "../utils/notifications";

const TYPE_ICON = {
  welcome: "/icons/rocket.png",
  test_completed: "/icons/correct.png",
};

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const refresh = () => {
    setNotifications(getNotifications());
    setUnread(getUnreadCount());
  };

  useEffect(() => {
    ensureWelcomeNotification();
    refresh();

    window.addEventListener(NOTIFICATIONS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(NOTIFICATIONS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  // Lock body scroll while the sidebar is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleItemClick = (n) => {
    markAsRead(n.id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <>
      <button
        className="notif-bell-btn"
        onClick={() => setOpen(true)}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="notif-badge">{unread > 9 ? "9+" : unread}</span>
        )}
      </button>

      {open && (
        <div className="notif-overlay" onClick={() => setOpen(false)}>
          <aside
            className="notif-sidebar notif-sidebar-open"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="notif-sidebar-header">
              <h3>Notifications</h3>
              <button
                className="notif-close-btn"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
              >
                <X />
              </button>
            </div>

            {notifications.length > 0 && (
              <div className="notif-actions">
                <button onClick={markAllAsRead}>Mark all as read</button>
                <button onClick={clearAllNotifications}>Clear all</button>
              </div>
            )}

            <div className="notif-list">
              {notifications.length === 0 ? (
                <div className="notif-empty">
                  <img src="/icons/misc/inbox-empty.png" alt="" />
                  <p>No notifications yet.</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const icon = n.icon || TYPE_ICON[n.type];
                  return (
                    <button
                      key={n.id}
                      className={`notif-item ${n.read ? "" : "notif-unread"}`}
                      onClick={() => handleItemClick(n)}
                    >
                      <div className="notif-item-icon">
                        {icon && icon.startsWith("/") ? (
                          <img src={icon} alt="" />
                        ) : (
                          <Bell size={18} />
                        )}
                      </div>
                      <div className="notif-item-body">
                        <div className="notif-item-title">{n.title}</div>
                        <p className="notif-item-message">{n.message}</p>
                        {n.link && <span className="notif-item-link">Click to view →</span>}
                        <span className="notif-item-time">{timeAgo(n.timestamp)}</span>
                      </div>
                      {!n.read && <span className="notif-dot" />}
                    </button>
                  );
                })
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
