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
    let pos: number;
    do {
      pos = Math.floor(Math.random() * size * size);
    } while (cells[pos] !== CellType.EMPTY || pos === 0);
    cells[pos] = CellType.QUESTION;
  }

  // Place gems (15% of cells)
  const gemCount = Math.floor(size * size * 0.15);
  for (let i = 0; i < gemCount; i++) {
    let pos: number;
    do {
      pos = Math.floor(Math.random() * size * size);
    } while (cells[pos] !== CellType.EMPTY || pos === 0);
    cells[pos] = Math.random() > 0.7 ? CellType.BIG_GEM : CellType.SMALL_GEM;
  }

  // Place traps (10% of cells)
  const trapCount = Math.floor(size * size * 0.1);
  for (let i = 0; i < trapCount; i++) {
    let pos: number;
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
    playerPosition: 0,
    visibleCells: getVisibleCells(mockGameState),
    activeItems: [
      { itemType: TreasureHuntItemType.TORCH, remainingUses: 2 },
      { itemType: TreasureHuntItemType.DICTIONARY, remainingUses: 1 },
    ],
    config: {
      difficulty,
      isDailyChallenge: false,
      scoreMultiplier: 1,
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
      isDailyChallenge: false,
      scoreMultiplier: 1.5,
    },
    gameStats: {
      questionsAnswered: mockGameState.questionsAnswered,
      questionsCorrect: mockGameState.questionsCorrect,
      accuracy: mockGameState.questionsAnswered > 0
        ? Math.round((mockGameState.questionsCorrect / mockGameState.questionsAnswered) * 100)
        : 0,
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
    newPosition: targetPosition,
    cellType,
    visibleCells: getVisibleCells(mockGameState),
    activeEffects: trapEffect ? [{
      type: trapEffect.type,
      remainingSeconds: trapEffect.duration || 0,
      expiresAt: new Date(Date.now() + (trapEffect.duration || 0) * 1000).toISOString(),
    }] : [],
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
    timeBonus: 0,
    streakBonus: 0,
    streakMultiplier: mockGameState.streak >= 3 ? 1.5 : 1,
    visibleCells: getVisibleCells(mockGameState),
    stats: {
      questionsAnswered: mockGameState.questionsAnswered,
      questionsCorrect: mockGameState.questionsCorrect,
      accuracy: mockGameState.questionsAnswered > 0
        ? Math.round((mockGameState.questionsCorrect / mockGameState.questionsAnswered) * 100)
        : 0,
    },
    pushedBack: !isCorrect,
    newPosition: isCorrect ? undefined : Math.max(0, mockGameState.playerPosition - 1),
  };
};

export const mockGetStats = (): IStatsResponse => ({
  overall: {
    totalGames: 5,
    totalScore: 750,
    bestScore: 250,
    averageScore: 150,
    totalCorrect: 38,
    totalQuestions: 45,
    overallAccuracy: 84,
    treasuresFound: 3,
    bestStreak: 7,
  },
  thisWeek: {
    gamesPlayed: 2,
    averageScore: 200,
    improvement: 10,
  },
  dailyChallengeStreak: 3,
});

export const mockGetInventory = (): IInventoryResponse => ({
  totalGems: 150,
  items: [
    { itemType: TreasureHuntItemType.TORCH, name: "Torch", quantity: 5, description: "Reveal a hidden cell", price: 30, icon: "torch" },
    { itemType: TreasureHuntItemType.SHIELD, name: "Shield", quantity: 3, description: "Block one trap", price: 40, icon: "shield" },
    { itemType: TreasureHuntItemType.DICTIONARY, name: "Dictionary", quantity: 2, description: "50/50 - Remove 2 wrong answers", price: 25, icon: "dictionary" },
    { itemType: TreasureHuntItemType.COMPASS, name: "Compass", quantity: 1, description: "Show treasure direction", price: 50, icon: "compass" },
    { itemType: TreasureHuntItemType.TIME_BOOST, name: "Time Boost", quantity: 2, description: "Add 60 seconds", price: 35, icon: "time_boost" },
  ],
});

export const mockGetDailyChallenge = (): IDailyChallengeResponse => ({
  challengeDate: new Date().toISOString().split("T")[0],
  difficulty: TreasureHuntDifficulty.MEDIUM,
  hasPlayed: false,
  topPlayers: [
    { rank: 1, userName: "Player1", score: 300 },
    { rank: 2, userName: "Player2", score: 280 },
    { rank: 3, userName: "Player3", score: 250 },
  ],
  rewards: {
    completionBonus: 50,
  },
});

export { mockGameState };
