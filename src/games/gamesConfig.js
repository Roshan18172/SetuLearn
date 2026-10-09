import { PAIR_PACKS } from "./fallbackTerms";

/** Everything the hub, the home-page section and the intro screens need to know about each game. */
export const GAMES = [
  {
    id: "crossword",
    title: "Crossword",
    tagline: "Clues from real mock-test questions. Fill the grid!",
    emoji: "🧩",
    theme: "crossword",
    glyphs: ["A", "E", "R", "S", "T", "N", "O", "?", "7", "▮"],
    howTo: [
      "Tap a square in the grid, or tap a clue in the list.",
      "Type the answer. The cursor moves to the next square by itself.",
      "Tap the same square again (or press Space) to switch between Across and Down.",
      "Use the arrow keys to move around, Backspace to erase.",
      "Press Check to see which letters are right. Press Finish when you are done.",
    ],
    rules: [
      "Every clue is a question taken from a SetuLearn mock test - the answer is its correct option.",
      "Each correct letter scores 10 points.",
      "Hint (reveal a letter) costs 15 points, Reveal word costs 5 points per letter.",
      "Finishing the whole grid earns a speed bonus.",
    ],
    difficulty: {
      easy: { label: "Easy", note: "6 words", words: 6, size: 13 },
      medium: { label: "Medium", note: "9 words", words: 9, size: 15 },
      hard: { label: "Hard", note: "12 words", words: 12, size: 17 },
    },
  },
  {
    id: "wordsearch",
    title: "Word Search",
    tagline: "Hunt hidden terms in a sea of letters.",
    emoji: "🔍",
    theme: "wordsearch",
    glyphs: ["~", "°", "○", "A", "S", "W", "≈", "◌"],
    howTo: [
      "Look at the word list. Every word is hidden somewhere in the grid.",
      "Press on the first letter, drag in a straight line to the last letter, then let go.",
      "Words can run across, down and diagonally - on Hard they can also run backwards.",
      "A found word gets coloured and ticked off the list.",
      "Stuck? Use Hint to flash the first letter of a word.",
    ],
    rules: [
      "Each word found scores 100 points, plus a bonus for speed.",
      "A hint costs 40 points.",
      "On Hard the list shows only the CLUE (the mock-test question) - you must work out the word yourself.",
      "Find every word to finish the round.",
    ],
    difficulty: {
      easy: { label: "Easy", note: "8x8 · words shown", size: 8, words: 6, dirCount: 2, clues: false },
      medium: { label: "Medium", note: "11x11 · 4 directions", size: 11, words: 8, dirCount: 4, clues: false },
      hard: { label: "Hard", note: "13x13 · clues only", size: 13, words: 10, dirCount: 8, clues: true },
    },
  },
  {
    id: "matching",
    title: "Matching Pairs",
    tagline: "Flip cards or link terms, dates and formulas.",
    emoji: "🃏",
    theme: "matching",
    glyphs: ["★", "♦", "●", "▲", "✦", "♥", "=", "+"],
    howTo: [
      "Flip cards: tap two cards. If a term and its match line up, they stay face up.",
      "Link terms: tap an item on the left, then its partner on the right (or drag one onto the other).",
      "Match every pair using as few moves as you can.",
    ],
    rules: [
      "Each matched pair scores 100 points.",
      "Every wrong try costs 15 points.",
      "Finish quickly for a time bonus.",
      "Choose a pack: your mock-test terms, dates & events, formulas, states & capitals, inventors, or key terms.",
    ],
    difficulty: {
      easy: { label: "Easy", note: "6 pairs", pairs: 6 },
      medium: { label: "Medium", note: "8 pairs", pairs: 8 },
      hard: { label: "Hard", note: "10 pairs", pairs: 10 },
    },
    options: [
      {
        id: "mode",
        label: "How do you want to play?",
        choices: [
          { value: "flip", label: "Flip cards" },
          { value: "link", label: "Link terms" },
        ],
        default: "flip",
      },
      {
        id: "pack",
        label: "Pack",
        choices: [
          { value: "tests", label: "From my mock tests" },
          ...Object.entries(PAIR_PACKS).map(([value, p]) => ({ value, label: p.label })),
        ],
        default: "tests",
      },
    ],
  },
  {
    id: "unscramble",
    title: "Unscramble",
    tagline: "Quick-fire! Put the letters back in order.",
    emoji: "🔤",
    theme: "unscramble",
    glyphs: ["✦", "✧", "?", "!", "Z", "Q", "X", "⚡"],
    howTo: [
      "A clue and a jumble of letters appear.",
      "Tap the letters in the right order - or just type the word on your keyboard.",
      "Tap a filled box (or press Backspace) to take a letter back.",
      "Beat the timer! Answer fast and in a row for bonus points.",
    ],
    rules: [
      "10 words per round. Correct answer: 100 points + up to 100 for speed.",
      "Streak bonus: +20 points for every answer in a row.",
      "Hint reveals one letter and costs 30 points. Skip scores nothing and breaks your streak.",
      "When the time runs out the word is skipped.",
    ],
    difficulty: {
      easy: { label: "Easy", note: "45 s per word", seconds: 45 },
      medium: { label: "Medium", note: "30 s per word", seconds: 30 },
      hard: { label: "Hard", note: "20 s per word", seconds: 20 },
    },
  },
  {
    id: "fillblanks",
    title: "Fill the Blanks",
    tagline: "Complete the concept before the bar runs out.",
    emoji: "✍️",
    theme: "fillblanks",
    glyphs: ["_", "?", "✓", "→", "⚡", "★"],
    howTo: [
      "Read the clue and complete the missing word.",
      "Easy: pick the right word from four choices.",
      "Medium and Hard: type the word. Some letters are shown to help you.",
      "The bar at the top is your timer - answer before it empties.",
    ],
    rules: [
      "10 questions per round. Correct answer: 100 points + up to 100 for speed.",
      "Streak bonus: +20 points for every answer in a row.",
      "A wrong answer or running out of time scores nothing and breaks your streak.",
    ],
    difficulty: {
      easy: { label: "Easy", note: "4 choices · 20 s", mode: "choice", seconds: 20 },
      medium: { label: "Medium", note: "type it · 20 s", mode: "type", seconds: 20, reveal: 0.4 },
      hard: { label: "Hard", note: "first letter only · 15 s", mode: "type", seconds: 15, reveal: 0 },
    },
  },
];

export const getGame = (id) => GAMES.find((g) => g.id === id);
