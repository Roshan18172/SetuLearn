import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;
// const API_BASE_URL = "http://localhost:5000/api/v1";
// const API_BASE_URL = process.env.REACT_APP_API_URL || "https://setulearn-backend.onrender.com/api/v1";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Response interceptor — log errors and always reject so callers handle them
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const responseData = error.response.data;
      const responseMessage = [responseData?.message, ...(responseData?.errors || [])]
        .filter(Boolean)
        .join(" ");
      const isExpectedGooglePhoneStep =
        error.response.status === 400 &&
        error.config?.url?.includes("/student/google") &&
        /phone/i.test(responseMessage);

      if (!isExpectedGooglePhoneStep) {
        console.error(
          `[API] ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}:`,
          responseData
        );
      }
    } else if (error.request) {
      console.error("[API] Network error — no response received:", error.message);
    } else {
      console.error("[API] Request setup error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
