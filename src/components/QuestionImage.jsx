import { resolveImageUrl } from "../utils/imageUrl";

/** Figure attached to a question, an option or an explanation. Renders nothing without a URL. */
export default function QuestionImage({ src, alt = "", className = "", maxHeight = 320 }) {
  if (!src) return null;
  return (
    <img
      src={resolveImageUrl(src)}
      alt={alt}
      className={`question-image ${className}`.trim()}
      loading="lazy"
      style={{ display: "block", maxWidth: "100%", maxHeight, height: "auto", objectFit: "contain", margin: "8px 0" }}
    />
  );
}
