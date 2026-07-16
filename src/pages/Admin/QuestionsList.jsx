import { useState, useEffect } from "react";
import adminService from "../../api/adminService";
import { getErrorMessage } from "../../api/apiErrorHandler";

const OPTION_LABELS = ["A", "B", "C", "D"];

const EMPTY_FORM = {
  importId: "",
  subjectId: "",
  topicId: "",
  questionText: "",
  questionImageUrl: "",
  marks: 4,
  negativeMarks: -1,
  explanation: "",
  source: "",
  year: "",
  options: [
    { optionText: "", optionImageUrl: "", isCorrect: false },
    { optionText: "", optionImageUrl: "", isCorrect: false },
    { optionText: "", optionImageUrl: "", isCorrect: false },
    { optionText: "", optionImageUrl: "", isCorrect: false },
  ],
};

export default function QuestionsList() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editQuestion, setEditQuestion] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM, options: EMPTY_FORM.options.map((o) => ({ ...o })) });
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  document.title = "Manage Questions - Admin";

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (search) params.search = search;
      const data = await adminService.getQuestions(params);
      setQuestions(data.questions);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await adminService.getExams();
      // Get subjects from the question bank - we need a subjects endpoint
      // Fallback: use the first question's subjects or fetch from questions
      const res = await adminService.getQuestions({ limit: 1 });
      if (res.questions?.length > 0) {
        // We'll populate subjects from the questions data
      }
    } catch (err) { /* ignore */ }
  };

  useEffect(() => { fetchQuestions(); }, [page]);

  // Fetch subjects and topics for the form
  useEffect(() => {
    const loadFormData = async () => {
      try {
        // Get distinct subjects from questions
        const res = await adminService.getQuestions({ limit: 200 });
        const subjectMap = new Map();
        const topicMap = new Map();
        res.questions?.forEach((q) => {
          if (q.subject) subjectMap.set(q.subject.id, q.subject);
          if (q.topic) topicMap.set(q.topic.id, q.topic);
        });
        setSubjects(Array.from(subjectMap.values()));
        setTopics(Array.from(topicMap.values()));
      } catch (err) { /* ignore */ }
    };
    loadFormData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchQuestions();
  };

  const openCreate = () => {
    setEditQuestion(null);
    setForm({
      ...EMPTY_FORM,
      options: EMPTY_FORM.options.map((o) => ({ ...o })),
    });
    setShowForm(true);
  };

  const openEdit = (q) => {
    setEditQuestion(q);
    const options = q.options?.length
      ? q.options.map((o) => ({
          optionText: o.optionText || "",
          optionImageUrl: o.optionImageUrl || "",
          isCorrect: o.isCorrect,
        }))
      : EMPTY_FORM.options.map((o) => ({ ...o }));

    // Pad to 4 options
    while (options.length < 4) {
      options.push({ optionText: "", optionImageUrl: "", isCorrect: false });
    }

    setForm({
      importId: q.importId || "",
      subjectId: q.subjectId || "",
      topicId: q.topicId || "",
      questionText: q.questionText || "",
      questionImageUrl: q.questionImageUrl || "",
      marks: q.marks || 4,
      negativeMarks: q.negativeMarks || -1,
      explanation: q.explanation || "",
      source: q.source || "",
      year: q.year || "",
      options,
    });
    setShowForm(true);
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...form.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setForm({ ...form, options: newOptions });
  };

  const setCorrectOption = (index) => {
    const newOptions = form.options.map((o, i) => ({
      ...o,
      isCorrect: i === index,
    }));
    setForm({ ...form, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        importId: form.importId,
        subjectId: form.subjectId,
        topicId: form.topicId || null,
        questionText: form.questionText,
        questionImageUrl: form.questionImageUrl || null,
        marks: Number(form.marks),
        negativeMarks: Number(form.negativeMarks),
        explanation: form.explanation || null,
        source: form.source || null,
        year: form.year ? Number(form.year) : null,
        options: form.options.map((o) => ({
          optionText: o.optionText,
          optionImageUrl: o.optionImageUrl || null,
          isCorrect: o.isCorrect,
        })),
      };

      if (editQuestion) {
        // For update, we only send question fields (options are managed separately)
        const { options, ...questionData } = payload;
        await adminService.updateQuestion(editQuestion.id, questionData);
      } else {
        await adminService.createQuestion(payload);
      }

      setShowForm(false);
      fetchQuestions();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await adminService.deleteQuestion(id);
      fetchQuestions();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const getTopicsForSubject = () => {
    if (!form.subjectId) return topics;
    return topics.filter((t) => t.subjectId === form.subjectId);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Questions</h1>
          <p className="admin-page-sub">Browse and manage the question bank</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <form className="admin-search-form" onSubmit={handleSearch}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
            />
            <button type="submit" className="admin-btn admin-btn-primary">
              Search
            </button>
          </form>
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>
            + Create Question
          </button>
        </div>
      </div>

      {error && <div className="admin-error-box">{error}</div>}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div
            className="admin-modal admin-modal-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{editQuestion ? "Edit Question" : "Create Question"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Import ID *</label>
                  <input
                    value={form.importId}
                    onChange={(e) =>
                      setForm({ ...form, importId: e.target.value })
                    }
                    required
                    placeholder="e.g. PHYSICS_001"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Year</label>
                  <input
                    type="number"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    placeholder="e.g. 2024"
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Subject *</label>
                  <select
                    value={form.subjectId}
                    onChange={(e) =>
                      setForm({ ...form, subjectId: e.target.value, topicId: "" })
                    }
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Topic</label>
                  <select
                    value={form.topicId}
                    onChange={(e) =>
                      setForm({ ...form, topicId: e.target.value })
                    }
                  >
                    <option value="">Select Topic</option>
                    {getTopicsForSubject().map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label>Question Text *</label>
                <textarea
                  value={form.questionText}
                  onChange={(e) =>
                    setForm({ ...form, questionText: e.target.value })
                  }
                  required
                  rows={4}
                  placeholder="Enter the question text (supports LaTeX with $...$)"
                />
              </div>

              <div className="admin-form-group">
                <label>Question Image URL</label>
                <input
                  value={form.questionImageUrl}
                  onChange={(e) =>
                    setForm({ ...form, questionImageUrl: e.target.value })
                  }
                  placeholder="https://example.com/diagram.png"
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Marks</label>
                  <input
                    type="number"
                    value={form.marks}
                    onChange={(e) =>
                      setForm({ ...form, marks: e.target.value })
                    }
                  />
                </div>
                <div className="admin-form-group">
                  <label>Negative Marks</label>
                  <input
                    type="number"
                    value={form.negativeMarks}
                    onChange={(e) =>
                      setForm({ ...form, negativeMarks: e.target.value })
                    }
                  />
                </div>
                <div className="admin-form-group">
                  <label>Source</label>
                  <input
                    value={form.source}
                    onChange={(e) =>
                      setForm({ ...form, source: e.target.value })
                    }
                    placeholder="e.g. Previous Year"
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Explanation</label>
                <textarea
                  value={form.explanation}
                  onChange={(e) =>
                    setForm({ ...form, explanation: e.target.value })
                  }
                  rows={3}
                  placeholder="Explanation for the correct answer"
                />
              </div>

              {/* Options */}
              <div className="admin-section-label">
                <strong>Options</strong>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginLeft: 8 }}>
                  (Select the correct answer)
                </span>
              </div>

              {form.options.map((opt, i) => (
                <div key={i} className="admin-option-row">
                  <div className="admin-option-label">
                    <span
                      className={`admin-option-radio ${opt.isCorrect ? "selected" : ""}`}
                      onClick={() => setCorrectOption(i)}
                      title="Mark as correct answer"
                    >
                      {OPTION_LABELS[i]}
                    </span>
                  </div>
                  <div className="admin-option-fields">
                    <input
                      value={opt.optionText}
                      onChange={(e) =>
                        handleOptionChange(i, "optionText", e.target.value)
                      }
                      placeholder={`Option ${OPTION_LABELS[i]} text`}
                      required
                    />
                    <input
                      value={opt.optionImageUrl}
                      onChange={(e) =>
                        handleOptionChange(i, "optionImageUrl", e.target.value)
                      }
                      placeholder="Image URL (optional)"
                      className="admin-opt-img"
                    />
                  </div>
                  {opt.isCorrect && (
                    <span className="admin-correct-badge">Correct</span>
                  )}
                </div>
              ))}

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : editQuestion
                    ? "Update Question"
                    : "Create Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="admin-loading">Loading...</div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "35%" }}>Question</th>
                  <th>Subject</th>
                  <th>Topic</th>
                  <th>Marks</th>
                  <th>Negative</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.id}>
                    <td className="admin-td-mono">
                      {q.questionText?.substring(0, 120)}
                      {q.questionText?.length > 120 ? "..." : ""}
                    </td>
                    <td>{q.subject?.name || "—"}</td>
                    <td>{q.topic?.name || "—"}</td>
                    <td>{q.marks}</td>
                    <td>{q.negativeMarks}</td>
                    <td className="admin-actions">
                      <button
                        className="admin-btn-sm"
                        onClick={() => openEdit(q)}
                      >
                        ✏️
                      </button>
                      <button
                        className="admin-btn-sm admin-btn-danger"
                        onClick={() => handleDelete(q.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
                {questions.length === 0 && (
                  <tr>
                    <td colSpan="6" className="admin-empty">
                      No questions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="admin-pagination">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}