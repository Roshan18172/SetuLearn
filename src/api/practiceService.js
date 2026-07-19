import api from "./axios";

/**
 * Public service powering the self-paced "Start Practicing" flow:
 * Subjects -> Topics -> Practice Questions (with instant right/wrong
 * feedback and a solution/explanation).
 *
 * Unlike the timed-test endpoints (/tests/:id), the practice endpoints
 * are expected to return the correct option and explanation directly on
 * each question, since practice mode is meant to give instant feedback
 * rather than being a proctored/scored exam.
 *
 * NOTE: These endpoints (GET /subjects, GET /subjects/:id/topics,
 * GET /topics/:id/questions) need to exist as PUBLIC routes on the
 * backend, mirroring the existing public /exams and /exams/:id/tests
 * routes. Today the backend only exposes subjects/topics/questions
 * under the protected /admin/* routes, so these calls will 404 until
 * matching public routes are added there.
 */
const practiceService = {
  /**
   * Get all subjects available for practice.
   * GET /api/v1/subjects
   */
  getSubjects: async () => {
    const response = await api.get("/subjects");
    return response.data.data;
  },

  /**
   * Get all topics under a given subject.
   * GET /api/v1/subjects/:subjectId/topics
   * @param {string} subjectId
   */
  getTopics: async (subjectId) => {
    if (!subjectId) throw new Error("subjectId is required");
    const response = await api.get(`/subjects/${subjectId}/topics`);
    return response.data.data;
  },

  /**
   * Get all practice questions (with options, correct answer, and
   * explanation) for a given topic.
   * GET /api/v1/topics/:topicId/questions
   * @param {string} topicId
   */
  getQuestionsByTopic: async (topicId) => {
    if (!topicId) throw new Error("topicId is required");
    const response = await api.get(`/topics/${topicId}/questions`);
    return response.data.data;
  },
};

export default practiceService;
