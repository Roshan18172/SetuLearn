import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import eventsService from "../api/eventsService";
import { addNotification } from "../utils/notifications";
import {
  isExcludedRoute,
  getLastShown,
  markShownNow,
  msUntilNextShow,
  hasNotifiedToday,
  markNotifiedToday,
  MODAL_INITIAL_DELAY_MS,
} from "../utils/eventPopup";
import { X } from "../data/svgs";

// How often we re-check whether it's time to pop the modal again. Kept
// short (not the same as the 20-minute repeat interval) so that if the
// 20-minute mark ticks over while the student is on an excluded page
// (e.g. mid-test), the modal appears promptly once they land somewhere
// it's allowed, instead of waiting for the *next* 20-minute window.
const CHECK_INTERVAL_MS = 15 * 1000;

function darken(hex, amount = 0.25) {
  try {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, ((num >> 16) & 0xff) * (1 - amount));
    const g = Math.max(0, ((num >> 8) & 0xff) * (1 - amount));
    const b = Math.max(0, (num & 0xff) * (1 - amount));
    return `rgb(${r | 0}, ${g | 0}, ${b | 0})`;
  } catch {
    return hex;
  }
}

export default function EventModalManager() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathRef = useRef(location.pathname);
  const [eventData, setEventData] = useState(null);
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);

  useEffect(() => {
    pathRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Fetch today's event content once.
  useEffect(() => {
    let cancelled = false;
    eventsService
      .getToday()
      .then((data) => {
        if (cancelled) return;
        setEventData(data);

        // Add a notification for today's occasion, once per calendar day.
        if (!hasNotifiedToday(data.date, data.event.id)) {
          addNotification({
            type: "event",
            title: `${data.event.emoji} ${data.event.name}`,
            message: `${data.quizTitle} is ready — take it to test yourself!`,
            link: "/current-affairs-quiz",
          });
          markNotifiedToday(data.date, data.event.id);
        }
      })
      .catch((err) => {
        console.error("[EventModalManager] Failed to load today's event:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Timing: show 2-3s after the very first load if due, then re-check
  // periodically so it reappears roughly every 20 minutes.
  useEffect(() => {
    if (!eventData) return;

    const tryShow = () => {
      if (openRef.current) return;
      if (isExcludedRoute(pathRef.current)) return;
      if (msUntilNextShow() > 0) return;
      setOpen(true);
      markShownNow();
    };

    let initialTimer = null;
    if (getLastShown() === 0) {
      initialTimer = setTimeout(tryShow, MODAL_INITIAL_DELAY_MS);
    }

    const interval = setInterval(tryShow, CHECK_INTERVAL_MS);
    return () => {
      if (initialTimer) clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [eventData]);

  if (!open || !eventData) return null;

  const { event, greeting, date } = eventData;
  const color = event.color || "#5A1EAD";

  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
  });

  const handleTakeQuiz = () => {
    setOpen(false);
    navigate("/current-affairs-quiz");
  };

  return (
    <div className="event-modal-overlay" onClick={() => setOpen(false)}>
      <div
        className="event-modal-box"
        style={{ "--event-color": color, "--event-color-dark": darken(color) }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="event-modal-banner">
          <button
            className="event-modal-close"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <X size={16} />
          </button>
          <span className="event-modal-emoji">{event.emoji}</span>
          <h3 className="event-modal-title">{event.name}</h3>
          <div className="event-modal-date">{formattedDate}</div>
        </div>
        <div className="event-modal-body">
          <p className="event-modal-greeting">{greeting}</p>
          <div className="event-modal-actions">
            <button className="btn-outline" onClick={() => setOpen(false)}>
              Maybe later
            </button>
            <button className="btn-primary" onClick={handleTakeQuiz}>
              Take the Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
