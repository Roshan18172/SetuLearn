import api from "./axios";

const adminService = {
  // Auth
  login: async (email, password) => {
    const response = await api.post("/admin/login", { email, password });
    return response.data.data;
  },

  signup: async (data) => {
    const response = await api.post("/admin/signup", data);
    return response.data.data;
  },

  getProfile: async () => {
    const response = await api.get("/admin/profile");
    return response.data.data;
  },

  updateProfile: async (data) => {
    const response = await api.patch("/admin/profile", data);
    return response.data.data;
  },

  // Admin management
  getAllAdmins: async () => {
    const response = await api.get("/admin");
    return response.data.data;
  },

  toggleAdminStatus: async (id, isActive) => {
    const response = await api.patch(`/admin/${id}/status`, { isActive });
    return response.data.data;
  },

  // Exams
  getExams: async () => {
    const response = await api.get("/admin/exams");
    return response.data.data;
  },

  getExam: async (id) => {
    const response = await api.get(`/admin/exams/${id}`);
    return response.data.data;
  },

  createExam: async (data) => {
    const response = await api.post("/admin/exams", data);
    return response.data.data;
  },

  updateExam: async (id, data) => {
    const response = await api.put(`/admin/exams/${id}`, data);
    return response.data.data;
  },

  deleteExam: async (id) => {
    const response = await api.delete(`/admin/exams/${id}`);
    return response.data.data;
  },

  // Tests
  getTests: async () => {
    const response = await api.get("/admin/tests");
    return response.data.data;
  },

  getTest: async (id) => {
    const response = await api.get(`/admin/tests/${id}`);
    return response.data.data;
  },

  createTest: async (data) => {
    const response = await api.post("/admin/tests", data);
    return response.data.data;
  },

  updateTest: async (id, data) => {
    const response = await api.put(`/admin/tests/${id}`, data);
    return response.data.data;
  },

  deleteTest: async (id) => {
    const response = await api.delete(`/admin/tests/${id}`);
    return response.data.data;
  },

  // Questions
  getQuestions: async (params = {}) => {
    const response = await api.get("/admin/questions", { params });
    return response.data.data;
  },

  getQuestion: async (id) => {
    const response = await api.get(`/admin/questions/${id}`);
    return response.data.data;
  },

  createQuestion: async (data) => {
    const response = await api.post("/admin/questions", data);
    return response.data.data;
  },

  updateQuestion: async (id, data) => {
    const response = await api.put(`/admin/questions/${id}`, data);
    return response.data.data;
  },

  deleteQuestion: async (id) => {
    const response = await api.delete(`/admin/questions/${id}`);
    return response.data.data;
  },

  // Contacts
  getContacts: async (params = {}) => {
    const response = await api.get("/admin/contacts", { params });
    return response.data.data;
  },

  getContact: async (id) => {
    const response = await api.get(`/admin/contacts/${id}`);
    return response.data.data;
  },

  updateContact: async (id, data) => {
    const response = await api.patch(`/admin/contacts/${id}`, data);
    return response.data.data;
  },

  deleteContact: async (id) => {
    const response = await api.delete(`/admin/contacts/${id}`);
    return response.data.data;
  },

  // Reports
  getReports: async (params = {}) => {
    const response = await api.get("/admin/reports", { params });
    return response.data.data;
  },

  getReport: async (id) => {
    const response = await api.get(`/admin/reports/${id}`);
    return response.data.data;
  },

  updateReport: async (id, data) => {
    const response = await api.patch(`/admin/reports/${id}`, data);
    return response.data.data;
  },

  deleteReport: async (id) => {
    const response = await api.delete(`/admin/reports/${id}`);
    return response.data.data;
  },

  // Submissions
  getSubmissions: async (params = {}) => {
    const response = await api.get("/admin/submissions", { params });
    return response.data.data;
  },

  getSubmission: async (id) => {
    const response = await api.get(`/admin/submissions/${id}`);
    return response.data.data;
  },

  deleteSubmission: async (id) => {
    const response = await api.delete(`/admin/submissions/${id}`);
    return response.data.data;
  },

  // Test Questions
  getTestQuestions: async (testId) => {
    const response = await api.get(`/admin/tests/${testId}/questions`);
    return response.data.data;
  },

  addTestQuestion: async (testId, data) => {
    const response = await api.post(`/admin/tests/${testId}/questions`, data);
    return response.data.data;
  },

  addTestQuestionsByTopic: async (testId, data) => {
    const response = await api.post(`/admin/tests/${testId}/questions/by-topic`, data);
    return response.data.data;
  },

  randomizeTestQuestions: async (testId, data) => {
    const response = await api.post(`/admin/tests/${testId}/questions/randomize`, data);
    return response.data.data;
  },

  reorderTestQuestions: async (testId, questionIds) => {
    const response = await api.put(`/admin/tests/${testId}/questions/reorder`, { questionIds });
    return response.data.data;
  },

  removeTestQuestion: async (testId, questionId) => {
    const response = await api.delete(`/admin/tests/${testId}/questions/${questionId}`);
    return response.data.data;
  },

  clearTestQuestions: async (testId) => {
    const response = await api.delete(`/admin/tests/${testId}/questions`);
    return response.data.data;
  },

  // Subjects
  getSubjects: async () => {
    const response = await api.get("/admin/subjects");
    return response.data.data;
  },

  getSubject: async (id) => {
    const response = await api.get(`/admin/subjects/${id}`);
    return response.data.data;
  },

  createSubject: async (data) => {
    const response = await api.post("/admin/subjects", data);
    return response.data.data;
  },

  updateSubject: async (id, data) => {
    const response = await api.put(`/admin/subjects/${id}`, data);
    return response.data.data;
  },

  deleteSubject: async (id) => {
    const response = await api.delete(`/admin/subjects/${id}`);
    return response.data.data;
  },

  // Topics
  getTopics: async (params = {}) => {
    const response = await api.get("/admin/topics", { params });
    return response.data.data;
  },

  getTopic: async (id) => {
    const response = await api.get(`/admin/topics/${id}`);
    return response.data.data;
  },

  createTopic: async (data) => {
    const response = await api.post("/admin/topics", data);
    return response.data.data;
  },

  updateTopic: async (id, data) => {
    const response = await api.put(`/admin/topics/${id}`, data);
    return response.data.data;
  },

  deleteTopic: async (id) => {
    const response = await api.delete(`/admin/topics/${id}`);
    return response.data.data;
  },
};

export default adminService;