import { useState } from "react";

export default function DeleteConfirmModal({
  isOpen,
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete",
  onConfirm,
  onCancel,
}) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onCancel}>
      <div className="admin-modal admin-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="admin-delete-icon-wrap">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </div>
        <h2>{title}</h2>
        <p className="admin-delete-message">{message}</p>
        <div className="admin-delete-modal-actions">
          <button className="admin-modal-btn" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            className="admin-modal-btn admin-modal-btn-danger"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}