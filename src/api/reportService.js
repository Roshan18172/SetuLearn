import api from "./axios";

const reportService = {
  submitReport: async (data) => {
    const response = await api.post("/reports", data);
    return response.data;
  },
};

export default reportService;