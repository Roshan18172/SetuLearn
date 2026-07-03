import { MathJax } from "better-react-mathjax";

/**
 * Renders text content with MathJax math rendering.
 * Uses the better-react-mathjax MathJax component which
 * automatically handles typesetting within the MathJaxContext.
 */
export default function MathContent({ text, className = "" }) {
  if (!text && text !== 0) return null;

  return (
    <span className={className}>
      <MathJax>{text}</MathJax>
    </span>
  );
}
