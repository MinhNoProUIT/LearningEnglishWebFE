"use client";

// src/app/user/games/treasure-hunt/page.tsx
// ==================== TREASURE HUNT HOME PAGE ====================

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import {
  DifficultySelector,
  ItemSelector,
  gameTheme,
} from "@/components/treasure-hunt";
import {
  useGetStatsQuery,
  useGetInventoryQuery,
  useGetDailyChallengeQuery,
  useStartGameMutation,
  useLazyResumeGameQuery,
  useEndGameMutation,
} from "@/services/TreasureHuntService";
import { TreasureHuntDifficulty, TreasureHuntItemType } from "@/models/TreasureHunt";

// ==================== COMPONENT ====================
export default function TreasureHuntHomePage() {
  const router = useRouter();

  // State
  const [selectedDifficulty, setSelectedDifficulty] = useState<TreasureHuntDifficulty>(
    TreasureHuntDifficulty.MEDIUM
  );
  const [selectedItems, setSelectedItems] = useState<TreasureHuntItemType[]>([]);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // API hooks
  const { data: stats, isLoading: statsLoading } = useGetStatsQuery();
  const { data: inventory, isLoading: inventoryLoading } = useGetInventoryQuery();
  const { data: dailyChallenge, isLoading: dailyLoading } = useGetDailyChallengeQuery();
  const [startGame, { isLoading: startingGame }] = useStartGameMutation();
  const [triggerResume, { isLoading: resumingGame }] = useLazyResumeGameQuery();
  const [endGame, { isLoading: endingGame }] = useEndGameMutation();

  // Check for active session on mount
  React.useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const result = await triggerResume().unwrap();
        if (result && result.sessionId) {
          setHasActiveSession(true);
          setActiveSessionId(result.sessionId);
        }
      } catch {
        // No active session - that's okay
        setHasActiveSession(false);
        setActiveSessionId(null);
      }
    };
    checkActiveSession();
  }, [triggerResume]);

  // Handlers
  const handleToggleItem = (itemType: TreasureHuntItemType) => {
    setSelectedItems((prev) => {
      if (prev.includes(itemType)) {
        return prev.filter((i) => i !== itemType);
      }
      if (prev.length >= 3) return prev;
      return [...prev, itemType];
    });
  };

  const handleStartGame = async () => {
    try {
      setError(null);
      const result = await startGame({
        difficulty: selectedDifficulty,
        isDailyChallenge: false,
        selectedItems,
      }).unwrap();

      // Navigate to play page with session ID
      router.push(`/user/games/treasure-hunt/play?sessionId=${result.sessionId}`);
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      setError(error?.data?.message || "Không thể bắt đầu game. Vui lòng thử lại.");
    }
  };

  const handleStartDailyChallenge = async () => {
    if (dailyChallenge?.hasPlayed) return;

    try {
      setError(null);
      const result = await startGame({
        difficulty: dailyChallenge?.difficulty || TreasureHuntDifficulty.MEDIUM,
        isDailyChallenge: true,
        selectedItems,
      }).unwrap();

      router.push(`/user/games/treasure-hunt/play?sessionId=${result.sessionId}`);
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      setError(error?.data?.message || "Không thể bắt đầu Daily Challenge.");
    }
  };

  const handleResumeGame = async () => {
    try {
      const result = await triggerResume().unwrap();
      router.push(`/user/games/treasure-hunt/play?sessionId=${result.sessionId}`);
    } catch {
      // No active session - that's okay
      setHasActiveSession(false);
      setActiveSessionId(null);
    }
  };

  const handleAbandonAndStartNew = async () => {
    if (!activeSessionId) return;

    try {
      setError(null);
      // End the current session
      await endGame({
        sessionId: activeSessionId,
        data: { reason: "ABANDONED" },
      }).unwrap();

      // Clear active session state
      setHasActiveSession(false);
      setActiveSessionId(null);

      // Now start new game
      const result = await startGame({
        difficulty: selectedDifficulty,
        isDailyChallenge: false,
        selectedItems,
      }).unwrap();

      router.push(`/user/games/treasure-hunt/play?sessionId=${result.sessionId}`);
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      setError(error?.data?.message || "Không thể bắt đầu game mới. Vui lòng thử lại.");
    }
  };

  const isLoading = statsLoading || inventoryLoading || dailyLoading;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${gameTheme.colors.background} 0%, #ecfdf5 100%)`,
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography sx={{ fontSize: 60, mb: 1 }}>🏴‍☠️</Typography>
          <Typography
            sx={{
              fontSize: 36,
              fontWeight: 700,
              background: gameTheme.gradients.primary,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            Đi Tìm Kho Báu
          </Typography>
          <Typography sx={{ fontSize: 16, color: "#6b7280" }}>
            Khám phá bản đồ, trả lời câu hỏi và tìm kho báu!
          </Typography>
        </Box>

        {/* Loading state */}
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: gameTheme.colors.primary }} />
          </Box>
        )}

        {!isLoading && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Stats summary */}
            {stats && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: gameTheme.borderRadius.xl,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                }}
              >
                <Typography
                  sx={{ fontSize: 18, fontWeight: 600, color: gameTheme.colors.text, mb: 2 }}
                >
                  📊 Thống kê của bạn
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(5, 1fr)" },
                    gap: 2,
                  }}
                >
                  <StatBox
                    icon="🎮"
                    label="Tổng game"
                    value={stats.overall.totalGames.toString()}
                  />
                  <StatBox
                    icon="🏆"
                    label="Điểm cao nhất"
                    value={stats.overall.bestScore.toLocaleString()}
                  />
                  <StatBox
                    icon="🎯"
                    label="Độ chính xác"
                    value={`${stats.overall.overallAccuracy}%`}
                  />
                  <StatBox
                    icon="🔥"
                    label="Streak cao nhất"
                    value={stats.overall.bestStreak.toString()}
                  />
                  <StatBox
                    icon="💎"
                    label="Kho báu tìm thấy"
                    value={stats.overall.treasuresFound.toString()}
                  />
                </Box>
              </Paper>
            )}

            {/* Daily Challenge */}
            {dailyChallenge && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: gameTheme.borderRadius.xl,
                  background: dailyChallenge.hasPlayed
                    ? "#f3f4f6"
                    : gameTheme.gradients.treasure,
                  border: dailyChallenge.hasPlayed ? "1px solid #e5e7eb" : "none",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {!dailyChallenge.hasPlayed && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)",
                      animation: "shine 3s ease-in-out infinite",
                    }}
                  />
                )}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                    position: "relative",
                  }}
                >
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <Typography sx={{ fontSize: 24 }}>🌟</Typography>
                      <Typography
                        sx={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: dailyChallenge.hasPlayed ? "#6b7280" : "#fff",
                        }}
                      >
                        Daily Challenge
                      </Typography>
                      {dailyChallenge.hasPlayed && (
                        <Chip
                          label="✓ Đã chơi"
                          size="small"
                          sx={{
                            background: "#d1fae5",
                            color: "#047857",
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 14,
                        color: dailyChallenge.hasPlayed ? "#9ca3af" : "rgba(255,255,255,0.9)",
                      }}
                    >
                      {dailyChallenge.hasPlayed
                        ? `Điểm của bạn: ${dailyChallenge.userResult?.score || 0} - Hạng #${dailyChallenge.userResult?.rank || "-"}`
                        : `Hoàn thành để nhận +${dailyChallenge.rewards.completionBonus} gems bonus!`}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    disabled={dailyChallenge.hasPlayed || startingGame}
                    onClick={handleStartDailyChallenge}
                    sx={{
                      background: dailyChallenge.hasPlayed ? "#d1d5db" : "#fff",
                      color: dailyChallenge.hasPlayed ? "#6b7280" : gameTheme.colors.gold,
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      borderRadius: gameTheme.borderRadius.md,
                      "&:hover": {
                        background: dailyChallenge.hasPlayed ? "#d1d5db" : "#fef3c7",
                      },
                    }}
                  >
                    {dailyChallenge.hasPlayed ? "Đã hoàn thành" : "🎯 Chơi ngay"}
                  </Button>
                </Box>
              </Paper>
            )}

            {/* Main actions */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 3,
              }}
            >
              {/* Start new game */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: gameTheme.borderRadius.xl,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                }}
              >
                <Typography
                  sx={{ fontSize: 18, fontWeight: 600, color: gameTheme.colors.text, mb: 2 }}
                >
                  🎮 Chơi game mới
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setShowStartDialog(true)}
                  sx={{
                    background: gameTheme.gradients.primary,
                    color: "#fff",
                    fontWeight: 700,
                    py: 2,
                    fontSize: 16,
                    borderRadius: gameTheme.borderRadius.md,
                    "&:hover": {
                      background: gameTheme.gradients.primaryDark,
                    },
                  }}
                >
                  ▶️ Bắt đầu
                </Button>
              </Paper>

              {/* Quick links */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: gameTheme.borderRadius.xl,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                }}
              >
                <Typography
                  sx={{ fontSize: 18, fontWeight: 600, color: gameTheme.colors.text, mb: 2 }}
                >
                  🔗 Truy cập nhanh
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Button
                    variant="outlined"
                    onClick={() => router.push("/user/games/treasure-hunt/leaderboard")}
                    sx={{
                      justifyContent: "flex-start",
                      py: 1.5,
                      borderRadius: gameTheme.borderRadius.md,
                      borderColor: "#e5e7eb",
                      color: "#374151",
                      "&:hover": {
                        borderColor: gameTheme.colors.primary,
                        background: "#f0fdf4",
                      },
                    }}
                  >
                    🏆 Bảng xếp hạng
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => router.push("/user/games/treasure-hunt/history")}
                    sx={{
                      justifyContent: "flex-start",
                      py: 1.5,
                      borderRadius: gameTheme.borderRadius.md,
                      borderColor: "#e5e7eb",
                      color: "#374151",
                      "&:hover": {
                        borderColor: gameTheme.colors.primary,
                        background: "#f0fdf4",
                      },
                    }}
                  >
                    📜 Lịch sử chơi
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleResumeGame}
                    disabled={resumingGame}
                    sx={{
                      justifyContent: "flex-start",
                      py: 1.5,
                      borderRadius: gameTheme.borderRadius.md,
                      borderColor: "#e5e7eb",
                      color: "#374151",
                      "&:hover": {
                        borderColor: gameTheme.colors.primary,
                        background: "#f0fdf4",
                      },
                    }}
                  >
                    ▶️ Tiếp tục game
                  </Button>
                </Box>
              </Paper>
            </Box>

            {/* How to play */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: gameTheme.borderRadius.xl,
                border: "1px solid #e5e7eb",
                background: "#fff",
              }}
            >
              <Typography
                sx={{ fontSize: 18, fontWeight: 600, color: gameTheme.colors.text, mb: 2 }}
              >
                📖 Cách chơi
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
                  gap: 2,
                }}
              >
                {[
                  { icon: "🗺️", title: "Khám phá", desc: "Di chuyển đến các ô liền kề" },
                  { icon: "❓", title: "Trả lời", desc: "Giải câu hỏi để mở đường" },
                  { icon: "💎", title: "Thu thập", desc: "Nhặt kim cương để ghi điểm" },
                  { icon: "🏆", title: "Chiến thắng", desc: "Tìm kho báu để hoàn thành" },
                ].map((item) => (
                  <Box
                    key={item.title}
                    sx={{
                      textAlign: "center",
                      p: 2,
                      background: "#f9fafb",
                      borderRadius: gameTheme.borderRadius.md,
                    }}
                  >
                    <Typography sx={{ fontSize: 32, mb: 1 }}>{item.icon}</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#374151", mb: 0.5 }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#6b7280" }}>{item.desc}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        )}

        {/* Start Game Dialog */}
        <Dialog
          open={showStartDialog}
          onClose={() => setShowStartDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: gameTheme.borderRadius.xl,
              p: 2,
            },
          }}
        >
          <DialogTitle sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: 24, fontWeight: 700, color: gameTheme.colors.text }}>
              🎮 Chuẩn bị bắt đầu
            </Typography>
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {hasActiveSession && (
              <Alert
                severity="warning"
                sx={{ mb: 3 }}
                action={
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      color="inherit"
                      size="small"
                      onClick={handleResumeGame}
                      disabled={resumingGame}
                    >
                      Tiếp tục
                    </Button>
                  </Box>
                }
              >
                <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                  Bạn có game đang chơi dở!
                </Typography>
                <Typography sx={{ fontSize: 13 }}>
                  Bấm &quot;Tiếp tục&quot; để chơi tiếp, hoặc bấm &quot;Bắt đầu mới&quot; bên dưới để hủy game cũ và bắt đầu lại.
                </Typography>
              </Alert>
            )}

            <DifficultySelector
              selectedDifficulty={selectedDifficulty}
              onSelect={setSelectedDifficulty}
            />

            <Box sx={{ mt: 4 }}>
              <ItemSelector
                inventory={inventory?.items || []}
                selectedItems={selectedItems}
                onToggleItem={handleToggleItem}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              onClick={() => setShowStartDialog(false)}
              sx={{ color: "#6b7280" }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={hasActiveSession ? handleAbandonAndStartNew : handleStartGame}
              disabled={startingGame || endingGame}
              sx={{
                background: hasActiveSession ? "#ef4444" : gameTheme.gradients.primary,
                color: "#fff",
                fontWeight: 700,
                px: 4,
                "&:hover": {
                  background: hasActiveSession ? "#dc2626" : gameTheme.gradients.primaryDark,
                },
              }}
            >
              {startingGame || endingGame ? (
                <CircularProgress size={20} sx={{ color: "#fff" }} />
              ) : hasActiveSession ? (
                "🔄 Bắt đầu mới"
              ) : (
                "🚀 Bắt đầu"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

// ==================== STAT BOX COMPONENT ====================
interface StatBoxProps {
  icon: string;
  label: string;
  value: string;
}

const StatBox: React.FC<StatBoxProps> = ({ icon, label, value }) => (
  <Box
    sx={{
      p: 2,
      background: "#f9fafb",
      borderRadius: gameTheme.borderRadius.md,
      textAlign: "center",
    }}
  >
    <Typography sx={{ fontSize: 24, mb: 0.5 }}>{icon}</Typography>
    <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 0.5 }}>{label}</Typography>
    <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#374151" }}>{value}</Typography>
  </Box>
);
