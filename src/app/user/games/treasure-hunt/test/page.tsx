"use client";

// src/app/user/games/treasure-hunt/test/page.tsx
// ==================== TREASURE HUNT TEST PAGE (WITH MOCK DATA) ====================

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
} from "@mui/material";
import {
  GameMap,
  GameHeader,
  QuestionPanel,
  MonkeyMascot,
  ResultCard,
  gameTheme,
} from "@/components/treasure-hunt";
import type { MonkeyState } from "@/components/treasure-hunt";
import {
  IVisibleCell,
  IActiveItem,
  IActiveEffect,
  ITreasureHuntQuestion,
  IEndGameResponse,
  TreasureHuntDifficulty,
  TreasureHuntItemType,
  CellType,
  CellState,
  TrapEffect,
} from "@/models/TreasureHunt";

// ==================== MOCK DATA ====================
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
];

const CORRECT_ANSWERS: Record<string, string> = {
  q1: "b",
  q2: "c",
  q3: "b",
};

// ==================== COMPONENT ====================
export default function TreasureHuntTestPage() {
  const router = useRouter();

  // Game config
  const mapSize = 6;
  const timeLimit = 300; // 5 minutes for testing

  // Generate map
  const [cellTypes] = useState<CellType[]>(() => {
    const cells: CellType[] = new Array(mapSize * mapSize).fill(CellType.EMPTY);

    // Treasure at position 35 (bottom right area)
    cells[35] = CellType.TREASURE;

    // Questions at specific positions
    [1, 7, 13, 19, 25, 31].forEach(pos => {
      cells[pos] = CellType.QUESTION;
    });

    // Gems
    [3, 9, 15, 21, 27].forEach(pos => {
      cells[pos] = CellType.SMALL_GEM;
    });
    [17, 29].forEach(pos => {
      cells[pos] = CellType.BIG_GEM;
    });

    // Traps
    [5, 11, 23].forEach(pos => {
      cells[pos] = CellType.TRAP;
    });

    // Start is empty
    cells[0] = CellType.EMPTY;

    return cells;
  });

  // Game state
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [playerPosition, setPlayerPosition] = useState(0);
  const [visitedCells, setVisitedCells] = useState<Set<number>>(new Set([0]));
  const [activeItems] = useState<IActiveItem[]>([
    { itemType: TreasureHuntItemType.TORCH, remainingUses: 2 },
    { itemType: TreasureHuntItemType.DICTIONARY, remainingUses: 1 },
  ]);
  const [activeEffects, setActiveEffects] = useState<IActiveEffect[]>([]);

  // Score state
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [questionsCorrect, setQuestionsCorrect] = useState(0);
  const [gemsCollected, setGemsCollected] = useState(0);

  // Question state
  const [currentQuestion, setCurrentQuestion] = useState<ITreasureHuntQuestion | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
  const [answerResult, setAnswerResult] = useState<{
    isCorrect: boolean;
    correctOptionId: string;
    explanation?: string;
  } | null>(null);

  // UI state
  const [monkeyState, setMonkeyState] = useState<MonkeyState>("idle");
  const [monkeyMessage, setMonkeyMessage] = useState<string>("Chọn một ô để bắt đầu!");
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [gameResult, setGameResult] = useState<IEndGameResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [torchMode, setTorchMode] = useState(false);
  const [compassDirection, setCompassDirection] = useState<{ direction: string; distance: number } | null>(null);

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper: Get adjacent positions
  const getAdjacentPositions = useCallback((pos: number): number[] => {
    const row = Math.floor(pos / mapSize);
    const col = pos % mapSize;
    const adjacent: number[] = [];

    if (row > 0) adjacent.push(pos - mapSize);
    if (row < mapSize - 1) adjacent.push(pos + mapSize);
    if (col > 0) adjacent.push(pos - 1);
    if (col < mapSize - 1) adjacent.push(pos + 1);

    return adjacent;
  }, [mapSize]);

  // Generate visible cells
  const visibleCells: IVisibleCell[] = React.useMemo(() => {
    const visible: IVisibleCell[] = [];
    const adjacentPositions = new Set(getAdjacentPositions(playerPosition));

    // Current position - show type
    visible.push({
      position: playerPosition,
      state: CellState.CURRENT,
      type: cellTypes[playerPosition],
    });

    // Visited cells - show type
    visitedCells.forEach((pos) => {
      if (pos !== playerPosition) {
        visible.push({
          position: pos,
          state: CellState.REVEALED,
          type: cellTypes[pos],
        });
      }
    });

    // Adjacent cells - HIDDEN (clickable but don't show type)
    adjacentPositions.forEach((pos) => {
      if (!visitedCells.has(pos)) {
        visible.push({
          position: pos,
          state: CellState.HIDDEN,
          type: null,
        });
      }
    });

    return visible;
  }, [playerPosition, visitedCells, cellTypes, getAdjacentPositions]);

  // Timer
  useEffect(() => {
    if (gameResult) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameResult]);

  // Effects countdown
  useEffect(() => {
    if (gameResult) return;

    const interval = setInterval(() => {
      setActiveEffects((prev) =>
        prev
          .map((effect) => ({
            ...effect,
            remainingSeconds: Math.max(0, effect.remainingSeconds - 1),
          }))
          .filter((effect) => effect.remainingSeconds > 0)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [gameResult]);

  const handleTimeUp = () => {
    setGameResult({
      finalScore: score,
      stars: score >= 200 ? 3 : score >= 100 ? 2 : 1,
      stats: {
        questionsAnswered,
        questionsCorrect,
        accuracy: questionsAnswered > 0 ? Math.round((questionsCorrect / questionsAnswered) * 100) : 0,
        gemsCollected,
        treasureFound: false,
        maxStreak: streak,
        timeSpent: timeLimit - timeRemaining,
      },
      ranking: {
        position: 10,
        totalPlayers: 100,
        percentile: 90,
        previousBest: 0,
        isNewRecord: false,
      },
      rewards: { gemsEarned: Math.floor(score / 10) },
    });
  };

  // Handle cell click
  const handleCellClick = useCallback((position: number) => {
    if (currentQuestion || gameResult) return;

    // Check if stunned
    const stunEffect = activeEffects.find((e) => e.type === TrapEffect.STUN);
    if (stunEffect && stunEffect.remainingSeconds > 0) {
      setMonkeyMessage("Bạn đang bị choáng! Chờ một chút...");
      setMonkeyState("disappointed");
      setTimeout(() => setMonkeyState("idle"), 2000);
      return;
    }

    // Check if adjacent
    const adjacentPositions = getAdjacentPositions(playerPosition);
    if (!adjacentPositions.includes(position)) {
      setMonkeyMessage("Chỉ có thể di chuyển đến ô liền kề!");
      setMonkeyState("disappointed");
      setTimeout(() => setMonkeyState("idle"), 2000);
      return;
    }

    // Move player
    setPlayerPosition(position);
    setVisitedCells((prev) => new Set([...prev, position]));

    const cellType = cellTypes[position];

    // Handle cell type
    console.log("Cell clicked:", position, "Type:", cellType);

    switch (cellType) {
      case CellType.QUESTION:
        const question = MOCK_QUESTIONS[questionIndex % MOCK_QUESTIONS.length];
        setCurrentQuestion(question);
        setMonkeyState("thinking");
        setMonkeyMessage("Hmm... suy nghĩ kỹ nhé!");
        break;

      case CellType.SMALL_GEM:
        setScore((prev) => prev + 25);
        setGemsCollected((prev) => prev + 1);
        setMonkeyState("celebrating");
        setMonkeyMessage("Tuyệt vời! +25 điểm 💎");
        setTimeout(() => setMonkeyState("idle"), 2000);
        break;

      case CellType.BIG_GEM:
        setScore((prev) => prev + 50);
        setGemsCollected((prev) => prev + 1);
        setMonkeyState("celebrating");
        setMonkeyMessage("Kim cương lớn! +50 điểm 💠");
        setTimeout(() => setMonkeyState("idle"), 2000);
        break;

      case CellType.TRAP:
        const trapTypes = [TrapEffect.STUN, TrapEffect.BLIND, TrapEffect.SCORE_LOSS];
        const randomTrap = trapTypes[Math.floor(Math.random() * trapTypes.length)];

        if (randomTrap === TrapEffect.SCORE_LOSS) {
          setScore((prev) => Math.max(0, prev - 15));
          setMonkeyMessage("Bẫy! Mất 15 điểm! 💸");
        } else if (randomTrap === TrapEffect.STUN) {
          setActiveEffects((prev) => [...prev, {
            type: TrapEffect.STUN,
            remainingSeconds: 5,
            expiresAt: new Date(Date.now() + 5000).toISOString()
          }]);
          setMonkeyMessage("Choáng 5 giây! 😵");
        } else {
          setActiveEffects((prev) => [...prev, {
            type: TrapEffect.BLIND,
            remainingSeconds: 10,
            expiresAt: new Date(Date.now() + 10000).toISOString()
          }]);
          setMonkeyMessage("Tầm nhìn bị thu hẹp! 🙈");
        }
        setMonkeyState("disappointed");
        setTimeout(() => setMonkeyState("idle"), 3000);
        break;

      case CellType.TREASURE:
        setScore((prev) => prev + 100);
        setMonkeyState("celebrating");
        setMonkeyMessage("TÌM THẤY KHO BÁU! 🏆🎉");

        setTimeout(() => {
          setGameResult({
            finalScore: score + 100,
            stars: 3,
            stats: {
              questionsAnswered,
              questionsCorrect,
              accuracy: questionsAnswered > 0 ? Math.round((questionsCorrect / questionsAnswered) * 100) : 0,
              gemsCollected,
              treasureFound: true,
              maxStreak: streak,
              timeSpent: timeLimit - timeRemaining,
            },
            ranking: {
              position: 1,
              totalPlayers: 100,
              percentile: 99,
              previousBest: score,
              isNewRecord: true,
            },
            rewards: { gemsEarned: 50 },
          });
        }, 2000);
        break;

      default:
        setMonkeyMessage("Ô trống! Tiếp tục khám phá!");
        break;
    }
  }, [playerPosition, cellTypes, currentQuestion, gameResult, activeEffects, getAdjacentPositions, questionIndex, score, questionsAnswered, questionsCorrect, gemsCollected, streak, timeRemaining]);

  // Handle answer
  const handleAnswer = useCallback((optionId: string) => {
    if (!currentQuestion) return;

    const isCorrect = CORRECT_ANSWERS[currentQuestion.id] === optionId;

    setAnswerResult({
      isCorrect,
      correctOptionId: CORRECT_ANSWERS[currentQuestion.id],
      explanation: isCorrect ? "Chính xác!" : "Đáp án đúng là: " + CORRECT_ANSWERS[currentQuestion.id].toUpperCase(),
    });

    setQuestionsAnswered((prev) => prev + 1);

    if (isCorrect) {
      setQuestionsCorrect((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      setScore((prev) => prev + 10);
      setMonkeyState("celebrating");
      setMonkeyMessage("Chính xác! +10 điểm 🎉");
    } else {
      setStreak(0);
      setMonkeyState("throwing_banana");
      setMonkeyMessage("Oops! Sai rồi! 🍌");
    }

    setQuestionIndex((prev) => prev + 1);

    setTimeout(() => {
      setCurrentQuestion(null);
      setAnswerResult(null);
      setEliminatedOptions([]);
      setMonkeyState("idle");
    }, 2500);
  }, [currentQuestion]);

  // Handle use item
  const handleUseItem = useCallback((itemType: TreasureHuntItemType) => {
    if (itemType === TreasureHuntItemType.DICTIONARY && currentQuestion) {
      // 50/50: eliminate 2 wrong answers
      const correctId = CORRECT_ANSWERS[currentQuestion.id];
      const wrongOptions = currentQuestion.options
        .filter((opt) => opt.id !== correctId)
        .slice(0, 2)
        .map((opt) => opt.id);
      setEliminatedOptions(wrongOptions);
      setMonkeyMessage("Đã loại 2 đáp án sai! 📖");
      setMonkeyState("celebrating");
      setTimeout(() => setMonkeyState("idle"), 2000);
    } else if (itemType === TreasureHuntItemType.COMPASS) {
      // Find treasure position
      const treasurePos = cellTypes.findIndex((c) => c === CellType.TREASURE);
      const treasureRow = Math.floor(treasurePos / mapSize);
      const treasureCol = treasurePos % mapSize;
      const playerRow = Math.floor(playerPosition / mapSize);
      const playerCol = playerPosition % mapSize;

      let direction = "";
      if (treasureRow < playerRow) direction += "Bắc";
      else if (treasureRow > playerRow) direction += "Nam";
      if (treasureCol > playerCol) direction += " Đông";
      else if (treasureCol < playerCol) direction += " Tây";

      const distance = Math.abs(treasureRow - playerRow) + Math.abs(treasureCol - playerCol);
      setCompassDirection({ direction: direction.trim(), distance });
      setMonkeyMessage(`Kho báu ở hướng ${direction.trim()}! 🧭`);
      setMonkeyState("celebrating");
      setTimeout(() => {
        setMonkeyState("idle");
        setCompassDirection(null);
      }, 10000);
    }
  }, [currentQuestion, cellTypes, playerPosition, mapSize]);

  // Handle quit
  const handleQuit = useCallback(() => {
    router.push("/user/games/treasure-hunt");
  }, [router]);

  // Loading state
  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: gameTheme.colors.background }}>
        <CircularProgress sx={{ color: gameTheme.colors.primary }} />
      </Box>
    );
  }

  // Game result state
  if (gameResult) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: gameTheme.colors.background, p: 4 }}>
        <ResultCard
          result={gameResult}
          difficulty={TreasureHuntDifficulty.MEDIUM}
          onPlayAgain={() => window.location.reload()}
          onGoHome={() => router.push("/user/games/treasure-hunt")}
          onViewLeaderboard={() => router.push("/user/games/treasure-hunt/leaderboard")}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", background: gameTheme.colors.background, py: 2 }}>
      <Container maxWidth="xl">
        {/* Test Mode Banner */}
        <Alert severity="info" sx={{ mb: 2 }}>
          🧪 <strong>Chế độ Test</strong> - Game đang chạy với dữ liệu giả lập (không cần Backend)
        </Alert>

        {/* Game Header */}
        <GameHeader
          score={score}
          timeRemaining={timeRemaining}
          streak={streak}
          questionsAnswered={questionsAnswered}
          questionsCorrect={questionsCorrect}
          gemsCollected={gemsCollected}
          activeItems={activeItems}
          activeEffects={activeEffects}
          difficulty="MEDIUM"
          onUseItem={handleUseItem}
          onQuit={() => setShowQuitDialog(true)}
        />

        {/* Debug Info */}
        {process.env.NODE_ENV === "development" && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Debug:</strong> Position: {playerPosition} |
            Question: {currentQuestion ? currentQuestion.id : "null"} |
            Cell Types: [{cellTypes.map((c, i) => i === playerPosition ? `[${c}]` : c === CellType.QUESTION ? `Q${i}` : "").filter(Boolean).join(", ")}]
          </Alert>
        )}

        {/* Question Modal - Show on top when there's a question */}
        {currentQuestion && (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.7)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
            }}
          >
            <Box sx={{ maxWidth: 500, width: "100%" }}>
              <QuestionPanel
                question={currentQuestion}
                onAnswer={handleAnswer}
                eliminatedOptions={eliminatedOptions}
                disabled={!!answerResult}
                showResult={answerResult}
              />
            </Box>
          </Box>
        )}

        {/* Main game area */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 150px" }, gap: 3, mt: 3, alignItems: "start" }}>
          {/* Game Map - Center */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <GameMap
              visibleCells={visibleCells}
              playerPosition={playerPosition}
              mapSize={mapSize}
              onCellClick={handleCellClick}
              disabled={!!currentQuestion || !!gameResult}
              compassDirection={compassDirection}
              torchMode={torchMode}
              isBlinded={activeEffects.some((e) => e.type === TrapEffect.BLIND && e.remainingSeconds > 0)}
            />
          </Box>

          {/* Monkey Mascot */}
          <Box sx={{ display: { xs: "none", lg: "flex" }, justifyContent: "center" }}>
            <MonkeyMascot
              state={monkeyState}
              message={monkeyMessage}
              onAnimationEnd={() => {
                if (monkeyState === "throwing_banana") {
                  setMonkeyState("disappointed");
                }
              }}
            />
          </Box>
        </Box>

        {/* Instructions when no question */}
        {!currentQuestion && (
          <Box sx={{ mt: 3, p: 3, textAlign: "center", background: "#fff", borderRadius: gameTheme.borderRadius.xl, border: "1px solid #e5e7eb", maxWidth: 400, mx: "auto" }}>
            <Typography sx={{ fontSize: 24, mb: 1 }}>🗺️</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#374151", mb: 1 }}>
              Chọn một ô để khám phá
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
              Click vào ô có viền xanh (🪨) kế bên bạn
            </Typography>
          </Box>
        )}

        {/* Quit Dialog */}
        <Dialog open={showQuitDialog} onClose={() => setShowQuitDialog(false)} PaperProps={{ sx: { borderRadius: gameTheme.borderRadius.xl, p: 2 } }}>
          <DialogTitle sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: 40, mb: 1 }}>🚪</Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 700 }}>Thoát game?</Typography>
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ textAlign: "center", color: "#6b7280" }}>
              Bạn có chắc muốn thoát?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 2 }}>
            <Button onClick={() => setShowQuitDialog(false)} sx={{ color: "#6b7280" }}>
              Tiếp tục chơi
            </Button>
            <Button variant="contained" onClick={handleQuit} sx={{ background: "#ef4444", "&:hover": { background: "#dc2626" } }}>
              Thoát
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
