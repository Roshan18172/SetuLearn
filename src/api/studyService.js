import api from "./axios";

const data = (res) => res.data?.data;

/** Student-side study tools: mistake notebook, bookmarks, progress, daily challenge, reports, game scores. */
const studyService = {
  // mistake notebook
  reviewSummary: () => api.get("/me/review/summary").then(data),
  reviewDue: (params = {}) => api.get("/me/review/due", { params }).then(data),
  reviewList: (params = {}) => api.get("/me/review/list", { params }).then(data),
  reviewAnswer: (questionId, optionId, source = "review") => api.post("/me/review/answer", { questionId, optionId, source }).then(data),

  // bookmarks
  bookmarkIds: () => api.get("/me/bookmarks/ids").then(data),
  bookmarkList: (params = {}) => api.get("/me/bookmarks", { params }).then(data),
  toggleBookmark: (questionId) => api.post(`/me/bookmarks/${questionId}`).then(data),

  // progress + daily
  progress: () => api.get("/me/progress").then(data),
  daily: () => api.get("/me/daily").then(data),
  submitDaily: (answers) => api.post("/me/daily/submit", { answers }).then(data),

  // reports
  reportQuestion: (body) => api.post("/me/reports", body).then((res) => res.data),

  // games
  saveGameScore: (gameId, score, meta) => api.post("/games/scores", { gameId, score, ...(meta ? { meta } : {}) }).then(data),
  gameLeaderboard: (gameId) => api.get(`/games/leaderboard/${gameId}`).then(data),

  // privacy: download my data (JSON blob)
  exportMyData: async () => {
    const res = await api.get("/me/export", { responseType: "blob" });
    const url = window.URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-setulearn-data.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default studyService;
