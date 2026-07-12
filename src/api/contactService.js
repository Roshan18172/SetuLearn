import api from "./axios";

const contactService = {
  sendMessage: async (data) => {
    const response = await api.post("/contacts", data, {timeout: 60000});
    return response.data;
  },
};

export default contactService;