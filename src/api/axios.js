import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;
// const API_BASE_URL = "http://localhost:5000/api/v1";
// const API_BASE_URL = process.env.REACT_APP_API_URL || "https://setulearn-backend.onrender.com/api/v1";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Render's free tier sleeps after ~15 min idle and needs 30-60s to wake up; 15s made the first
  // login / Google sign-in of the day fail with a timeout.
  timeout: 60000,
});

// Response interceptor — log errors and always reject so callers handle them
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const responseData = error.response.data;
      console.error(
        `[API] ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}:`,
        responseData
      );
    } else if (error.request) {
      console.error("[API] Network error — no response received:", error.message);
    } else {
      console.error("[API] Request setup error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
