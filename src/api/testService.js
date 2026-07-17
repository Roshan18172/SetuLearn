import api from "./axios";

/**
 * Get auth headers for student users (checks both localStorage and sessionStorage).
 * This is used for setting the Authorization header dynamically for each request.
 * @returns {object} Headers object with optional Authorization token
 */
function getStudentAuthHeader() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

/**
 * Service for student/test-taker exam-related API calls.
 * This service handles direct API calls for test execution, handling both
 * admin and student auth tokens from localStorage/sessionStorage.
 */
const testService = {
  /**
   * Start a test (creates a submission).
   * POST /tests/:id/start
   * @param {string} testId
   */
  startTest: async (testId) => {
    if (!testId) throw new Error("testId is required");
    const response = await api.post(`/tests/${testId}/start`, {}, {
      headers: getStudentAuthHeader(),
    });
    return response.data.data;
  },

  /**
   * Get test questions (fetches full test data including questions).
   * GET /tests/:id
   * @param {string} testId
   */
  getTestQuestions: async (testId) => {
    if (!testId) throw new Error("testId is required");
    const response = await api.get(`/tests/${testId}`, {
      headers: getStudentAuthHeader(),
    });
    return response.data.data;
  },

  /**
   * Submit a test with answers.
   * POST /tests/:id/submit
   * @param {string} testId
   * @param {object} payload - { submissionId, answers: [{ questionId, selectedOptionId }], timeSpent }
   */
  submitTest: async (testId, payload) => {
    if (!testId) throw new Error("testId is required");
    const response = await api.post(`/tests/${testId}/submit`, payload, {
      headers: getStudentAuthHeader(),
    });
    return response.data.data;
  },

  /**
   * Get the detailed result for a submission.
   * GET /submissions/:id/result
   * @param {string} submissionId
   */
  getSubmissionResult: async (submissionId) => {
    if (!submissionId) throw new Error("submissionId is required");
    const response = await api.get(`/submissions/${submissionId}/result`, {
      headers: getStudentAuthHeader(),
    });
    return response.data.data;
  },
};

export default testService;