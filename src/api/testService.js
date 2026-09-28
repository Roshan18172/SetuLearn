import api from "./axios";
import { getStudentToken } from "../utils/studentToken";

/**
 * Get auth headers for student users.
 */
function getStudentAuthHeader() {
  const token = getStudentToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

/**
 * Service for student/test-taker exam-related API calls.
 */
const testService = {
  /**
   * Start a test (creates a submission).
   * POST /tests/:id/start — requires student JWT
   */
  startTest: async (testId) => {
    if (!testId) throw new Error("testId is required");
    const response = await api.post(
      `/tests/${testId}/start`,
      {},
      { headers: getStudentAuthHeader() }
    );
    return response.data.data;
  },

  /**
   * Get test questions (fetches full test data including questions).
   * GET /tests/:id
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
   * POST /tests/:id/submit — requires student JWT
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
   */
  getSubmissionResult: async (submissionId) => {
    if (!submissionId) throw new Error("submissionId is required");
    try {
      const response = await api.get(
        `/student/submissions/${submissionId}/result`,
        { headers: getStudentAuthHeader() }
      );
      return response.data.data;
    } catch {
      const response = await api.get(`/submissions/${submissionId}/result`, {
        headers: getStudentAuthHeader(),
      });
      return response.data.data;
    }
  },
};

export default testService;
