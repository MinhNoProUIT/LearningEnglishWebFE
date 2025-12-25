# TREASURE HUNT GAME - Backend API Specification

> **Version**: 1.0
> **Dành cho**: Backend Team
> **Tham chiếu**: TREASURE_HUNT_GAME_DESIGN.md

---

## MỤC LỤC

1. [Tổng quan](#1-tổng-quan)
2. [Database Schema (Prisma)](#2-database-schema-prisma)
3. [API Endpoints Chi Tiết](#3-api-endpoints-chi-tiết)
4. [Business Logic](#4-business-logic)
5. [Thuật Toán](#5-thuật-toán)
6. [Validation & Security](#6-validation--security)
7. [Error Codes](#7-error-codes)
8. [Testing Checklist](#8-testing-checklist)

---

## 1. TỔNG QUAN

### 1.1 Mô tả game
Game "Đi Tìm Kho Báu" là trò chơi kết hợp học tiếng Anh với gameplay khám phá bản đồ. Player di chuyển trên lưới 5x5/6x6/7x7, trả lời câu hỏi Part 5 TOEIC để mở ô và tìm kho báu.

### 1.2 Core Mechanics cần hỗ trợ
- **Fog of War**: Player chỉ thấy ô liền kề
- **Adjacent Movement**: Chỉ di chuyển 4 hướng (trên/dưới/trái/phải)
- **Question Gate**: Trả lời sai = bị đẩy lùi
- **Items/Power-ups**: 5 loại vật phẩm hỗ trợ
- **Daily Challenge**: Bản đồ cố định theo ngày (seeded)
- **Leaderboard**: Xếp hạng theo ngày/tuần/tháng/all-time

### 1.3 Tech Stack (Đề xuất)
- **Framework**: NestJS hoặc Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache**: Redis (cho leaderboard, daily seed)
- **Auth**: JWT (sử dụng hệ thống auth có sẵn)

---

## 2. DATABASE SCHEMA (Prisma)

### 2.1 Thêm vào schema.prisma

```prisma
// ==================== TREASURE HUNT GAME ====================

// Enum cho difficulty
enum TreasureHuntDifficulty {
  EASY
  MEDIUM
  HARD
}

// Enum cho trạng thái session
enum TreasureHuntSessionStatus {
  IN_PROGRESS
  COMPLETED
  ABANDONED
  TIMEOUT
}

// Enum cho loại ô
enum TreasureHuntCellType {
  QUESTION
  SMALL_GEM
  BIG_GEM
  TRAP
  TREASURE
  EMPTY
}

// Enum cho hiệu ứng bẫy
enum TrapEffect {
  STUN
  BLIND
  SCORE_LOSS
}

// Enum cho loại item
enum TreasureHuntItemType {
  TORCH
  SHIELD
  DICTIONARY
  COMPASS
  TIME_BOOST
}

// Enum cho period leaderboard
enum LeaderboardPeriod {
  DAILY
  WEEKLY
  MONTHLY
  ALL_TIME
}

// ==================== TABLES ====================

// Session game chính
model TreasureHuntSession {
  id                 String                      @id @default(uuid())
  userId             String                      @map("user_id")
  user               User                        @relation(fields: [userId], references: [id], onDelete: Cascade)

  difficulty         TreasureHuntDifficulty
  mapSize            Int                         @map("map_size")
  mapSeed            String?                     @map("map_seed")
  mapData            Json                        @map("map_data")

  playerPosition     Int                         @default(0) @map("player_position")
  previousPosition   Int?                        @map("previous_position") // Vị trí trước đó (để pushback)

  score              Int                         @default(0)
  gemsCollected      Int                         @default(0) @map("gems_collected")
  questionsAnswered  Int                         @default(0) @map("questions_answered")
  questionsCorrect   Int                         @default(0) @map("questions_correct")
  currentStreak      Int                         @default(0) @map("current_streak")
  maxStreak          Int                         @default(0) @map("max_streak")

  treasureFound      Boolean                     @default(false) @map("treasure_found")
  timeLimitSeconds   Int                         @map("time_limit_seconds")
  timeSpentSeconds   Int                         @default(0) @map("time_spent_seconds")

  itemsUsed          Json                        @default("[]") @map("items_used")
  activeEffects      Json                        @default("[]") @map("active_effects") // Hiệu ứng đang active (blind, stun)

  isDailyChallenge   Boolean                     @default(false) @map("is_daily_challenge")
  status             TreasureHuntSessionStatus   @default(IN_PROGRESS)

  // Lưu danh sách câu hỏi đã dùng trong session này
  usedQuestionIds    String[]                    @default([]) @map("used_question_ids")

  startedAt          DateTime                    @default(now()) @map("started_at")
  completedAt        DateTime?                   @map("completed_at")
  createdAt          DateTime                    @default(now()) @map("created_at")

  answers            TreasureHuntAnswer[]

  @@index([userId])
  @@index([status])
  @@index([isDailyChallenge, startedAt])
  @@map("treasure_hunt_sessions")
}

// Chi tiết câu trả lời
model TreasureHuntAnswer {
  id               String                @id @default(uuid())
  sessionId        String                @map("session_id")
  session          TreasureHuntSession   @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  questionId       BigInt                @map("question_id")
  question         Question              @relation(fields: [questionId], references: [id])

  cellPosition     Int                   @map("cell_position")
  attemptNumber    Int                   @default(1) @map("attempt_number") // Lần thử thứ mấy

  selectedOptionId BigInt?               @map("selected_option_id")
  selectedOption   QuestionOption?       @relation(fields: [selectedOptionId], references: [id])

  isCorrect        Boolean?              @map("is_correct")
  timeSpentMs      Int?                  @map("time_spent_ms")
  pointsEarned     Int                   @default(0) @map("points_earned")
  streakAtTime     Int                   @default(0) @map("streak_at_time")

  answeredAt       DateTime              @default(now()) @map("answered_at")

  @@index([sessionId])
  @@index([questionId])
  @@map("treasure_hunt_answers")
}

// Bảng xếp hạng
model TreasureHuntLeaderboard {
  id              String            @id @default(uuid())
  userId          String            @map("user_id")
  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  period          LeaderboardPeriod
  periodStart     DateTime          @map("period_start") @db.Date

  bestScore       Int               @default(0) @map("best_score")
  totalGames      Int               @default(0) @map("total_games")
  totalCorrect    Int               @default(0) @map("total_correct")
  totalQuestions  Int               @default(0) @map("total_questions")
  averageAccuracy Decimal           @default(0) @map("average_accuracy") @db.Decimal(5, 2)
  bestStreak      Int               @default(0) @map("best_streak")
  treasuresFound  Int               @default(0) @map("treasures_found")

  updatedAt       DateTime          @updatedAt @map("updated_at")

  @@unique([userId, period, periodStart])
  @@index([period, periodStart, bestScore(sort: Desc)])
  @@map("treasure_hunt_leaderboard")
}

// Inventory vật phẩm của user
model TreasureHuntInventory {
  id        String                  @id @default(uuid())
  userId    String                  @map("user_id")
  user      User                    @relation(fields: [userId], references: [id], onDelete: Cascade)

  itemType  TreasureHuntItemType    @map("item_type")
  quantity  Int                     @default(0)

  updatedAt DateTime                @updatedAt @map("updated_at")

  @@unique([userId, itemType])
  @@map("treasure_hunt_inventory")
}

// Lịch sử mua vật phẩm
model TreasureHuntItemPurchase {
  id          String                @id @default(uuid())
  userId      String                @map("user_id")
  user        User                  @relation(fields: [userId], references: [id], onDelete: Cascade)

  itemType    TreasureHuntItemType  @map("item_type")
  quantity    Int
  gemsSpent   Int                   @map("gems_spent")

  purchasedAt DateTime              @default(now()) @map("purchased_at")

  @@index([userId])
  @@map("treasure_hunt_item_purchases")
}

// Daily Challenge config
model TreasureHuntDailyChallenge {
  id            String                    @id @default(uuid())
  challengeDate DateTime                  @unique @map("challenge_date") @db.Date
  mapSeed       String                    @map("map_seed")
  difficulty    TreasureHuntDifficulty    @default(MEDIUM)
  config        Json                      // Cấu hình bản đồ chi tiết
  questionIds   String[]                  @default([]) @map("question_ids") // Câu hỏi cố định cho ngày đó

  createdAt     DateTime                  @default(now()) @map("created_at")

  @@index([challengeDate])
  @@map("treasure_hunt_daily_challenges")
}

// Thêm relation vào model User (nếu chưa có)
// model User {
//   ...existing fields...
//   treasureHuntSessions      TreasureHuntSession[]
//   treasureHuntLeaderboard   TreasureHuntLeaderboard[]
//   treasureHuntInventory     TreasureHuntInventory[]
//   treasureHuntPurchases     TreasureHuntItemPurchase[]
// }

// Thêm relation vào model Question (nếu chưa có)
// model Question {
//   ...existing fields...
//   treasureHuntAnswers       TreasureHuntAnswer[]
// }

// Thêm relation vào model QuestionOption (nếu chưa có)
// model QuestionOption {
//   ...existing fields...
//   treasureHuntAnswers       TreasureHuntAnswer[]
// }
```

### 2.2 Migration Command
```bash
npx prisma migrate dev --name add_treasure_hunt_tables
```

---

## 3. API ENDPOINTS CHI TIẾT

### 3.1 Game Flow APIs

---

#### POST `/api/treasure-hunt/start`
**Mô tả**: Tạo session game mới

**Request Body**:
```typescript
interface StartGameRequest {
  difficulty: "EASY" | "MEDIUM" | "HARD";
  isDailyChallenge?: boolean;  // Default: false
  selectedItems?: string[];    // Item IDs mang theo (max 3)
}
```

**Response**:
```typescript
interface StartGameResponse {
  success: boolean;
  data: {
    sessionId: string;
    mapSize: number;
    timeLimit: number;          // Seconds
    playerPosition: number;     // Starting position (0)

    // Visible cells (current + adjacent)
    visibleCells: VisibleCell[];

    // Items đang mang theo
    activeItems: {
      itemType: string;
      remainingUses: number;
    }[];

    // Config cho FE
    config: {
      difficulty: string;
      isDailyChallenge: boolean;
      scoreMultiplier: number;
    };
  };
  error?: string;
}

interface VisibleCell {
  position: number;
  state: "current" | "hidden" | "fog";  // current=vị trí player, hidden=có thể click, fog=không thấy
  // Không trả về type cho đến khi reveal!
}
```

**Business Logic**:
1. Validate user đã login
2. Check nếu user có session IN_PROGRESS → return error hoặc auto-abandon
3. Nếu isDailyChallenge:
   - Lấy/tạo DailyChallenge cho ngày hôm nay
   - Check user đã chơi daily hôm nay chưa → return error nếu đã chơi
4. Generate map với config theo difficulty
5. Random chọn questions từ DB (Part 5 TOEIC)
6. Lưu session với map_data (KHÔNG trả về FE)
7. Trừ items từ inventory nếu có
8. Return visible cells (chỉ current + 4 adjacent)

---

#### POST `/api/treasure-hunt/move`
**Mô tả**: Di chuyển đến ô liền kề

**Request Body**:
```typescript
interface MoveRequest {
  sessionId: string;
  targetPosition: number;
}
```

**Response**:
```typescript
interface MoveResponse {
  success: boolean;
  data: {
    newPosition: number;
    cellType: "QUESTION" | "SMALL_GEM" | "BIG_GEM" | "TRAP" | "TREASURE" | "EMPTY";

    // Nếu là QUESTION
    question?: {
      id: string;
      questionText: string;
      options: {
        id: string;
        label: string;  // A, B, C, D
        text: string;
      }[];
      timeLimit: number;  // Seconds
    };

    // Nếu là GEM
    pointsEarned?: number;
    newScore?: number;

    // Nếu là TRAP
    trapEffect?: {
      type: "STUN" | "BLIND" | "SCORE_LOSS";
      duration?: number;    // Seconds (for STUN, BLIND)
      pointsLost?: number;  // For SCORE_LOSS
    };
    shieldActivated?: boolean;  // True nếu có shield và đã dùng

    // Nếu là TREASURE
    gameCompleted?: boolean;
    bonusPoints?: number;

    // Luôn trả về
    visibleCells: VisibleCell[];  // Updated visible cells
    activeEffects: ActiveEffect[];
  };
  error?: string;
}

interface ActiveEffect {
  type: "STUN" | "BLIND";
  expiresAt: string;  // ISO timestamp
  remainingSeconds: number;
}
```

**Business Logic**:
1. Validate session tồn tại và thuộc user
2. Validate session status = IN_PROGRESS
3. **Validate targetPosition là ô liền kề** (QUAN TRỌNG - anti-cheat)
4. Check nếu có STUN effect → return error "Bạn đang bị choáng"
5. Lưu previousPosition = currentPosition
6. Update playerPosition = targetPosition
7. Reveal cell tại targetPosition
8. Xử lý theo cellType:
   - QUESTION: Lấy câu hỏi chưa dùng, return question
   - SMALL_GEM: +10 điểm, update score
   - BIG_GEM: +30 điểm, update score
   - TRAP: Check shield, apply effect
   - TREASURE: Complete game, +100 điểm
   - EMPTY: Không làm gì
9. Update visibleCells (current + 4 adjacent)
10. Return response

---

#### POST `/api/treasure-hunt/answer`
**Mô tả**: Submit câu trả lời cho câu hỏi

**Request Body**:
```typescript
interface AnswerRequest {
  sessionId: string;
  questionId: string;
  selectedOptionId: string;
  timeSpentMs: number;
}
```

**Response**:
```typescript
interface AnswerResponse {
  success: boolean;
  data: {
    isCorrect: boolean;
    correctOptionId: string;
    explanation?: string;

    // Điểm
    pointsEarned: number;
    timeBonus: number;
    streakBonus: number;
    newScore: number;

    // Streak
    currentStreak: number;
    streakMultiplier: number;  // 1.0, 1.2, 1.5, 1.8, 2.0

    // Nếu sai
    pushedBack?: boolean;
    newPosition?: number;  // Vị trí sau khi bị đẩy lùi
    attemptsRemaining?: number;  // Số lần thử còn lại cho ô này
    cellLocked?: boolean;  // True nếu đã hết lượt thử

    // Updated state
    visibleCells: VisibleCell[];
    stats: {
      questionsAnswered: number;
      questionsCorrect: number;
      accuracy: number;
    };
  };
  error?: string;
}
```

**Business Logic**:
1. Validate session và question
2. **Validate timeSpentMs >= 500** (anti-cheat: không thể trả lời < 0.5s)
3. Check question có trong session's usedQuestionIds → prevent replay
4. Lấy correct answer từ DB
5. Tính điểm nếu đúng:
   - Base: 10 điểm
   - Time bonus: max 5 điểm nếu < 10s
   - Streak bonus: x1.2/1.5/1.8/2.0
6. Nếu SAI:
   - Reset streak về 0
   - Check số lần đã thử ô này
   - Nếu < 2 lần: đẩy lùi về previousPosition
   - Nếu = 2 lần: lock ô, đẩy lùi
7. Lưu TreasureHuntAnswer
8. Update session stats
9. Return response

---

#### POST `/api/treasure-hunt/use-item`
**Mô tả**: Sử dụng item trong game

**Request Body**:
```typescript
interface UseItemRequest {
  sessionId: string;
  itemType: "TORCH" | "SHIELD" | "DICTIONARY" | "COMPASS" | "TIME_BOOST";
  targetPosition?: number;  // Cho TORCH - vị trí muốn scan
  questionId?: string;      // Cho DICTIONARY - câu hỏi muốn 50/50
}
```

**Response**:
```typescript
interface UseItemResponse {
  success: boolean;
  data: {
    itemUsed: string;
    remainingUses: number;

    // TORCH: Reveal ô không cần di chuyển
    revealedCell?: {
      position: number;
      type: string;
    };

    // DICTIONARY: Loại 2 đáp án sai
    eliminatedOptions?: string[];  // Option IDs bị loại

    // COMPASS: Hướng đến treasure
    treasureDirection?: {
      direction: "up" | "down" | "left" | "right" | "up-left" | "up-right" | "down-left" | "down-right";
      distance: number;  // Số ô
      expiresAt: string;  // 30s
    };

    // TIME_BOOST
    timeAdded?: number;
    newTimeLimit?: number;

    // SHIELD: Chỉ active, không return gì đặc biệt
  };
  error?: string;
}
```

**Business Logic**:
1. Validate session và item
2. Check item còn lượt dùng trong session
3. Check cooldown (5s giữa các lần dùng item)
4. Apply item effect
5. Update itemsUsed trong session
6. Return response

---

#### POST `/api/treasure-hunt/end`
**Mô tả**: Kết thúc game

**Request Body**:
```typescript
interface EndGameRequest {
  sessionId: string;
  reason: "COMPLETED" | "TIMEOUT" | "ABANDONED";
}
```

**Response**:
```typescript
interface EndGameResponse {
  success: boolean;
  data: {
    finalScore: number;
    stars: 1 | 2 | 3;

    stats: {
      questionsAnswered: number;
      questionsCorrect: number;
      accuracy: number;
      gemsCollected: number;
      treasureFound: boolean;
      maxStreak: number;
      timeSpent: number;  // Seconds
    };

    ranking: {
      position: number;
      totalPlayers: number;
      percentile: number;
      previousBest: number;
      isNewRecord: boolean;
    };

    rewards?: {
      gemsEarned: number;
      dailyBonus?: number;
      streakBonus?: number;
    };
  };
  error?: string;
}
```

**Business Logic**:
1. Validate session
2. Calculate final stats
3. Calculate stars:
   - 1 star: Hoàn thành
   - 2 stars: Accuracy >= 70%
   - 3 stars: Accuracy >= 90% + treasureFound
4. Update leaderboard (daily, weekly, monthly, all-time)
5. Calculate ranking
6. Award rewards
7. Update session status
8. Return response

---

### 3.2 Leaderboard APIs

---

#### GET `/api/treasure-hunt/leaderboard`
**Query Params**:
```
?period=WEEKLY&limit=50&offset=0
```

**Response**:
```typescript
interface LeaderboardResponse {
  success: boolean;
  data: {
    period: "DAILY" | "WEEKLY" | "MONTHLY" | "ALL_TIME";
    periodStart: string;
    periodEnd: string;

    entries: {
      rank: number;
      userId: string;
      userName: string;
      fullName: string;
      avatarUrl?: string;
      bestScore: number;
      totalGames: number;
      averageAccuracy: number;
      isCurrentUser: boolean;
    }[];

    currentUser?: {
      rank: number;
      bestScore: number;
      totalGames: number;
      averageAccuracy: number;
    };

    totalPlayers: number;
  };
}
```

---

#### GET `/api/treasure-hunt/history`
**Query Params**:
```
?page=1&limit=10
```

**Response**:
```typescript
interface HistoryResponse {
  success: boolean;
  data: {
    items: {
      sessionId: string;
      difficulty: string;
      score: number;
      stars: number;
      accuracy: number;
      treasureFound: boolean;
      isDailyChallenge: boolean;
      playedAt: string;
    }[];

    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  };
}
```

---

#### GET `/api/treasure-hunt/stats`
**Response**:
```typescript
interface StatsResponse {
  success: boolean;
  data: {
    overall: {
      totalGames: number;
      totalScore: number;
      bestScore: number;
      averageScore: number;
      totalCorrect: number;
      totalQuestions: number;
      overallAccuracy: number;
      treasuresFound: number;
      bestStreak: number;
    };

    thisWeek: {
      gamesPlayed: number;
      averageScore: number;
      improvement: number;  // % so với tuần trước
    };

    dailyChallengeStreak: number;  // Số ngày liên tiếp chơi daily
  };
}
```

---

### 3.3 Inventory APIs

---

#### GET `/api/treasure-hunt/inventory`
**Response**:
```typescript
interface InventoryResponse {
  success: boolean;
  data: {
    items: {
      itemType: string;
      name: string;
      description: string;
      quantity: number;
      price: number;
      icon: string;
    }[];

    totalGems: number;  // Số gems user đang có
  };
}
```

---

#### POST `/api/treasure-hunt/purchase-item`
**Request Body**:
```typescript
interface PurchaseItemRequest {
  itemType: "TORCH" | "SHIELD" | "DICTIONARY" | "COMPASS" | "TIME_BOOST";
  quantity: number;
}
```

**Response**:
```typescript
interface PurchaseItemResponse {
  success: boolean;
  data: {
    itemType: string;
    quantityPurchased: number;
    totalQuantity: number;
    gemsSpent: number;
    remainingGems: number;
  };
  error?: string;
}
```

---

### 3.4 Daily Challenge API

---

#### GET `/api/treasure-hunt/daily-challenge`
**Response**:
```typescript
interface DailyChallengeResponse {
  success: boolean;
  data: {
    challengeDate: string;
    difficulty: string;
    hasPlayed: boolean;

    // Nếu đã chơi
    userResult?: {
      score: number;
      rank: number;
      totalPlayers: number;
    };

    // Top 10 hôm nay
    topPlayers: {
      rank: number;
      userName: string;
      score: number;
    }[];

    // Reward info
    rewards: {
      completionBonus: number;
      top10Bonus?: number;
      top3Bonus?: number;
    };
  };
}
```

---

## 4. BUSINESS LOGIC

### 4.1 Game Config

```typescript
const GAME_CONFIG = {
  EASY: {
    mapSize: 5,
    timeLimit: 600,       // 10 phút
    questionCount: 15,
    trapCount: 2,
    smallGemCount: 6,
    bigGemCount: 2,
    scoreMultiplier: 1,
    questionTimeLimit: 45,
  },
  MEDIUM: {
    mapSize: 6,
    timeLimit: 720,       // 12 phút
    questionCount: 20,
    trapCount: 3,
    smallGemCount: 8,
    bigGemCount: 3,
    scoreMultiplier: 1.5,
    questionTimeLimit: 35,
  },
  HARD: {
    mapSize: 7,
    timeLimit: 900,       // 15 phút
    questionCount: 30,
    trapCount: 5,
    smallGemCount: 10,
    bigGemCount: 4,
    scoreMultiplier: 2,
    questionTimeLimit: 25,
  },
};
```

### 4.2 Scoring System

```typescript
const SCORING = {
  correctAnswer: {
    base: 10,
    timeBonusMax: 5,
    timeBonusThreshold: 10,  // < 10s = full bonus
  },
  streak: {
    3: 1.2,
    5: 1.5,
    7: 1.8,
    10: 2.0,
  },
  gems: {
    small: 10,
    big: 30,
    treasure: 100,
  },
  trap: -15,
  wrongAnswer: 0,
};

// Tính điểm cho câu trả lời đúng
function calculatePoints(
  timeSpentMs: number,
  currentStreak: number,
  scoreMultiplier: number
): { base: number; timeBonus: number; streakMultiplier: number; total: number } {
  const base = SCORING.correctAnswer.base;

  // Time bonus: linear decrease từ max đến 0
  const timeSpentSeconds = timeSpentMs / 1000;
  const timeBonus = timeSpentSeconds < SCORING.correctAnswer.timeBonusThreshold
    ? Math.floor(SCORING.correctAnswer.timeBonusMax *
        (1 - timeSpentSeconds / SCORING.correctAnswer.timeBonusThreshold))
    : 0;

  // Streak multiplier
  let streakMultiplier = 1;
  const streakThresholds = Object.entries(SCORING.streak)
    .map(([k, v]) => ({ threshold: parseInt(k), multiplier: v }))
    .sort((a, b) => b.threshold - a.threshold);

  for (const { threshold, multiplier } of streakThresholds) {
    if (currentStreak >= threshold) {
      streakMultiplier = multiplier;
      break;
    }
  }

  const total = Math.floor((base + timeBonus) * streakMultiplier * scoreMultiplier);

  return { base, timeBonus, streakMultiplier, total };
}
```

### 4.3 Items Config

```typescript
const ITEMS_CONFIG = {
  TORCH: {
    name: "Đèn Pin Xịn",
    description: "Nhìn thấy nội dung của 2 ô bất kỳ mà không cần mở",
    price: 30,
    usageLimit: 2,
    icon: "🔦"
  },
  SHIELD: {
    name: "Khiên Bảo Vệ",
    description: "Chống lại 1 lần đạp bẫy",
    price: 40,
    usageLimit: 1,
    icon: "🛡️"
  },
  DICTIONARY: {
    name: "Từ Điển Mini",
    description: "Loại bỏ 2 đáp án sai trong 1 câu hỏi (50/50)",
    price: 25,
    usageLimit: 3,
    icon: "📖"
  },
  COMPASS: {
    name: "La Bàn Kho Báu",
    description: "Hiển thị mũi tên chỉ hướng tới kho báu trong 30 giây",
    price: 50,
    usageLimit: 1,
    icon: "🧭"
  },
  TIME_BOOST: {
    name: "Đồng Hồ Cát",
    description: "Cộng thêm 60 giây vào thời gian còn lại",
    price: 35,
    usageLimit: 2,
    icon: "⏳"
  }
};
```

### 4.4 Trap Effects

```typescript
const TRAP_EFFECTS = {
  STUN: {
    duration: 5,  // seconds
    description: "Không thể di chuyển trong 5 giây"
  },
  BLIND: {
    duration: 30,  // seconds
    description: "Chỉ thấy 1 ô liền kề thay vì 4 ô trong 30 giây"
  },
  SCORE_LOSS: {
    points: 15,
    description: "Mất 15 điểm"
  }
};

// Random chọn trap effect
function getRandomTrapEffect(): TrapEffect {
  const effects: TrapEffect[] = ["STUN", "BLIND", "SCORE_LOSS"];
  return effects[Math.floor(Math.random() * effects.length)];
}
```

---

## 5. THUẬT TOÁN

### 5.1 Map Generation

```typescript
interface MapCell {
  position: number;
  type: TreasureHuntCellType;
  state: "FOG" | "HIDDEN" | "REVEALED" | "CURRENT" | "LOCKED";
  trapEffect?: TrapEffect;
  questionId?: string;
  attempts?: number;  // Số lần đã thử (cho QUESTION)
}

interface MapGenerationConfig {
  size: number;
  seed?: string;
  questionCount: number;
  trapCount: number;
  smallGemCount: number;
  bigGemCount: number;
}

function generateMap(config: MapGenerationConfig): MapCell[] {
  const { size, seed, questionCount, trapCount, smallGemCount, bigGemCount } = config;
  const totalCells = size * size;

  // Dùng seeded random nếu có seed (Daily Challenge)
  const random = seed ? seededRandom(seed) : Math.random;

  // 1. Khởi tạo map trống
  const map: MapCell[] = Array(totalCells).fill(null).map((_, i) => ({
    position: i,
    type: "EMPTY" as TreasureHuntCellType,
    state: i === 0 ? "CURRENT" : "FOG",
    attempts: 0
  }));

  // 2. Đặt Start (0) và Treasure (last)
  const startPos = 0;
  const treasurePos = totalCells - 1;
  map[treasurePos].type = "TREASURE";

  // 3. Generate guaranteed path
  const guaranteedPath = generateGuaranteedPath(startPos, treasurePos, size, random);

  // 4. Đặt Questions trên path (60%)
  const pathQuestionCount = Math.floor(guaranteedPath.length * 0.6);
  const pathQuestionPositions = selectRandom(
    guaranteedPath.slice(1, -1),  // Bỏ start và treasure
    pathQuestionCount,
    random
  );
  pathQuestionPositions.forEach(pos => {
    map[pos].type = "QUESTION";
  });

  // 5. Đặt gems trên path
  const pathGemPositions = selectRandom(
    guaranteedPath.filter(p => map[p].type === "EMPTY"),
    Math.floor(smallGemCount * 0.3),
    random
  );
  pathGemPositions.forEach(pos => {
    map[pos].type = "SMALL_GEM";
  });

  // 6. Các vị trí còn lại
  const remainingPositions = Array.from({ length: totalCells }, (_, i) => i)
    .filter(p => p !== startPos && p !== treasurePos && !guaranteedPath.includes(p));

  const shuffled = shuffle(remainingPositions, random);
  let idx = 0;

  // Đặt Traps (KHÔNG trên guaranteed path)
  for (let i = 0; i < trapCount && idx < shuffled.length; i++, idx++) {
    map[shuffled[idx]].type = "TRAP";
    map[shuffled[idx]].trapEffect = getRandomTrapEffect();
  }

  // Đặt Questions còn lại
  const remainingQuestions = questionCount - pathQuestionCount;
  for (let i = 0; i < remainingQuestions && idx < shuffled.length; i++, idx++) {
    map[shuffled[idx]].type = "QUESTION";
  }

  // Đặt Gems còn lại
  const remainingSmallGems = smallGemCount - pathGemPositions.length;
  for (let i = 0; i < remainingSmallGems && idx < shuffled.length; i++, idx++) {
    map[shuffled[idx]].type = "SMALL_GEM";
  }

  for (let i = 0; i < bigGemCount && idx < shuffled.length; i++, idx++) {
    map[shuffled[idx]].type = "BIG_GEM";
  }

  // 7. Validate có đường đi
  if (!hasValidPath(map, startPos, treasurePos, size)) {
    return generateMap(config);  // Regenerate
  }

  return map;
}

// Seeded random number generator
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }

  return () => {
    hash = Math.sin(hash) * 10000;
    return hash - Math.floor(hash);
  };
}
```

### 5.2 Adjacent Position Calculation

```typescript
function getAdjacentPositions(pos: number, mapSize: number): number[] {
  const row = Math.floor(pos / mapSize);
  const col = pos % mapSize;
  const adjacent: number[] = [];

  if (row > 0) adjacent.push(pos - mapSize);         // Trên
  if (row < mapSize - 1) adjacent.push(pos + mapSize); // Dưới
  if (col > 0) adjacent.push(pos - 1);               // Trái
  if (col < mapSize - 1) adjacent.push(pos + 1);     // Phải

  return adjacent;
}

function isAdjacent(pos1: number, pos2: number, mapSize: number): boolean {
  return getAdjacentPositions(pos1, mapSize).includes(pos2);
}
```

### 5.3 Path Validation (BFS)

```typescript
function hasValidPath(
  map: MapCell[],
  start: number,
  end: number,
  mapSize: number
): boolean {
  const visited = new Set<number>();
  const queue = [start];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current === end) return true;
    if (visited.has(current)) continue;

    visited.add(current);

    const adjacent = getAdjacentPositions(current, mapSize);
    for (const pos of adjacent) {
      // Có thể đi qua mọi ô trừ TRAP (để đảm bảo có ít nhất 1 đường không qua trap)
      if (!visited.has(pos) && map[pos].type !== "TRAP") {
        queue.push(pos);
      }
    }
  }

  return false;
}
```

### 5.4 Compass Direction Calculation

```typescript
function getDirectionToTreasure(
  currentPos: number,
  treasurePos: number,
  mapSize: number
): { direction: string; distance: number } {
  const currentRow = Math.floor(currentPos / mapSize);
  const currentCol = currentPos % mapSize;
  const treasureRow = Math.floor(treasurePos / mapSize);
  const treasureCol = treasurePos % mapSize;

  const rowDiff = treasureRow - currentRow;
  const colDiff = treasureCol - currentCol;

  let direction = "";

  if (rowDiff < 0) direction += "up";
  else if (rowDiff > 0) direction += "down";

  if (colDiff < 0) direction += direction ? "-left" : "left";
  else if (colDiff > 0) direction += direction ? "-right" : "right";

  const distance = Math.abs(rowDiff) + Math.abs(colDiff);  // Manhattan distance

  return { direction: direction || "here", distance };
}
```

---

## 6. VALIDATION & SECURITY

### 6.1 Input Validation

```typescript
// Validate move request
function validateMove(
  session: TreasureHuntSession,
  targetPosition: number
): { valid: boolean; error?: string } {
  // Check session status
  if (session.status !== "IN_PROGRESS") {
    return { valid: false, error: "Session đã kết thúc" };
  }

  // Check adjacent
  if (!isAdjacent(session.playerPosition, targetPosition, session.mapSize)) {
    return { valid: false, error: "Không thể di chuyển đến ô không liền kề" };
  }

  // Check target trong range
  if (targetPosition < 0 || targetPosition >= session.mapSize * session.mapSize) {
    return { valid: false, error: "Vị trí không hợp lệ" };
  }

  // Check stun effect
  const stunEffect = session.activeEffects.find(e => e.type === "STUN");
  if (stunEffect && new Date(stunEffect.expiresAt) > new Date()) {
    return { valid: false, error: "Bạn đang bị choáng, không thể di chuyển" };
  }

  // Check cell locked
  const cell = session.mapData[targetPosition];
  if (cell.state === "LOCKED") {
    return { valid: false, error: "Ô này đã bị khóa" };
  }

  return { valid: true };
}
```

### 6.2 Anti-Cheat Measures

```typescript
// Rate limiting
const RATE_LIMITS = {
  move: { requests: 2, windowMs: 1000 },
  answer: { requests: 1, windowMs: 1000 },
  useItem: { requests: 1, windowMs: 5000 },
};

// Validate answer timing
function validateAnswerTiming(timeSpentMs: number): boolean {
  // Không thể trả lời < 500ms (impossible to read)
  if (timeSpentMs < 500) return false;

  // Không thể trả lời > 5 phút (timeout)
  if (timeSpentMs > 300000) return false;

  return true;
}

// Detect suspicious patterns
async function checkSuspiciousActivity(
  userId: string,
  sessionId: string
): Promise<boolean> {
  const session = await getSession(sessionId);

  // 100% accuracy với thời gian trung bình < 3s/câu
  if (session.questionsCorrect === session.questionsAnswered) {
    const avgTime = session.timeSpentSeconds / session.questionsAnswered;
    if (avgTime < 3) {
      await flagSuspiciousSession(sessionId, "SPEED_HACK");
      return true;
    }
  }

  return false;
}
```

### 6.3 Session Security

```typescript
// Validate session ownership
async function validateSessionOwnership(
  sessionId: string,
  userId: string
): Promise<boolean> {
  const session = await prisma.treasureHuntSession.findUnique({
    where: { id: sessionId },
    select: { userId: true }
  });

  return session?.userId === userId;
}

// Auto-expire stale sessions
async function expireStaleSession(sessionId: string): Promise<void> {
  const session = await getSession(sessionId);

  if (session.status !== "IN_PROGRESS") return;

  const elapsedSeconds = Math.floor(
    (Date.now() - new Date(session.startedAt).getTime()) / 1000
  );

  if (elapsedSeconds > session.timeLimitSeconds + 60) {  // +60s buffer
    await prisma.treasureHuntSession.update({
      where: { id: sessionId },
      data: {
        status: "TIMEOUT",
        completedAt: new Date(),
        timeSpentSeconds: session.timeLimitSeconds
      }
    });
  }
}
```

---

## 7. ERROR CODES

```typescript
const ERROR_CODES = {
  // Auth errors (1xxx)
  UNAUTHORIZED: { code: 1001, message: "Vui lòng đăng nhập" },

  // Session errors (2xxx)
  SESSION_NOT_FOUND: { code: 2001, message: "Không tìm thấy session" },
  SESSION_NOT_OWNED: { code: 2002, message: "Session không thuộc về bạn" },
  SESSION_EXPIRED: { code: 2003, message: "Session đã hết hạn" },
  SESSION_COMPLETED: { code: 2004, message: "Game đã kết thúc" },
  SESSION_IN_PROGRESS: { code: 2005, message: "Bạn đang có game chưa hoàn thành" },

  // Move errors (3xxx)
  INVALID_POSITION: { code: 3001, message: "Vị trí không hợp lệ" },
  NOT_ADJACENT: { code: 3002, message: "Chỉ có thể di chuyển đến ô liền kề" },
  CELL_LOCKED: { code: 3003, message: "Ô này đã bị khóa" },
  PLAYER_STUNNED: { code: 3004, message: "Bạn đang bị choáng" },

  // Answer errors (4xxx)
  QUESTION_NOT_FOUND: { code: 4001, message: "Không tìm thấy câu hỏi" },
  INVALID_OPTION: { code: 4002, message: "Lựa chọn không hợp lệ" },
  ANSWER_TOO_FAST: { code: 4003, message: "Trả lời quá nhanh" },
  QUESTION_ALREADY_ANSWERED: { code: 4004, message: "Câu hỏi đã được trả lời" },

  // Item errors (5xxx)
  ITEM_NOT_FOUND: { code: 5001, message: "Vật phẩm không tồn tại" },
  ITEM_NO_USES_LEFT: { code: 5002, message: "Đã hết lượt sử dụng vật phẩm" },
  ITEM_COOLDOWN: { code: 5003, message: "Vật phẩm đang trong thời gian hồi" },
  INSUFFICIENT_GEMS: { code: 5004, message: "Không đủ gems" },

  // Daily Challenge errors (6xxx)
  DAILY_ALREADY_PLAYED: { code: 6001, message: "Bạn đã chơi Daily Challenge hôm nay" },
  DAILY_NOT_AVAILABLE: { code: 6002, message: "Daily Challenge chưa sẵn sàng" },

  // Rate limit errors (9xxx)
  RATE_LIMITED: { code: 9001, message: "Quá nhiều request, vui lòng chờ" },
};
```

---

## 8. TESTING CHECKLIST

### 8.1 Unit Tests

```typescript
// Map Generation Tests
describe("Map Generation", () => {
  test("should generate map with correct size");
  test("should place treasure at last position");
  test("should have valid path from start to treasure");
  test("should generate same map with same seed");
  test("should not place traps on guaranteed path");
  test("should have correct number of each cell type");
});

// Scoring Tests
describe("Scoring", () => {
  test("should calculate base points correctly");
  test("should calculate time bonus correctly");
  test("should apply streak multiplier correctly");
  test("should reset streak on wrong answer");
  test("should not go below 0 points");
});

// Movement Tests
describe("Movement", () => {
  test("should allow movement to adjacent cells");
  test("should reject movement to non-adjacent cells");
  test("should block movement when stunned");
  test("should push back on wrong answer");
  test("should lock cell after 2 wrong attempts");
});

// Item Tests
describe("Items", () => {
  test("should reveal cell with torch");
  test("should block trap with shield");
  test("should eliminate 2 options with dictionary");
  test("should show direction with compass");
  test("should add time with time_boost");
  test("should enforce cooldown between uses");
});
```

### 8.2 Integration Tests

```typescript
describe("Game Flow", () => {
  test("should start new game");
  test("should complete full game successfully");
  test("should handle timeout correctly");
  test("should handle abandon correctly");
  test("should update leaderboard on completion");
});

describe("Daily Challenge", () => {
  test("should generate same map for all users on same day");
  test("should prevent multiple plays per day");
  test("should have separate leaderboard");
});
```

### 8.3 Load Tests

```
- 100 concurrent games
- 1000 requests/second for leaderboard
- 500 simultaneous answer submissions
```

---

## APPENDIX: API Response Format

Tất cả API response nên follow format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: number;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}
```

---

## APPENDIX: Cron Jobs

```typescript
// Daily Challenge Generation - Chạy 00:00 UTC mỗi ngày
// Tạo DailyChallenge cho ngày mai
cron.schedule("0 0 * * *", async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const seed = `daily-${tomorrow.toISOString().split('T')[0]}`;

  await prisma.treasureHuntDailyChallenge.create({
    data: {
      challengeDate: tomorrow,
      mapSeed: seed,
      difficulty: "MEDIUM",
      config: GAME_CONFIG.MEDIUM,
      questionIds: await selectRandomQuestionIds(20)
    }
  });
});

// Leaderboard Aggregation - Chạy mỗi giờ
cron.schedule("0 * * * *", async () => {
  await aggregateLeaderboards();
});

// Cleanup expired sessions - Chạy mỗi 6 giờ
cron.schedule("0 */6 * * *", async () => {
  await cleanupExpiredSessions();
});
```

---

**END OF DOCUMENT**

Đây là tài liệu đầy đủ để đội Backend implement APIs cho game Treasure Hunt.
Nếu có câu hỏi, vui lòng liên hệ team Frontend.
