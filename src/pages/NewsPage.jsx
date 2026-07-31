import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import newsService from "../api/newsService";
import SEO from "../components/SEO";
import "../components/NewsSection.css";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

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
        style={article.imageUrl ? { backgroundImage: `url(${article.imageUrl})` } : undefined}
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

const FALLBACK_CATEGORIES = [
  { value: "top", label: "Top" },
  { value: "world", label: "World" },
  { value: "business", label: "Business" },
  { value: "politics", label: "Politics" },
  { value: "technology", label: "Technology" },
  { value: "science", label: "Science" },
  { value: "health", label: "Health" },
  { value: "sports", label: "Sports" },
  { value: "entertainment", label: "Entertainment" },
];

export default function NewsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [meta, setMeta] = useState(null);
  const [category, setCategory] = useState(searchParams.get("category") || "top");
  const [country, setCountry] = useState(searchParams.get("country") || "in");
  const [language, setLanguage] = useState(searchParams.get("language") || "en");
  const [date, setDate] = useState(
    searchParams.get("scope") === "today" ? todayStr() : searchParams.get("date") || ""
  );
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [searchInput, setSearchInput] = useState(q);

  const [articles, setArticles] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [dateFilterApplied, setDateFilterApplied] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  useEffect(() => {
    newsService
      .getMeta()
      .then(setMeta)
      .catch(() => setMeta(null));
  }, []);

  const fetchPage = useCallback(
    (pageToken, replace) => {
      const myRequest = ++requestId.current;
      setLoading(true);
      setError(null);
      newsService
        .search({
          q: q || undefined,
          category,
          country,
          language,
          from: date || undefined,
          to: date || undefined,
          page: pageToken || undefined,
          pageSize: 12,
        })
        .then((data) => {
          if (myRequest !== requestId.current) return;
          setArticles((prev) => (replace ? data.articles : [...prev, ...data.articles]));
          setTotalResults(data.totalResults);
          setNextPage(data.nextPage);
          setDateFilterApplied(data.dateFilterApplied !== false);
        })
        .catch((err) => {
          if (myRequest !== requestId.current) return;
          console.error("[NewsPage] Failed to load news:", err);
          setError(
            err?.response?.status === 503
              ? "The news feature isn't set up yet — an admin needs to add a NEWS_API_KEY on the backend."
              : "Couldn't load news right now. Please try again shortly."
          );
        })
        .finally(() => {
          if (myRequest === requestId.current) setLoading(false);
        });
    },
    [q, category, country, language, date]
  );

  useEffect(() => {
    fetchPage(null, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, country, language, date, q]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setQ(searchInput.trim());
  }

  function openArticle(article) {
    navigate("/news/article", { state: { article } });
  }

  const hasMore = Boolean(nextPage) && articles.length > 0;

  return (
    <div className="news-page">
      <SEO
        title="News | SetuLearn"
        description="Browse the latest news by category, country and date — stay current for your competitive exam general-awareness prep."
        canonical="/news"
      />
      <div className="news-page-header">
        <div className="section-eyebrow">Stay Informed</div>
        <h1>Browse News</h1>
      </div>

      <div className="news-filters">
        <div className="news-filter-chips">
          {(meta?.categories || FALLBACK_CATEGORIES).map((c) => (
            <button
              key={c.value}
              className={`news-chip${category === c.value ? " active" : ""}`}
              onClick={() => setCategory(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="news-filters-row">
          <select
            className="news-select"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            aria-label="Country"
          >
            {(meta?.countries || [{ value: "in", label: "India" }]).map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            className="news-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            aria-label="Language"
          >
            {(meta?.languages || [{ value: "en", label: "English" }]).map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="news-date-input"
            value={date}
            max={todayStr()}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Date"
          />
          {date && (
            <button className="news-clear-btn" onClick={() => setDate("")}>
              Clear date
            </button>
          )}
          {date !== todayStr() && (
            <button className="news-clear-btn" onClick={() => setDate(todayStr())}>
              Today
            </button>
          )}

          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 8, flex: 1, minWidth: 200 }}>
            <input
              type="text"
              className="news-search-input"
              placeholder="Search news…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="btn-outline">
              Search
            </button>
          </form>
        </div>
      </div>

      {date && !dateFilterApplied && !loading && !error && (
        <div className="news-page-loading" style={{ padding: "0 0 16px" }}>
          Your NewsData.io plan doesn't support filtering by that date — showing recent results instead.
        </div>
      )}

      {error && <div className="news-page-error">{error}</div>}

      {!error && loading && articles.length === 0 && (
        <div className="news-page-loading">Loading news…</div>
      )}

      {!error && !loading && articles.length === 0 && (
        <div className="news-empty">No news found for these filters. Try a different category, country or date.</div>
      )}

      {articles.length > 0 && (
        <>
          <div className="news-page-grid">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} onClick={() => openArticle(article)} />
            ))}
          </div>
          {hasMore && (
            <div className="news-load-more">
              <button className="btn-outline" onClick={() => fetchPage(nextPage, false)} disabled={loading}>
                {loading ? "Loading…" : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
