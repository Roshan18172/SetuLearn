import { useState } from "react";
import { tests, categories } from "../data/demoData";
import { useNavigate } from "react-router-dom";
const difficulties = ["All Difficulty", "Easy", "Medium", "Hard"];
const durations = ["All Duration", "< 60 Mins", "60-120 Mins", "> 120 Mins"];

export default function Tests() {
  const navigate = useNavigate();
  const [catFilter, setCatFilter] = useState("All Categories");
  const [diffFilter, setDiffFilter] = useState("All Difficulty");
  const [durFilter, setDurFilter] = useState("All Duration");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(4);
  document.title = "Tests - SetuLearn";

  const filtered = tests.filter((t) => {
    const matchCat = catFilter === "All Categories" || t.category === catFilter;
    const matchDiff = diffFilter === "All Difficulty" || t.difficulty === diffFilter;
    const matchDur =
      durFilter === "All Duration" ||
      (durFilter === "< 60 Mins" && t.duration < 60) ||
      (durFilter === "60-120 Mins" && t.duration >= 60 && t.duration <= 120) ||
      (durFilter === "> 120 Mins" && t.duration > 120);
    const matchSearch =
      search === "" ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.exam.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchDiff && matchDur && matchSearch;
  });

  return (
    <div className="tests-page">
      <div className="tests-header">
        <h1>All Tests</h1>
        <p>{filtered.length} tests available</p>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <select value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setVisible(4); }}>
            <option>All Categories</option>
            {categories.map((c) => <option key={c.id}>{c.name}</option>)}
          </select>

          <select value={diffFilter} onChange={(e) => { setDiffFilter(e.target.value); setVisible(4); }}>
            {difficulties.map((d) => <option key={d}>{d}</option>)}
          </select>

          <select value={durFilter} onChange={(e) => { setDurFilter(e.target.value); setVisible(4); }}>
            {durations.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>

        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search tests..." value={search}
            onChange={(e) => { setSearch(e.target.value); setVisible(4); }} />
        </div>
      </div>

      {/* Tests List */}
      <div className="tests-list-page">
        {filtered.slice(0, visible).map((test) => {
          const catColor = categories.find((c) => c.name === test.category)?.color || "#6C63FF";
          return (
            <div key={test.id} className="test-row">
              <div className="tr-left">
                <div className="tr-icon" style={{ background: catColor }}>
                  {test.exam.slice(0, 3).toUpperCase()}
                </div>
                <div className="tr-info">
                  <div className="tr-title">{test.title}</div>
                  <div className="tr-meta">
                    <span className="tr-cat">{test.category}</span>
                    <span>•</span>
                    <span>{test.questions} Questions</span>
                    <span>•</span>
                    <span>{test.duration} Mins</span>
                    <span>•</span>
                    <span className={`diff-badge ${test.difficulty.toLowerCase()}`}>{test.difficulty}</span>
                  </div>
                  <div className="tr-sub-info">
                    <span>📊 {test.attemptedBy.toLocaleString()} attempted</span>
                    <span>•</span>
                    <span>Avg Score: {test.avgScore}%</span>
                    <span>•</span>
                    <span>Marks: {test.marks}</span>
                  </div>
                </div>
              </div>
              <button className="btn-primary"
                onClick={() => navigate("/instructions", { state: { test, mode: "timed" } })} >
                Start Test
              </button>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No tests found</h3>
            <p>Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      {visible < filtered.length && (
        <div className="load-more-wrap">
          <button className="btn-outline" onClick={() => setVisible((v) => v + 4)}>
            Load More Tests
          </button>
        </div>
      )}
    </div>
  );
}
