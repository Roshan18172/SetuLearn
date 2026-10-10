import api from "../api/axios";
import API_BASE_URL from "../api/baseUrl";

const unwrap = (res) => res.data?.data;

export const createRoom = (body) => api.post("/games/live/create", body).then(unwrap);
export const joinRoom = (pin, name) => api.post(`/games/live/${pin}/join`, { name }).then(unwrap);
export const startGame = (pin, token) => api.post(`/games/live/${pin}/start`, { token }).then(unwrap);
export const nextStep = (pin, token) => api.post(`/games/live/${pin}/next`, { token }).then(unwrap);
export const endGame = (pin, token) => api.post(`/games/live/${pin}/end`, { token }).then(unwrap);
export const sendAnswer = (pin, token, index, choice) => api.post(`/games/live/${pin}/answer`, { token, index, choice }).then(unwrap);

/** Server-Sent Events stream for a room (the token identifies the host or the player). */
export const openEvents = (pin, token) =>
  new EventSource(`${API_BASE_URL}/games/live/${pin}/events?token=${encodeURIComponent(token)}`);
