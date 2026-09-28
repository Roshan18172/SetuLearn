import api from "./axios";
import { getStudentToken } from "../utils/studentToken";

function getStudentAuthHeader() {
  const token = getStudentToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

/**
 * Service for test submission and result-related API calls.
 */
const submissionService = {
  submitTest: async (testId, payload) => {
    if (!testId) throw new Error("testId is required");
    if (!payload?.submissionId) throw new Error("submissionId is required in payload");
    if (!Array.isArray(payload?.answers)) throw new Error("answers array is required in payload");

    const response = await api.post(`/tests/${testId}/submit`, payload, {
      headers: getStudentAuthHeader(),
    });
    return response.data.data;
  },

  getResult: async (submissionId) => {
    if (!submissionId) throw new Error("submissionId is required");
    const response = await api.get(`/student/submissions/${submissionId}/result`, {
      headers: getStudentAuthHeader(),
    });
    return response.data.data;
  },
};

export default submissionService;
