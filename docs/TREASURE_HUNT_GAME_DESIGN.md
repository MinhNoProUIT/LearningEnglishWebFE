# 🏴‍☠️ ĐI TÌM KHO BÁU TIẾNG ANH - Game Design Document

> **Version**: 2.0
> **Last Updated**: 2024-01-20
> **Status**: Ready for Development

## 1. TỔNG QUAN GAME

### 1.1 Concept
Game phiêu lưu tìm kho báu kết hợp với việc trả lời câu hỏi tiếng Anh (Part 5 TOEIC - Incomplete Sentences). Người chơi điều khiển nhân vật thợ mỏ di chuyển trên bản đồ **có sương mù (Fog of War)**, mở các ô liền kề để tìm kho báu và trả lời câu hỏi.

### 1.2 Mục tiêu
- Thu thập nhiều kim cương/coins nhất có thể
- Tìm được kho báu lớn (đích đến)
- Trả lời đúng các câu hỏi tiếng Anh
- Cạnh tranh điểm với người chơi khác
- **Tính toán lộ trình thông minh** để tránh bẫy

### 1.3 Theme & Art Style
- **Chủ đề**: Thợ mỏ tìm kho báu trong hang động
- **Màu sắc chính**: Nâu đất, xanh lá, vàng kim
- **Nhân vật chính**: Thợ mỏ với mũ có đèn pin
- **Mascot**: Khỉ con (companion) - phản ứng theo kết quả trả lời

### 1.4 Core Mechanics (MỚI)
- **Fog of War**: Chỉ thấy các ô liền kề với vị trí hiện tại
- **Adjacent Movement**: Chỉ có thể di chuyển đến ô liền kề (4 hướng: trên, dưới, trái, phải)
- **Question Gate**: Trả lời sai = bị đẩy lùi về ô cũ
- **Path Guarantee**: Luôn có ít nhất 1 đường đi từ Start → Treasure

---

## 2. NHÂN VẬT & MASCOT

### 2.1 Nhân vật chính - Thợ Mỏ (Miner)
```
Trạng thái:
├── idle: Đứng yên, nhìn xung quanh
├── walking: Di chuyển giữa các ô
├── digging: Đào khi mở ô mới
├── celebrating: Nhảy múa khi tìm được kho báu
└── sad: Buồn khi gặp bẫy
```

### 2.2 Mascot - Khỉ Con (Monkey)
```
Phản ứng theo kết quả:
├── ĐÚNG:
│   ├── Nhảy lên hoan hô 🎉
│   ├── Vỗ tay
│   └── Tung confetti
│
├── SAI:
│   ├── Ném chuối vào màn hình 🍌💥
│   ├── Lắc đầu thất vọng
│   └── Che mặt
│
└── CHỜ ĐỢI:
    ├── Gãi đầu suy nghĩ
    └── Nhìn đồng hồ
```

---

## 3. BẢN ĐỒ GAME

### 3.1 Cấu trúc bản đồ
```
Kích thước: 6x6 = 36 ô

Phân bố ô (có thể config):
├── Ô câu hỏi (Question): 20 ô (55%) - Đá xám với dấu "?"
├── Ô kim cương nhỏ (Small Gem): 8 ô (22%) - Thưởng +10 điểm
├── Ô kim cương lớn (Big Gem): 3 ô (8%) - Thưởng +30 điểm
├── Ô bẫy (Trap): 3 ô (8%) - Trừ 15 điểm
├── Ô kho báu (Treasure): 1 ô (3%) - Bonus +100 điểm, kết thúc game
└── Ô trống (Empty): 1 ô (3%) - Không có gì

Vị trí bắt đầu: Random ở hàng đầu hoặc cột đầu
Vị trí kho báu: Random ở góc đối diện
```

### 3.2 Trạng thái ô
```typescript
enum CellState {
  FOG = "fog",            // Sương mù - không nhìn thấy (MỚI)
  HIDDEN = "hidden",      // Chưa mở - hiển thị đá (ô liền kề)
  REVEALED = "revealed",  // Đã mở - hiển thị nội dung
  CURRENT = "current",    // Vị trí hiện tại của player
  LOCKED = "locked",      // Ô bị khóa (trả lời sai)
}

enum CellType {
  QUESTION = "question",        // Câu hỏi Part 5
  SMALL_GEM = "small_gem",      // Kim cương nhỏ (xanh dương)
  BIG_GEM = "big_gem",          // Kim cương lớn (đỏ)
  TRAP = "trap",                // Bẫy (ô đỏ)
  TREASURE = "treasure",        // Kho báu cuối
  EMPTY = "empty",              // Ô trống
}

enum TrapEffect {           // (MỚI) Hiệu ứng bẫy
  STUN = "stun",            // Choáng 5 giây
  BLIND = "blind",          // Thu hẹp tầm nhìn (chỉ thấy 1 ô)
  SCORE_LOSS = "score_loss" // Mất 15 điểm
}
```

### 3.3 Fog of War System (MỚI)
```
Visibility Rules:
├── Ô hiện tại (CURRENT): Luôn thấy rõ
├── Ô liền kề (4 hướng): Thấy được, có thể click để di chuyển
├── Ô đã đi qua (REVEALED): Thấy được nhưng mờ hơn
└── Ô chưa khám phá (FOG): Bị che bởi sương mù đen

Adjacent Cells Calculation:
  const getAdjacentPositions = (pos: number, mapSize: number): number[] => {
    const row = Math.floor(pos / mapSize);
    const col = pos % mapSize;
    const adjacent: number[] = [];

    if (row > 0) adjacent.push(pos - mapSize);        // Trên
    if (row < mapSize - 1) adjacent.push(pos + mapSize); // Dưới
    if (col > 0) adjacent.push(pos - 1);              // Trái
    if (col < mapSize - 1) adjacent.push(pos + 1);    // Phải

    return adjacent;
  };
```

### 3.4 Visual của từng loại ô
```
FOG (sương mù):
├── Màu đen/xám đậm với hiệu ứng khói
└── Không thể click

HIDDEN (chưa mở - ô liền kề):
├── Đá xám với dấu "?" màu xanh dương
└── Hover effect: sáng lên, có thể click

QUESTION (đã mở, chưa trả lời):
├── Ô màu nâu với icon cuộn giấy/sách
└── Hiệu ứng: pulse nhẹ

SMALL_GEM:
├── Kim cương xanh dương nhỏ
└── Hiệu ứng: lấp lánh

BIG_GEM:
├── Kim cương đỏ/tím lớn
└── Hiệu ứng: lấp lánh mạnh + tia sáng

TRAP:
├── Ô đỏ với icon bom/gai
└── Hiệu ứng: rung lắc

TREASURE:
├── Rương kho báu vàng mở ra
└── Hiệu ứng: ánh sáng vàng tỏa ra

EMPTY:
├── Ô nâu trống
└── Bụi bay
```

---

## 4. LUỒNG GAME (Game Flow)

### 4.1 Màn hình chính (Home)
```
┌─────────────────────────────────────────────┐
│                                             │
│        🏴‍☠️ ĐI TÌM KHO BÁU                    │
│           TIẾNG ANH                         │
│                                             │
│     [Hình thợ mỏ và kho báu animated]       │
│                                             │
│     ┌─────────────────────────┐             │
│     │    🎮 CHƠI NGAY         │             │
│     └─────────────────────────┘             │
│                                             │
│     ┌─────────────────────────┐             │
│     │    🏆 BẢNG XẾP HẠNG     │             │
│     └─────────────────────────┘             │
│                                             │
│     ┌─────────────────────────┐             │
│     │    📜 HƯỚNG DẪN         │             │
│     └─────────────────────────┘             │
│                                             │
│     ┌─────────────────────────┐             │
│     │    📊 LỊCH SỬ           │             │
│     └─────────────────────────┘             │
│                                             │
│  Điểm cao nhất: 1,250 💎                    │
│  Số game đã chơi: 15                        │
│                                             │
└─────────────────────────────────────────────┘
```

### 4.2 Chọn độ khó (Difficulty Selection)
```
┌─────────────────────────────────────────────┐
│  ← Quay lại         CHỌN ĐỘ KHÓ            │
│─────────────────────────────────────────────│
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  🌱 DỄ (Easy)                       │    │
│  │  • Bản đồ 5x5                       │    │
│  │  • 15 câu hỏi                       │    │
│  │  • Thời gian: 10 phút               │    │
│  │  • Điểm thưởng: x1                  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  🔥 TRUNG BÌNH (Medium)             │    │
│  │  • Bản đồ 6x6                       │    │
│  │  • 20 câu hỏi                       │    │
│  │  • Thời gian: 12 phút               │    │
│  │  • Điểm thưởng: x1.5                │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  💀 KHÓ (Hard)                      │    │
│  │  • Bản đồ 7x7                       │    │
│  │  • 30 câu hỏi                       │    │
│  │  • Thời gian: 15 phút               │    │
│  │  • Điểm thưởng: x2                  │    │
│  │  • Nhiều bẫy hơn!                   │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

### 4.3 Màn hình chơi game (Gameplay) - QUAN TRỌNG NHẤT
```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌─────────────────────────────────┐    ┌──────────────────────────────┐    │
│  │  🏴‍☠️ ĐI TÌM KHO BÁU              │    │  👤 Player Name              │    │
│  │  [Logo với rương kho báu]       │    │  💎 Điểm: 120                │    │
│  └─────────────────────────────────┘    │  ⏱️ 08:45                    │    │
│                                          │  🔊 [Sound Toggle]           │    │
│  ┌─────────────────────────────────────┐ └──────────────────────────────┘    │
│  │                                     │                                     │
│  │  📜 PANEL CÂU HỎI                   │    ┌────────────────────────────┐   │
│  │                                     │    │                            │   │
│  │  The company ______ its new         │    │   BẢN ĐỒ KHO BÁU 6x6       │   │
│  │  product line next month.           │    │                            │   │
│  │                                     │    │  [🪨][🪨][💎][🪨][🪨][🪨]  │   │
│  │  ┌─────────────┐                    │    │  [🪨][🔴][🪨][🪨][💎][🪨]  │   │
│  │  │  19:06      │  ⏱️               │    │  [🪨][🪨][🧑‍🔧][🪨][🪨][🪨]  │   │
│  │  └─────────────┘                    │    │  [🪨][🪨][🪨][🔴][🪨][🪨]  │   │
│  │                                     │    │  [💎][🪨][🪨][🪨][🪨][🪨]  │   │
│  │  ┌───────────┐  ┌───────────┐       │    │  [🪨][🪨][🪨][🪨][🪨][🏆]  │   │
│  │  │ A. launch │  │ B. launched│      │    │                            │   │
│  │  └───────────┘  └───────────┘       │    │  🐵 [Khỉ mascot ở đây]     │   │
│  │                                     │    │                            │   │
│  │  ┌───────────┐  ┌───────────┐       │    └────────────────────────────┘   │
│  │  │C. launching│ │D. will launch│    │                                     │
│  │  └───────────┘  └───────────┘       │    📊 Tiến độ: 5/20 câu             │
│  │                                     │    ✅ Đúng: 4  ❌ Sai: 1            │
│  │  🐿️ [Sóc mascot động]              │                                     │
│  │                                     │                                     │
│  └─────────────────────────────────────┘                                     │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 4.4 Animation khi trả lời

#### Trả lời ĐÚNG:
```
1. Ô chuyển màu xanh lá + hiệu ứng ✓
2. Khỉ mascot:
   - Nhảy lên 2-3 lần
   - Vỗ tay
   - Hiện text "Tuyệt vời!" / "Giỏi lắm!" / "Xuất sắc!"
3. +10 điểm bay lên
4. Confetti rơi xuống
5. Sound effect: "Ding!" vui vẻ
6. Sau 1.5s: Tự động mở ô tiếp theo hoặc chờ click
```

#### Trả lời SAI:
```
1. Ô chuyển màu đỏ + hiệu ứng X
2. Khỉ mascot:
   - Animation ném chuối 🍌
   - Chuối bay vào màn hình (splat effect)
   - Khỉ lắc đầu, che mặt
   - Hiện text "Oops!" / "Cố lên!" / "Sai rồi!"
3. -5 điểm (hoặc không trừ, tùy config)
4. Hiển thị đáp án đúng với giải thích
5. Sound effect: "Bonk!" hài hước
6. Màn hình rung nhẹ
7. Sau 2s: Tiếp tục game
```

### 4.5 Màn hình kết quả (Result)
```
┌─────────────────────────────────────────────┐
│                                             │
│           🎉 HOÀN THÀNH! 🎉                 │
│                                             │
│     [Animation thợ mỏ với kho báu]          │
│     [Khỉ nhảy múa xung quanh]               │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │                                     │    │
│  │     💎 TỔNG ĐIỂM: 1,250             │    │
│  │                                     │    │
│  │     ⭐⭐⭐ (3 sao)                   │    │
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  📊 THỐNG KÊ:                               │
│  ├── ✅ Câu đúng: 18/20 (90%)              │
│  ├── 💎 Gems thu thập: 8                   │
│  ├── 🏆 Kho báu: Đã tìm thấy!              │
│  ├── ⏱️ Thời gian: 8:32                    │
│  └── 🔥 Chuỗi đúng dài nhất: 7             │
│                                             │
│  🏅 XẾP HẠNG: #12 / 1,234 người chơi       │
│     (Top 1% tuần này!)                      │
│                                             │
│  ┌─────────────┐  ┌─────────────┐           │
│  │ 🔄 Chơi lại │  │ 🏠 Về home  │           │
│  └─────────────┘  └─────────────┘           │
│                                             │
│  ┌─────────────────────────────────┐        │
│  │  📤 Chia sẻ kết quả             │        │
│  └─────────────────────────────────┘        │
│                                             │
│  ┌─────────────────────────────────┐        │
│  │  📖 Xem lại các câu sai         │        │
│  └─────────────────────────────────┘        │
│                                             │
└─────────────────────────────────────────────┘
```

### 4.6 Bảng xếp hạng (Leaderboard)
```
┌─────────────────────────────────────────────┐
│  ← Quay lại      🏆 BẢNG XẾP HẠNG          │
│─────────────────────────────────────────────│
│                                             │
│  [Hôm nay] [Tuần này] [Tháng] [Mọi lúc]    │
│                                             │
│  🥇 #1  NguyenVanA      2,450 💎            │
│      ├── 🎯 98% accuracy                    │
│      └── 🕐 Hôm nay                         │
│                                             │
│  🥈 #2  TranThiB        2,380 💎            │
│      ├── 🎯 95% accuracy                    │
│      └── 🕐 Hôm nay                         │
│                                             │
│  🥉 #3  LeVanC          2,250 💎            │
│      ├── 🎯 92% accuracy                    │
│      └── 🕐 Hôm nay                         │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  #4   Player4           2,100 💎            │
│  #5   Player5           1,980 💎            │
│  #6   Player6           1,850 💎            │
│  ...                                        │
│                                             │
│  ─────────────────────────────────────────  │
│  📍 VỊ TRÍ CỦA BẠN:                         │
│  #12  YourName          1,250 💎            │
│      ├── 🎯 90% accuracy                    │
│      └── 📈 +5 so với hôm qua              │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 5. HỆ THỐNG ĐIỂM (Scoring System)

### 5.1 Điểm cơ bản
```
Trả lời đúng câu hỏi:
├── Base: +10 điểm
├── Time bonus: +1-5 điểm (trả lời nhanh)
└── Streak bonus: x1.5 nếu đúng 3+ câu liên tiếp

Tìm được gem:
├── Small gem (xanh): +10 điểm
├── Big gem (đỏ): +30 điểm
└── Treasure (kho báu): +100 điểm

Gặp bẫy:
├── Trap: -15 điểm
└── Minimum: 0 điểm (không âm)

Trả lời sai:
├── Default: 0 điểm (không cộng)
└── Hardcore mode: -5 điểm
```

### 5.2 Hệ thống sao (Stars)
```
⭐ 1 sao: Hoàn thành game
⭐⭐ 2 sao: Accuracy >= 70%
⭐⭐⭐ 3 sao: Accuracy >= 90% + Tìm được kho báu
```

### 5.3 Combo/Streak
```
Đúng liên tiếp:
├── 3 câu: x1.2 điểm
├── 5 câu: x1.5 điểm
├── 7 câu: x1.8 điểm
└── 10+ câu: x2.0 điểm + Badge "On Fire!" 🔥

Sai 1 câu → Reset streak về 0
```

---

## 6. DATABASE SCHEMA

### 6.1 Tables mới cần tạo

```sql
-- Bảng lưu session game
CREATE TABLE treasure_hunt_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    difficulty VARCHAR(20) NOT NULL, -- 'easy', 'medium', 'hard'
    map_size INT NOT NULL, -- 5, 6, or 7
    map_seed VARCHAR(100),           -- (MỚI) Seed để tái tạo bản đồ
    map_data JSONB NOT NULL, -- Lưu trạng thái bản đồ
    player_position INT DEFAULT 0,   -- (MỚI) Vị trí hiện tại của player
    score INT DEFAULT 0,
    gems_collected INT DEFAULT 0,
    questions_answered INT DEFAULT 0,
    questions_correct INT DEFAULT 0,
    current_streak INT DEFAULT 0,    -- (MỚI) Streak hiện tại
    max_streak INT DEFAULT 0,
    treasure_found BOOLEAN DEFAULT FALSE,
    time_limit_seconds INT NOT NULL,
    time_spent_seconds INT DEFAULT 0,
    items_used JSONB DEFAULT '[]',   -- (MỚI) Items đã sử dụng
    is_daily_challenge BOOLEAN DEFAULT FALSE, -- (MỚI) Có phải Daily Challenge không
    status VARCHAR(20) DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng lưu chi tiết từng câu trả lời trong game
CREATE TABLE treasure_hunt_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES treasure_hunt_sessions(id) ON DELETE CASCADE,
    question_id BIGINT REFERENCES questions(id),
    cell_position INT NOT NULL, -- Vị trí ô trên bản đồ (0-35)
    selected_option_id BIGINT REFERENCES question_options(id),
    is_correct BOOLEAN,
    time_spent_ms INT, -- Thời gian trả lời (ms)
    points_earned INT DEFAULT 0,
    streak_at_time INT DEFAULT 0,
    answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng leaderboard (có thể dùng materialized view)
CREATE TABLE treasure_hunt_leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    period VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'all_time'
    period_start DATE NOT NULL,
    best_score INT DEFAULT 0,
    total_games INT DEFAULT 0,
    total_correct INT DEFAULT 0,
    total_questions INT DEFAULT 0,
    average_accuracy DECIMAL(5,2) DEFAULT 0,
    best_streak INT DEFAULT 0,
    treasures_found INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, period, period_start)
);

-- Bảng lưu inventory items của user (MỚI)
CREATE TABLE treasure_hunt_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL, -- 'torch', 'shield', 'dictionary', 'compass', 'time_boost'
    quantity INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, item_type)
);

-- Bảng lưu lịch sử mua items (MỚI)
CREATE TABLE treasure_hunt_item_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    gems_spent INT NOT NULL,
    purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Daily Challenge (MỚI)
CREATE TABLE treasure_hunt_daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_date DATE NOT NULL UNIQUE,
    map_seed VARCHAR(100) NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'medium',
    config JSONB NOT NULL, -- Cấu hình bản đồ
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index cho performance
CREATE INDEX idx_th_sessions_user ON treasure_hunt_sessions(user_id);
CREATE INDEX idx_th_sessions_status ON treasure_hunt_sessions(status);
CREATE INDEX idx_th_sessions_daily ON treasure_hunt_sessions(is_daily_challenge, started_at);
CREATE INDEX idx_th_leaderboard_period ON treasure_hunt_leaderboard(period, period_start, best_score DESC);
CREATE INDEX idx_th_daily_date ON treasure_hunt_daily_challenges(challenge_date);
```

---

## 7. API ENDPOINTS

### 7.1 Game Flow APIs

```yaml
# Bắt đầu game mới
POST /api/treasure-hunt/start
Request:
  {
    "difficulty": "medium"  // "easy" | "medium" | "hard"
  }
Response:
  {
    "success": true,
    "data": {
      "sessionId": "uuid",
      "mapSize": 6,
      "map": [
        { "position": 0, "type": "hidden", "content": null },
        { "position": 1, "type": "hidden", "content": null },
        ...
      ],
      "playerPosition": 0,
      "config": {
        "timeLimit": 720, // seconds
        "questionCount": 20
      },
      "questions": [
        {
          "id": 123,
          "questionText": "The company ______ its new product...",
          "options": [
            { "id": 1, "label": "A", "text": "launch" },
            { "id": 2, "label": "B", "text": "launched" },
            { "id": 3, "label": "C", "text": "launching" },
            { "id": 4, "label": "D", "text": "will launch" }
          ]
        },
        ...
      ]
    }
  }

# Mở ô trên bản đồ
POST /api/treasure-hunt/reveal-cell
Request:
  {
    "sessionId": "uuid",
    "position": 5
  }
Response:
  {
    "success": true,
    "data": {
      "cellType": "question", // "question" | "small_gem" | "big_gem" | "trap" | "treasure" | "empty"
      "questionId": 123,      // Nếu là ô question
      "pointsChange": 0,      // Điểm thay đổi ngay (gem/trap)
      "newScore": 120
    }
  }

# Submit câu trả lời
POST /api/treasure-hunt/answer
Request:
  {
    "sessionId": "uuid",
    "questionId": 123,
    "selectedOptionId": 2,
    "timeSpentMs": 8500
  }
Response:
  {
    "success": true,
    "data": {
      "isCorrect": true,
      "correctOptionId": 2,
      "explanation": "Giải thích ngữ pháp...",
      "pointsEarned": 15,     // Base + bonus
      "currentStreak": 4,
      "newScore": 135,
      "bonusApplied": "streak_x1.2"
    }
  }

# Kết thúc game
POST /api/treasure-hunt/end
Request:
  {
    "sessionId": "uuid",
    "reason": "completed" // "completed" | "timeout" | "abandoned"
  }
Response:
  {
    "success": true,
    "data": {
      "finalScore": 1250,
      "stars": 3,
      "stats": {
        "questionsAnswered": 20,
        "questionsCorrect": 18,
        "accuracy": 90,
        "gemsCollected": 8,
        "treasureFound": true,
        "maxStreak": 7,
        "timeSpent": 512
      },
      "ranking": {
        "position": 12,
        "totalPlayers": 1234,
        "percentile": 99,
        "previousPosition": 17,
        "change": 5
      },
      "newRecords": [
        { "type": "personal_best", "value": 1250 },
        { "type": "best_streak", "value": 7 }
      ]
    }
  }
```

### 7.2 Leaderboard APIs

```yaml
# Lấy bảng xếp hạng
GET /api/treasure-hunt/leaderboard?period=weekly&limit=50
Response:
  {
    "success": true,
    "data": {
      "period": "weekly",
      "periodStart": "2024-01-15",
      "periodEnd": "2024-01-21",
      "entries": [
        {
          "rank": 1,
          "userId": "uuid",
          "userName": "NguyenVanA",
          "fullName": "Nguyễn Văn A",
          "avatarUrl": "...",
          "bestScore": 2450,
          "totalGames": 12,
          "averageAccuracy": 98,
          "isCurrentUser": false
        },
        ...
      ],
      "currentUser": {
        "rank": 12,
        "bestScore": 1250,
        "totalGames": 5,
        "averageAccuracy": 90
      },
      "totalPlayers": 1234
    }
  }

# Lấy lịch sử chơi
GET /api/treasure-hunt/history?page=1&limit=10
Response:
  {
    "success": true,
    "data": {
      "items": [
        {
          "sessionId": "uuid",
          "difficulty": "medium",
          "score": 1250,
          "stars": 3,
          "accuracy": 90,
          "treasureFound": true,
          "playedAt": "2024-01-20T10:30:00Z"
        },
        ...
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "totalItems": 25,
        "totalPages": 3
      }
    }
  }

# Lấy stats tổng hợp
GET /api/treasure-hunt/stats
Response:
  {
    "success": true,
    "data": {
      "overall": {
        "totalGames": 25,
        "totalScore": 18500,
        "bestScore": 1250,
        "averageScore": 740,
        "totalCorrect": 420,
        "totalQuestions": 480,
        "overallAccuracy": 87.5,
        "treasuresFound": 18,
        "bestStreak": 12
      },
      "thisWeek": {
        "gamesPlayed": 5,
        "averageScore": 980,
        "improvement": 15 // % so với tuần trước
      }
    }
  }
```

---

## 8. FRONTEND COMPONENTS

### 8.1 Cấu trúc thư mục
```
src/
├── app/user/treasure-hunt/
│   ├── page.tsx                    # Home page
│   ├── difficulty/page.tsx         # Chọn độ khó
│   ├── play/page.tsx               # Gameplay chính
│   ├── result/page.tsx             # Kết quả
│   ├── leaderboard/page.tsx        # Bảng xếp hạng
│   ├── history/page.tsx            # Lịch sử chơi
│   └── review/[sessionId]/page.tsx # Xem lại câu sai
│
├── components/treasure-hunt/
│   ├── GameMap.tsx                 # Bản đồ 6x6
│   ├── MapCell.tsx                 # Từng ô trên bản đồ
│   ├── QuestionPanel.tsx           # Panel câu hỏi bên trái
│   ├── PlayerInfo.tsx              # Thông tin người chơi
│   ├── MinerCharacter.tsx          # Nhân vật thợ mỏ
│   ├── MonkeyMascot.tsx            # Khỉ mascot với animations
│   ├── AnswerFeedback.tsx          # Hiệu ứng đúng/sai
│   ├── BananaThrow.tsx             # Animation ném chuối
│   ├── ConfettiEffect.tsx          # Confetti khi đúng
│   ├── GameTimer.tsx               # Đồng hồ đếm ngược
│   ├── ScoreDisplay.tsx            # Hiển thị điểm
│   ├── StreakIndicator.tsx         # Hiển thị combo streak
│   └── ResultCard.tsx              # Card kết quả
│
├── services/
│   └── TreasureHuntService.ts      # RTK Query API
│
├── models/
│   └── TreasureHunt.ts             # TypeScript interfaces
│
└── hooks/
    └── useTreasureHuntGame.ts      # Game state management
```

### 8.2 Component chính - GameMap
```tsx
// Pseudo code cho GameMap
interface MapCellData {
  position: number;
  state: 'hidden' | 'revealed' | 'current';
  type?: CellType;
  isAdjacent: boolean; // Có thể đi được không
}

function GameMap({
  cells,
  playerPosition,
  onCellClick
}: GameMapProps) {
  return (
    <div className="grid grid-cols-6 gap-1 p-4 bg-amber-900 rounded-xl border-4 border-amber-700">
      {cells.map((cell) => (
        <MapCell
          key={cell.position}
          data={cell}
          isPlayer={cell.position === playerPosition}
          onClick={() => onCellClick(cell.position)}
        />
      ))}
      <MinerCharacter position={playerPosition} />
    </div>
  );
}
```

### 8.3 Component - MonkeyMascot
```tsx
// Pseudo code cho MonkeyMascot với animations
type MonkeyState = 'idle' | 'thinking' | 'celebrating' | 'throwing_banana' | 'disappointed';

function MonkeyMascot({ state, onAnimationEnd }: MonkeyMascotProps) {
  return (
    <div className="relative w-24 h-24">
      {/* Khỉ base */}
      <img
        src={`/images/monkey-${state}.gif`}
        alt="Monkey mascot"
        className="w-full h-full"
      />

      {/* Banana projectile khi ném */}
      {state === 'throwing_banana' && (
        <BananaThrow onComplete={onAnimationEnd} />
      )}

      {/* Speech bubble */}
      {state === 'celebrating' && (
        <SpeechBubble text="Tuyệt vời! 🎉" />
      )}
      {state === 'disappointed' && (
        <SpeechBubble text="Cố lên nào! 💪" />
      )}
    </div>
  );
}
```

---

## 9. ASSETS CẦN THIẾT

### 9.1 Hình ảnh
```
/public/images/treasure-hunt/
├── backgrounds/
│   ├── cave-bg.jpg           # Background hang động
│   └── grass-bg.jpg          # Background cỏ
│
├── characters/
│   ├── miner-idle.png        # Thợ mỏ đứng
│   ├── miner-walk.gif        # Thợ mỏ đi
│   ├── miner-dig.gif         # Thợ mỏ đào
│   └── miner-celebrate.gif   # Thợ mỏ ăn mừng
│
├── mascot/
│   ├── monkey-idle.gif       # Khỉ đứng yên
│   ├── monkey-thinking.gif   # Khỉ suy nghĩ
│   ├── monkey-celebrate.gif  # Khỉ hoan hô
│   ├── monkey-throw.gif      # Khỉ ném chuối
│   ├── monkey-sad.gif        # Khỉ buồn
│   └── banana.png            # Quả chuối
│
├── cells/
│   ├── rock-hidden.png       # Đá chưa mở
│   ├── rock-question.png     # Đá có dấu ?
│   ├── gem-small.png         # Kim cương nhỏ
│   ├── gem-big.png           # Kim cương lớn
│   ├── trap.png              # Bẫy
│   ├── treasure-closed.png   # Rương đóng
│   ├── treasure-open.png     # Rương mở
│   └── empty-cell.png        # Ô trống
│
├── ui/
│   ├── frame-wood.png        # Khung gỗ
│   ├── panel-paper.png       # Panel giấy cũ
│   ├── button-wood.png       # Nút gỗ
│   └── timer-sign.png        # Bảng đồng hồ
│
└── effects/
    ├── confetti.gif          # Confetti
    ├── sparkle.gif           # Lấp lánh
    ├── banana-splat.png      # Chuối vỡ
    └── dust.gif              # Bụi
```

### 9.2 Sound Effects
```
/public/sounds/treasure-hunt/
├── correct.mp3               # Trả lời đúng
├── wrong.mp3                 # Trả lời sai
├── banana-throw.mp3          # Ném chuối
├── banana-splat.mp3          # Chuối vỡ
├── gem-collect.mp3           # Nhặt kim cương
├── treasure-open.mp3         # Mở kho báu
├── trap-trigger.mp3          # Kích hoạt bẫy
├── cell-reveal.mp3           # Mở ô
├── monkey-cheer.mp3          # Khỉ hoan hô
├── walking.mp3               # Bước đi
├── victory.mp3               # Chiến thắng
└── bg-music.mp3              # Nhạc nền
```

---

## 10. GAME CONFIG

### 10.1 Config theo độ khó
```typescript
const GAME_CONFIG = {
  easy: {
    mapSize: 5,
    timeLimit: 600, // 10 phút
    questionCount: 15,
    trapCount: 2,
    smallGemCount: 6,
    bigGemCount: 2,
    scoreMultiplier: 1,
    questionTimeLimit: 45, // giây mỗi câu
  },
  medium: {
    mapSize: 6,
    timeLimit: 720, // 12 phút
    questionCount: 20,
    trapCount: 3,
    smallGemCount: 8,
    bigGemCount: 3,
    scoreMultiplier: 1.5,
    questionTimeLimit: 35,
  },
  hard: {
    mapSize: 7,
    timeLimit: 900, // 15 phút
    questionCount: 30,
    trapCount: 5,
    smallGemCount: 10,
    bigGemCount: 4,
    scoreMultiplier: 2,
    questionTimeLimit: 25,
  },
};
```

### 10.2 Scoring Config
```typescript
const SCORING = {
  correctAnswer: {
    base: 10,
    timeBonusMax: 5,      // Bonus tối đa nếu trả lời nhanh
    timeBonusThreshold: 10, // Trả lời trong 10s = full bonus
  },
  streak: {
    3: 1.2,   // 3 câu đúng liên tiếp = x1.2
    5: 1.5,   // 5 câu = x1.5
    7: 1.8,   // 7 câu = x1.8
    10: 2.0,  // 10+ câu = x2.0
  },
  gems: {
    small: 10,
    big: 30,
    treasure: 100,
  },
  trap: -15,
  wrongAnswer: 0, // Không trừ điểm khi sai (normal mode)
};
```

---

## 11. USER FLOW DIAGRAMS

### 11.1 Main Flow
```
┌─────────┐     ┌──────────────┐     ┌─────────────┐
│  Home   │────▶│ Chọn độ khó  │────▶│  Loading    │
└─────────┘     └──────────────┘     └─────────────┘
                                            │
                                            ▼
┌─────────┐     ┌──────────────┐     ┌─────────────┐
│ Result  │◀────│   Gameplay   │◀────│  Countdown  │
└─────────┘     └──────────────┘     │   3..2..1   │
     │                               └─────────────┘
     │
     ▼
┌─────────────────────────────────────────────┐
│  [Chơi lại] [Xem đáp án] [Leaderboard] [Home] │
└─────────────────────────────────────────────┘
```

### 11.2 Gameplay Flow
```
┌────────────────┐
│  Click vào ô   │
└───────┬────────┘
        │
        ▼
┌────────────────┐     ┌─────────────┐
│  Ô đã mở chưa? │─Yes─▶│   Ignore    │
└───────┬────────┘     └─────────────┘
        │ No
        ▼
┌────────────────┐     ┌─────────────┐
│ Có thể đi tới? │─No──▶│ Show error  │
└───────┬────────┘     └─────────────┘
        │ Yes
        ▼
┌────────────────┐
│  Move player   │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│   Reveal cell  │
└───────┬────────┘
        │
        ├──────────────────────────────────────┐
        │                                      │
        ▼                                      ▼
┌────────────────┐                    ┌────────────────┐
│   QUESTION     │                    │  GEM/TRAP/     │
└───────┬────────┘                    │  TREASURE      │
        │                             └───────┬────────┘
        ▼                                     │
┌────────────────┐                            ▼
│ Show question  │                    ┌────────────────┐
│    panel       │                    │ Apply effect   │
└───────┬────────┘                    │ Update score   │
        │                             └───────┬────────┘
        ▼                                     │
┌────────────────┐                            │
│ User selects   │                            │
│    answer      │                            │
└───────┬────────┘                            │
        │                                     │
        ├─────────────────┐                   │
        ▼                 ▼                   │
┌────────────┐    ┌────────────┐              │
│  CORRECT   │    │   WRONG    │              │
├────────────┤    ├────────────┤              │
│ +Points    │    │ Banana     │              │
│ Confetti   │    │ animation  │              │
│ Monkey     │    │ Show       │              │
│ celebrates │    │ correct    │              │
└────────────┘    └────────────┘              │
        │                 │                   │
        └────────┬────────┘                   │
                 │                            │
                 ▼                            │
        ┌────────────────┐                    │
        │  Check if      │◀───────────────────┘
        │  game ends     │
        └───────┬────────┘
                │
                ├────── Treasure found ──────▶ END
                ├────── Time up ─────────────▶ END
                └────── Continue ────────────▶ Wait for next click
```

---

## 12. RESPONSIVE DESIGN

### 12.1 Desktop (>1024px)
- Layout 2 cột: Panel câu hỏi (40%) + Bản đồ (60%)
- Bản đồ hiển thị đầy đủ
- Mascot hiển thị bên cạnh bản đồ

### 12.2 Tablet (768-1024px)
- Layout 2 cột thu gọn
- Bản đồ có thể scroll ngang nếu cần

### 12.3 Mobile (<768px)
- Layout 1 cột
- Panel câu hỏi hiện dạng modal/overlay khi có câu hỏi
- Bản đồ full width, có thể pinch-zoom
- Mascot nhỏ hơn, đặt ở góc

---

## 13. ANIMATION SPECS

### 13.1 Monkey Throw Banana Animation
```css
@keyframes banana-throw {
  0% {
    transform: translateX(-100px) translateY(0) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: translateX(200px) translateY(-100px) rotate(360deg);
  }
  100% {
    transform: translateX(400px) translateY(50px) rotate(720deg);
    opacity: 0;
  }
}

@keyframes banana-splat {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes screen-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
```

### 13.2 Confetti Animation
```css
@keyframes confetti-fall {
  0% {
    transform: translateY(-100%) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
```

### 13.3 Cell Reveal Animation
```css
@keyframes cell-reveal {
  0% {
    transform: scale(1) rotateY(0);
  }
  50% {
    transform: scale(1.1) rotateY(90deg);
  }
  100% {
    transform: scale(1) rotateY(180deg);
  }
}
```

---

## 14. ERROR HANDLING

### 14.1 Network Errors
- Auto-save game state locally mỗi 30s
- Reconnect và sync khi có mạng lại
- Hiển thị toast thông báo mất kết nối

### 14.2 Timeout Handling
- Warning khi còn 1 phút
- Warning khi còn 30s (nhấp nháy timer)
- Auto-submit khi hết giờ

### 14.3 Session Expiry
- Kiểm tra session validity trước mỗi action
- Redirect về home nếu session expired

---

## 15. TESTING CHECKLIST

### 15.1 Functional Tests
- [ ] Tạo game mới với từng độ khó
- [ ] Di chuyển player trên bản đồ
- [ ] Mở ô và hiển thị đúng loại
- [ ] Submit câu trả lời đúng/sai
- [ ] Tính điểm chính xác
- [ ] Streak bonus hoạt động
- [ ] Timer đếm ngược đúng
- [ ] Kết thúc game đúng điều kiện
- [ ] Lưu kết quả vào DB
- [ ] Leaderboard cập nhật

### 15.2 UI/UX Tests
- [ ] Responsive trên mobile/tablet/desktop
- [ ] Animations mượt mà
- [ ] Sound effects phát đúng thời điểm
- [ ] Loading states hiển thị
- [ ] Error states hiển thị

### 15.3 Performance Tests
- [ ] Initial load < 3s
- [ ] API response < 500ms
- [ ] Animation không lag
- [ ] Memory không leak

---

## 16. HỆ THỐNG VẬT PHẨM (ITEMS/POWER-UPS) - MỚI

### 16.1 Danh sách vật phẩm
```typescript
interface GameItem {
  id: string;
  name: string;
  description: string;
  price: number;      // Giá mua bằng gems
  effect: ItemEffect;
  usageLimit: number; // Số lần dùng trong 1 game
}

enum ItemEffect {
  TORCH = "torch",           // Đèn pin xịn - Scan 2 ô bất kỳ
  SHIELD = "shield",         // Khiên - Chống 1 lần bẫy
  DICTIONARY = "dictionary", // Từ điển - Loại 2 đáp án sai (50/50)
  COMPASS = "compass",       // La bàn - Chỉ hướng tới kho báu
  TIME_BOOST = "time_boost", // Đồng hồ - +60 giây
}

const ITEMS_CONFIG = {
  torch: {
    name: "Đèn Pin Xịn",
    description: "Nhìn thấy nội dung của 2 ô bất kỳ mà không cần mở",
    price: 30,
    usageLimit: 2,
    icon: "🔦"
  },
  shield: {
    name: "Khiên Bảo Vệ",
    description: "Chống lại 1 lần đạp bẫy",
    price: 40,
    usageLimit: 1,
    icon: "🛡️"
  },
  dictionary: {
    name: "Từ Điển Mini",
    description: "Loại bỏ 2 đáp án sai trong 1 câu hỏi (50/50)",
    price: 25,
    usageLimit: 3,
    icon: "📖"
  },
  compass: {
    name: "La Bàn Kho Báu",
    description: "Hiển thị mũi tên chỉ hướng tới kho báu trong 30 giây",
    price: 50,
    usageLimit: 1,
    icon: "🧭"
  },
  time_boost: {
    name: "Đồng Hồ Cát",
    description: "Cộng thêm 60 giây vào thời gian còn lại",
    price: 35,
    usageLimit: 2,
    icon: "⏳"
  }
};
```

### 16.2 Cách mua và sử dụng
```
Trước khi vào game:
├── Màn hình "Chuẩn bị" hiển thị inventory
├── User có thể mua items bằng gems đã kiếm được
└── Chọn items muốn mang theo (tối đa 3 items)

Trong game:
├── Items hiển thị ở góc màn hình
├── Click vào item để sử dụng
├── Cooldown 5 giây giữa các lần dùng item
└── Items hết lượt sẽ bị greyed out
```

---

## 17. THUẬT TOÁN TẠO BẢN ĐỒ (MAP GENERATION) - MỚI

### 17.1 Đảm bảo đường đi hợp lệ (Path Guarantee)
```typescript
/**
 * Thuật toán tạo bản đồ đảm bảo luôn có đường đi từ Start → Treasure
 * Sử dụng BFS để kiểm tra path validity
 */

interface MapGenerationConfig {
  size: number;
  seed?: string;           // Seed để tái tạo bản đồ (Daily Challenge)
  questionCount: number;
  trapCount: number;
  smallGemCount: number;
  bigGemCount: number;
}

function generateMap(config: MapGenerationConfig): MapCell[] {
  const { size, questionCount, trapCount, smallGemCount, bigGemCount } = config;
  const totalCells = size * size;

  // 1. Khởi tạo bản đồ trống
  const map: MapCell[] = Array(totalCells).fill(null).map((_, i) => ({
    position: i,
    type: CellType.EMPTY,
    state: CellState.FOG
  }));

  // 2. Đặt vị trí Start (góc trên trái) và Treasure (góc dưới phải)
  const startPos = 0;
  const treasurePos = totalCells - 1;

  map[startPos].state = CellState.CURRENT;
  map[treasurePos].type = CellType.TREASURE;

  // 3. Tạo đường đi chính (guaranteed path) bằng Random Walk
  const guaranteedPath = generateGuaranteedPath(startPos, treasurePos, size);

  // 4. Đặt Questions lên đường đi chính (đảm bảo user phải trả lời)
  const pathQuestionCount = Math.floor(guaranteedPath.length * 0.6);
  const pathQuestionPositions = selectRandom(guaranteedPath.slice(1, -1), pathQuestionCount);

  pathQuestionPositions.forEach(pos => {
    map[pos].type = CellType.QUESTION;
  });

  // 5. Đặt Gems lên đường đi (phần thưởng cho người đi đúng đường)
  const pathGemPositions = selectRandom(
    guaranteedPath.filter(p => map[p].type === CellType.EMPTY),
    Math.floor(smallGemCount * 0.3)
  );
  pathGemPositions.forEach(pos => {
    map[pos].type = CellType.SMALL_GEM;
  });

  // 6. Đặt các ô còn lại (ngoài đường đi chính)
  const remainingPositions = Array.from({ length: totalCells }, (_, i) => i)
    .filter(p => p !== startPos && p !== treasurePos && !guaranteedPath.includes(p));

  // Shuffle và phân bổ
  const shuffled = shuffle(remainingPositions);
  let idx = 0;

  // Đặt Traps (KHÔNG trên đường đi chính)
  for (let i = 0; i < trapCount && idx < shuffled.length; i++, idx++) {
    map[shuffled[idx]].type = CellType.TRAP;
  }

  // Đặt Questions còn lại
  const remainingQuestions = questionCount - pathQuestionCount;
  for (let i = 0; i < remainingQuestions && idx < shuffled.length; i++, idx++) {
    map[shuffled[idx]].type = CellType.QUESTION;
  }

  // Đặt Gems còn lại
  const remainingSmallGems = smallGemCount - pathGemPositions.length;
  for (let i = 0; i < remainingSmallGems && idx < shuffled.length; i++, idx++) {
    map[shuffled[idx]].type = CellType.SMALL_GEM;
  }

  for (let i = 0; i < bigGemCount && idx < shuffled.length; i++, idx++) {
    map[shuffled[idx]].type = CellType.BIG_GEM;
  }

  // 7. Validate: Chạy BFS để đảm bảo có đường đi
  if (!hasValidPath(map, startPos, treasurePos, size)) {
    // Nếu không có đường đi, regenerate
    return generateMap(config);
  }

  return map;
}

function generateGuaranteedPath(start: number, end: number, size: number): number[] {
  // Random walk từ start đến end, ưu tiên đi về phía treasure
  const path = [start];
  let current = start;

  while (current !== end) {
    const adjacent = getAdjacentPositions(current, size);
    const currentRow = Math.floor(current / size);
    const currentCol = current % size;
    const endRow = Math.floor(end / size);
    const endCol = end % size;

    // Ưu tiên đi về phía treasure (70% theo hướng đúng, 30% random)
    const preferredMoves = adjacent.filter(pos => {
      const row = Math.floor(pos / size);
      const col = pos % size;
      return (row >= currentRow && row <= endRow) || (col >= currentCol && col <= endCol);
    });

    const nextPos = Math.random() < 0.7 && preferredMoves.length > 0
      ? preferredMoves[Math.floor(Math.random() * preferredMoves.length)]
      : adjacent[Math.floor(Math.random() * adjacent.length)];

    if (!path.includes(nextPos)) {
      path.push(nextPos);
      current = nextPos;
    }
  }

  return path;
}

function hasValidPath(map: MapCell[], start: number, end: number, size: number): boolean {
  // BFS để kiểm tra có thể đi từ start đến end
  // Bỏ qua các ô TRAP khi kiểm tra
  const visited = new Set<number>();
  const queue = [start];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current === end) return true;
    if (visited.has(current)) continue;

    visited.add(current);

    const adjacent = getAdjacentPositions(current, size);
    for (const pos of adjacent) {
      if (!visited.has(pos) && map[pos].type !== CellType.TRAP) {
        queue.push(pos);
      }
    }
  }

  return false;
}
```

### 17.2 Seed-based Generation (Daily Challenge)
```typescript
// Sử dụng seed để tạo cùng một bản đồ cho tất cả players
// Cho phép so sánh công bằng trong Daily/Weekly Challenge

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

// Daily Challenge: Tất cả users cùng ngày sẽ có cùng bản đồ
const dailySeed = `daily-${new Date().toISOString().split('T')[0]}`;
const map = generateMapWithSeed(config, dailySeed);
```

---

## 18. CƠ CHẾ TRẢ LỜI SAI (WRONG ANSWER MECHANICS) - MỚI

### 18.1 Hậu quả khi trả lời sai
```
Khi user trả lời sai câu hỏi:

1. ĐẨY LÙI VỀ Ô CŨ
   ├── Player bị đẩy ngược về vị trí trước đó
   ├── Animation: Player bay ngược + hiệu ứng "X" đỏ
   └── Ô đó KHÔNG bị khóa (có thể quay lại sau)

2. HIỂN THỊ ĐÁP ÁN ĐÚNG
   ├── Modal hiện đáp án đúng + giải thích
   ├── Khỉ mascot ném chuối (animation hài hước)
   └── Sau 2-3 giây tự đóng

3. KHÔNG MẤT ĐIỂM (Default mode)
   ├── Điểm giữ nguyên, chỉ mất cơ hội +điểm
   └── Hardcore mode: -5 điểm

4. RESET STREAK
   ├── Combo streak về 0
   └── Mất multiplier bonus
```

### 18.2 Số lần được thử lại
```
Mỗi ô Question:
├── Lần 1: Thử bình thường
├── Lần 2: Sau khi bị đẩy lùi, có thể quay lại thử lại
├── Lần 3: Nếu sai lần 2, ô bị KHÓA vĩnh viễn
└── Ô bị khóa hiển thị màu đỏ với icon khóa

Lưu ý: Mỗi lần thử lại sẽ được câu hỏi KHÁC (không lặp câu cũ)
```

---

## 19. DAILY CHALLENGE SYSTEM - MỚI

### 19.1 Concept
```
Mỗi ngày có một bản đồ cố định (seeded):
├── Tất cả players cùng ngày chơi cùng 1 bản đồ
├── Cùng vị trí Start, Treasure, Gems, Traps
├── Cùng bộ câu hỏi (nhưng thứ tự có thể khác)
└── Leaderboard riêng cho Daily Challenge
```

### 19.2 Phần thưởng Daily
```
Hoàn thành Daily Challenge:
├── +50 bonus gems
├── Streak badge nếu chơi nhiều ngày liên tiếp
├── Top 10% daily → Special avatar frame
└── Top 3 daily → Vàng/Bạc/Đồng badge
```

---

## 20. ANTI-CHEAT MEASURES - MỚI

### 20.1 Server-side Validation
```
TẤT CẢ tính toán quan trọng phải ở Backend:

1. Kết quả đúng/sai:
   ├── Frontend chỉ gửi: { questionId, selectedOptionId }
   ├── Backend tính toán isCorrect
   └── Backend trả về kết quả + điểm

2. Thời gian:
   ├── Server lưu start_time khi bắt đầu game
   ├── Server tính time_spent khi submit
   └── Reject nếu time_spent < 0.5s (impossible)

3. Map state:
   ├── Server lưu map_data trong session
   ├── Mỗi move được validate ở server
   └── Reject nếu di chuyển không hợp lệ (non-adjacent)

4. Rate limiting:
   ├── Max 1 request/second cho submit answer
   └── Max 2 requests/second cho reveal cell
```

### 20.2 Suspicious Activity Detection
```
Flag và review nếu:
├── Accuracy 100% + Thời gian trung bình < 3s/câu
├── Điểm cao bất thường so với lịch sử
├── Pattern di chuyển "biết trước" vị trí treasure
└── Nhiều sessions bị abandon ngay sau khi gặp bẫy
```

---

## 21. FUTURE ENHANCEMENTS (V2)

### Có thể thêm sau:
1. **Multiplayer mode** - 2 người chơi cùng lúc, racing đến treasure
2. **Weekly tournaments** - Giải đấu hàng tuần với prize pool
3. **Custom themes** - Đổi theme (biển, rừng, sa mạc, vũ trụ)
4. **Friend challenges** - Thách đấu bạn bè, so điểm trực tiếp
5. **Achievements/Badges** - Huy hiệu thành tích (100 games, 1000 correct, etc.)
6. **Story mode** - Các màn chơi có cốt truyện
7. **Boss battles** - Câu hỏi siêu khó ở cuối mỗi level

---

## 22. SUMMARY

Game "Đi Tìm Kho Báu Tiếng Anh" kết hợp:
- **Gameplay thú vị**: Khám phá bản đồ với **Fog of War**, tìm kho báu
- **Học tập hiệu quả**: Câu hỏi Part 5 TOEIC
- **Gamification**: Điểm, streak, leaderboard, **Daily Challenge**
- **Visual appeal**: Nhân vật cute, animations vui nhộn
- **Feedback tức thì**: Khỉ mascot phản ứng ngay (hoan hô/ném chuối)
- **Strategy element**: Tính toán lộ trình, tránh bẫy, sử dụng **Items** hợp lý
- **Fair competition**: **Seed-based maps** cho Daily Challenge, **Anti-cheat** measures
- **Replay value**: Mỗi game khác nhau, leaderboard cạnh tranh

### Key Improvements in v2.0:
1. ✅ **Fog of War** - Tăng tính khám phá
2. ✅ **Adjacent Movement** - Chỉ đi ô liền kề
3. ✅ **Wrong Answer = Pushback** - Trả lời sai bị đẩy lùi
4. ✅ **Items/Power-ups** - 5 loại vật phẩm hỗ trợ
5. ✅ **Path Guarantee Algorithm** - Luôn có đường đi hợp lệ
6. ✅ **Seed-based Maps** - Daily Challenge công bằng
7. ✅ **Anti-cheat** - Server-side validation
8. ✅ **Trap Effects** - Stun, Blind, Score Loss

Đây là thiết kế hoàn chỉnh v2.0 để team Backend và Frontend có thể triển khai.
