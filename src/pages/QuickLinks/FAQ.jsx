import { useState } from "react";

const faqData = [
  {
    question: "What is SetuLearn?",
    answer:
      "SetuLearn is a free online mock test platform designed to help students prepare for government, entrance, and competitive examinations."
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No. You can start practicing tests instantly without creating an account."
  },
  {
    question: "Are all mock tests free?",
    answer:
      "Yes. All mock tests available on SetuLearn are completely free."
  },
  {
    question: "Can I attempt a test multiple times?",
    answer:
      "Yes. You can retake any test as many times as you want."
  },
  {
    question: "What exams are available?",
    answer:
      "We provide mock tests for JEE, NEET, UPSC, SSC, Banking, Railway, CUET and many other competitive exams."
  },
  {
    question: "What is Timed Mode?",
    answer:
      "Timed Mode simulates a real examination environment with a countdown timer."
  },
  {
    question: "What is Practice Mode?",
    answer:
      "Practice Mode allows you to solve questions without any time limit."
  },
  {
    question: "Will my test be submitted automatically?",
    answer:
      "Yes. In Timed Mode, the test is automatically submitted when the timer reaches zero."
  },
  {
    question: "Can I mark questions for review?",
    answer:
      "Yes. You can mark questions for review and revisit them before submission."
  },
  {
    question: "How is my score calculated?",
    answer:
      "Scores are calculated based on correct answers, incorrect answers, and the marking scheme of the selected test."
  },
  {
    question: "Can I view solutions after submitting?",
    answer:
      "Yes. Detailed solutions and correct answers are available after test completion."
  },
  {
    question: "Can I see detailed performance analytics?",
    answer:
      "Yes. SetuLearn provides topic-wise and section-wise performance analysis."
  },
  {
    question: "Can I use SetuLearn on mobile devices?",
    answer:
      "Absolutely. The platform is fully responsive and works on mobiles, tablets, and desktops."
  },
  {
    question: "Do I need an internet connection during the test?",
    answer:
      "Yes. A stable internet connection is recommended for the best experience."
  },
  {
    question: "How often are new tests added?",
    answer:
      "New tests and question sets are added regularly to keep content updated."
  }
];

export default function FAQ() {
  const [active, setActive] = useState(null);
    document.title = "FAQ - SetuLearn";

  const toggleFAQ = (index) => {
    setActive(active === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="faq-header">
        <div className="section-eyebrow">Help Center</div>
        <h1 className="faq-title">Frequently Asked Questions</h1>
        <p className="faq-subtitle">
          Find answers to the most common questions about SetuLearn.
        </p>
      </div>

      <div className="faq-wrapper">
        {faqData.map((faq, index) => (
          <div key={index}
            className={`faq-card ${
              active === index ? "faq-active" : ""
            }`}
          >
            <button className="faq-question" onClick={() => toggleFAQ(index)} >
              <span>{faq.question}</span>
              <span className="faq-icon">
                {active === index ? "−" : "+"}
              </span>
            </button>

            {active === index && (
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="faq-contact">
        <h3>Still Have Questions?</h3>
        <p>
          Our support team is always ready to help you.
        </p>

        <button className="btn-primary"> Contact Support </button>
      </div>
    </div>
  );
}