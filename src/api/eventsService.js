import api from "./axios";

/**
 * Service for the festival / current-affairs popup + quiz feature.
 * Backed by GET /api/v1/events/today and GET /api/v1/events/upcoming.
 * The backend generates greeting + quiz content once per day via AI and
 * caches it server-side, so repeated calls on the same day are cheap.
 */
const eventsService = {
  /** Today's festival/GK event: { event, date, greeting, quizTitle, quiz, funFacts, generatedBy } */
  getToday: async () => {
    const response = await api.get("/events/today");
    return response.data.data;
  },

  /** Upcoming festival teaser list (pure date data, no AI): { upcoming: [...] } */
  getUpcoming: async (count = 6) => {
    const response = await api.get("/events/upcoming", { params: { count } });
    return response.data.data.upcoming;
  },
};

export default eventsService;
