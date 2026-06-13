import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Tests from "./pages/Tests";
import TestInstructions from "./pages/TestInstructions";
import TestInterface from "./pages/TestInterface";
import TestResult from "./pages/TestResult";
import DetailedAnalysis from "./pages/DetailedAnalysis";

// import About from "./pages/About";
// import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
// import PrivacyPolicy from "./pages/PrivacyPolicy";
// import TermsOfService from "./pages/TermsOfService";

function App() {
  const location = useLocation();

  const hideLayout =
    location.pathname === "/test";

  return (
    <div className="app-root">

      {!hideLayout && <Navbar />}

      <main className={!hideLayout ? "main-content" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/instructions" element={<TestInstructions />} />
          <Route path="/test" element={<TestInterface />} />
          <Route path="/result" element={<TestResult />} />
          <Route path="/analysis" element={<DetailedAnalysis />} />

          {/* New Pages */}
          <Route path="/faq" element={<FAQ />} />
          {/* <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} /> */}
        </Routes>
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
}

export default App;