import api from "./axios";

/**
 * Student auth + dashboard API.
 * Backend wraps responses in { success, message, data }.
 */
const studentService = {
  signup: async ({ name, email, phone, password }) => {
    const response = await api.post("/student/signup", {
      name,
      email,
      phone,
      password,
    });
    return response.data.data;
  },

  login: async ({ email, password }) => {
    const response = await api.post("/student/login", { email, password });
    return response.data.data;
  },

  googleAuth: async ({ idToken, phone, name }) => {
    const payload = { idToken };
    if (phone) payload.phone = phone;
    if (name) payload.name = name;
    const response = await api.post("/student/google", payload);
    return response.data.data;
  },

  getProfile: async () => {
    const response = await api.get("/student/profile");
    return response.data.data;
  },

  updateProfile: async (data) => {
    const response = await api.patch("/student/profile", data);
    return response.data.data;
  },

  getSubmissions: async () => {
    const response = await api.get("/student/submissions");
    return response.data.data;
  },

  getSubmissionResult: async (submissionId) => {
    const response = await api.get(`/student/submissions/${submissionId}/result`);
    return response.data.data;
  },

  getProgress: async () => {
    const response = await api.get("/student/progress");
    return response.data.data;
  },
};

export default studentService;
