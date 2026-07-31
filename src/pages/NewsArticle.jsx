import { useLocation, useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import "../components/NewsSection.css";

function formattedDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NewsArticle() {
  const location = useLocation();
  const navigate = useNavigate();
  const article = location.state?.article;

  if (!article) {
    return (
      <div className="news-article-page">
        <div className="news-article-notfound">
          <p>We don't have this article open right now — it may have been reached via a page refresh or a shared link.</p>
          <button className="btn-primary" onClick={() => navigate("/news")}>
            Browse News
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="news-article-page">
      <SEO title={`${article.title} | SetuLearn`} canonical="/news/article" noindex />
      <button className="news-article-back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {article.imageUrl && (
        <img className="news-article-image" src={article.imageUrl} alt={article.title} />
      )}

      <div className="news-article-meta">
        <span className="news-card-source">{article.sourceName}</span>
        <span>·</span>
        <span>{formattedDate(article.publishedAt)}</span>
        {article.author && (
          <>
            <span>·</span>
            <span>{article.author}</span>
          </>
        )}
      </div>

      <h1 className="news-article-title">{article.title}</h1>

      {article.description && (
        <p className="news-article-description">{article.description}</p>
      )}

      {article.content && (
        <p className="news-article-content">
          {article.content.replace(/\[\+\d+ chars\]$/, "")}
        </p>
      )}

      <a
        className="btn-primary news-article-link"
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        Read Full Article ↗
      </a>
    </div>
  );
}
