/**
 * Content source for the "Setu" chatbot widget.
 * Kept in one place so the FAQ page and the chatbot never drift apart —
 * if you update an answer here, both surfaces stay in sync.
 */

export const botFaqData = [
  {
    q: "What is SetuLearn?",
    a: "SetuLearn is a free online mock test platform built to help students prepare for government, entrance, and competitive exams — think JEE, NEET, UPSC, SSC, Banking, Railway, CUET and more.",
  },
  {
    q: "Do I need to create an account?",
    a: "Nope! You can jump straight into practice tests without creating an account.",
  },
  {
    q: "Are the tests really free?",
    a: "Yes — every mock test on SetuLearn is completely free, no subscriptions or hidden charges.",
  },
  {
    q: "Can I retake a test?",
    a: "Absolutely, you can attempt any test as many times as you like.",
  },
  {
    q: "Will my test auto-submit?",
    a: "In Timed Mode, yes — the test submits automatically once the countdown hits zero. In Practice Mode there's no timer, so you're never rushed.",
  },
  {
    q: "Can I mark questions for review?",
    a: "Yes, you can flag any question for review and revisit it before final submission.",
  },
  {
    q: "Can I see solutions after a test?",
    a: "Yes — full solutions and correct answers are unlocked right after you submit, along with a detailed performance breakdown.",
  },
  {
    q: "Does it work on mobile?",
    a: "Yes, SetuLearn is fully responsive and works great on mobile, tablet, and desktop.",
  },
];

export const howItWorksSteps = [
  { title: "Browse Tests", desc: "Explore mock tests across engineering, medical, government, banking and entrance exam categories." },
  { title: "Read Instructions", desc: "Check the rules, marking scheme, duration and subject-wise split before you start." },
  { title: "Attempt Questions", desc: "Answer questions, flag tricky ones for review, and move freely between sections." },
  { title: "Manage Time", desc: "Practice under real exam conditions with the built-in timer." },
  { title: "Get Instant Results", desc: "See your scorecard immediately after submitting, with accuracy and topic-wise insight." },
  { title: "Analyze & Improve", desc: "Review solutions, spot weak topics, and track improvement over attempts." },
];

export const testModesInfo = [
  { title: "Timed Mode", desc: "Simulates a real exam with a countdown timer — the test auto-submits when time runs out." },
  { title: "Practice Mode", desc: "No timer, no pressure. Solve at your own pace and check answers instantly with explanations." },
];

/** Support/contact details shown by the chatbot's "Talk to support" option. */
export const supportDetails = {
  email: "support@setulearn.in",
  phone: "+91 89082 21784",
  hours: "Mon - Sat, 9 AM - 6 PM",
  website: "https://www.setulearn.in",
};

export const markingSystemInfo =
  "Each test has its own marking scheme, shown on the Instructions page before you start — most tests use +4 marks for a correct answer and −1 for a wrong one, with 0 for unattempted questions. Your final score, accuracy and subject-wise breakup are calculated automatically the moment you submit, and a detailed analysis is ready right after.";

/** Top-level quick-reply menu shown in the chatbot */
export const mainMenu = [
  { id: "about", label: "What is SetuLearn?" },
  { id: "how_it_works", label: "How does it work?" },
  { id: "exam_categories", label: "View exam categories" },
  { id: "test_modes", label: "How do tests work?" },
  { id: "marking_system", label: "Marking system" },
  { id: "test_count", label: "How many tests are there?" },
  { id: "last_test_result", label: "My last test result" },
  { id: "practice_ai", label: "Help with a practice question" },
  { id: "faq", label: "More FAQs" },
  { id: "contact", label: "Talk to support" },
];

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Hi there";
}
