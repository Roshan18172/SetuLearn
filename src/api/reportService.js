import api from "./axios";

const reportService = {
  submitReport: async (data) => {
    const response = await api.post("/reports", data, { timeout: 60000 });
    return response.data;
  },
};

export default reportService;