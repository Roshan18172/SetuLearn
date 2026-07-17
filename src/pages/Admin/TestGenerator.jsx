import { useState, useEffect } from "react";
import adminService from "../../api/adminService";
import { getErrorMessage } from "../../api/apiErrorHandler";

export default function TestGenerator() {
  const [activeTab, setActiveTab] = useState("by-range");
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // By Range Form Data
  const [rangeForm, setRangeForm] = useState({
    testName: "",
    importIdFrom: "",
    importIdTo: "",
  });

  // By Subject Form Data
  const [subjectForm, setSubjectForm] = useState({
    testName: "",
    subjectConfigs: [{ subjectId: "", topicIds: [], countPerTopic: 5, shuffle: true }],
  });

  document.title = "Test Generator - Admin";

  useEffect(() => {
    fetchSubjects();
    fetchTopics();
  }, []);

  const fetchSubjects = async () => {
    try {
      setSubjects(await adminService.getSubjects());
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load subjects"));
    }
  };

  const fetchTopics = async () => {
    try {
      setTopics(await adminService.getTopics({ limit: 1000 }));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load topics"));
    }
  };

  const handleRangeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await adminService.generateTestByRange(
        rangeForm.testName,
        rangeForm.importIdFrom,
        rangeForm.importIdTo
      );
      setSuccess(`Test generated successfully! Total Marks: ${response.totalMarks}, Total Questions: ${response.totalQuestions}`);
      setRangeForm({ testName: "", importIdFrom: "", importIdTo: "" });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to generate test"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await adminService.generateTestBySubject(
        subjectForm.testName,
        subjectForm.subjectConfigs
      );
      setSuccess(`Test generated successfully! Total Marks: ${response.totalMarks}, Total Questions: ${response.totalQuestions}`);
      setSubjectForm({
        testName: "",
        subjectConfigs: [{ subjectId: "", topicIds: [], countPerTopic: 5, shuffle: true }],
      });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to generate test"));
    } finally {
      setLoading(false);
    }
  };

  const addSubjectConfig = () => {
    setSubjectForm({
      ...subjectForm,
      subjectConfigs: [
        ...subjectForm.subjectConfigs,
        { subjectId: "", topicIds: [], countPerTopic: 5, shuffle: true },
      ],
    });
  };

  const updateSubjectConfig = (index, field, value) => {
    const newConfigs = [...subjectForm.subjectConfigs];
    newConfigs[index] = { ...newConfigs[index], [field]: value };
    setSubjectForm({ ...subjectForm, subjectConfigs: newConfigs });
  };

  const removeSubjectConfig = (index) => {
    const newConfigs = subjectForm.subjectConfigs.filter((_, i) => i !== index);
    setSubjectForm({ ...subjectForm, subjectConfigs: newConfigs });
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Test Generator</h1>
          <p className="admin-page-sub">Generate tests from questions in bulk</p>
        </div>
      </div>

      {error && <div className="admin-error-box">{error}</div>}
      {success && <div className="admin-success-box">{success}</div>}

      <div className="admin-tab-nav">
        <button
          className={`admin-tab ${activeTab === "by-range" ? "active" : ""}`}
          onClick={() => setActiveTab("by-range")}
        >
          By Import Range
        </button>
        <button
          className={`admin-tab ${activeTab === "by-subject" ? "active" : ""}`}
          onClick={() => setActiveTab("by-subject")}
        >
          By Subject/Topic
        </button>
      </div>

      {activeTab === "by-range" && (
        <div className="admin-card">
          <h2>Generate Test by Import Code Range</h2>
          <p className="admin-card-sub">
            Generate a test using questions with import IDs within a specified range.
          </p>
          <form onSubmit={handleRangeSubmit}>
            <div className="admin-form-group">
              <label>Test Name *</label>
              <input
                value={rangeForm.testName}
                onChange={(e) => setRangeForm({ ...rangeForm, testName: e.target.value })}
                placeholder="e.g., SSC CGL Mock Test 1"
                required
              />
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Import ID From *</label>
                <input
                  type="number"
                  value={rangeForm.importIdFrom}
                  onChange={(e) => setRangeForm({ ...rangeForm, importIdFrom: +e.target.value })}
                  placeholder="1"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Import ID To *</label>
                <input
                  type="number"
                  value={rangeForm.importIdTo}
                  onChange={(e) => setRangeForm({ ...rangeForm, importIdTo: +e.target.value })}
                  placeholder="100"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Test"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "by-subject" && (
        <div className="admin-card">
          <h2>Generate Test by Subject/Topic</h2>
          <p className="admin-card-sub">
            Generate a test by selecting specific subjects and topics.
          </p>
          <form onSubmit={handleSubjectSubmit}>
            <div className="admin-form-group">
              <label>Test Name *</label>
              <input
                value={subjectForm.testName}
                onChange={(e) => setSubjectForm({ ...subjectForm, testName: e.target.value })}
                placeholder="e.g., SSC CGL Subject-wise Mock Test"
                required
              />
            </div>

            <div className="admin-divider">
              <span>Subject Configurations</span>
            </div>

            {subjectForm.subjectConfigs.map((config, index) => (
              <div key={index} className="admin-subject-config">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Subject *</label>
                    <select
                      value={config.subjectId}
                      onChange={(e) => updateSubjectConfig(index, "subjectId", e.target.value)}
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
                    <label>Questions per Topic *</label>
                    <input
                      type="number"
                      value={config.countPerTopic}
                      onChange={(e) => updateSubjectConfig(index, "countPerTopic", +e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Shuffle Questions</label>
                    <select
                      value={config.shuffle}
                      onChange={(e) => updateSubjectConfig(index, "shuffle", e.target.value === "true")}
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Topics (optional - leave empty for all topics in subject)</label>
                  <select
                    multiple
                    value={config.topicIds}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                      updateSubjectConfig(index, "topicIds", selected);
                    }}
                    size="4"
                  >
                    {topics
                      .filter((t) => String(t.subjectId) === String(config.subjectId))
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                  </select>
                  <small className="admin-help-text">Hold Ctrl/Cmd to select multiple topics</small>
                </div>

                {subjectForm.subjectConfigs.length > 1 && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    onClick={() => removeSubjectConfig(index)}
                  >
                    Remove Subject
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="admin-btn admin-btn-outline"
              onClick={addSubjectConfig}
            >
              + Add Another Subject
            </button>

            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={loading}
              style={{ marginLeft: "10px" }}
            >
              {loading ? "Generating..." : "Generate Test"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}