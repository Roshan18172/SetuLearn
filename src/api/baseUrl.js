/**
 * Centralized API base URL configuration (single source of truth for axios + the streaming seed upload).
 *
 * Production builds use REACT_APP_API_URL. When the site itself is open on localhost (local development)
 * and no URL is configured, fall back to the local backend. There is no commented line to toggle any more,
 * and no way to ship a build that points at localhost by mistake.
 */
const isLocalhost =
  typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);

const API_BASE_URL =
  process.env.REACT_APP_API_URL || (isLocalhost ? "http://localhost:5000/api/v1" : undefined);

export default API_BASE_URL;
