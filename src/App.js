import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { MathJaxContext } from "better-react-mathjax";
import { HelmetProvider } from "react-helmet-async";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Chatbot from "./components/Chatbot/Chatbot";

import Home from "./pages/Home";
import Exams from "./pages/Exams";
import Tests from "./pages/Tests";
import Practice from "./pages/Practice";
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

// Admin imports
import { AdminAuthProvider } from "./context/AdminAuthContext";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ProtectedRoute from "./pages/Admin/ProtectedRoute";
import ExamsList from "./pages/Admin/ExamsList";
import TestsList from "./pages/Admin/TestsList";
import TestGenerator from "./pages/Admin/TestGenerator";
import QuestionSeed from "./pages/Admin/QuestionSeed";
import TestQuestionsList from "./pages/Admin/TestQuestionsList";
import QuestionsList from "./pages/Admin/QuestionsList";
import SubjectsList from "./pages/Admin/SubjectsList";
import TopicsList from "./pages/Admin/TopicsList";
import ContactsList from "./pages/Admin/ContactsList";
import ReportsList from "./pages/Admin/ReportsList";
import SubmissionsList from "./pages/Admin/SubmissionsList";

function App() {
  const location = useLocation();

  const hideLayout =
    location.pathname === "/test" || location.pathname.startsWith("/admin");

  // The chatbot floats on almost every page, but it should stay out of the
  // way on pages where a student needs full focus: reading test
  // instructions and sitting the live test itself.
  const hideChatbot = hideLayout || location.pathname === "/instructions";

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
    <HelmetProvider>
    <MathJaxContext config={config}>
      <div className="app-root">

        {!hideLayout && <Navbar />}

        <main className={!hideLayout ? "main-content" : ""}>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/tests" element={<Tests />} />
            <Route path="/practice" element={<Practice />} />
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

            {/* Admin Routes */}
            <Route path="/admin/login" element={
              <AdminAuthProvider>
                <AdminLogin />
              </AdminAuthProvider>
            } />
            <Route
              path="/admin"
              element={
                <AdminAuthProvider>
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                </AdminAuthProvider>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="exams" element={<ExamsList />} />
              <Route path="tests" element={<TestsList />} />
              <Route path="tests/generate" element={<TestGenerator />} />
              <Route path="tests/:testId/questions" element={<TestQuestionsList />} />
              <Route path="subjects" element={<SubjectsList />} />
              <Route path="topics" element={<TopicsList />} />
              <Route path="questions" element={<QuestionsList />} />
              <Route path="questions/seed" element={<QuestionSeed />} />
              <Route path="contacts" element={<ContactsList />} />
              <Route path="reports" element={<ReportsList />} />
              <Route path="submissions" element={<SubmissionsList />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {!hideLayout && <Footer />}

        {/* Setu chatbot floats on every page except the live test screen
            (and the admin dashboard, which has its own separate UI). */}
        {!hideChatbot && <Chatbot />}
      </div>
    </MathJaxContext>
    </HelmetProvider>
  );
}

export default App;