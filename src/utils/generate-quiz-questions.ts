export type QuizCategory =
  | "General"
  | "Science"
  | "History"
  | "Sports"
  | "Movies";

export type QuizQuestion = {
  id: string;
  category: QuizCategory;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: number;
};

type QuestionSeed = {
  prompt: string;
  correct: string;
  wrong: [string, string, string];
};

const QUESTION_BANK: Record<QuizCategory, QuestionSeed[]> = {
  General: [
    { prompt: "Which color is made by mixing blue and yellow?", correct: "Green", wrong: ["Orange", "Purple", "Pink"] },
    { prompt: "How many days are there in a leap year?", correct: "366", wrong: ["365", "364", "360"] },
    { prompt: "Which ocean is the largest?", correct: "Pacific Ocean", wrong: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean"] },
    { prompt: "What is the capital of Japan?", correct: "Tokyo", wrong: ["Seoul", "Osaka", "Kyoto"] },
    { prompt: "Which month comes right after April?", correct: "May", wrong: ["June", "March", "July"] },
    { prompt: "How many continents are there?", correct: "7", wrong: ["5", "6", "8"] },
    { prompt: "Which animal is known as man's best friend?", correct: "Dog", wrong: ["Cat", "Horse", "Rabbit"] },
    { prompt: "What shape has exactly three sides?", correct: "Triangle", wrong: ["Square", "Circle", "Rectangle"] },
    { prompt: "What is H2O commonly known as?", correct: "Water", wrong: ["Hydrogen", "Salt", "Oxygen"] },
    { prompt: "Which direction does the sun rise from?", correct: "East", wrong: ["West", "North", "South"] },
    { prompt: "Which season comes after summer in most countries?", correct: "Autumn", wrong: ["Winter", "Spring", "Monsoon"] },
    { prompt: "Which planet is known as the Red Planet?", correct: "Mars", wrong: ["Venus", "Jupiter", "Mercury"] },
  ],
  Science: [
    { prompt: "What gas do humans need to breathe to survive?", correct: "Oxygen", wrong: ["Carbon Dioxide", "Nitrogen", "Helium"] },
    { prompt: "What is the center of an atom called?", correct: "Nucleus", wrong: ["Electron", "Core shell", "Proton cloud"] },
    { prompt: "What force pulls objects toward Earth?", correct: "Gravity", wrong: ["Magnetism", "Friction", "Momentum"] },
    { prompt: "What is the boiling point of water at sea level?", correct: "100°C", wrong: ["90°C", "80°C", "120°C"] },
    { prompt: "Which organ pumps blood through the body?", correct: "Heart", wrong: ["Lungs", "Liver", "Kidney"] },
    { prompt: "What part of the cell contains genetic material?", correct: "Nucleus", wrong: ["Membrane", "Cytoplasm", "Ribosome"] },
    { prompt: "What type of energy comes from the Sun?", correct: "Solar energy", wrong: ["Nuclear energy", "Wind energy", "Hydro energy"] },
    { prompt: "What gas do plants absorb from the atmosphere?", correct: "Carbon Dioxide", wrong: ["Oxygen", "Hydrogen", "Argon"] },
    { prompt: "How many bones are in an adult human body?", correct: "206", wrong: ["201", "212", "220"] },
    { prompt: "Which blood cells help fight infections?", correct: "White blood cells", wrong: ["Red blood cells", "Platelets", "Plasma"] },
    { prompt: "What is the chemical symbol for gold?", correct: "Au", wrong: ["Ag", "Gd", "Go"] },
    { prompt: "Which planet has the most moons currently known?", correct: "Saturn", wrong: ["Earth", "Mars", "Venus"] },
  ],
  History: [
    { prompt: "Which civilization built the pyramids of Giza?", correct: "Ancient Egyptians", wrong: ["Romans", "Greeks", "Mayans"] },
    { prompt: "In which year did World War II end?", correct: "1945", wrong: ["1939", "1942", "1950"] },
    { prompt: "Who was the first President of the United States?", correct: "George Washington", wrong: ["Thomas Jefferson", "Abraham Lincoln", "John Adams"] },
    { prompt: "The Roman Empire was centered in which city?", correct: "Rome", wrong: ["Athens", "Alexandria", "Sparta"] },
    { prompt: "Which wall fell in 1989, symbolizing the Cold War's end?", correct: "Berlin Wall", wrong: ["Great Wall", "Hadrian's Wall", "Wailing Wall"] },
    { prompt: "Who discovered America in 1492 (traditional European account)?", correct: "Christopher Columbus", wrong: ["Ferdinand Magellan", "Marco Polo", "Leif Erikson"] },
    { prompt: "Which ship famously sank in 1912?", correct: "Titanic", wrong: ["Britannic", "Lusitania", "Bismarck"] },
    { prompt: "Where did the Renaissance begin?", correct: "Italy", wrong: ["France", "England", "Germany"] },
    { prompt: "Who was known as the Maid of Orleans?", correct: "Joan of Arc", wrong: ["Catherine the Great", "Queen Victoria", "Marie Curie"] },
    { prompt: "Which empire was ruled by Genghis Khan?", correct: "Mongol Empire", wrong: ["Ottoman Empire", "Roman Empire", "Persian Empire"] },
    { prompt: "Which ancient wonder stood in Babylon?", correct: "Hanging Gardens", wrong: ["Colossus of Rhodes", "Temple of Artemis", "Great Sphinx"] },
    { prompt: "Who wrote the Communist Manifesto with Friedrich Engels?", correct: "Karl Marx", wrong: ["Vladimir Lenin", "Joseph Stalin", "Adam Smith"] },
  ],
  Sports: [
    { prompt: "How many players are on a soccer team on the field?", correct: "11", wrong: ["9", "10", "12"] },
    { prompt: "Which sport uses a puck?", correct: "Ice hockey", wrong: ["Basketball", "Baseball", "Tennis"] },
    { prompt: "In tennis, what is the score called when both players have 40?", correct: "Deuce", wrong: ["Love", "Advantage", "Set point"] },
    { prompt: "How many points is a touchdown worth in American football?", correct: "6", wrong: ["3", "7", "2"] },
    { prompt: "Which country hosted the 2016 Summer Olympics?", correct: "Brazil", wrong: ["China", "UK", "Japan"] },
    { prompt: "What is the maximum score in one frame of bowling?", correct: "30", wrong: ["20", "25", "40"] },
    { prompt: "In basketball, how many points is a free throw worth?", correct: "1", wrong: ["2", "3", "4"] },
    { prompt: "Which sport is Wimbledon associated with?", correct: "Tennis", wrong: ["Cricket", "Golf", "Rugby"] },
    { prompt: "How long is a standard marathon?", correct: "42.195 km", wrong: ["40 km", "50 km", "35 km"] },
    { prompt: "Which combat sport uses an octagon ring?", correct: "MMA (UFC)", wrong: ["Boxing", "Judo", "Karate"] },
    { prompt: "Which country won the FIFA World Cup in 2018?", correct: "France", wrong: ["Croatia", "Brazil", "Germany"] },
    { prompt: "What color card means a player is sent off in soccer?", correct: "Red", wrong: ["Yellow", "Blue", "Green"] },
  ],
  Movies: [
    { prompt: "Who directed the movie 'Titanic'?", correct: "James Cameron", wrong: ["Steven Spielberg", "Christopher Nolan", "Ridley Scott"] },
    { prompt: "Which movie features the quote 'I'll be back'?", correct: "The Terminator", wrong: ["Rambo", "Predator", "Rocky"] },
    { prompt: "What is the name of the wizard school in Harry Potter?", correct: "Hogwarts", wrong: ["Beauxbatons", "Durmstrang", "Ilvermorny"] },
    { prompt: "Which film won Best Picture at the Oscars for 2020 awards season?", correct: "Parasite", wrong: ["1917", "Joker", "Ford v Ferrari"] },
    { prompt: "Who plays Iron Man in the MCU?", correct: "Robert Downey Jr.", wrong: ["Chris Evans", "Chris Hemsworth", "Mark Ruffalo"] },
    { prompt: "In Star Wars, who is Luke Skywalker's father?", correct: "Darth Vader", wrong: ["Obi-Wan Kenobi", "Yoda", "Han Solo"] },
    { prompt: "Which animated movie features a snowman named Olaf?", correct: "Frozen", wrong: ["Moana", "Tangled", "Brave"] },
    { prompt: "What color is the pill Neo takes in The Matrix?", correct: "Red", wrong: ["Blue", "Green", "Yellow"] },
    { prompt: "Which studio made Spirited Away?", correct: "Studio Ghibli", wrong: ["Pixar", "DreamWorks", "Toei Animation"] },
    { prompt: "Who directed 'Inception'?", correct: "Christopher Nolan", wrong: ["Denis Villeneuve", "David Fincher", "James Wan"] },
    { prompt: "Which film series features the character Jack Sparrow?", correct: "Pirates of the Caribbean", wrong: ["Indiana Jones", "Mission: Impossible", "The Mummy"] },
    { prompt: "In The Lion King, what is Simba's father's name?", correct: "Mufasa", wrong: ["Scar", "Rafiki", "Kovu"] },
  ],
};

const CATEGORIES: QuizCategory[] = [
  "General",
  "Science",
  "History",
  "Sports",
  "Movies",
];

export function generateQuizQuestions(
  category: string,
  requestedCount: number,
): QuizQuestion[] {
  const safeCategory: QuizCategory = CATEGORIES.includes(category as QuizCategory)
    ? (category as QuizCategory)
    : "General";
  const count = Math.max(1, Math.min(30, requestedCount));

  const primaryPool = QUESTION_BANK[safeCategory];
  const fallbackPool = CATEGORIES.flatMap((c) => QUESTION_BANK[c]);

  const selected: QuizQuestion[] = [];
  const usedPrompts = new Set<string>();

  while (selected.length < count) {
    const source = selected.length < primaryPool.length ? primaryPool : fallbackPool;
    const seed = source[Math.floor(Math.random() * source.length)];
    if (!seed || usedPrompts.has(seed.prompt)) continue;
    usedPrompts.add(seed.prompt);
    selected.push(seedToQuestion(seed, safeCategory));
  }

  return shuffle(selected);
}

function seedToQuestion(seed: QuestionSeed, category: QuizCategory): QuizQuestion {
  const shuffled = shuffle([
    seed.correct,
    ...seed.wrong,
  ]);
  const options: [string, string, string, string] = [
    shuffled[0] ?? "",
    shuffled[1] ?? "",
    shuffled[2] ?? "",
    shuffled[3] ?? "",
  ];
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    category,
    prompt: seed.prompt,
    options,
    correctIndex: options.indexOf(seed.correct),
  };
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
