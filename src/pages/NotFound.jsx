import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { MathJax } from "better-react-mathjax";

export default function NotFound() {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="not-found-code">404</div>
        <h1 className="not-found-title">Page Not Found</h1>
        <div style={{
              opacity: isReady ? 1 : 0,
              transition: "opacity 0.2s ease-in-out",
            }}>
        <MathJax dynamic onTypeset={() => setIsReady(true)}>
          The area of a circle is $A = \\pi r^2$.
        </MathJax>
        </div>
        <p className="not-found-message">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="not-found-actions">
          <button className="btn-primary" onClick={() => navigate("/")}>
            Go Home
          </button>
          <button className="btn-outline" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}