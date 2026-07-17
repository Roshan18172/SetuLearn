import { useState } from "react";
import adminService from "../../api/adminService";
import { getErrorMessage } from "../../api/apiErrorHandler";

export default function QuestionSeed() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [clearExisting, setClearExisting] = useState(false);

  document.title = "Seed Questions - Admin";

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
      setPreview(result);
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
    setSeeding(true);
    setError("");
    setSuccess("");
    try {
      const result = await adminService.seedQuestionsExcel(file, clearExisting);
      setSuccess(`Successfully seeded ${result.count} questions! Total Marks: ${result.totalMarks}, Total Negative: ${result.totalNegative}`);
      setPreview(null);
      setFile(null);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to seed questions"));
    } finally {
      setSeeding(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(null);
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

      {error && <div className="admin-error-box">{error}</div>}
      {success && <div className="admin-success-box">{success}</div>}

      <div className="admin-card">
        <h2>Upload Excel File</h2>
        <p className="admin-card-sub">
          Supported format: .xlsx, .xls. The file should contain columns for:
          importId, subjectId, topicId, questionText, marks, negativeMarks, options (A-D)
        </p>

        <form onSubmit={handlePreview}>
          <div className="admin-form-group">
            <label>Select Excel File *</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              required
            />
          </div>

          <div className="admin-form-group">
            <label>
              <input
                type="checkbox"
                checked={clearExisting}
                onChange={(e) => setClearExisting(e.target.checked)}
              />
              {" "}Clear existing questions before seeding
            </label>
            <small className="admin-help-text">
              Check this to delete all existing questions before uploading new ones (use with caution!)
            </small>
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={loading || !file}
          >
            {loading ? "Previewing..." : "Preview Questions"}
          </button>
        </form>
      </div>

      {preview && (
        <div className="admin-card">
          <h2>Preview Summary</h2>
          <div className="admin-preview-summary">
            <div className="admin-summary-item">
              <span className="admin-summary-label">Total Questions:</span>
              <span className="admin-summary-value">{preview.count}</span>
            </div>
            <div className="admin-summary-item">
              <span className="admin-summary-label">Total Marks:</span>
              <span className="admin-summary-value">{preview.totalMarks}</span>
            </div>
            <div className="admin-summary-item">
              <span className="admin-summary-label">Total Negative:</span>
              <span className="admin-summary-value">{preview.totalNegative}</span>
            </div>
            {preview.subjects && (
              <div className="admin-summary-item">
                <span className="admin-summary-label">Subjects:</span>
                <span className="admin-summary-value">
                  {preview.subjects.map((s) => s.name).join(", ")}
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
    </div>
  );
}