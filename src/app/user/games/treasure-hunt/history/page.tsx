"use client";

// src/app/user/games/treasure-hunt/history/page.tsx
// ==================== TREASURE HUNT HISTORY PAGE ====================

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Chip,
  Pagination,
  CircularProgress,
} from "@mui/material";
import { gameTheme } from "@/components/treasure-hunt";
import { useGetHistoryQuery } from "@/services/TreasureHuntService";
import { TreasureHuntDifficulty } from "@/models/TreasureHunt";

// ==================== COMPONENT ====================
export default function TreasureHuntHistoryPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetHistoryQuery({
    page,
    limit: 10,
  });

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDifficultyConfig = (difficulty: TreasureHuntDifficulty) => {
    return gameTheme.difficulty[difficulty] || gameTheme.difficulty.MEDIUM;
  };

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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 28,
                fontWeight: 700,
                color: gameTheme.colors.text,
              }}
            >
              📜 Lịch Sử Chơi
            </Typography>
            <Typography sx={{ fontSize: 14, color: "#6b7280" }}>
              Xem lại các ván game đã chơi
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => router.push("/user/games/treasure-hunt")}
            sx={{
              borderColor: gameTheme.colors.primary,
              color: gameTheme.colors.primary,
              borderRadius: gameTheme.borderRadius.md,
              "&:hover": {
                borderColor: gameTheme.colors.primaryDark,
                background: "#f0fdf4",
              },
            }}
          >
            ← Quay lại
          </Button>
        </Box>

        {/* Loading */}
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: gameTheme.colors.primary }} />
          </Box>
        )}

        {/* Empty state */}
        {!isLoading && (!data?.items || data.items.length === 0) && (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: gameTheme.borderRadius.xl,
              border: "1px solid #e5e7eb",
            }}
          >
            <Typography sx={{ fontSize: 48, mb: 2 }}>🎮</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: "#374151", mb: 1 }}>
              Chưa có lịch sử chơi
            </Typography>
            <Typography sx={{ fontSize: 14, color: "#6b7280", mb: 3 }}>
              Hãy chơi game đầu tiên của bạn!
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push("/user/games/treasure-hunt")}
              sx={{
                background: gameTheme.gradients.primary,
                borderRadius: gameTheme.borderRadius.md,
                "&:hover": {
                  background: gameTheme.gradients.primaryDark,
                },
              }}
            >
              Chơi ngay
            </Button>
          </Paper>
        )}

        {/* History list */}
        {!isLoading && data?.items && data.items.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {data.items.map((item) => {
              const diffConfig = getDifficultyConfig(item.difficulty);

              return (
                <Paper
                  key={item.sessionId}
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: gameTheme.borderRadius.xl,
                    border: "1px solid #e5e7eb",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      boxShadow: gameTheme.shadows.cardHover,
                      borderColor: gameTheme.colors.primaryLight,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                  >
                    {/* Left - Game info */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: "50%",
                          background: item.treasureFound
                            ? gameTheme.gradients.treasure
                            : "#f3f4f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography sx={{ fontSize: 24 }}>
                          {item.treasureFound ? "🏆" : "🎮"}
                        </Typography>
                      </Box>
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#374151" }}>
                            {item.score.toLocaleString()} điểm
                          </Typography>
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            {[1, 2, 3].map((star) => (
                              <Typography
                                key={star}
                                sx={{
                                  fontSize: 14,
                                  color: star <= item.stars ? "#fbbf24" : "#d1d5db",
                                }}
                              >
                                ⭐
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                        <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
                          {formatDate(item.playedAt)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Center - Stats */}
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Chip
                        label={diffConfig.label}
                        size="small"
                        sx={{
                          background: diffConfig.bg,
                          color: diffConfig.color,
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        label={`🎯 ${item.accuracy}%`}
                        size="small"
                        sx={{
                          background: item.accuracy >= 80 ? "#d1fae5" : "#fef3c7",
                          color: item.accuracy >= 80 ? "#047857" : "#92400e",
                          fontWeight: 600,
                        }}
                      />
                      {item.isDailyChallenge && (
                        <Chip
                          label="🌟 Daily"
                          size="small"
                          sx={{
                            background: "#fef3c7",
                            color: "#92400e",
                            fontWeight: 600,
                          }}
                        />
                      )}
                      {item.treasureFound && (
                        <Chip
                          label="🏆 Kho báu"
                          size="small"
                          sx={{
                            background: "#fef3c7",
                            color: "#92400e",
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </Paper>
              );
            })}

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Pagination
                  count={data.pagination.totalPages}
                  page={page}
                  onChange={(_, newPage) => setPage(newPage)}
                  color="primary"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      "&.Mui-selected": {
                        background: gameTheme.colors.primary,
                      },
                    },
                  }}
                />
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
