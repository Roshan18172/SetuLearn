import api from "./axios";

/**
 * Student auth + dashboard API.
 * Backend wraps responses in { success, message, data }.
 */
const studentService = {
  // Manual signup is two steps: request an OTP (sent by e-mail + SMS), then verify it to create the account.
  requestSignupOtp: async ({ name, email, phone, password }) => {
    const response = await api.post("/student/signup/request-otp", {
      name,
      email,
      phone,
      password,
    });
    return response.data.data;
  },

  resendSignupOtp: async (email) => {
    const response = await api.post("/student/signup/resend-otp", { email });
    return response.data.data;
  },

  verifySignupOtp: async ({ email, otp }) => {
    const response = await api.post("/student/signup/verify-otp", { email, otp });
    return response.data.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post("/student/forgot-password", { email });
    return response.data.data;
  },

  resetPassword: async ({ email, otp, newPassword }) => {
    const response = await api.post("/student/reset-password", {
      email,
      otp,
      newPassword,
    });
    return response.data.data;
  },

  login: async ({ email, password }) => {
    const response = await api.post("/student/login", { email, password });
    return response.data.data;
  },

  googleAuth: async ({ idToken, name }) => {
    const payload = { idToken };
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
