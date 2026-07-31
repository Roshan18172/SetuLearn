import api from "./axios";

/**
 * Service for the daily news feature.
 * Backed by /api/v1/news/* on the SetuLearn backend, which proxies to
 * NewsData.io server-side — the API key must stay off the frontend, since
 * NewsData.io keys are meant for server-to-server use.
 *
 * Note: pagination uses NewsData.io's opaque `nextPage` cursor string
 * (not an integer page number) — pass the previous response's `nextPage`
 * back in as `page` to fetch the next batch.
 */
const newsService = {
  /** Filter options for the browse page: { categories, countries, defaultCategory, defaultCountry } */
  getMeta: async () => {
    const response = await api.get("/news/meta");
    return response.data.data;
  },

  /** Today's top headlines for the home page cards: { articles, totalResults, nextPage } */
  getToday: async ({ country, category, pageSize = 8 } = {}) => {
    const response = await api.get("/news/today", {
      params: { country, category, pageSize },
    });
    return response.data.data;
  },

  /** Full search/browse with category, country, language, date-range and keyword filters. */
  search: async ({ q, category, country, language, from, to, page, pageSize = 12 } = {}) => {
    const response = await api.get("/news/search", {
      params: { q, category, country, language, from, to, page, pageSize },
    });
    return response.data.data;
  },
};

export default newsService;
