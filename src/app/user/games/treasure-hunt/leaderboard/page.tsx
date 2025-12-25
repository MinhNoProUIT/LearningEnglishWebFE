"use client";

// src/app/user/games/treasure-hunt/leaderboard/page.tsx
// ==================== TREASURE HUNT LEADERBOARD PAGE ====================

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { LeaderboardTable, gameTheme } from "@/components/treasure-hunt";
import { useGetLeaderboardQuery } from "@/services/TreasureHuntService";
import { LeaderboardPeriod } from "@/models/TreasureHunt";

// ==================== COMPONENT ====================
export default function TreasureHuntLeaderboardPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<LeaderboardPeriod>(LeaderboardPeriod.ALL_TIME);

  const { data, isLoading } = useGetLeaderboardQuery({
    period,
    limit: 50,
    offset: 0,
  });

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
              🏆 Bảng Xếp Hạng
            </Typography>
            <Typography sx={{ fontSize: 14, color: "#6b7280" }}>
              Xem ai là người chơi giỏi nhất!
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

        {/* Leaderboard */}
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: gameTheme.colors.primary }} />
          </Box>
        ) : (
          <LeaderboardTable
            entries={data?.entries || []}
            currentUser={data?.currentUser}
            totalPlayers={data?.totalPlayers || 0}
            period={period}
            onPeriodChange={setPeriod}
            loading={isLoading}
          />
        )}
      </Container>
    </Box>
  );
}
