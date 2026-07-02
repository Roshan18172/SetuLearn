import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function TestInstructions() {
  const [mode, setMode] = useState("timed");
  const location = useLocation();
  const navigate = useNavigate();
  const { test } = location.state || {};
  document.title = "Test Instructions - SetuLearn";

  if (!test) {
    return (
      <div className="empty-state" style={{ padding: "80px 20px" }}>
        <div className="empty-icon">📋</div>
        <h3>No test selected</h3>
        <button className="btn-primary" onClick={() => navigate("/tests")}>Browse Tests</button>
      </div>
    );
  }

  // Handle both array formatting or single text string instructions safely
  const formattedInstructions = Array.isArray(test.instructions)
    ? test.instructions
    : typeof test.instructions === "string"
      ? test.instructions.split(/(?<=\.)\s+/) // Splits long text blocks nicely by sentences
      : ["Attempt all questions carefully.", "Each question carries defined marks.", "Wrong answers carry penalty rules if active."];

  return (
    <div className="instructions-page">
      <div className="instructions-card">
        <div className="instr-header">
          <h1>Test Instructions</h1>
        </div>

        {/* Test master meta strip */}
        <div className="instr-meta-strip">
          <div className="instr-test-title">{test.title}</div>
          <div className="instr-stats">
            <div className="istat">
              <b>{test.questions}</b>
              <span>Questions</span>
            </div>
            <div className="istat">
              <b>{test.duration}</b>
              <span>Minutes</span>
            </div>
            <div className="istat">
              <b>{test.marks}</b>
              <span>Total Marks</span>
            </div>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="mode-toggle-section">
          <h3>Select Mode</h3>
          <div className="mode-toggle">
            <button className={`mode-btn ${mode === "timed" ? "active" : ""}`} onClick={() => setMode("timed")} >
              ⏱️ Timed Mode
              <span>Simulates real exam with countdown</span>
            </button>
            <button className={`mode-btn ${mode === "untimed" ? "active" : ""}`} onClick={() => setMode("untimed")} >
              📖 Practice Mode
              <span>No timer, go at your own pace</span>
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="instr-sections">
          <div className="instr-section">
            <div className="instr-section-title">
              <span className="instr-num">1</span>
              General Instructions
            </div>
            <ul className="instr-list">
              {formattedInstructions.map((instr, i) => (
                <li key={i}>{instr}</li>
              ))}
            </ul>
          </div>

          <div className="instr-section">
            <div className="instr-section-title">
              <span className="instr-num">2</span>
              Navigation
            </div>
            <ul className="instr-list">
              <li>Use the Next and Previous buttons to navigate between questions.</li>
              <li>You can mark a question for review and come back to it later.</li>
              <li>The question palette on the right shows status of all questions.</li>
            </ul>
          </div>

          <div className="instr-section">
            <div className="instr-section-title">
              <span className="instr-num">3</span>
              Submission
            </div>
            <ul className="instr-list">
              <li>You can submit the test only after the time is over or by clicking the Submit Test button.</li>
              {mode === "timed" && <li>If you do not submit before time runs out, the test will be auto-submitted.</li>}
            </ul>
          </div>

          {/* Subject Breakdown generated dynamically from the combined aggregated sub-tests */}
          {test.subjects?.length > 0 && (
            <div className="instr-section subject-section">
              <div className="instr-section-title">
                <span className="instr-num">4</span>
                Subject Breakdown
              </div>

              <div className="subject-table">
                <div className="st-header">
                  <span>Subject</span>
                  <span>Questions</span>
                  <span>Marks</span>
                </div>

                {test.subjects.map((subject) => (
                  <div key={subject.id} className="st-row">
                    <span>{subject.name}</span>
                    <span>{subject.questions}</span>
                    <span>{subject.marks}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="instr-notice">
          <span>ℹ️</span>
          Make sure you have a stable internet connection.
        </div>

        <div className="instr-actions">
          <button className="btn-outline" onClick={() => navigate("/tests")}>← Back</button>
          <button className="btn-primary btn-lg" onClick={() => navigate("/test", { state: { test, mode } })} >
            Start Test →
          </button>
        </div>
      </div>
    </div>
  );
}