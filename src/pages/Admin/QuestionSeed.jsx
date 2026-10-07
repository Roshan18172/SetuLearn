import { useState } from "react";
import QuestionSeedExcel from "./QuestionSeedExcel";
import QuestionSeedPdf from "./QuestionSeedPdf";

const TABS = [
  { id: "excel", label: "Upload by Excel", icon: "📊" },
  { id: "pdf", label: "Upload by PDF", icon: "📄" },
];

export default function QuestionSeed() {
  const [tab, setTab] = useState("excel");
  document.title = "Seed Questions - Admin";

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Seed Questions</h1>
          <p className="admin-page-sub">
            {tab === "excel"
              ? "Upload questions from an Excel file (Subjects, Topics and Questions sheets)"
              : "Upload a question paper PDF - questions, options, images, answers and explanations are extracted for you"}
          </p>
        </div>
      </div>

      <div className="seed-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`seed-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <span aria-hidden="true">{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* keep both mounted so switching tabs does not lose an in-progress review */}
      <div style={{ display: tab === "excel" ? "block" : "none" }}>
        <QuestionSeedExcel />
      </div>
      <div style={{ display: tab === "pdf" ? "block" : "none" }}>
        <QuestionSeedPdf />
      </div>
    </div>
  );
}
