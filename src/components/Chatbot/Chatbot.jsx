import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MathJax } from "better-react-mathjax";
import examService from "../../api/examService";
import aiService from "../../api/aiService";
import { getErrorMessage } from "../../api/apiErrorHandler";
import { subscribeToPracticeQuestion, getLastTestResult } from "../../utils/chatbotBridge";
import {
  botFaqData,
  howItWorksSteps,
  testModesInfo,
  markingSystemInfo,
  mainMenu,
  supportDetails,
  getGreeting,
} from "../../data/chatbotData";
import { Send, X, Sparkles } from "../../data/svgs";
import "./Chatbot.css";

let uid = 0;
const nextId = () => `m${Date.now()}_${uid++}`;

const botText = (content, options = null) => ({
  id: nextId(),
  from: "bot",
  content,
  options,
});
const userText = (content) => ({ id: nextId(), from: "user", content });

export default function Chatbot() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [practiceQuestion, setPracticeQuestion] = useState(null);
  const [awaitingAiQuestion, setAwaitingAiQuestion] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => subscribeToPracticeQuestion(setPracticeQuestion), []);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const pushBot = useCallback((content, options = null, delay = 350) => {
    setTyping(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setTyping(false);
        setMessages((m) => [...m, botText(content, options)]);
        resolve();
      }, delay);
    });
  }, []);

  const pushUser = (content) => setMessages((m) => [...m, userText(content)]);

  const showMainMenu = useCallback(
    (intro = "What would you like to know?") => {
      pushBot(intro, mainMenu);
    },
    [pushBot]
  );

  const handleOpen = () => {
    setOpen(true);
    if (!hasGreeted) {
      setHasGreeted(true);
      pushBot(
        `${getGreeting()}! I'm SetuLearn 👋 How can I help you today?`,
        mainMenu,
        250
      );
    }
  };

  // ---- Intent handlers -------------------------------------------------

  const handleAbout = async () => {
    await pushBot(botFaqData[0].a);
    await pushBot("Anything else you'd like to know?", mainMenu);
  };

  const handleHowItWorks = async () => {
    const steps = howItWorksSteps
      .map((s, i) => `${i + 1}. ${s.title} — ${s.desc}`)
      .join("\n");
    await pushBot(`Here's how SetuLearn works, step by step:\n\n${steps}`);
    await pushBot("Want the full walkthrough?", [
      { id: "open_how_it_works", label: "Open How It Works page" },
      { id: "main_menu", label: "⬅ Back to menu" },
    ]);
  };

  const handleTestModes = async () => {
    const text = testModesInfo.map((t) => `• ${t.title}: ${t.desc}`).join("\n\n");
    await pushBot(`Tests can be attempted in two modes:\n\n${text}`);
    await pushBot("Anything else?", mainMenu);
  };

  const handleMarkingSystem = async () => {
    await pushBot(markingSystemInfo);
    await pushBot("Anything else?", mainMenu);
  };

  const handleExamCategories = async () => {
    setTyping(true);
    try {
      const exams = await examService.getExams();
      setTyping(false);
      if (!exams || exams.length === 0) {
        await pushBot("I couldn't find any exam categories right now — please check back soon.");
      } else {
        const names = exams.slice(0, 12).map((e) => `• ${e.name}`).join("\n");
        const more = exams.length > 12 ? `\n…and ${exams.length - 12} more` : "";
        await pushBot(`We currently cover ${exams.length} exam categories:\n\n${names}${more}`, [
          { id: "open_exams", label: "Browse all categories" },
          { id: "main_menu", label: "⬅ Back to menu" },
        ]);
      }
    } catch (err) {
      setTyping(false);
      await pushBot(
        getErrorMessage(err, "I couldn't load exam categories right now.") +
          " You can also browse them directly."
      , [{ id: "open_exams", label: "Browse all categories" }, { id: "main_menu", label: "⬅ Back to menu" }]);
    }
  };

  const handleTestCount = async () => {
    setTyping(true);
    try {
      const tests = await examService.getAllTests();
      setTyping(false);
      const count = tests?.length || 0;
      await pushBot(
        `We currently have ${count} mock test${count === 1 ? "" : "s"} available across all exam categories, and new ones are added regularly.`,
        [{ id: "open_tests", label: "Browse tests" }, { id: "main_menu", label: "⬅ Back to menu" }]
      );
    } catch (err) {
      setTyping(false);
      await pushBot(
        getErrorMessage(err, "I couldn't fetch the test count right now."),
        [{ id: "open_tests", label: "Browse tests" }, { id: "main_menu", label: "⬅ Back to menu" }]
      );
    }
  };

  const handlePracticeAI = async () => {
    if (practiceQuestion) {
      if (practiceQuestion.explanation) {
        await pushBot(
          `Here's the AI-generated solution for the question you're viewing:\n\n"${practiceQuestion.text || "Current question"}"\n\n${practiceQuestion.explanation}`
        );
      } else {
        await pushBot(
          "No explanation is stored for this question yet. Tell me what's confusing about it and I'll try to help."
        );
      }
      setAwaitingAiQuestion(true);
      await pushBot("Type your question below, or:", [{ id: "main_menu", label: "⬅ Back to menu" }]);
    } else {
      await pushBot(
        "Open any question on the Practice page and tap this option again — I'll pull up the solution instantly. Or just type your question below and I'll do my best to help."
      );
      setAwaitingAiQuestion(true);
      await pushBot("Where would you like to go?", [
        { id: "open_practice", label: "Go to Practice" },
        { id: "main_menu", label: "⬅ Back to menu" },
      ]);
    }
  };

  const handleFaq = async () => {
    await pushBot(
      "Pick a question:",
      botFaqData.map((f, i) => ({ id: `faq_${i}`, label: f.q }))
    );
  };

  const handleFaqAnswer = async (index) => {
    await pushBot(botFaqData[index].a);
    await pushBot("Anything else?", [
      { id: "faq", label: "More FAQs" },
      { id: "main_menu", label: "⬅ Back to menu" },
    ]);
  };

  const handleContact = async () => {
    await pushBot(
      `You can reach our support team directly:\n\n📧 Email: ${supportDetails.email}\n📱 Phone: ${supportDetails.phone}\n⏰ Support Hours: ${supportDetails.hours}\n🌐 Website: ${supportDetails.website}`
    );
    await pushBot("Or send us a message here:", [
      { id: "open_contact", label: "Open Contact page" },
      { id: "main_menu", label: "⬅ Back to menu" },
    ]);
  };

  const handleLastTestResult = async () => {
    const last = getLastTestResult();
    if (!last) {
      await pushBot(
        "You haven't completed a test yet, so I don't have a result to show. Attempt one and I'll be able to summarize it for you right here.",
        [{ id: "open_tests", label: "Browse tests" }, { id: "main_menu", label: "⬅ Back to menu" }]
      );
      return;
    }
    const when = last.timestamp ? new Date(last.timestamp).toLocaleString() : null;
    const lines = [
      `Here's a summary of your last test${last.testTitle ? ` — "${last.testTitle}"` : ""}:`,
      "",
      `• Score: ${last.securedScore} / ${last.totalScore}`,
      `• Correct: ${last.correct}`,
      `• Incorrect: ${last.incorrect}`,
      `• Unattempted: ${last.unattempted}`,
      `• Total Questions: ${last.totalQuestions}`,
      `• Accuracy/Percentile: ${last.percentile}%`,
    ];
    if (when) lines.push(`• Taken on: ${when}`);
    await pushBot(lines.join("\n"));
    await pushBot("Anything else?", [
      { id: "open_tests", label: "Browse more tests" },
      { id: "main_menu", label: "⬅ Back to menu" },
    ]);
  };

  const handleOption = async (optionId) => {
    pushUser(mainMenu.find((m) => m.id === optionId)?.label || findLabel(optionId));
    if (optionId !== "practice_ai") setAwaitingAiQuestion(false);

    if (optionId.startsWith("faq_")) {
      return handleFaqAnswer(Number(optionId.split("_")[1]));
    }

    switch (optionId) {
      case "about":
        return handleAbout();
      case "how_it_works":
        return handleHowItWorks();
      case "exam_categories":
        return handleExamCategories();
      case "test_modes":
        return handleTestModes();
      case "marking_system":
        return handleMarkingSystem();
      case "test_count":
        return handleTestCount();
      case "last_test_result":
        return handleLastTestResult();
      case "practice_ai":
        return handlePracticeAI();
      case "faq":
        return handleFaq();
      case "contact":
        return handleContact();
      case "main_menu":
        setAwaitingAiQuestion(false);
        return showMainMenu();
      case "open_how_it_works":
        navigate("/how-it-works");
        return setOpen(false);
      case "open_exams":
        navigate("/exams");
        return setOpen(false);
      case "open_tests":
        navigate("/tests");
        return setOpen(false);
      case "open_practice":
        navigate("/practice");
        return setOpen(false);
      case "open_contact":
        navigate("/contact");
        return setOpen(false);
      default:
        return showMainMenu();
    }
  };

  function findLabel(id) {
    const all = [
      ...mainMenu,
      { id: "open_how_it_works", label: "Open How It Works page" },
      { id: "open_exams", label: "Browse all categories" },
      { id: "open_tests", label: "Browse tests" },
      { id: "open_practice", label: "Go to Practice" },
      { id: "open_contact", label: "Open Contact page" },
      { id: "main_menu", label: "⬅ Back to menu" },
      { id: "faq", label: "More FAQs" },
      ...botFaqData.map((f, i) => ({ id: `faq_${i}`, label: f.q })),
    ];
    return all.find((m) => m.id === id)?.label || id;
  }

  // ---- Free-text handling -----------------------------------------------

  const KEYWORD_MAP = [
    { id: "about", words: ["what is setulearn", "about setulearn", "what is this"] },
    { id: "how_it_works", words: ["how it works", "how does it work", "how this works"] },
    { id: "exam_categories", words: ["exam categor", "which exams", "what exams"] },
    { id: "test_modes", words: ["timed mode", "practice mode", "how test", "how does test", "how tests work"] },
    { id: "marking_system", words: ["marking", "negative mark", "how is my score", "score calculat"] },
    { id: "test_count", words: ["how many test", "number of test", "total test"] },
    { id: "last_test_result", words: ["last test", "my result", "my score", "how did i do", "previous test", "my last exam"] },
    { id: "practice_ai", words: ["solution", "explain this question", "help with this question", "ai solution"] },
    { id: "contact", words: ["contact", "support", "help me talk", "human", "website url", "your website", "phone number", "email address"] },
  ];

  const matchKeyword = (text) => {
    const t = text.toLowerCase();
    for (const entry of KEYWORD_MAP) {
      if (entry.words.some((w) => t.includes(w))) return entry.id;
    }
    return null;
  };

  const matchFaq = (text) => {
    const t = text.toLowerCase();
    let best = -1;
    let bestScore = 0;
    botFaqData.forEach((f, i) => {
      const qWords = f.q.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
      const score = qWords.filter((w) => t.includes(w)).length;
      if (score > bestScore) {
        bestScore = score;
        best = i;
      }
    });
    return bestScore >= 2 ? best : -1;
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    pushUser(text);

    const intent = matchKeyword(text);
    if (intent) {
      setAwaitingAiQuestion(false);
      return handleOption(intent);
    }

    const faqIndex = matchFaq(text);
    if (faqIndex >= 0) {
      await pushBot(botFaqData[faqIndex].a);
      await pushBot("Anything else?", mainMenu);
      return;
    }

    // No keyword/FAQ match — try the AI backend for a real answer instead
    // of immediately punting to the static menu. This is what makes free
    // typing ("hello", "explain projectile motion", etc.) actually useful,
    // not just the guided "Help with a practice question" flow.
    setTyping(true);
    try {
      const lastTestResult = getLastTestResult();
      const context =
        practiceQuestion || lastTestResult
          ? {
              ...(practiceQuestion
                ? {
                    questionText: practiceQuestion.text,
                    options: practiceQuestion.options,
                    subject: practiceQuestion.subject,
                  }
                : {}),
              ...(lastTestResult ? { lastTestResult } : {}),
            }
          : null;
      const result = await aiService.askAI(text, context, practiceQuestion?.id || null);
      setTyping(false);
      await pushBot(result?.answer || "Here's what I found.");
      await pushBot("Anything else?", mainMenu);
    } catch (err) {
      setTyping(false);
      await pushBot(
        "I'm not sure about that one yet, and I couldn't reach the AI assistant right now. Here's what I can help with:",
        mainMenu
      );
    }
  };

  return (
    <div className="setu-chatbot">
      {open && (
        <div className="setu-panel" role="dialog" aria-label="Setu chatbot">
          <div className="setu-header">
            <div className="setu-header-info">
              <img src="/favicon.ico" alt="SetuLearn" className="setu-avatar" />
              <div>
                <div className="setu-name">SetuLearn</div>
                <div className="setu-status">
                  <span className="setu-dot" /> Online
                </div>
              </div>
            </div>
            <button className="setu-close" onClick={() => setOpen(false)} aria-label="Close chat">
              <X />
            </button>
          </div>

          <div className="setu-body" ref={bodyRef}>
            {messages.map((m) => (
              <div key={m.id} className={`setu-row setu-row-${m.from}`}>
                {m.from === "bot" && (
                  <img src="/favicon.ico" alt="" className="setu-bubble-avatar" />
                )}
                <div className={`setu-bubble setu-bubble-${m.from}`}>
                  <MathJax dynamic inline>
                    {m.content}
                  </MathJax>
                </div>
              </div>
            ))}

            {typing && (
              <div className="setu-row setu-row-bot">
                <img src="/favicon.ico" alt="" className="setu-bubble-avatar" />
                <div className="setu-bubble setu-bubble-bot setu-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            {!typing && messages.length > 0 && messages[messages.length - 1].options && (
              <div className="setu-options">
                {messages[messages.length - 1].options.map((opt) => (
                  <button key={opt.id} className="setu-chip" onClick={() => handleOption(opt.id)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="setu-inputbar">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                awaitingAiQuestion ? "Ask me anything about this question…" : "Type your question…"
              }
            />
            <button onClick={handleSend} aria-label="Send message" className="setu-send">
              <Send />
            </button>
          </div>
        </div>
      )}

      <button
        className={`setu-launcher ${open ? "setu-launcher-open" : ""}`}
        onClick={() => (open ? setOpen(false) : handleOpen())}
        aria-label="Chat with Setu"
      >
        {open ? <X /> : (
          <>
            <img src="/favicon.ico" alt="" className="setu-launcher-logo" />
            <span className="setu-launcher-badge"><Sparkles size={11} /></span>
            <span className="setu-launcher-active-dot" aria-hidden="true" />
          </>
        )}
      </button>
    </div>
  );
}
