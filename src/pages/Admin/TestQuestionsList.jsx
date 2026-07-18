import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adminService from "../../api/adminService";
import { getErrorMessage } from "../../api/apiErrorHandler";
import { ArrowLeft, Shuffle, Trash2 } from "../../data/svgs";
import DeleteConfirmModal from "./DeleteConfirmModal";

export default function TestQuestionsList() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [testQuestions, setTestQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [selectedTopicIds, setSelectedTopicIds] = useState([]);
  const [countPerTopic, setCountPerTopic] = useState(5);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [questionsPerSubject, setQuestionsPerSubject] = useState(10);
  const [busy, setBusy] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  document.title = "Manage Test Questions - Admin";

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tq, subs, tops, qs] = await Promise.all([
        adminService.getTestQuestions(testId),
        adminService.getSubjects(),
        adminService.getTopics(),
        adminService.getQuestions({ limit: 500 }),
      ]);
      setTest(tq.test);
      setTestQuestions(tq.questions || []);
      setSubjects(subs);
      setTopics(tops);
      setAllQuestions(qs.questions || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };
 // eslint-disable-next-line
  useEffect(() => { fetchData(); }, [testId]);

  const handleAddSingle = async () => {
    if (!selectedQuestionId) { setError("Select a question to add"); return; }
    setBusy(true);
    try {
      await adminService.addTestQuestion(testId, { questionId: selectedQuestionId });
      setShowAdd(false);
      setSelectedQuestionId("");
      fetchData();
    } catch (err) { setError(getErrorMessage(err)); } finally { setBusy(false); }
  };

  const handleBulkAdd = async () => {
    if (selectedTopicIds.length === 0) { setError("Select at least one topic"); return; }
    setBusy(true);
    try {
      await adminService.addTestQuestionsByTopic(testId, { topicIds: selectedTopicIds, countPerTopic: Number(countPerTopic) });
      setShowBulk(false);
      setSelectedTopicIds([]);
      fetchData();
    } catch (err) { setError(getErrorMessage(err)); } finally { setBusy(false); }
  };

  const handleRandomize = async () => {
    if (selectedSubjectIds.length === 0) { setError("Select at least one subject"); return; }
    setBusy(true);
    try {
      await adminService.randomizeTestQuestions(testId, { subjectIds: selectedSubjectIds, questionsPerSubject: Number(questionsPerSubject) });
      setShowBulk(false);
      setSelectedSubjectIds([]);
      fetchData();
      setConfirmAction(null);
    } catch (err) { setError(getErrorMessage(err)); } finally { setBusy(false); setConfirmAction(null); }
  };

  const handleRemove = async (questionId) => {
    try {
      await adminService.removeTestQuestion(testId, questionId);
      fetchData();
      setConfirmAction(null);
    } catch (err) { setError(getErrorMessage(err)); setConfirmAction(null); }
  };

  const handleClearAll = async () => {
    try {
      await adminService.clearTestQuestions(testId);
      fetchData();
      setConfirmAction(null);
    } catch (err) { setError(getErrorMessage(err)); setConfirmAction(null); }
  };

  const totalMarks = testQuestions.reduce((sum, tq) => sum + (tq.question?.marks || 0), 0);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <button className="admin-link-btn" onClick={() => navigate("/admin/tests")} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><ArrowLeft /> Back to Tests</button>
          <h1 style={{ marginTop: 8 }}>{test?.title || "Test Questions"}</h1>
          <p className="admin-page-sub">
            {testQuestions.length} questions · {totalMarks} marks
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="admin-btn" onClick={() => setShowBulk(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Shuffle size={15} /> Bulk Add / Randomize</button>
          <button className="admin-btn admin-btn-primary" onClick={() => setShowAdd(true)}>+ Add Question</button>
          {testQuestions.length > 0 && (
            <button className="admin-btn admin-btn-danger" onClick={() => setConfirmAction("clearAll")}>Clear All</button>
          )}
        </div>
      </div>

      {error && <div className="admin-error-box">{error}</div>}

      {showAdd && (
        <div className="admin-modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <h2>Add Question to Test</h2>
            <div className="admin-form-group">
              <label>Select Question</label>
              <select value={selectedQuestionId} onChange={(e) => setSelectedQuestionId(e.target.value)} size={10} style={{ width: "100%" }}>
                <option value="">-- Choose a question --</option>
                {allQuestions.map((q) => (
                  <option key={q.id} value={q.id}>
                    [{q.subject?.name}] {q.questionText?.substring(0, 80)}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-modal-actions">
              <button className="admin-btn" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" disabled={busy} onClick={handleAddSingle}>Add to Test</button>
            </div>
          </div>
        </div>
      )}

      {showBulk && (
        <div className="admin-modal-overlay" onClick={() => setShowBulk(false)}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <h2>Bulk Add / Randomize Questions</h2>
            <div className="admin-section-label"><strong>Add by Topic</strong></div>
            <div className="admin-form-group">
              <label>Select Topics</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {topics.map((t) => (
                  <label key={t.id} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.82rem", background: selectedTopicIds.includes(t.id) ? "var(--primary-light)" : "#f5f5f5", padding: "6px 10px", borderRadius: 8 }}>
                    <input
                      type="checkbox"
                      checked={selectedTopicIds.includes(t.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedTopicIds([...selectedTopicIds, t.id]);
                        else setSelectedTopicIds(selectedTopicIds.filter((id) => id !== t.id));
                      }}
                    />
                    {t.name} <span style={{ color: "var(--text-muted)" }}>({t.subject?.name})</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="admin-form-group">
              <label>Questions per Topic</label>
              <input type="number" min="1" value={countPerTopic} onChange={(e) => setCountPerTopic(e.target.value)} style={{ width: 120 }} />
            </div>
            <button className="admin-btn admin-btn-primary" disabled={busy} onClick={handleBulkAdd} style={{ marginBottom: 24 }}>
              Add Selected Topics' Questions
            </button>

            <div className="admin-section-label"><strong>Randomize by Subject (Replaces All)</strong></div>
            <div className="admin-form-group">
              <label>Select Subjects</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {subjects.map((s) => (
                  <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.82rem", background: selectedSubjectIds.includes(s.id) ? "var(--primary-light)" : "#f5f5f5", padding: "6px 10px", borderRadius: 8 }}>
                    <input
                      type="checkbox"
                      checked={selectedSubjectIds.includes(s.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedSubjectIds([...selectedSubjectIds, s.id]);
                        else setSelectedSubjectIds(selectedSubjectIds.filter((id) => id !== s.id));
                      }}
                    />
                    {s.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="admin-form-group">
              <label>Questions per Subject</label>
              <input type="number" min="1" value={questionsPerSubject} onChange={(e) => setQuestionsPerSubject(e.target.value)} style={{ width: 120 }} />
            </div>
            <button className="admin-btn admin-btn-danger" disabled={busy} onClick={() => setConfirmAction("randomize")} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Shuffle size={15} /> Randomize Test (Replace All)
            </button>

            <div className="admin-modal-actions">
              <button className="admin-btn" onClick={() => setShowBulk(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!confirmAction}
        title={
          confirmAction === "clearAll" ? "Clear All Questions" :
          confirmAction?.type === "remove" ? "Remove Question" :
          "Randomize Questions"
        }
        message={
          confirmAction === "clearAll" ? "Remove ALL questions from this test?" :
          confirmAction?.type === "remove" ? "Remove this question from the test?" :
          "This will REPLACE all existing questions in the test. Continue?"
        }
        confirmText={
          confirmAction === "clearAll" ? "Clear All" :
          confirmAction?.type === "remove" ? "Remove" :
          "Randomize"
        }
        onConfirm={() => {
          if (confirmAction === "clearAll") handleClearAll();
          else if (confirmAction?.type === "remove") handleRemove(confirmAction.questionId);
          else handleRandomize();
        }}
        onCancel={() => setConfirmAction(null)}
      />

      {loading ? (
        <div className="admin-loading">Loading...</div>
      ) : testQuestions.length === 0 ? (
        <div className="admin-empty" style={{ padding: 60 }}>No questions in this test yet.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>#</th>
                <th>Question</th>
                <th>Subject</th>
                <th>Topic</th>
                <th>Marks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {testQuestions.map((tq, i) => (
                <tr key={tq.id}>
                  <td className="admin-td-bold">{i + 1}</td>
                  <td className="admin-td-mono">{tq.question?.questionText?.substring(0, 120)}{tq.question?.questionText?.length > 120 ? "..." : ""}</td>
                  <td>{tq.question?.subject?.name || "—"}</td>
                  <td>{tq.question?.topic?.name || "—"}</td>
                  <td>{tq.question?.marks || 0}</td>
                  <td className="admin-actions">
                    <button className="admin-btn-sm admin-btn-danger" onClick={() => setConfirmAction({ type: "remove", questionId: tq.questionId })}><Trash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}