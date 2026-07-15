import { useEffect } from "react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  primaryLabel = "Confirm",
  secondaryLabel = "Cancel",
  onPrimary,
  onSecondary,
  primaryDisabled = false,
  variant = "primary", // "primary" | "danger"
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {title && <h3>{title}</h3>}
        {children && <div className="modal-body">{children}</div>}
        <div className="modal-actions">
          {secondaryLabel && onSecondary && (
            <button className="btn-outline" onClick={onSecondary}>
              {secondaryLabel}
            </button>
          )}
          {primaryLabel && onPrimary && (
            <button
              className={`btn-primary${variant === "danger" ? " btn-danger" : ""}`}
              onClick={onPrimary}
              disabled={primaryDisabled}
            >
              {primaryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}