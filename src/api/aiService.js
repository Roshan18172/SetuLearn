import api from "./axios";

/**
 * Service for the Setu chatbot's AI-powered features.
 * Backed by POST /api/v1/ai/ask on the SetuLearn backend, which proxies to
 * the Anthropic API with the model key kept server-side.
 */
const aiService = {
  /**
   * Ask the AI assistant a free-text question, optionally scoped to a
   * specific practice question for extra context.
   * POST /api/v1/ai/ask
   * @param {string} question - The student's question
   * @param {object} [context] - Optional context, e.g. { questionText, options, subject, topic }
   * @param {string} [questionId] - Optional real question id — when present, the backend
   *   fetches the trusted question/options/explanation from the database itself instead
   *   of relying on `context`.
   */
  askAI: async (question, context = null, questionId = null) => {
    if (!question) throw new Error("question is required");
    const response = await api.post("/ai/ask", { question, context, questionId });
    return response.data.data;
  },
};

export default aiService;
