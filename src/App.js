import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Tests from "./pages/Tests";
import TestInstructions from "./pages/TestInstructions";
import TestInterface from "./pages/TestInterface";
import TestResult from "./pages/TestResult";
import DetailedAnalysis from "./pages/DetailedAnalysis";
import About from "./pages/About";
import ContactUs from "./pages/ContactUs";
import FAQ from "./pages/FAQ";
import HowItWorks from "./pages/HowItWorks";
import PerformanceTips from "./pages/PerformanceTips";
import ReportIssue from "./pages/ReportIssue";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Accessibility from "./pages/Accessibility";
import Solutions from "./pages/Solutions";

function App() {
  const location = useLocation();

  const hideLayout =
    location.pathname === "/test";

  return (
    <div className="app-root">

      {!hideLayout && <Navbar />}

      <main className={!hideLayout ? "main-content" : ""}>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/instructions" element={<TestInstructions />} />
          <Route path="/test" element={<TestInterface />} />
          <Route path="/result" element={<TestResult />} />
          <Route path="/analysis" element={<DetailedAnalysis />} />\
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
        </Routes>
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
}

export default App;