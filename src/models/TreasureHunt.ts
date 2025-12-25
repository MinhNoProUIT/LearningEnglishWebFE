// ==================== TREASURE HUNT GAME MODELS ====================

// ==================== ENUMS ====================

export enum TreasureHuntDifficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export enum TreasureHuntSessionStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  ABANDONED = "ABANDONED",
  TIMEOUT = "TIMEOUT",
}

export enum CellState {
  FOG = "fog",
  HIDDEN = "hidden",
  REVEALED = "revealed",
  CURRENT = "current",
  LOCKED = "locked",
}

export enum CellType {
  QUESTION = "QUESTION",
  SMALL_GEM = "SMALL_GEM",
  BIG_GEM = "BIG_GEM",
  TRAP = "TRAP",
  TREASURE = "TREASURE",
  EMPTY = "EMPTY",
}

export enum TrapEffect {
  STUN = "STUN",
  BLIND = "BLIND",
  SCORE_LOSS = "SCORE_LOSS",
}

export enum TreasureHuntItemType {
  TORCH = "TORCH",
  SHIELD = "SHIELD",
  DICTIONARY = "DICTIONARY",
  COMPASS = "COMPASS",
  TIME_BOOST = "TIME_BOOST",
}

export enum LeaderboardPeriod {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  ALL_TIME = "ALL_TIME",
}

// ==================== INTERFACES ====================

// Cell interfaces
export interface IVisibleCell {
  position: number;
  state: CellState;
  type: CellType | null;
}

export interface IMapCell {
  position: number;
  state: CellState;
  type: CellType;
  trapEffect?: TrapEffect;
  questionId?: string;
  attempts?: number;
}

// Item interfaces
export interface IActiveItem {
  itemType: TreasureHuntItemType;
  remainingUses: number;
}

export interface IInventoryItem {
  itemType: TreasureHuntItemType;
  name: string;
  description: string;
  quantity: number;
  price: number;
  icon: string;
}

// Active Effect interface
export interface IActiveEffect {
  type: TrapEffect;
  expiresAt: string;
  remainingSeconds: number;
}

// Question interfaces
export interface ITreasureHuntQuestion {
  id: string;
  questionText: string;
  options: ITreasureHuntOption[];
  timeLimit: number;
}

export interface ITreasureHuntOption {
  id: string;
  label: string;
  text: string;
}

// Trap effect response
export interface ITrapEffectResponse {
  type: TrapEffect;
  duration?: number;
  pointsLost?: number;
}

// Compass direction
export interface ICompassDirection {
  direction: string;
  distance: number;
  expiresAt: string;
}

// ==================== REQUEST INTERFACES ====================

export interface IStartGameRequest {
  difficulty: TreasureHuntDifficulty;
  isDailyChallenge?: boolean;
  selectedItems?: TreasureHuntItemType[];
}

export interface IMoveRequest {
  targetPosition: number;
}

export interface IAnswerRequest {
  questionId: string;
  selectedOptionId: string;
  timeSpentMs: number;
}

export interface IUseItemRequest {
  itemType: TreasureHuntItemType;
  targetPosition?: number;
  questionId?: string;
}

export interface IEndGameRequest {
  reason: "COMPLETED" | "TIMEOUT" | "ABANDONED";
}

export interface IPurchaseItemRequest {
  itemType: TreasureHuntItemType;
  quantity: number;
}

// ==================== RESPONSE INTERFACES ====================

export interface IGameConfig {
  difficulty: TreasureHuntDifficulty;
  isDailyChallenge: boolean;
  scoreMultiplier: number;
}

export interface IStartGameResponse {
  sessionId: string;
  mapSize: number;
  timeLimit: number;
  playerPosition: number;
  visibleCells: IVisibleCell[];
  activeItems: IActiveItem[];
  config: IGameConfig;
}

export interface IMoveResponse {
  newPosition: number;
  cellType: CellType;
  question?: ITreasureHuntQuestion;
  pointsEarned?: number;
  newScore?: number;
  trapEffect?: ITrapEffectResponse;
  shieldActivated?: boolean;
  gameCompleted?: boolean;
  bonusPoints?: number;
  visibleCells: IVisibleCell[];
  activeEffects: IActiveEffect[];
}

export interface IAnswerResponse {
  isCorrect: boolean;
  correctOptionId: string;
  explanation?: string;
  pointsEarned: number;
  timeBonus: number;
  streakBonus: number;
  newScore: number;
  currentStreak: number;
  streakMultiplier: number;
  pushedBack?: boolean;
  newPosition?: number;
  attemptsRemaining?: number;
  cellLocked?: boolean;
  visibleCells: IVisibleCell[];
  stats: IGameStats;
}

export interface IGameStats {
  questionsAnswered: number;
  questionsCorrect: number;
  accuracy: number;
}

export interface IUseItemResponse {
  itemUsed: TreasureHuntItemType;
  remainingUses: number;
  revealedCell?: {
    position: number;
    type: CellType;
  };
  eliminatedOptions?: string[];
  treasureDirection?: ICompassDirection;
  timeAdded?: number;
  newTimeLimit?: number;
}

export interface IEndGameStats {
  questionsAnswered: number;
  questionsCorrect: number;
  accuracy: number;
  gemsCollected: number;
  treasureFound: boolean;
  maxStreak: number;
  timeSpent: number;
}

export interface IEndGameRanking {
  position: number;
  totalPlayers: number;
  percentile: number;
  previousBest: number;
  isNewRecord: boolean;
}

export interface IEndGameRewards {
  gemsEarned: number;
  dailyBonus?: number;
  streakBonus?: number;
}

export interface IEndGameResponse {
  finalScore: number;
  stars: 1 | 2 | 3;
  stats: IEndGameStats;
  ranking: IEndGameRanking;
  rewards?: IEndGameRewards;
}

// Leaderboard interfaces
export interface ILeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  fullName: string;
  avatarUrl?: string;
  bestScore: number;
  totalGames: number;
  averageAccuracy: number;
  isCurrentUser: boolean;
}

export interface ICurrentUserRank {
  rank: number;
  bestScore: number;
  totalGames: number;
  averageAccuracy: number;
}

export interface ILeaderboardResponse {
  period: LeaderboardPeriod;
  periodStart: string | null;
  periodEnd: string;
  entries: ILeaderboardEntry[];
  currentUser?: ICurrentUserRank;
  totalPlayers: number;
}

export interface ILeaderboardParams {
  period?: LeaderboardPeriod;
  limit?: number;
  offset?: number;
}

// History interfaces
export interface IGameHistoryItem {
  sessionId: string;
  difficulty: TreasureHuntDifficulty;
  score: number;
  stars: 1 | 2 | 3;
  accuracy: number;
  treasureFound: boolean;
  isDailyChallenge: boolean;
  playedAt: string;
}

export interface IHistoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IHistoryResponse {
  items: IGameHistoryItem[];
  pagination: IHistoryPagination;
}

export interface IHistoryParams {
  page?: number;
  limit?: number;
}

// Stats interfaces
export interface IOverallStats {
  totalGames: number;
  totalScore: number;
  bestScore: number;
  averageScore: number;
  totalCorrect: number;
  totalQuestions: number;
  overallAccuracy: number;
  treasuresFound: number;
  bestStreak: number;
}

export interface IWeeklyStats {
  gamesPlayed: number;
  averageScore: number;
  improvement: number;
}

export interface IStatsResponse {
  overall: IOverallStats;
  thisWeek: IWeeklyStats;
  dailyChallengeStreak: number;
}

// Inventory interfaces
export interface IInventoryResponse {
  items: IInventoryItem[];
  totalGems: number;
}

export interface IPurchaseItemResponse {
  itemType: TreasureHuntItemType;
  quantityPurchased: number;
  totalQuantity: number;
  gemsSpent: number;
  remainingGems: number;
}

// Daily Challenge interfaces
export interface IDailyChallengeTopPlayer {
  rank: number;
  userName: string;
  score: number;
}

export interface IDailyChallengeUserResult {
  score: number;
  rank: number;
  totalPlayers: number;
}

export interface IDailyChallengeRewards {
  completionBonus: number;
  top10Bonus?: number;
  top3Bonus?: number;
}

export interface IDailyChallengeResponse {
  challengeDate: string;
  difficulty: TreasureHuntDifficulty;
  hasPlayed: boolean;
  userResult?: IDailyChallengeUserResult;
  topPlayers: IDailyChallengeTopPlayer[];
  rewards: IDailyChallengeRewards;
}

// Resume game response (same as start but with current state)
export interface IResumeGameResponse extends IStartGameResponse {
  currentScore: number;
  timeRemaining: number;
  gameStats: IGameStats;
}

// ==================== GAME CONFIG CONSTANTS ====================

export const GAME_CONFIG = {
  [TreasureHuntDifficulty.EASY]: {
    mapSize: 5,
    timeLimit: 600,
    questionCount: 15,
    trapCount: 2,
    smallGemCount: 6,
    bigGemCount: 2,
    scoreMultiplier: 1,
    questionTimeLimit: 45,
  },
  [TreasureHuntDifficulty.MEDIUM]: {
    mapSize: 6,
    timeLimit: 720,
    questionCount: 20,
    trapCount: 3,
    smallGemCount: 8,
    bigGemCount: 3,
    scoreMultiplier: 1.5,
    questionTimeLimit: 35,
  },
  [TreasureHuntDifficulty.HARD]: {
    mapSize: 7,
    timeLimit: 900,
    questionCount: 30,
    trapCount: 5,
    smallGemCount: 10,
    bigGemCount: 4,
    scoreMultiplier: 2,
    questionTimeLimit: 25,
  },
};

export const ITEMS_CONFIG: Record<TreasureHuntItemType, {
  name: string;
  description: string;
  price: number;
  usageLimit: number;
  icon: string;
}> = {
  [TreasureHuntItemType.TORCH]: {
    name: "Torch",
    description: "Reveal content of 2 cells without opening them",
    price: 30,
    usageLimit: 2,
    icon: "torch",
  },
  [TreasureHuntItemType.SHIELD]: {
    name: "Shield",
    description: "Block 1 trap effect",
    price: 40,
    usageLimit: 1,
    icon: "shield",
  },
  [TreasureHuntItemType.DICTIONARY]: {
    name: "Dictionary",
    description: "Eliminate 2 wrong answers (50/50)",
    price: 25,
    usageLimit: 3,
    icon: "dictionary",
  },
  [TreasureHuntItemType.COMPASS]: {
    name: "Compass",
    description: "Show direction to treasure for 30 seconds",
    price: 50,
    usageLimit: 1,
    icon: "compass",
  },
  [TreasureHuntItemType.TIME_BOOST]: {
    name: "Time Boost",
    description: "Add 60 seconds to remaining time",
    price: 35,
    usageLimit: 2,
    icon: "time_boost",
  },
};

export const SCORING = {
  correctAnswer: {
    base: 10,
    timeBonusMax: 5,
    timeBonusThreshold: 10,
  },
  streak: {
    3: 1.2,
    5: 1.5,
    7: 1.8,
    10: 2.0,
  } as Record<number, number>,
  gems: {
    small: 10,
    big: 30,
    treasure: 100,
  },
  trap: -15,
  wrongAnswer: 0,
};
