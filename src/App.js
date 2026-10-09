import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { MathJaxContext } from "better-react-mathjax";
import { HelmetProvider } from "react-helmet-async";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Chatbot from "./components/Chatbot/Chatbot";
import HumanVerification from "./components/HumanVerification";
import CookieConsent from "./components/CookieConsent";
import EventModalManager from "./components/EventModalManager";

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
import TestHistory from "./pages/TestHistory";
import TestHistoryDetail from "./pages/TestHistoryDetail";
import CurrentAffairsQuiz from "./pages/CurrentAffairsQuiz";
import NewsPage from "./pages/NewsPage";
import NewsArticle from "./pages/NewsArticle";
import NotFound from "./pages/NotFound";
import StudentAuth from "./pages/StudentAuth";
import ForgotPassword from "./pages/ForgotPassword";
import { StudentAuthProvider } from "./context/StudentAuthContext";

import RequireStudent from "./pages/Student/RequireStudent";
import StudentLayout from "./pages/Student/StudentLayout";
import StudentDashboard from "./pages/Student/StudentDashboard";
import StudentAttempts from "./pages/Student/StudentAttempts";
import StudentAttemptDetail from "./pages/Student/StudentAttemptDetail";
import StudentProfile from "./pages/Student/StudentProfile";

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
import StudentsList from "./pages/Admin/StudentsList";
import ActivityLogs from "./pages/Admin/ActivityLogs";
import GamesHub from "./pages/Games/GamesHub";
import GamePage from "./pages/Games/GamePage";
import AdminsList from "./pages/Admin/AdminsList";
import NotificationBell from "./components/NotificationBell";

const HUMAN_VERIFIED_KEY = "setulearn_human_verified";
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

function AppRoutes() {
  const location = useLocation();
  const [verified, setVerified] = useState(() => {
    try {
      return !!localStorage.getItem(HUMAN_VERIFIED_KEY);
    } catch {
      return true;
    }
  });

  const hideLayout =
    location.pathname === "/test" ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/dashboard");

  const hideChatbot =
    hideLayout ||
    location.pathname === "/instructions" ||
    location.pathname.startsWith("/dashboard");

  const config = {
    loader: { load: ["input/tex", "output/chtml"] },
    tex: {
      inlineMath: [
        ["$", "$"],
        ["\\(", "\\)"],
      ],
      displayMath: [
        ["$$", "$$"],
        ["\\[", "\\]"],
      ],
      processEscapes: true,
    },
  };

  if (!verified) {
    return (
      <HelmetProvider>
        <HumanVerification onVerified={() => setVerified(true)} />
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <MathJaxContext config={config}>
        <StudentAuthProvider>
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
                <Route path="/test-history" element={<TestHistory />} />
                <Route path="/test-history/:id" element={<TestHistoryDetail />} />
                <Route path="/current-affairs-quiz" element={<CurrentAffairsQuiz />} />
                <Route path="/games" element={<GamesHub />} />
                <Route path="/games/:gameId" element={<GamePage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/news/article" element={<NewsArticle />} />

                <Route path="/login" element={<StudentAuth />} />
                <Route path="/signup" element={<StudentAuth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/profile" element={<Navigate to="/dashboard/profile" replace />} />

                <Route
                  path="/dashboard"
                  element={
                    <RequireStudent>
                      <StudentLayout />
                    </RequireStudent>
                  }
                >
                  <Route index element={<StudentDashboard />} />
                  <Route path="attempts" element={<StudentAttempts />} />
                  <Route path="attempts/:id" element={<StudentAttemptDetail />} />
                  <Route path="profile" element={<StudentProfile />} />
                </Route>

                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/about" element={<About />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/performance-tips" element={<PerformanceTips />} />
                <Route path="/report-issue" element={<ReportIssue />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/accessibility" element={<Accessibility />} />

                <Route
                  path="/admin/login"
                  element={
                    <AdminAuthProvider>
                      <AdminLogin />
                    </AdminAuthProvider>
                  }
                />
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
                  <Route path="students" element={<StudentsList />} />
                  <Route path="activity" element={<ActivityLogs />} />
                  <Route path="admins" element={<AdminsList />} />
                  <Route path="contacts" element={<ContactsList />} />
                  <Route path="reports" element={<ReportsList />} />
                  <Route path="submissions" element={<SubmissionsList />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {!hideLayout && <Footer />}
            {!hideChatbot && <Chatbot />}
            {!hideLayout && <CookieConsent />}
            {!hideLayout && <EventModalManager />}
            {!hideLayout && <NotificationBell />}
          </div>
        </StudentAuthProvider>
      </MathJaxContext>
    </HelmetProvider>
  );
}

function App() {
  if (GOOGLE_CLIENT_ID) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AppRoutes />
      </GoogleOAuthProvider>
    );
  }
  return <AppRoutes />;
}

export default App;
