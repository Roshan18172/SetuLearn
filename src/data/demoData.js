export const categories = [
  { id: 1, name: "Engineering", icon: "🎓", exams: ["JEE Main", "JEE Advanced", "BITSAT", "VITEEE"], tests: 12, color: "#6C63FF" },
  { id: 2, name: "Medical", icon: "🏥", exams: ["NEET", "AIIMS", "JIPMER"], tests: 8, color: "#00BFA6" },
  { id: 3, name: "Government Exams", icon: "🏛️", exams: ["UPSC", "SSC", "Banking", "Railway", "State PSC"], tests: 15, color: "#FF6B6B" },
  { id: 4, name: "College Entrance", icon: "📚", exams: ["CUET", "IPMAT", "NIFT", "CLAT", "Others"], tests: 10, color: "#FFA726" },
];

export const tests = [
  {
    id: 1,
    title: "JEE Main 2024 - Full Length Test 1",
    category: "Engineering",
    exam: "JEE Main",
    subject: "Physics, Chemistry, Mathematics",
    questions: 90,
    duration: 180,
    difficulty: "Hard",
    marks: 300,
    tags: ["Full Length", "2024"],
    description: "A complete simulation of JEE Main 2024 pattern with questions from Physics, Chemistry, and Mathematics. Negative marking applies.",
    subjects: [
      { name: "Physics", questions: 30, marks: 120 },
      { name: "Chemistry", questions: 30, marks: 120 },
      { name: "Mathematics", questions: 30, marks: 120 },
    ],
    instructions: [
      "The test contains 90 multiple choice questions.",
      "The duration of the test is 180 minutes.",
      "Each question carries 4 marks.",
      "There is negative marking. 1 mark will be deducted for each incorrect answer.",
    ],
    attemptedBy: 4821,
    avgScore: 67,
  },
  {
    id: 2,
    title: "NEET 2024 - Full Length Test 1",
    category: "Medical",
    exam: "NEET",
    subject: "Physics, Chemistry, Biology",
    questions: 180,
    duration: 180,
    difficulty: "Medium",
    marks: 720,
    tags: ["Full Length", "2024"],
    description: "Full-length NEET 2024 mock test with Biology, Physics, and Chemistry sections following the latest NTA pattern.",
    subjects: [
      { name: "Physics", questions: 45, marks: 180 },
      { name: "Chemistry", questions: 45, marks: 180 },
      { name: "Biology", questions: 90, marks: 360 },
    ],
    instructions: [
      "The test contains 180 multiple choice questions.",
      "The duration of the test is 180 minutes.",
      "Each correct answer carries 4 marks.",
      "1 mark is deducted for each incorrect answer.",
    ],
    attemptedBy: 6200,
    avgScore: 72,
  },
  {
    id: 3,
    title: "SSC CGL Tier 1 - Full Length Test 1",
    category: "Government Exams",
    exam: "SSC CGL",
    subject: "GK, Reasoning, Quant, English",
    questions: 100,
    duration: 60,
    difficulty: "Medium",
    marks: 200,
    tags: ["Tier 1", "Full Length"],
    description: "Complete SSC CGL Tier 1 mock test with all 4 sections: General Intelligence, General Awareness, Quantitative Aptitude, and English.",
    subjects: [
      { name: "General Intelligence", questions: 25, marks: 50 },
      { name: "General Awareness", questions: 25, marks: 50 },
      { name: "Quantitative Aptitude", questions: 25, marks: 50 },
      { name: "English Comprehension", questions: 25, marks: 50 },
    ],
    instructions: [
      "The test contains 100 multiple choice questions.",
      "Duration is 60 minutes.",
      "Each correct answer carries 2 marks.",
      "0.5 mark deducted for each wrong answer.",
    ],
    attemptedBy: 3100,
    avgScore: 78,
  },
  {
    id: 4,
    title: "CUET 2024 - General Test",
    category: "College Entrance",
    exam: "CUET",
    subject: "GK, Reasoning, Quant, English",
    questions: 60,
    duration: 60,
    difficulty: "Easy",
    marks: 200,
    tags: ["General Test", "2024"],
    description: "CUET General Test preparation mock covering current affairs, reasoning, and language comprehension.",
    subjects: [
      { name: "Current Affairs", questions: 20, marks: 60 },
      { name: "Reasoning", questions: 20, marks: 60 },
      { name: "English", questions: 20, marks: 80 },
    ],
    instructions: [
      "The test contains 60 questions.",
      "Duration is 60 minutes.",
      "Each correct answer carries marks as per section.",
      "No negative marking for this test.",
    ],
    attemptedBy: 2700,
    avgScore: 81,
  },
  {
    id: 5,
    title: "JEE Advanced 2024 - Mock Test 1",
    category: "Engineering",
    exam: "JEE Advanced",
    subject: "Physics, Chemistry, Mathematics",
    questions: 54,
    duration: 180,
    difficulty: "Hard",
    marks: 198,
    tags: ["Mock", "2024", "Advanced"],
    description: "JEE Advanced level mock test with challenging problems in all three subjects. Multiple question types included.",
    subjects: [
      { name: "Physics", questions: 18, marks: 66 },
      { name: "Chemistry", questions: 18, marks: 66 },
      { name: "Mathematics", questions: 18, marks: 66 },
    ],
    instructions: [
      "Contains 54 questions across 3 papers.",
      "Duration is 180 minutes.",
      "Different question types carry different marks.",
      "Partial marking and negative marking applies.",
    ],
    attemptedBy: 1980,
    avgScore: 55,
  },
  {
    id: 6,
    title: "UPSC Prelims - GS Paper 1 Mock",
    category: "Government Exams",
    exam: "UPSC",
    subject: "General Studies",
    questions: 100,
    duration: 120,
    difficulty: "Hard",
    marks: 200,
    tags: ["Prelims", "GS1"],
    description: "UPSC Civil Services Preliminary General Studies Paper 1 mock with questions from History, Geography, Polity, Economy, Science & Environment.",
    subjects: [
      { name: "History & Culture", questions: 20, marks: 40 },
      { name: "Geography", questions: 15, marks: 30 },
      { name: "Polity", questions: 20, marks: 40 },
      { name: "Economy", questions: 20, marks: 40 },
      { name: "Environment & Science", questions: 25, marks: 50 },
    ],
    instructions: [
      "100 questions, 120 minutes.",
      "Each correct answer carries 2 marks.",
      "0.66 marks deducted for each wrong answer.",
      "Unanswered questions carry no marks.",
    ],
    attemptedBy: 5400,
    avgScore: 60,
  },
  {
    id: 7,
    title: "JEE Main 2024 - Full Length Test 2",
    category: "Engineering",
    exam: "JEE Main",
    subject: "Physics, Chemistry, Mathematics",
    questions: 90,
    duration: 180,
    difficulty: "Hard",
    marks: 300,
    tags: ["Full Length", "2024"],
    description: "Another full-length JEE Main 2024 mock test with a new set of questions across all three subjects.",
    subjects: [
      { name: "Physics", questions: 30, marks: 120 },
      { name: "Chemistry", questions: 30, marks: 120 },
      { name: "Mathematics", questions: 30, marks: 120 },
    ],
    instructions: [
      "The test contains 90 multiple choice questions.",
      "The duration of the test is 180 minutes.",
      "Each question carries 4 marks.",
      "There is negative marking. 1 mark will be deducted for each incorrect answer.",
    ],
    attemptedBy: 4500,
    avgScore: 65,   
  },
  {
    id: 8,
    title: "BITSAT   2024 - Full Length Test 2",
    category: "Medical",
    exam: "BITSAT",
    subject: "Physics, Chemistry, Mathematics",
    questions: 90,
    duration: 180,
    difficulty: "Hard",
    marks: 300,
    tags: ["Full Length", "2024"],
    description: "Another full-length BITSAT 2024 mock test with a new set of questions across all three subjects.",
    subjects: [
      { name: "Physics", questions: 30, marks: 120 },
      { name: "Chemistry", questions: 30, marks: 120 },
      { name: "Mathematics", questions: 30, marks: 120 },
    ],
    instructions: [
      "The test contains 90 multiple choice questions.",
      "The duration of the test is 180 minutes.",
      "Each question carries 4 marks.",
      "There is negative marking. 1 mark will be deducted for each incorrect answer.",
    ],
    attemptedBy: 4500,
    avgScore: 65,   
  }
];

export const questionBank = {
  1: generateJEEQuestions(),
  2: generateNEETQuestions(),
  3: generateSSCQuestions(),
  4: generateCUETQuestions(),
  5: generateAdvancedQuestions(),
  6: generateUPSCQuestions(),
  7: generateJEEQuestions(),
  8: generateBITSATQuestions(),
};

function createQuestion(
  id,
  text,
  topic,
  correctIndex = 0
) {
  return {
    id,
    text,
    topic,
    options: [
      { id: "o1", text: "Option A" },
      { id: "o2", text: "Option B" },
      { id: "o3", text: "Option C" },
      { id: "o4", text: "Option D" },
    ],
    correct: `o${correctIndex + 1}`,
  };
}
 
function generateBITSATQuestions() {
  const questions = [];

  const physicsTopics = [
    "Mechanics",
    "Thermodynamics",
    "Optics",
    "Modern Physics",
    "Electrodynamics",
  ];

  const chemistryTopics = [
    "Organic Chemistry",
    "Inorganic Chemistry",
    "Physical Chemistry",
  ];

  const mathsTopics = [
    "Algebra",
    "Calculus",
    "Coordinate Geometry",
    "Trigonometry",
    "Probability",
  ];

  // let count = 1;

  for (let i = 1; i <= 30; i++) {
    questions.push(
      createQuestion(
        `bitsat-p-${i}`,
        `Physics Question ${i}`,
        physicsTopics[i % physicsTopics.length],
        i % 4
      )
    );
  }

  for (let i = 1; i <= 30; i++) {
    questions.push(
      createQuestion(
        `bitsat-c-${i}`,
        `Chemistry Question ${i}`,
        chemistryTopics[i % chemistryTopics.length],
        i % 4
      )
    );
  }

  for (let i = 1; i <= 30; i++) {
    questions.push(
      createQuestion(
        `bitsat-m-${i}`,
        `Mathematics Question ${i}`,
        mathsTopics[i % mathsTopics.length],
        i % 4
      )
    );
  }

  return questions;
}

function generateJEEQuestions() {
  const questions = [];

  const physicsTopics = [
    "Mechanics",
    "Thermodynamics",
    "Optics",
    "Modern Physics",
    "Electrodynamics",
  ];

  const chemistryTopics = [
    "Organic Chemistry",
    "Inorganic Chemistry",
    "Physical Chemistry",
  ];

  const mathsTopics = [
    "Algebra",
    "Calculus",
    "Coordinate Geometry",
    "Trigonometry",
    "Probability",
  ];

  // let count = 1;

  for (let i = 1; i <= 30; i++) {
    questions.push(
      createQuestion(
        `jee-p-${i}`,
        `Physics Question ${i}`,
        physicsTopics[i % physicsTopics.length],
        i % 4
      )
    );
  }

  for (let i = 1; i <= 30; i++) {
    questions.push(
      createQuestion(
        `jee-c-${i}`,
        `Chemistry Question ${i}`,
        chemistryTopics[i % chemistryTopics.length],
        i % 4
      )
    );
  }

  for (let i = 1; i <= 30; i++) {
    questions.push(
      createQuestion(
        `jee-m-${i}`,
        `Mathematics Question ${i}`,
        mathsTopics[i % mathsTopics.length],
        i % 4
      )
    );
  }

  return questions;
}

function generateCUETQuestions() {
  const questions = [];

  const sections = [
    "Current Affairs",
    "Reasoning",
    "English",
  ];

  sections.forEach((section) => {
    for (let i = 1; i <= 20; i++) {
      questions.push(
        createQuestion(
          `cuet-${section}-${i}`,
          `${section} Question ${i}`,
          section,
          i % 4
        )
      );
    }
  });

  return questions;
}

function generateAdvancedQuestions() {
  const questions = [];

  const subjects = ["Physics", "Chemistry", "Mathematics"];

  subjects.forEach((subject) => {
    for (let i = 1; i <= 18; i++) {
      questions.push(
        createQuestion(
          `advanced-${subject}-${i}`,
          `${subject} Question ${i}`,
          subject,
          i % 4
        )
      );
    }
  });

  return questions;
} 

function generateNEETQuestions() {
  const questions = [];

  for (let i = 1; i <= 45; i++) {
    questions.push(
      createQuestion(
        `neet-p-${i}`,
        `Physics Question ${i}`,
        "Physics",
        i % 4
      )
    );
  }

  for (let i = 1; i <= 45; i++) {
    questions.push(
      createQuestion(
        `neet-c-${i}`,
        `Chemistry Question ${i}`,
        "Chemistry",
        i % 4
      )
    );
  }

  for (let i = 1; i <= 90; i++) {
    questions.push(
      createQuestion(
        `neet-b-${i}`,
        `Biology Question ${i}`,
        "Biology",
        i % 4
      )
    );
  }

  return questions;
}
function generateSSCQuestions() {
  const questions = [];

  const sections = [
    "Reasoning",
    "English",
    "Quantitative Aptitude",
    "General Awareness",
  ];

  sections.forEach((section) => {
    for (let i = 1; i <= 25; i++) {
      questions.push(
        createQuestion(
          `ssc-${section}-${i}`,
          `${section} Question ${i}`,
          section,
          i % 4
        )
      );
    }
  });

  return questions;
}
function generateUPSCQuestions() {
  const questions = [];

  const sections = [
    ["History", 20],
    ["Geography", 15],
    ["Polity", 20],
    ["Economy", 20],
    ["Environment", 25],
  ];

  sections.forEach(([topic, count]) => {
    for (let i = 1; i <= count; i++) {
      questions.push(
        createQuestion(
          `upsc-${topic}-${i}`,
          `${topic} Question ${i}`,
          topic,
          i % 4
        )
      );
    }
  });

  return questions;
}
