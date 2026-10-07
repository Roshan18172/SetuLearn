import API_BASE_URL from "../api/baseUrl";

/**
 * Images imported from PDFs are stored as relative URLs ("/api/v1/assets/<id>") so the database
 * stays portable between environments. Resolve them against the backend origin.
 * Absolute URLs (Excel imports pointing at Cloudinary, S3, ...) are returned untouched.
 */
export function resolveImageUrl(url) {
  if (!url) return "";
  if (/^(https?:)?\/\//i.test(url) || url.startsWith("data:")) return url;
  if (url.startsWith("/api/")) {
    const origin = String(API_BASE_URL).replace(/\/api\/v\d+\/?$/, "").replace(/\/$/, "");
    return `${origin}${url}`;
  }
  return url;
}
