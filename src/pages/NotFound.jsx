import { useNavigate } from "react-router-dom";
import SEO from "../components/SEO";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <SEO
        title="404 - Page Not Found"
        description="The page you are looking for doesn't exist or has been moved. Return to SetuLearn's home page to continue your exam preparation."
        canonical="/404"
        noindex
      />
      <div className="not-found-container">
        <div className="not-found-code">404</div>
        <h1 className="not-found-title">Page Not Found</h1>
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
