import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "../data/svgs";
import SEO from "../components/SEO";

export default function TestInstructions() {
  const [mode, setMode] = useState("timed");
  const location = useLocation();
  const navigate = useNavigate();
  const { test } = location.state || {};

  if (!test) {
    return (
      <div className="empty-state" style={{ padding: "80px 20px" }}>
        <div className="empty-icon">📋</div>
        <h3>No test selected</h3>
        <button className="btn-primary" onClick={() => navigate("/tests")}>
          Browse Tests
        </button>
      </div>
    );
  }

  // Handle both array formatting or single text string instructions safely
  const formattedInstructions = Array.isArray(test.instructions)
    ? test.instructions
    : typeof test.instructions === "string"
      ? test.instructions.split(/(?<=\.)\s+/) // Splits long text blocks nicely by sentences
      : [
          "Attempt all questions carefully.",
          "Each question carries defined marks.",
          "Wrong answers carry penalty rules if active.",
        ];

  return (
    <div className="instructions-page">
      <SEO
        title={test?.title ? `Test Instructions - ${test.title}` : "Test Instructions"}
        description="Review test instructions, question distribution, marking scheme, and exam pattern before starting your SetuLearn mock test."
        canonical="/instructions"
      />
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
            <button
              className={`mode-btn ${mode === "timed" ? "active" : ""}`}
              onClick={() => setMode("timed")}
            >
              ⏱️ Timed Mode
              <span>Simulates real exam with countdown</span>
            </button>
            <button
              className={`mode-btn ${mode === "untimed" ? "active" : ""}`}
              onClick={() => setMode("untimed")}
            >
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
              <li>
                Use the Next and Previous buttons to navigate between questions.
              </li>
              <li>
                You can mark a question for review and come back to it later.
              </li>
              <li>
                The question palette on the right shows status of all questions.
              </li>
            </ul>
          </div>

          <div className="instr-section">
            <div className="instr-section-title">
              <span className="instr-num">3</span>
              Submission
            </div>
            <ul className="instr-list">
              <li>
                You can submit the test only after the time is over or by
                clicking the Submit Test button.
              </li>
              {mode === "timed" && (
                <li>
                  If you do not submit before time runs out, the test will be
                  auto-submitted.
                </li>
              )}
            </ul>
          </div>

          {/* Subject Breakdown generated dynamically from the combined aggregated sub-tests */}
          {test.subjects?.length > 0 && (
            <div className="instr-section subject-section">
              <div className="instr-section-title">
                <span className="instr-num">4</span>
                Subject Breakdown
              </div>

              <div className="st-header">
                <div className="subject-col">Subject</div>
                <div className="col">Questions</div>
                <div className="col">Marks</div>
              </div>

              {test.subjects.map((subject) => (
                <div key={subject.id} className="st-row">
                  <div className="subject-col">{subject.name}</div>
                  <div>{subject.questions}</div>
                  <div>{subject.marks}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="instr-notice">
          <span>ℹ️</span>
          Make sure you have a stable internet connection.
        </div>

        <div className="instr-actions">
          <button className="btn-outline" onClick={() => navigate("/tests")}>
            <ArrowLeft />
            <span>Back</span>
          </button>
          <button
            className="btn-primary btn-lg"
            onClick={() => {
              // Clear any "already submitted"/"already exited" flags from
              // a previous attempt so a fresh attempt isn't immediately
              // bounced back out.
              if (test?.id) {
                sessionStorage.removeItem(`test_submitted_${test.id}`);
                sessionStorage.removeItem(`test_exited_${test.id}`);
              }
              // replace: true — TestInterface takes Instructions' place in
              // history, so pressing Back mid-test goes straight to Tests
              // instead of back through here.
              navigate("/test", { replace: true, state: { test, mode } });
            }}
          >
            <span>Start Test</span>
            <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}