import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";
import Reveal from "../../components/Reveal";

const faqData = [
  {
    icon: "/icons/vision.png",
    question: "What is SetuLearn?",
    answer:
      "SetuLearn is a free online mock test platform designed to help students prepare for government, entrance, and competitive examinations."
  },
  {
    icon: "/icons/document.png",
    question: "Do I need to create an account?",
    answer:
      "No. You can start practicing tests instantly without creating an account."
  },
  {
    icon: "/icons/free.png",
    question: "Are all mock tests free?",
    answer:
      "Yes. All mock tests available on SetuLearn are completely free."
  },
  {
    icon: "/icons/checkbox.png",
    question: "Can I attempt a test multiple times?",
    answer:
      "Yes. You can retake any test as many times as you want."
  },
  {
    icon: "/icons/exam-icons/graduation-cap.png",
    question: "What exams are available?",
    answer:
      "We provide mock tests for JEE, NEET, UPSC, SSC, Banking, Railway, CUET and many other competitive exams."
  },
  {
    icon: "/icons/clock.png",
    question: "What is Timed Mode?",
    answer:
      "Timed Mode simulates a real examination environment with a countdown timer."
  },
  {
    icon: "/icons/document.png",
    question: "What is Practice Mode?",
    answer:
      "Practice Mode allows you to solve questions without any time limit."
  },
  {
    icon: "/icons/rocket.png",
    question: "Will my test be submitted automatically?",
    answer:
      "Yes. In Timed Mode, the test is automatically submitted when the timer reaches zero."
  },
  {
    icon: "/icons/question-icon.png",
    question: "Can I mark questions for review?",
    answer:
      "Yes. You can mark questions for review and revisit them before submission."
  },
  {
    icon: "/icons/accuracy.png",
    question: "How is my score calculated?",
    answer:
      "Scores are calculated based on correct answers, incorrect answers, and the marking scheme of the selected test."
  },
  {
    icon: "/icons/correct.png",
    question: "Can I view solutions after submitting?",
    answer:
      "Yes. Detailed solutions and correct answers are available after test completion."
  },
  {
    icon: "/icons/business.png",
    question: "Can I see detailed performance analytics?",
    answer:
      "Yes. SetuLearn provides topic-wise and section-wise performance analysis."
  },
  {
    icon: "/icons/online-test.png",
    question: "Can I use SetuLearn on mobile devices?",
    answer:
      "Absolutely. The platform is fully responsive and works on mobiles, tablets, and desktops."
  },
  {
    icon: "/icons/online-test.png",
    question: "Do I need an internet connection during the test?",
    answer:
      "Yes. A stable internet connection is recommended for the best experience."
  },
  {
    icon: "/icons/tips/smart.png",
    question: "How often are new tests added?",
    answer:
      "New tests and question sets are added regularly to keep content updated."
  }
];

export default function FAQ() {
  const navigate = useNavigate();
  const [active, setActive] = useState(null);
    document.title = "FAQ - SetuLearn";

  const toggleFAQ = (index) => {
    setActive(active === index ? null : index);
  };

  return (
    <div className="faq-page">
      <SEO
        title="FAQ"
        description="Frequently asked questions about SetuLearn mock test platform. Learn about timed mode, practice mode, score calculation, exam categories, and how to get started with free mock tests."
        canonical="/faq"
      />
      <div className="faq-header">
        <div className="section-eyebrow">Help Center</div>
        <h1 className="faq-title">Frequently Asked Questions</h1>
        <p className="faq-subtitle">
          Find answers to the most common questions about SetuLearn.
        </p>
      </div>

      <div className="faq-wrapper">
        {faqData.map((faq, index) => (
          <Reveal key={index} delay={Math.min(index, 6) * 60}>
            <div
              className={`faq-card ${
                active === index ? "faq-active" : ""
              }`}
            >
              <button className="faq-question" onClick={() => toggleFAQ(index)} >
                <span className="faq-q-icon">
                  {faq.icon && faq.icon.startsWith("/") ? (
                    <img src={faq.icon} alt={faq.question} height={30} />
                  ) : (
                    faq.icon
                  )}
                </span>
                <span className="faq-q-text">{faq.question}</span>
                <span className="faq-icon">
                  {active === index ? "−" : "+"}
                </span>
              </button>

              <div className="faq-answer-collapse">
                <div className="faq-answer-inner">
                  <p style={{ padding: "1rem" }}>{faq.answer}</p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="faq-contact">
        <h3>Still Have Questions?</h3>
        <p>
          Our support team is always ready to help you.
        </p>

        <button className="btn-white" onClick={() => navigate("/contact")}>
          Contact Support
        </button>
      </div>
    </div>
  );
}