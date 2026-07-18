import { useState, useRef, useEffect } from "react";
import adminService from "../../api/adminService";
import { getErrorMessage } from "../../api/apiErrorHandler";
import { seedQuestionsStream } from "../../api/seedStreamService";

export default function QuestionSeed() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [clearExisting, setClearExisting] = useState(false);

  // Streaming log state
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(null); // { current, total, percent }
  const logEndRef = useRef(null);
  const streamRef = useRef(null);

  document.title = "Seed Questions - Admin";

  // Auto-scroll log panel
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (type, message, data) => {
    setLogs((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), type, message, data, timestamp: new Date() },
    ]);
  };

  const handlePreview = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an Excel file first");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const result = await adminService.previewQuestionsExcel(file);
      console.log("Preview result:", result);
      if (!result) {
        setError(
          "Preview returned empty result. Please check the file format and try again.",
        );
        setPreview(null);
      } else {
        setPreview(result);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to preview questions"));
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    if (!file) {
      setError("Please select an Excel file first");
      return;
    }

    // Reset streaming state
    setSeeding(true);
    setError("");
    setSuccess("");
    setLogs([]);
    setProgress(null);

    addLog("info", "Starting seed process...");

    streamRef.current = seedQuestionsStream(file, clearExisting, {
      onEvent: (event) => {
        addLog(event.type, event.message, event.data);

        // Track progress
        if (event.type === "progress" && event.data) {
          setProgress({
            current: event.data.current || 0,
            total: event.data.total || 0,
            percent: event.data.percent || 0,
          });
        }
      },
      onError: (err) => {
        addLog("error", err.message);
        setError(err.message);
        setSeeding(false);
      },
      onComplete: (data) => {
        addLog("complete", "Seeding completed successfully!", data);
        if (data) {
          setSuccess(
            `Successfully seeded ${data.imported || data.count || "?"} questions!` +
              (data.skipped ? ` (${data.skipped} skipped)` : "") +
              (data.total ? ` out of ${data.total} total` : ""),
          );
        } else {
          setSuccess("Seeding completed successfully!");
        }
        setSeeding(false);
        setPreview(null);
        setFile(null);
        // Reset file input visually
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
      },
    });
  };

  const handleCancel = () => {
    if (streamRef.current) {
      streamRef.current.abort();
      addLog("info", "Seeding cancelled by user.");
      setSeeding(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(null);
      setLogs([]);
      setProgress(null);
    }
  };

  /** Map SSE event type to a CSS class for log styling */
  const logClass = (type) => {
    switch (type) {
      case "info":
        return "seed-log-info";
      case "success":
        return "seed-log-success";
      case "error":
        return "seed-log-error";
      case "progress":
        return "seed-log-progress";
      case "complete":
        return "seed-log-complete";
      default:
        return "";
    }
  };

  /** Icon for each log type */
  const logIcon = (type) => {
    switch (type) {
      case "info":
        return "ℹ️";
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "progress":
        return "⏳";
      case "complete":
        return "🎉";
      default:
        return "•";
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Seed Questions</h1>
          <p className="admin-page-sub">Upload questions from Excel file</p>
        </div>
      </div>

      {error && !seeding && <div className="admin-error-box">{error}</div>}
      {success && !seeding && <div className="admin-success-box">{success}</div>}

      <div className="admin-card">
        <h2>Upload Excel File</h2>
        <p className="admin-card-sub">
          Supported format: .xlsx, .xls. The file should contain columns for:
          importId, subjectId, topicId, questionText, marks, negativeMarks,
          options (A-D)
        </p>

        <form onSubmit={handlePreview}>
          <div className="admin-form-group">
            <label>Select Excel File *</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              required
              disabled={seeding}
            />
          </div>

          <div className="admin-form-group">
            <label>
              <input
                type="checkbox"
                checked={clearExisting}
                onChange={(e) => setClearExisting(e.target.checked)}
                disabled={seeding}
              />{" "}
              Clear existing questions before seeding
            </label>
            <small className="admin-help-text">
              Check this to delete all existing questions before uploading new
              ones (use with caution!)
            </small>
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={loading || !file || seeding}
          >
            {loading ? "Previewing..." : "Preview Questions"}
          </button>
        </form>
      </div>

      {preview && !seeding && (
        <div className="admin-card">
          <h2>Preview Summary</h2>
          <div className="admin-preview-summary">
            <div className="admin-summary-item">
              <span className="admin-summary-label">Total Questions:</span>
              <span className="admin-summary-value">
                {preview.totalQuestions}
              </span>
            </div>
            <div className="admin-summary-item">
              <span className="admin-summary-label">Total Marks:</span>
              <span className="admin-summary-value">{preview.totalMarks}</span>
            </div>
            {preview.subjects && (
              <div className="admin-summary-item">
                <span className="admin-summary-label">Subjects:</span>
                <span className="admin-summary-value">
                  {(Array.isArray(preview.subjects)
                    ? preview.subjects
                    : Object.values(preview.subjects || {})
                  )
                    .map((s) => s.name || s)
                    .join(", ")}
                </span>
              </div>
            )}
            {preview.topics && (
              <div className="admin-summary-item">
                <span className="admin-summary-label">Topics:</span>
                <span className="admin-summary-value">
                  {(Array.isArray(preview.topics)
                    ? preview.topics
                    : Object.values(
                        preview.topics.reduce((acc, obj) => {
                          acc[obj.id] = obj;
                          return acc;
                        }, {}),
                      )
                  )
                    .map((t) => t.topic_name || t)
                    .join(", ")}
                </span>
              </div>
            )}
          </div>

          {preview.errors?.length > 0 && (
            <div className="admin-error-box">
              <strong>Errors found:</strong>
              <ul>
                {preview.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            className="admin-btn admin-btn-primary"
            onClick={handleSeed}
            disabled={seeding}
            style={{ marginTop: "20px" }}
          >
            {seeding ? "Seeding..." : "Confirm & Seed Questions"}
          </button>
        </div>
      )}

      {/* Streaming Log Panel — visible during seeding or when logs exist */}
      {(seeding || logs.length > 0) && (
        <div className="admin-card seed-log-panel">
          <div className="seed-log-header">
            <h2>Seed Progress</h2>
            {seeding && (
              <button
                className="admin-btn admin-btn-danger"
                onClick={handleCancel}
                style={{ padding: "4px 14px", fontSize: "0.85rem" }}
              >
                Cancel
              </button>
            )}
          </div>

          {/* Progress bar */}
          {progress && progress.total > 0 && (
            <div className="seed-progress-bar-container">
              <div className="seed-progress-bar">
                <div
                  className="seed-progress-fill"
                  style={{ width: `${Math.min(progress.percent, 100)}%` }}
                />
              </div>
              <span className="seed-progress-text">
                {progress.current} / {progress.total} questions
                {" — "}
                {Math.round(progress.percent)}%
              </span>
            </div>
          )}

          {/* Log entries */}
          <div className="seed-log-list">
            {logs.map((log) => (
              <div key={log.id} className={`seed-log-entry ${logClass(log.type)}`}>
                <span className="seed-log-icon">{logIcon(log.type)}</span>
                <span className="seed-log-message">{log.message}</span>
                {log.data && log.type === "progress" && log.data.detail && (
                  <span className="seed-log-detail">{log.data.detail}</span>
                )}
              </div>
            ))}
            {seeding && (
              <div className="seed-log-entry seed-log-pending">
                <span className="seed-log-icon">⏳</span>
                <span className="seed-log-message">Processing...</span>
                <span className="seed-log-dots">
                  <span className="dot-1">.</span>
                  <span className="dot-2">.</span>
                  <span className="dot-3">.</span>
                </span>
              </div>
            )}
            <div ref={logEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}