/**
 * Built-in vocabulary, used when the question bank has too few suitable terms
 * (new install, or a subject with mostly numeric questions). [answer, clue, subject]
 */
const RAW = [
  // General science
  ["Photosynthesis", "Process by which plants make food using sunlight", "Science"],
  ["Oxygen", "Gas essential for respiration, symbol O", "Science"],
  ["Haemoglobin", "Iron-rich protein in red blood cells that carries oxygen", "Science"],
  ["Mitochondria", "Organelle called the powerhouse of the cell", "Science"],
  ["Neuron", "Basic functional unit of the nervous system", "Science"],
  ["Gravity", "Force that pulls objects towards the Earth", "Science"],
  ["Velocity", "Speed of an object in a given direction", "Science"],
  ["Catalyst", "Substance that speeds up a reaction without being used up", "Science"],
  ["Electron", "Negatively charged particle that orbits the nucleus", "Science"],
  ["Proton", "Positively charged particle found in the nucleus", "Science"],
  ["Friction", "Force that opposes the relative motion of two surfaces", "Science"],
  ["Inertia", "Tendency of a body to resist a change in its motion", "Science"],
  ["Diamond", "Hardest natural substance, a form of carbon", "Science"],
  ["Mercury", "Only metal that is liquid at room temperature", "Science"],
  ["Scurvy", "Disease caused by a deficiency of vitamin C", "Science"],
  ["Calcium", "Mineral that strengthens bones and teeth", "Science"],
  ["Chlorophyll", "Green pigment in leaves that absorbs sunlight", "Science"],
  ["Evaporation", "Change of a liquid into vapour below its boiling point", "Science"],
  ["Barometer", "Instrument used to measure atmospheric pressure", "Science"],
  ["Acid", "Substance with a pH value below 7", "Science"],
  // Geography
  ["Everest", "Highest mountain peak in the world", "Geography"],
  ["Ganga", "Longest river in India", "Geography"],
  ["Himalaya", "Mountain range along the northern border of India", "Geography"],
  ["Equator", "Imaginary line at 0 degrees latitude", "Geography"],
  ["Monsoon", "Seasonal wind that brings heavy rain to India", "Geography"],
  ["Delta", "Fan-shaped landform at the mouth of a river", "Geography"],
  ["Sahara", "Largest hot desert in the world", "Geography"],
  ["Pacific", "Largest and deepest ocean on Earth", "Geography"],
  ["Latitude", "Angular distance of a place north or south of the equator", "Geography"],
  ["Aravalli", "Oldest fold mountain range in India", "Geography"],
  ["Chilika", "Largest coastal lagoon in India, in Odisha", "Geography"],
  ["Peninsula", "Land surrounded by water on three sides", "Geography"],
  // Polity
  ["Constitution", "Supreme law of India", "Polity"],
  ["Parliament", "Legislature of India made up of the Lok Sabha and Rajya Sabha", "Polity"],
  ["President", "Constitutional head of the Indian state", "Polity"],
  ["Preamble", "Introduction that states the ideals of the Constitution", "Polity"],
  ["Speaker", "Presiding officer of the Lok Sabha", "Polity"],
  ["Amendment", "Formal change made to the Constitution", "Polity"],
  ["Judiciary", "Branch of government that interprets the law", "Polity"],
  ["Republic", "Form of government in which the head of state is elected", "Polity"],
  ["Democracy", "Government of the people, by the people, for the people", "Polity"],
  ["Cabinet", "Group of senior ministers led by the Prime Minister", "Polity"],
  // History
  ["Ashoka", "Mauryan emperor who embraced Buddhism after the Kalinga war", "History"],
  ["Mughal", "Dynasty founded by Babur in 1526", "History"],
  ["Harappa", "Major city of the Indus Valley Civilisation", "History"],
  ["Swaraj", "Self-rule, demanded by Bal Gangadhar Tilak", "History"],
  ["Plassey", "1757 battle that began British dominance in Bengal", "History"],
  ["Akbar", "Mughal emperor who started the Din-i-Ilahi", "History"],
  ["Satyagraha", "Gandhi's method of non-violent resistance", "History"],
  ["Kalinga", "Ancient region whose war changed Ashoka", "History"],
  ["Renaissance", "European revival of art and learning after the Middle Ages", "History"],
  ["Dandi", "Place where Gandhi broke the salt law in 1930", "History"],
  // Maths
  ["Hypotenuse", "Longest side of a right-angled triangle", "Maths"],
  ["Prime", "A number with exactly two factors, 1 and itself", "Maths"],
  ["Diameter", "Longest chord of a circle, passing through its centre", "Maths"],
  ["Perimeter", "Total length of the boundary of a shape", "Maths"],
  ["Triangle", "Polygon with three sides", "Maths"],
  ["Integer", "A whole number, positive, negative or zero", "Maths"],
  ["Parallel", "Lines in a plane that never meet", "Maths"],
  ["Algebra", "Branch of maths that uses letters for unknown numbers", "Maths"],
  ["Percentage", "A number expressed as a fraction of 100", "Maths"],
  ["Median", "Middle value of data arranged in order", "Maths"],
  ["Radius", "Distance from the centre of a circle to its edge", "Maths"],
  ["Quadrilateral", "Polygon with four sides", "Maths"],
  // English
  ["Synonym", "Word that has the same meaning as another word", "English"],
  ["Antonym", "Word that has the opposite meaning", "English"],
  ["Adjective", "Word that describes a noun", "English"],
  ["Prefix", "Group of letters added at the start of a word", "English"],
  ["Verb", "Word that shows an action or a state", "English"],
  ["Metaphor", "Figure of speech that compares without using like or as", "English"],
  ["Pronoun", "Word used in place of a noun", "English"],
  ["Idiom", "Phrase whose meaning is different from its words", "English"],
  // Computer
  ["Algorithm", "Step-by-step procedure to solve a problem", "Computers"],
  ["Browser", "Software used to view web pages", "Computers"],
  ["Internet", "Global network of connected computers", "Computers"],
  ["Processor", "The brain of the computer, also called the CPU", "Computers"],
  ["Firewall", "Security system that filters network traffic", "Computers"],
  ["Binary", "Number system that uses only 0 and 1", "Computers"],
  ["Software", "Programs that run on a computer", "Computers"],
  ["Keyboard", "Input device with keys for typing", "Computers"],
  // Economy
  ["Inflation", "General rise in prices over time", "Economy"],
  ["Budget", "Annual statement of government income and spending", "Economy"],
  ["Currency", "Money in use in a country", "Economy"],
  ["Deficit", "Shortfall when spending is more than income", "Economy"],
  ["Export", "Goods sold to another country", "Economy"],
  ["Tariff", "Tax charged on imported goods", "Economy"],
];

export const FALLBACK_TERMS = RAW.map(([answer, clue, subject]) => ({ answer, clue, subject, topic: null }));

/** Pairs for the matching game. [left, right] */
export const PAIR_PACKS = {
  dates: {
    label: "Dates & events",
    pairs: [
      ["1857", "First War of Independence"], ["1947", "India gains independence"],
      ["1950", "Constitution comes into force"], ["1919", "Jallianwala Bagh massacre"],
      ["1930", "Dandi Salt March"], ["1526", "First Battle of Panipat"],
      ["1757", "Battle of Plassey"], ["1905", "Partition of Bengal"],
      ["1942", "Quit India Movement"], ["1991", "Economic liberalisation in India"],
      ["1885", "Indian National Congress founded"], ["1764", "Battle of Buxar"],
    ],
  },
  formulas: {
    label: "Formulas & symbols",
    pairs: [
      ["H₂O", "Water"], ["CO₂", "Carbon dioxide"], ["NaCl", "Common salt"], ["NH₃", "Ammonia"],
      ["CH₄", "Methane"], ["E = mc²", "Mass-energy equivalence"], ["F = ma", "Newton's second law"],
      ["V = IR", "Ohm's law"], ["πr²", "Area of a circle"], ["2πr", "Circumference of a circle"],
      ["a² + b² = c²", "Pythagoras theorem"], ["Speed = D / T", "Speed formula"],
    ],
  },
  terms: {
    label: "Key terms",
    pairs: [
      ["Photosynthesis", "Plants make food using light"], ["Osmosis", "Water moves through a semi-permeable membrane"],
      ["Synonym", "Word with a similar meaning"], ["Inflation", "Rise in the general price level"],
      ["Fiscal deficit", "Government spending exceeds revenue"], ["Habeas corpus", "Writ to produce a detained person"],
      ["Latitude", "Angular distance from the equator"], ["Catalyst", "Speeds up a reaction"],
      ["Democracy", "Rule by the people"], ["Monsoon", "Seasonal rain-bearing wind"],
    ],
  },
  capitals: {
    label: "States & capitals",
    pairs: [
      ["Karnataka", "Bengaluru"], ["Rajasthan", "Jaipur"], ["Kerala", "Thiruvananthapuram"], ["Assam", "Dispur"],
      ["Odisha", "Bhubaneswar"], ["Punjab", "Chandigarh"], ["Goa", "Panaji"], ["Bihar", "Patna"],
      ["Tamil Nadu", "Chennai"], ["Maharashtra", "Mumbai"], ["Gujarat", "Gandhinagar"], ["West Bengal", "Kolkata"],
    ],
  },
  people: {
    label: "Inventors & discoverers",
    pairs: [
      ["Telephone", "Alexander Graham Bell"], ["Penicillin", "Alexander Fleming"], ["Gravity", "Isaac Newton"],
      ["Relativity", "Albert Einstein"], ["Evolution", "Charles Darwin"], ["Radium", "Marie Curie"],
      ["Light bulb", "Thomas Edison"], ["Vaccination", "Edward Jenner"], ["Periodic table", "Dmitri Mendeleev"],
      ["Electric battery", "Alessandro Volta"],
    ],
  },
};
