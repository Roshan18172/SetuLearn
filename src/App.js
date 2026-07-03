import { Routes, Route, useLocation } from "react-router-dom";
import { MathJaxContext } from "better-react-mathjax";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import Exams from "./pages/Exams";
import Tests from "./pages/Tests";
import TestInstructions from "./pages/TestInstructions";
import TestInterface from "./pages/TestInterface";
import TestResult from "./pages/TestResult";
import DetailedAnalysis from "./pages/DetailedAnalysis";
import About from "./pages/About";
import Solutions from "./pages/Solutions";
import NotFound from "./pages/NotFound";

import FAQ from "./pages/QuickLinks/FAQ";
import HowItWorks from "./pages/QuickLinks/HowItWorks";
import PerformanceTips from "./pages/QuickLinks/PerformanceTips";

import ContactUs from "./pages/Supports/ContactUs";
import ReportIssue from "./pages/Supports/ReportIssue";
import PrivacyPolicy from "./pages/Supports/PrivacyPolicy";
import TermsOfService from "./pages/Supports/TermsOfService";
import Accessibility from "./pages/Supports/Accessibility";



function App() {
  const location = useLocation();

  const hideLayout =
    location.pathname === "/test";

const config = {
  // 1. Tell MathJax to load the TeX input processor
  loader: { load: ["input/tex", "output/chtml"] },
  
  // 2. Define the exact delimiters your API uses
  tex: {
    inlineMath: [
      ["$", "$"],         // Matches $x^2$
      ["\\(", "\\)"]      // Matches \(x^2\)
    ],
    displayMath: [
      ["$$", "$$"],       // Matches $$x^2$$ (block/centered)
      ["\\[", "\\]"]      // Matches \[x^2\]
    ],
    processEscapes: true, // Allows using regular \$ in text without triggering math
  }
};

  return (
    <MathJaxContext config={config}>
      <div className="app-root">

      {!hideLayout && <Navbar />}

      <main className={!hideLayout ? "main-content" : ""}>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/instructions" element={<TestInstructions />} />
          <Route path="/test" element={<TestInterface />} />
          <Route path="/result" element={<TestResult />} />
          <Route path="/analysis" element={<DetailedAnalysis />} />
          <Route path="/solutions" element={<Solutions />} />

          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/performance-tips" element={<PerformanceTips />} />
          <Route path="/report-issue" element={<ReportIssue />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} /> 
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!hideLayout && <Footer />}
      </div>
    </MathJaxContext>
  );
}

export default App;
