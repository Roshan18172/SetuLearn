import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import newsService from "../api/newsService";
import "./NewsSection.css";

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function NewsCard({ article, onClick }) {
  return (
    <div className="news-card" onClick={onClick} role="button" tabIndex={0}>
      <div
        className="news-card-image"
        style={
          article.imageUrl
            ? { backgroundImage: `url(${article.imageUrl})` }
            : undefined
        }
      >
        {!article.imageUrl && <span className="news-card-image-fallback">📰</span>}
      </div>
      <div className="news-card-body">
        <div className="news-card-meta">
          <span className="news-card-source">{article.sourceName}</span>
          <span className="news-card-dot">·</span>
          <span>{timeAgo(article.publishedAt)}</span>
        </div>
        <p className="news-card-title">{article.title}</p>
      </div>
    </div>
  );
}

export default function NewsSection() {
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, articles: [], error: null });

  useEffect(() => {
    let cancelled = false;
    newsService
      .getToday({ pageSize: 8 })
      .then((data) => {
        if (!cancelled) setState({ loading: false, articles: data.articles, error: null });
      })
      .catch((err) => {
        console.error("[NewsSection] Failed to load news:", err);
        if (!cancelled) setState({ loading: false, articles: [], error: err });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Silently omit the section if the backend has no NEWS_API_KEY configured
  // yet, or the request fails, instead of showing a broken/empty section.
  if (!state.loading && (state.error || state.articles.length === 0)) return null;

  const openArticle = (article) => {
    navigate("/news/article", { state: { article } });
  };

  return (
    <section className="section news-section">
      <div className="section-header">
        <div>
          <div className="section-eyebrow">Stay Informed</div>
          <h2 className="section-title">Today&apos;s News</h2>
        </div>
        <div className="news-section-actions">
          <button className="btn-outline" onClick={() => navigate("/news?scope=today")}>
            View Today's News
          </button>
          <button className="btn-primary" onClick={() => navigate("/news")}>
            View All News
          </button>
        </div>
      </div>

      {state.loading ? (
        <div className="news-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="news-card news-card-skeleton" key={i} />
          ))}
        </div>
      ) : (
        <div className="news-grid">
          {state.articles.slice(0, 8).map((article) => (
            <NewsCard key={article.id} article={article} onClick={() => openArticle(article)} />
          ))}
        </div>
      )}
    </section>
  );
}
