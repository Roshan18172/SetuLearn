import MathContent from "../MathContent";
import QuestionImage from "../QuestionImage";

const LETTERS = ["A", "B", "C", "D", "E"];

/**
 * One multiple-choice question with its options. Shared by Time Attack, Survival, Asteroid Blaster,
 * Board Race and Quiz Market.
 *  picked  - option index the player chose (or null)
 *  reveal  - show right / wrong colouring
 *  locked  - disable the buttons
 *  hidden  - indexes to grey out (e.g. already tried)
 */
export default function McqPanel({ question, picked = null, reveal = false, locked = false, hidden = [], onPick, compact = false }) {
  return (
    <div className={`mcq ${compact ? "mcq-compact" : ""}`}>
      <div className="mcq-question">
        <MathContent text={question.text} />
        <QuestionImage src={question.imageUrl} alt="Question figure" maxHeight={compact ? 120 : 200} />
      </div>
      <div className="mcq-options">
        {question.options.map((opt, i) => {
          const isRight = reveal && i === question.correct;
          const isWrong = reveal && picked === i && i !== question.correct;
          return (
            <button
              key={i}
              type="button"
              className={`mcq-option ${isRight ? "right" : ""} ${isWrong ? "wrong" : ""} ${reveal && !isRight && !isWrong ? "dim" : ""} ${hidden.includes(i) ? "tried" : ""}`}
              disabled={locked || hidden.includes(i)}
              onClick={() => onPick(i)}
            >
              <span className="mcq-letter">{LETTERS[i]}</span>
              <span className="mcq-text"><MathContent text={opt} /></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
