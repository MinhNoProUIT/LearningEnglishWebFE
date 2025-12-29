// src/services/TreasureHuntMockData.ts
// ==================== MOCK DATA FOR TESTING TREASURE HUNT GAME ====================

import {
  CellState,
  CellType,
  TreasureHuntDifficulty,
  TreasureHuntItemType,
  TrapEffect,
  IVisibleCell,
  IStartGameResponse,
  IMoveResponse,
  IAnswerResponse,
  IResumeGameResponse,
  IStatsResponse,
  IInventoryResponse,
  IDailyChallengeResponse,
  ITreasureHuntQuestion,
} from "@/models/TreasureHunt";

// ==================== MOCK QUESTIONS ====================
const MOCK_QUESTIONS: ITreasureHuntQuestion[] = [
  {
    id: "q1",
    questionText: "What is the past tense of 'go'?",
    options: [
      { id: "a", label: "A", text: "goed" },
      { id: "b", label: "B", text: "went" },
      { id: "c", label: "C", text: "gone" },
      { id: "d", label: "D", text: "going" },
    ],
    timeLimit: 30,
    difficulty: "EASY",
    category: "Grammar",
  },
  {
    id: "q2",
    questionText: "Which word means 'happy'?",
    options: [
      { id: "a", label: "A", text: "Sad" },
      { id: "b", label: "B", text: "Angry" },
      { id: "c", label: "C", text: "Joyful" },
      { id: "d", label: "D", text: "Tired" },
    ],
    timeLimit: 30,
    difficulty: "EASY",
    category: "Vocabulary",
  },
  {
    id: "q3",
    questionText: "Complete: She ___ to school every day.",
    options: [
      { id: "a", label: "A", text: "go" },
      { id: "b", label: "B", text: "goes" },
      { id: "c", label: "C", text: "going" },
      { id: "d", label: "D", text: "gone" },
    ],
    timeLimit: 30,
    difficulty: "EASY",
    category: "Grammar",
  },
  {
    id: "q4",
    questionText: "What is the opposite of 'hot'?",
    options: [
      { id: "a", label: "A", text: "Warm" },
      { id: "b", label: "B", text: "Cold" },
      { id: "c", label: "C", text: "Cool" },
      { id: "d", label: "D", text: "Mild" },
    ],
    timeLimit: 30,
    difficulty: "EASY",
    category: "Vocabulary",
  },
  {
    id: "q5",
    questionText: "Which sentence is correct?",
    options: [
      { id: "a", label: "A", text: "He don't like coffee." },
      { id: "b", label: "B", text: "He doesn't likes coffee." },
      { id: "c", label: "C", text: "He doesn't like coffee." },
      { id: "d", label: "D", text: "He not like coffee." },
    ],
    timeLimit: 30,
    difficulty: "MEDIUM",
    category: "Grammar",
  },
];

const CORRECT_ANSWERS: Record<string, string> = {
  q1: "b",
  q2: "c",
  q3: "b",
  q4: "b",
  q5: "c",
};

// ==================== MOCK MAP GENERATOR ====================
interface MockGameState {
  sessionId: string;
  mapSize: number;
  playerPosition: number;
  score: number;
  streak: number;
  questionsAnswered: number;
  questionsCorrect: number;
  gemsCollected: number;
  cellTypes: CellType[];
  revealedCells: Set<number>;
  visitedCells: Set<number>;
  treasurePosition: number;
  currentQuestionIndex: number;
}

let mockGameState: MockGameState | null = null;

const generateMockMap = (size: number): CellType[] => {
  const cells: CellType[] = new Array(size * size).fill(CellType.EMPTY);

  // Place treasure (far from start)
  const treasurePos = size * size - 1 - Math.floor(Math.random() * size);
  cells[treasurePos] = CellType.TREASURE;

  // Place questions (30% of cells)
  const questionCount = Math.floor(size * size * 0.3);
  for (let i = 0; i < questionCount; i++) {
    let pos;
    do {
      pos = Math.floor(Math.random() * size * size);
    } while (cells[pos] !== CellType.EMPTY || pos === 0);
    cells[pos] = CellType.QUESTION;
  }

  // Place gems (15% of cells)
  const gemCount = Math.floor(size * size * 0.15);
  for (let i = 0; i < gemCount; i++) {
    let pos;
    do {
      pos = Math.floor(Math.random() * size * size);
    } while (cells[pos] !== CellType.EMPTY || pos === 0);
    cells[pos] = Math.random() > 0.7 ? CellType.BIG_GEM : CellType.SMALL_GEM;
  }

  // Place traps (10% of cells)
  const trapCount = Math.floor(size * size * 0.1);
  for (let i = 0; i < trapCount; i++) {
    let pos;
    do {
      pos = Math.floor(Math.random() * size * size);
    } while (cells[pos] !== CellType.EMPTY || pos === 0);
    cells[pos] = CellType.TRAP;
  }

  // Start position is always empty
  cells[0] = CellType.EMPTY;

  return cells;
};

const getAdjacentPositions = (pos: number, mapSize: number): number[] => {
  const row = Math.floor(pos / mapSize);
  const col = pos % mapSize;
  const adjacent: number[] = [];

  if (row > 0) adjacent.push(pos - mapSize);
  if (row < mapSize - 1) adjacent.push(pos + mapSize);
  if (col > 0) adjacent.push(pos - 1);
  if (col < mapSize - 1) adjacent.push(pos + 1);

  return adjacent;
};

const getVisibleCells = (state: MockGameState): IVisibleCell[] => {
  const visible: IVisibleCell[] = [];
  const adjacentPositions = new Set(getAdjacentPositions(state.playerPosition, state.mapSize));

  // Current position
  visible.push({
    position: state.playerPosition,
    state: CellState.CURRENT,
    type: state.cellTypes[state.playerPosition],
  });

  // Visited cells
  state.visitedCells.forEach((pos) => {
    if (pos !== state.playerPosition) {
      visible.push({
        position: pos,
        state: CellState.REVEALED,
        type: state.cellTypes[pos],
      });
    }
  });

  // Adjacent cells (hidden but visible)
  adjacentPositions.forEach((pos) => {
    if (!state.visitedCells.has(pos)) {
      visible.push({
        position: pos,
        state: CellState.HIDDEN,
        type: null, // Don't reveal type until visited
      });
    }
  });

  return visible;
};

// ==================== MOCK API FUNCTIONS ====================
export const mockStartGame = (difficulty: TreasureHuntDifficulty): IStartGameResponse => {
  const mapSize = difficulty === TreasureHuntDifficulty.EASY ? 5 :
                  difficulty === TreasureHuntDifficulty.MEDIUM ? 6 : 7;

  const cellTypes = generateMockMap(mapSize);
  const treasurePosition = cellTypes.findIndex(c => c === CellType.TREASURE);

  mockGameState = {
    sessionId: `mock-session-${Date.now()}`,
    mapSize,
    playerPosition: 0,
    score: 0,
    streak: 0,
    questionsAnswered: 0,
    questionsCorrect: 0,
    gemsCollected: 0,
    cellTypes,
    revealedCells: new Set([0]),
    visitedCells: new Set([0]),
    treasurePosition,
    currentQuestionIndex: 0,
  };

  return {
    sessionId: mockGameState.sessionId,
    mapSize,
    timeLimit: difficulty === TreasureHuntDifficulty.EASY ? 600 :
               difficulty === TreasureHuntDifficulty.MEDIUM ? 720 : 900,
    startPosition: 0,
    visibleCells: getVisibleCells(mockGameState),
    activeItems: [
      { itemType: TreasureHuntItemType.TORCH, remainingUses: 2 },
      { itemType: TreasureHuntItemType.DICTIONARY, remainingUses: 1 },
    ],
    config: {
      difficulty,
      mapSize,
      questionTimeLimit: 30,
    },
  };
};

export const mockResumeGame = (): IResumeGameResponse | null => {
  if (!mockGameState) return null;

  return {
    sessionId: mockGameState.sessionId,
    mapSize: mockGameState.mapSize,
    timeLimit: 720,
    timeRemaining: 600,
    playerPosition: mockGameState.playerPosition,
    visibleCells: getVisibleCells(mockGameState),
    activeItems: [
      { itemType: TreasureHuntItemType.TORCH, remainingUses: 2 },
      { itemType: TreasureHuntItemType.DICTIONARY, remainingUses: 1 },
    ],
    currentScore: mockGameState.score,
    config: {
      difficulty: TreasureHuntDifficulty.MEDIUM,
      mapSize: mockGameState.mapSize,
      questionTimeLimit: 30,
    },
    gameStats: {
      questionsAnswered: mockGameState.questionsAnswered,
      questionsCorrect: mockGameState.questionsCorrect,
    },
  };
};

export const mockMove = (targetPosition: number): IMoveResponse => {
  if (!mockGameState) throw new Error("No active game");

  mockGameState.playerPosition = targetPosition;
  mockGameState.visitedCells.add(targetPosition);

  const cellType = mockGameState.cellTypes[targetPosition];
  let question: ITreasureHuntQuestion | undefined;
  let newScore = mockGameState.score;
  let trapEffect: { type: TrapEffect; duration?: number; pointsLost?: number } | undefined;

  if (cellType === CellType.QUESTION) {
    question = MOCK_QUESTIONS[mockGameState.currentQuestionIndex % MOCK_QUESTIONS.length];
  } else if (cellType === CellType.SMALL_GEM) {
    newScore += 25;
    mockGameState.score = newScore;
    mockGameState.gemsCollected++;
  } else if (cellType === CellType.BIG_GEM) {
    newScore += 50;
    mockGameState.score = newScore;
    mockGameState.gemsCollected++;
  } else if (cellType === CellType.TRAP) {
    const trapTypes = [TrapEffect.STUN, TrapEffect.BLIND, TrapEffect.SCORE_LOSS];
    const randomTrap = trapTypes[Math.floor(Math.random() * trapTypes.length)];

    if (randomTrap === TrapEffect.SCORE_LOSS) {
      const pointsLost = 15;
      newScore = Math.max(0, newScore - pointsLost);
      mockGameState.score = newScore;
      trapEffect = { type: randomTrap, pointsLost };
    } else {
      trapEffect = { type: randomTrap, duration: 5 };
    }
  }

  return {
    success: true,
    newPosition: targetPosition,
    cellType,
    visibleCells: getVisibleCells(mockGameState),
    activeEffects: trapEffect ? [{ type: trapEffect.type, remainingSeconds: trapEffect.duration || 0 }] : [],
    newScore,
    question,
    trapEffect,
    gameCompleted: cellType === CellType.TREASURE,
  };
};

export const mockAnswer = (questionId: string, selectedOptionId: string): IAnswerResponse => {
  if (!mockGameState) throw new Error("No active game");

  const isCorrect = CORRECT_ANSWERS[questionId] === selectedOptionId;

  mockGameState.questionsAnswered++;
  if (isCorrect) {
    mockGameState.questionsCorrect++;
    mockGameState.streak++;
    mockGameState.score += 10 * (mockGameState.streak >= 3 ? 1.5 : 1);
  } else {
    mockGameState.streak = 0;
  }

  mockGameState.currentQuestionIndex++;

  return {
    isCorrect,
    correctOptionId: CORRECT_ANSWERS[questionId],
    explanation: isCorrect ? "Great job!" : "The correct answer was: " + CORRECT_ANSWERS[questionId].toUpperCase(),
    newScore: Math.round(mockGameState.score),
    currentStreak: mockGameState.streak,
    pointsEarned: isCorrect ? 10 : 0,
    bonusPoints: 0,
    visibleCells: getVisibleCells(mockGameState),
    stats: {
      questionsAnswered: mockGameState.questionsAnswered,
      questionsCorrect: mockGameState.questionsCorrect,
    },
    pushedBack: !isCorrect,
    newPosition: isCorrect ? undefined : Math.max(0, mockGameState.playerPosition - 1),
  };
};

export const mockGetStats = (): IStatsResponse => ({
  overall: {
    totalGames: 5,
    gamesCompleted: 3,
    gamesAbandoned: 1,
    totalPlayTime: 3600,
    bestScore: 250,
    averageScore: 150,
    totalQuestionsAnswered: 45,
    totalQuestionsCorrect: 38,
    overallAccuracy: 84,
    bestStreak: 7,
    treasuresFound: 3,
    gemsCollected: 25,
  },
  byDifficulty: {
    EASY: { gamesPlayed: 2, bestScore: 200, averageAccuracy: 90 },
    MEDIUM: { gamesPlayed: 2, bestScore: 250, averageAccuracy: 85 },
    HARD: { gamesPlayed: 1, bestScore: 180, averageAccuracy: 75 },
  },
  recentGames: [],
});

export const mockGetInventory = (): IInventoryResponse => ({
  gems: 150,
  items: [
    { itemType: TreasureHuntItemType.TORCH, quantity: 5, description: "Reveal a hidden cell" },
    { itemType: TreasureHuntItemType.SHIELD, quantity: 3, description: "Block one trap" },
    { itemType: TreasureHuntItemType.DICTIONARY, quantity: 2, description: "50/50 - Remove 2 wrong answers" },
    { itemType: TreasureHuntItemType.COMPASS, quantity: 1, description: "Show treasure direction" },
    { itemType: TreasureHuntItemType.TIME_BOOST, quantity: 2, description: "Add 60 seconds" },
  ],
});

export const mockGetDailyChallenge = (): IDailyChallengeResponse => ({
  challengeId: "daily-1",
  date: new Date().toISOString().split("T")[0],
  difficulty: TreasureHuntDifficulty.MEDIUM,
  hasPlayed: false,
  rewards: {
    completionBonus: 50,
    perfectBonus: 100,
  },
});

export { mockGameState };
