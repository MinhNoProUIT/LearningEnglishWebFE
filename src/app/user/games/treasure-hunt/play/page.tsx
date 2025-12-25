"use client";

// src/app/user/games/treasure-hunt/play/page.tsx
// ==================== TREASURE HUNT GAMEPLAY PAGE ====================

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  useMoveMutation,
  useAnswerMutation,
  useUseItemMutation,
  useEndGameMutation,
  useLazyResumeGameQuery,
} from "@/services/TreasureHuntService";
import {
  IVisibleCell,
  IActiveItem,
  IActiveEffect,
  ITreasureHuntQuestion,
  IEndGameResponse,
  TreasureHuntDifficulty,
  TreasureHuntItemType,
  CellType,
  TrapEffect,
} from "@/models/TreasureHunt";

// ==================== COMPONENT ====================
export default function TreasureHuntPlayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  // Game state
  const [mapSize, setMapSize] = useState(6);
  const [timeLimit, setTimeLimit] = useState(720);
  const [timeRemaining, setTimeRemaining] = useState(720);
  const [playerPosition, setPlayerPosition] = useState(0);
  const [visibleCells, setVisibleCells] = useState<IVisibleCell[]>([]);
  const [activeItems, setActiveItems] = useState<IActiveItem[]>([]);
  const [activeEffects, setActiveEffects] = useState<IActiveEffect[]>([]);
  const [difficulty, setDifficulty] = useState<TreasureHuntDifficulty>(TreasureHuntDifficulty.MEDIUM);

  // Score state
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [questionsCorrect, setQuestionsCorrect] = useState(0);
  const [gemsCollected, setGemsCollected] = useState(0);

  // Question state
  const [currentQuestion, setCurrentQuestion] = useState<ITreasureHuntQuestion | null>(null);
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
  const [answerResult, setAnswerResult] = useState<{
    isCorrect: boolean;
    correctOptionId: string;
    explanation?: string;
  } | null>(null);

  // UI state
  const [monkeyState, setMonkeyState] = useState<MonkeyState>("idle");
  const [monkeyMessage, setMonkeyMessage] = useState<string>("");
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [gameResult, setGameResult] = useState<IEndGameResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compassDirection, setCompassDirection] = useState<{ direction: string; distance: number } | null>(null);
  const [torchMode, setTorchMode] = useState(false); // Mode để chọn ô khi dùng TORCH

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const effectsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const monkeyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const compassTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const questionClearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track answered questions to prevent double scoring
  const answeredQuestionsRef = useRef<Set<string>>(new Set());

  // API hooks
  const [triggerResume] = useLazyResumeGameQuery();
  const [move, { isLoading: isMoving }] = useMoveMutation();
  const [answer, { isLoading: isAnswering }] = useAnswerMutation();
  const [useItem, { isLoading: isUsingItem }] = useUseItemMutation();
  const [endGame, { isLoading: isEnding }] = useEndGameMutation();

  // Initialize game
  useEffect(() => {
    const initGame = async () => {
      if (!sessionId) {
        router.push("/user/games/treasure-hunt");
        return;
      }

      try {
        setLoading(true);
        const result = await triggerResume().unwrap();

        setMapSize(result.mapSize);
        setTimeLimit(result.timeLimit);
        setTimeRemaining(result.timeRemaining || result.timeLimit);
        setPlayerPosition(result.playerPosition);
        setVisibleCells(result.visibleCells);
        setActiveItems(result.activeItems);
        setDifficulty(result.config.difficulty);
        setScore(result.currentScore || 0);

        if (result.gameStats) {
          setQuestionsAnswered(result.gameStats.questionsAnswered);
          setQuestionsCorrect(result.gameStats.questionsCorrect);
        }

        setLoading(false);
      } catch {
        setError("Không thể tải game. Vui lòng thử lại.");
        setLoading(false);
      }
    };

    initGame();
  }, [sessionId, router, triggerResume]);

  // Handle time up - defined before Timer useEffect to avoid reference issues
  const handleTimeUp = useCallback(async () => {
    if (!sessionId || gameResult) return;

    try {
      const result = await endGame({
        sessionId,
        data: { reason: "TIMEOUT" },
      }).unwrap();
      setGameResult(result);
    } catch {
      setError("Không thể kết thúc game.");
    }
  }, [sessionId, gameResult, endGame]);

  // Timer
  useEffect(() => {
    if (loading || gameResult) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Clear timer before calling handleTimeUp
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, gameResult, handleTimeUp]);

  // Update active effects countdown - stop when game ends
  useEffect(() => {
    // Don't run effects countdown if game has ended
    if (gameResult || loading) return;

    effectsIntervalRef.current = setInterval(() => {
      setActiveEffects((prev) =>
        prev
          .map((effect) => ({
            ...effect,
            remainingSeconds: Math.max(0, effect.remainingSeconds - 1),
          }))
          .filter((effect) => effect.remainingSeconds > 0)
      );
    }, 1000);

    return () => {
      if (effectsIntervalRef.current) {
        clearInterval(effectsIntervalRef.current);
        effectsIntervalRef.current = null;
      }
    };
  }, [gameResult, loading]);

  // Cleanup all timeouts when component unmounts or game ends
  useEffect(() => {
    return () => {
      // Clear all pending timeouts to prevent memory leaks
      if (monkeyTimeoutRef.current) clearTimeout(monkeyTimeoutRef.current);
      if (compassTimeoutRef.current) clearTimeout(compassTimeoutRef.current);
      if (questionClearTimeoutRef.current) clearTimeout(questionClearTimeoutRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (effectsIntervalRef.current) clearInterval(effectsIntervalRef.current);
    };
  }, []);

  // Helper function to check adjacent
  const isAdjacent = useCallback(
    (pos1: number, pos2: number): boolean => {
      const row1 = Math.floor(pos1 / mapSize);
      const col1 = pos1 % mapSize;
      const row2 = Math.floor(pos2 / mapSize);
      const col2 = pos2 % mapSize;

      // Check if pos2 is adjacent to pos1 (up, down, left, right)
      return (
        (Math.abs(row1 - row2) === 1 && col1 === col2) ||
        (Math.abs(col1 - col2) === 1 && row1 === row2)
      );
    },
    [mapSize]
  );

  // Handle torch reveal - called when user selects a cell in torch mode
  const handleTorchReveal = useCallback(
    async (targetPosition: number) => {
      if (!sessionId || isUsingItem) return;

      // Exit torch mode
      setTorchMode(false);

      try {
        const result = await useItem({
          sessionId,
          data: {
            itemType: TreasureHuntItemType.TORCH,
            targetPosition,
          },
        }).unwrap();

        // Update remaining uses
        setActiveItems((prev) =>
          prev.map((item) =>
            item.itemType === TreasureHuntItemType.TORCH
              ? { ...item, remainingUses: result.remainingUses }
              : item
          )
        );

        if (result.revealedCell) {
          setMonkeyMessage(`Ô ${result.revealedCell.position} là ${result.revealedCell.type}! 🔦`);
        }

        setMonkeyState("celebrating");
        setTimeout(() => setMonkeyState("idle"), 2000);
      } catch (err: unknown) {
        const error = err as { data?: { message?: string } };
        setMonkeyMessage(error?.data?.message || "Không thể sử dụng đuốc!");
        setMonkeyState("disappointed");
        setTimeout(() => setMonkeyState("idle"), 2000);
      }
    },
    [sessionId, isUsingItem, useItem]
  );

  // Handle cell click
  const handleCellClick = useCallback(
    async (position: number) => {
      if (!sessionId || isMoving || currentQuestion || gameResult) return;

      // If in torch mode, use torch on selected cell instead of moving
      if (torchMode) {
        handleTorchReveal(position);
        return;
      }

      // Check if adjacent - validate before calling API
      if (!isAdjacent(playerPosition, position)) {
        setMonkeyMessage("Chỉ có thể di chuyển đến ô liền kề!");
        setMonkeyState("disappointed");
        setTimeout(() => setMonkeyState("idle"), 2000);
        return;
      }

      // Check if stunned
      const stunEffect = activeEffects.find((e) => e.type === TrapEffect.STUN);
      if (stunEffect && stunEffect.remainingSeconds > 0) {
        setMonkeyMessage("Bạn đang bị choáng! Chờ một chút...");
        setMonkeyState("disappointed");
        setTimeout(() => setMonkeyState("idle"), 2000);
        return;
      }

      try {
        const result = await move({
          sessionId,
          data: { targetPosition: position },
        }).unwrap();

        setPlayerPosition(result.newPosition);
        setVisibleCells(result.visibleCells);
        setActiveEffects(result.activeEffects);

        // Handle cell type
        switch (result.cellType) {
          case CellType.QUESTION:
            if (result.question) {
              setCurrentQuestion(result.question);
              setMonkeyState("thinking");
              setMonkeyMessage("Hmm... suy nghĩ kỹ nhé!");
            }
            break;

          case CellType.SMALL_GEM:
          case CellType.BIG_GEM:
            setScore(result.newScore || score);
            setGemsCollected((prev) => prev + 1);
            setMonkeyState("celebrating");
            setMonkeyMessage(result.cellType === CellType.BIG_GEM ? "Kim cương lớn! 💎" : "Tuyệt vời! 💎");
            setTimeout(() => setMonkeyState("idle"), 2000);
            break;

          case CellType.TRAP:
            if (result.shieldActivated) {
              setMonkeyMessage("Khiên đã bảo vệ bạn! 🛡️");
              setMonkeyState("celebrating");
            } else if (result.trapEffect) {
              setScore(result.newScore || score);
              setMonkeyState("disappointed");
              switch (result.trapEffect.type) {
                case TrapEffect.STUN:
                  setMonkeyMessage(`Choáng ${result.trapEffect.duration}s! 😵`);
                  break;
                case TrapEffect.BLIND:
                  setMonkeyMessage("Tầm nhìn bị thu hẹp! 🙈");
                  break;
                case TrapEffect.SCORE_LOSS:
                  setMonkeyMessage(`Mất ${result.trapEffect.pointsLost} điểm! 💸`);
                  break;
              }
            }
            setTimeout(() => setMonkeyState("idle"), 3000);
            break;

          case CellType.TREASURE:
            if (result.gameCompleted) {
              setScore(result.newScore || score);
              setMonkeyState("celebrating");
              setMonkeyMessage("TÌM THẤY KHO BÁU! 🏆🎉");

              // End game with completion
              const endResult = await endGame({
                sessionId,
                data: { reason: "COMPLETED" },
              }).unwrap();
              setGameResult(endResult);
            }
            break;

          default:
            break;
        }
      } catch (err: unknown) {
        const error = err as { data?: { message?: string } };
        setMonkeyMessage(error?.data?.message || "Không thể di chuyển!");
        setMonkeyState("disappointed");
        setTimeout(() => setMonkeyState("idle"), 2000);
      }
    },
    [sessionId, isMoving, currentQuestion, gameResult, activeEffects, move, score, endGame, isAdjacent, playerPosition, torchMode, handleTorchReveal]
  );

  // Handle answer - with protection against double scoring
  const handleAnswer = useCallback(
    async (optionId: string, timeSpentMs: number) => {
      if (!sessionId || !currentQuestion || isAnswering) return;

      // Prevent answering the same question twice (anti-cheat)
      if (answeredQuestionsRef.current.has(currentQuestion.id)) {
        console.warn("Question already answered:", currentQuestion.id);
        return;
      }

      // Mark as answered immediately to prevent double-click
      answeredQuestionsRef.current.add(currentQuestion.id);

      try {
        const result = await answer({
          sessionId,
          data: {
            questionId: currentQuestion.id,
            selectedOptionId: optionId,
            timeSpentMs,
          },
        }).unwrap();

        setAnswerResult({
          isCorrect: result.isCorrect,
          correctOptionId: result.correctOptionId,
          explanation: result.explanation,
        });

        setScore(result.newScore);
        setStreak(result.currentStreak);
        setQuestionsAnswered(result.stats.questionsAnswered);
        setQuestionsCorrect(result.stats.questionsCorrect);
        setVisibleCells(result.visibleCells);

        if (result.isCorrect) {
          setMonkeyState("celebrating");
          setMonkeyMessage("Chính xác! 🎉");
        } else {
          setMonkeyState("throwing_banana");
          setMonkeyMessage("Oops! Sai rồi! 🍌");

          if (result.pushedBack && result.newPosition !== undefined) {
            setPlayerPosition(result.newPosition);
          }
        }

        // Clear question after delay - use ref for cleanup
        if (questionClearTimeoutRef.current) {
          clearTimeout(questionClearTimeoutRef.current);
        }
        questionClearTimeoutRef.current = setTimeout(() => {
          setCurrentQuestion(null);
          setAnswerResult(null);
          setEliminatedOptions([]);
          setMonkeyState("idle");
          questionClearTimeoutRef.current = null;
        }, 2500);
      } catch (err: unknown) {
        // Remove from answered set if API call failed (allow retry)
        answeredQuestionsRef.current.delete(currentQuestion.id);
        const error = err as { data?: { message?: string } };
        setError(error?.data?.message || "Không thể gửi câu trả lời.");
      }
    },
    [sessionId, currentQuestion, isAnswering, answer]
  );

  // Handle use item
  const handleUseItem = useCallback(
    async (itemType: TreasureHuntItemType) => {
      if (!sessionId || isUsingItem) return;

      // Special handling for TORCH - enter selection mode
      if (itemType === TreasureHuntItemType.TORCH) {
        setTorchMode(true);
        setMonkeyMessage("Chọn một ô để soi sáng! 🔦");
        setMonkeyState("thinking");
        return;
      }

      try {
        const result = await useItem({
          sessionId,
          data: {
            itemType,
            questionId: itemType === TreasureHuntItemType.DICTIONARY ? currentQuestion?.id : undefined,
          },
        }).unwrap();

        // Update remaining uses
        setActiveItems((prev) =>
          prev.map((item) =>
            item.itemType === itemType
              ? { ...item, remainingUses: result.remainingUses }
              : item
          )
        );

        // Handle item effects
        if (result.eliminatedOptions) {
          setEliminatedOptions(result.eliminatedOptions);
          setMonkeyMessage("Đã loại 2 đáp án sai! 📖");
        }

        if (result.treasureDirection) {
          setCompassDirection({
            direction: result.treasureDirection.direction,
            distance: result.treasureDirection.distance,
          });
          setMonkeyMessage(`Kho báu ở hướng ${result.treasureDirection.direction}! 🧭`);

          // Clear compass after 30s - use ref for cleanup
          if (compassTimeoutRef.current) {
            clearTimeout(compassTimeoutRef.current);
          }
          compassTimeoutRef.current = setTimeout(() => {
            setCompassDirection(null);
            compassTimeoutRef.current = null;
          }, 30000);
        }

        if (result.timeAdded) {
          setTimeRemaining((prev) => prev + result.timeAdded!);
          setMonkeyMessage(`+${result.timeAdded}s thời gian! ⏳`);
        }

        setMonkeyState("celebrating");
        // Use ref for cleanup
        if (monkeyTimeoutRef.current) {
          clearTimeout(monkeyTimeoutRef.current);
        }
        monkeyTimeoutRef.current = setTimeout(() => {
          setMonkeyState("idle");
          monkeyTimeoutRef.current = null;
        }, 2000);
      } catch (err: unknown) {
        const error = err as { data?: { message?: string } };
        setMonkeyMessage(error?.data?.message || "Không thể sử dụng vật phẩm!");
        setMonkeyState("disappointed");
        setTimeout(() => setMonkeyState("idle"), 2000);
      }
    },
    [sessionId, isUsingItem, useItem, currentQuestion]
  );

  // Handle quit
  const handleQuit = useCallback(async () => {
    if (!sessionId) return;

    try {
      const result = await endGame({
        sessionId,
        data: { reason: "ABANDONED" },
      }).unwrap();
      setGameResult(result);
      setShowQuitDialog(false);
    } catch {
      setError("Không thể thoát game.");
    }
  }, [sessionId, endGame]);

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: gameTheme.colors.background,
        }}
      >
        <CircularProgress sx={{ color: gameTheme.colors.primary }} />
      </Box>
    );
  }

  // Error state
  if (error && !gameResult) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: gameTheme.colors.background,
          p: 4,
        }}
      >
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => router.push("/user/games/treasure-hunt")}>
              Về trang chủ
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // Game result state
  if (gameResult) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: gameTheme.colors.background,
          p: 4,
        }}
      >
        <ResultCard
          result={gameResult}
          difficulty={difficulty}
          onPlayAgain={() => router.push("/user/games/treasure-hunt")}
          onGoHome={() => router.push("/user/games/treasure-hunt")}
          onViewLeaderboard={() => router.push("/user/games/treasure-hunt/leaderboard")}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: gameTheme.colors.background,
        py: 2,
      }}
    >
      <Container maxWidth="xl">
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
          difficulty={difficulty}
          onUseItem={handleUseItem}
          onQuit={() => setShowQuitDialog(true)}
        />

        {/* Main game area */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "400px 1fr 150px" },
            gap: 3,
            mt: 3,
            alignItems: "start",
          }}
        >
          {/* Question Panel */}
          <Box sx={{ order: { xs: 2, lg: 1 } }}>
            {currentQuestion ? (
              <QuestionPanel
                question={currentQuestion}
                onAnswer={handleAnswer}
                eliminatedOptions={eliminatedOptions}
                disabled={isAnswering || !!answerResult}
                showResult={answerResult}
              />
            ) : (
              <Box
                sx={{
                  p: 4,
                  textAlign: "center",
                  background: "#fff",
                  borderRadius: gameTheme.borderRadius.xl,
                  border: "1px solid #e5e7eb",
                }}
              >
                <Typography sx={{ fontSize: 40, mb: 2 }}>🗺️</Typography>
                <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#374151", mb: 1 }}>
                  Chọn một ô để khám phá
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#6b7280" }}>
                  Di chuyển đến các ô liền kề để tìm kho báu
                </Typography>
              </Box>
            )}
          </Box>

          {/* Game Map */}
          <Box sx={{ order: { xs: 1, lg: 2 } }}>
            {/* Torch Mode Indicator */}
            {torchMode && (
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                  borderRadius: gameTheme.borderRadius.lg,
                  border: "2px solid #f59e0b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  animation: "th-pulse 1.5s ease-in-out infinite",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontSize: 24 }}>🔦</Typography>
                  <Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#92400e" }}>
                      Chế độ đuốc đang bật
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#b45309" }}>
                      Nhấp vào ô bất kỳ để soi sáng
                    </Typography>
                  </Box>
                </Box>
                <Button
                  size="small"
                  onClick={() => {
                    setTorchMode(false);
                    setMonkeyMessage("");
                    setMonkeyState("idle");
                  }}
                  sx={{
                    color: "#92400e",
                    borderColor: "#f59e0b",
                    "&:hover": { background: "#fef3c7" },
                  }}
                >
                  Hủy
                </Button>
              </Box>
            )}
            <GameMap
              visibleCells={visibleCells}
              playerPosition={playerPosition}
              mapSize={mapSize}
              onCellClick={handleCellClick}
              disabled={isMoving || !!currentQuestion || !!gameResult}
              compassDirection={compassDirection}
              torchMode={torchMode}
              isBlinded={activeEffects.some((e) => e.type === TrapEffect.BLIND && e.remainingSeconds > 0)}
            />
          </Box>

          {/* Monkey Mascot */}
          <Box
            sx={{
              order: 3,
              display: { xs: "none", lg: "flex" },
              justifyContent: "center",
            }}
          >
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

        {/* Quit Dialog */}
        <Dialog
          open={showQuitDialog}
          onClose={() => setShowQuitDialog(false)}
          PaperProps={{
            sx: { borderRadius: gameTheme.borderRadius.xl, p: 2 },
          }}
        >
          <DialogTitle sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: 40, mb: 1 }}>🚪</Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 700 }}>Thoát game?</Typography>
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ textAlign: "center", color: "#6b7280" }}>
              Bạn có chắc muốn thoát? Tiến trình sẽ được lưu lại.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 2 }}>
            <Button onClick={() => setShowQuitDialog(false)} sx={{ color: "#6b7280" }}>
              Tiếp tục chơi
            </Button>
            <Button
              variant="contained"
              onClick={handleQuit}
              disabled={isEnding}
              sx={{
                background: "#ef4444",
                "&:hover": { background: "#dc2626" },
              }}
            >
              {isEnding ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Thoát"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
