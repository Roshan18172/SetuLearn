import api from "./axios";

const contactService = {
  sendMessage: async (data) => {
    const response = await api.post("/contacts", data);
    return response.data;
  },
};

export default contactService;