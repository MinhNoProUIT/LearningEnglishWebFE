"use client";

// src/components/treasure-hunt/LeaderboardTable.tsx
// ==================== LEADERBOARD TABLE COMPONENT ====================

import React from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { ILeaderboardEntry, ICurrentUserRank, LeaderboardPeriod } from "@/models/TreasureHunt";
import { gameTheme } from "./gameTheme";

// ==================== INTERFACES ====================
interface LeaderboardTableProps {
  entries: ILeaderboardEntry[];
  currentUser?: ICurrentUserRank;
  totalPlayers: number;
  period: LeaderboardPeriod;
  onPeriodChange: (period: LeaderboardPeriod) => void;
  loading?: boolean;
}

// ==================== COMPONENT ====================
const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  currentUser,
  totalPlayers,
  period,
  onPeriodChange,
  loading = false,
}) => {
  const getRankDisplay = (rank: number): React.ReactNode => {
    if (rank === 1)
      return (
        <Typography sx={{ fontSize: 24 }}>🥇</Typography>
      );
    if (rank === 2)
      return (
        <Typography sx={{ fontSize: 24 }}>🥈</Typography>
      );
    if (rank === 3)
      return (
        <Typography sx={{ fontSize: 24 }}>🥉</Typography>
      );
    return (
      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 700,
          color: "#6b7280",
          width: 30,
          textAlign: "center",
        }}
      >
        #{rank}
      </Typography>
    );
  };

  const getRowBackground = (entry: ILeaderboardEntry, index: number): string => {
    if (entry.isCurrentUser) return "#f0fdf4";
    if (index % 2 === 0) return "#fff";
    return "#f9fafb";
  };

  return (
    <Paper
      elevation={0}
      sx={{
        background: "#fff",
        borderRadius: gameTheme.borderRadius.xl,
        border: "1px solid #e5e7eb",
        boxShadow: gameTheme.shadows.card,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: gameTheme.gradients.primary,
          p: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography sx={{ fontSize: 28 }}>🏆</Typography>
          <Box>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>
              Bảng Xếp Hạng
            </Typography>
            <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
              {totalPlayers.toLocaleString()} người chơi
            </Typography>
          </Box>
        </Box>

        {/* Period selector */}
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={(_, value) => value && onPeriodChange(value)}
          size="small"
          sx={{
            background: "rgba(255,255,255,0.2)",
            borderRadius: gameTheme.borderRadius.md,
            "& .MuiToggleButton-root": {
              border: "none",
              color: "rgba(255,255,255,0.7)",
              fontWeight: 600,
              fontSize: 12,
              px: 2,
              "&.Mui-selected": {
                background: "#fff",
                color: gameTheme.colors.primary,
                "&:hover": {
                  background: "#fff",
                },
              },
              "&:hover": {
                background: "rgba(255,255,255,0.1)",
              },
            },
          }}
        >
          <ToggleButton value={LeaderboardPeriod.DAILY}>Hôm nay</ToggleButton>
          <ToggleButton value={LeaderboardPeriod.WEEKLY}>Tuần</ToggleButton>
          <ToggleButton value={LeaderboardPeriod.MONTHLY}>Tháng</ToggleButton>
          <ToggleButton value={LeaderboardPeriod.ALL_TIME}>Tất cả</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Current user summary */}
      {currentUser && (
        <Box
          sx={{
            p: 2,
            background: "#f0fdf4",
            borderBottom: `2px solid ${gameTheme.colors.primaryLight}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography sx={{ fontSize: 14 }}>📍</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: gameTheme.colors.text }}>
              Vị trí của bạn: #{currentUser.rank}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Chip
              label={`💎 ${currentUser.bestScore.toLocaleString()}`}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label={`🎯 ${currentUser.averageAccuracy}%`}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label={`🎮 ${currentUser.totalGames} games`}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>
      )}

      {/* Table header */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "60px 1fr 100px 80px 80px",
          gap: 2,
          px: 3,
          py: 1.5,
          background: "#f3f4f6",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>
          Hạng
        </Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>
          Người chơi
        </Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textAlign: "right" }}>
          Điểm cao
        </Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textAlign: "right" }}>
          Độ chính xác
        </Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textAlign: "right" }}>
          Số game
        </Typography>
      </Box>

      {/* Loading state */}
      {loading && (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography sx={{ color: "#6b7280" }}>Đang tải...</Typography>
        </Box>
      )}

      {/* Empty state */}
      {!loading && entries.length === 0 && (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography sx={{ fontSize: 40, mb: 1 }}>🏜️</Typography>
          <Typography sx={{ color: "#6b7280" }}>
            Chưa có ai trên bảng xếp hạng
          </Typography>
        </Box>
      )}

      {/* Entries */}
      {!loading &&
        entries.map((entry, index) => (
          <Box
            key={entry.userId}
            sx={{
              display: "grid",
              gridTemplateColumns: "60px 1fr 100px 80px 80px",
              gap: 2,
              px: 3,
              py: 2,
              background: getRowBackground(entry, index),
              borderBottom: "1px solid #f3f4f6",
              alignItems: "center",
              transition: "background 0.2s",
              "&:hover": {
                background: entry.isCurrentUser ? "#dcfce7" : "#f0fdf4",
              },
            }}
          >
            {/* Rank */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {getRankDisplay(entry.rank)}
            </Box>

            {/* Player info */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                src={entry.avatarUrl}
                sx={{
                  width: 36,
                  height: 36,
                  border: entry.isCurrentUser
                    ? `2px solid ${gameTheme.colors.primary}`
                    : "2px solid #e5e7eb",
                }}
              >
                {entry.fullName?.charAt(0) || entry.userName?.charAt(0)}
              </Avatar>
              <Box>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: entry.isCurrentUser ? 700 : 500,
                    color: entry.isCurrentUser ? gameTheme.colors.primary : "#374151",
                  }}
                >
                  {entry.fullName || entry.userName}
                  {entry.isCurrentUser && (
                    <Typography
                      component="span"
                      sx={{ fontSize: 12, color: gameTheme.colors.text, ml: 1 }}
                    >
                      (Bạn)
                    </Typography>
                  )}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                  @{entry.userName}
                </Typography>
              </Box>
            </Box>

            {/* Best score */}
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                color: entry.rank <= 3 ? "#f59e0b" : "#374151",
                textAlign: "right",
                fontFamily: "monospace",
              }}
            >
              {entry.bestScore.toLocaleString()}
            </Typography>

            {/* Accuracy */}
            <Typography
              sx={{
                fontSize: 14,
                color: "#374151",
                textAlign: "right",
              }}
            >
              {entry.averageAccuracy}%
            </Typography>

            {/* Total games */}
            <Typography
              sx={{
                fontSize: 14,
                color: "#6b7280",
                textAlign: "right",
              }}
            >
              {entry.totalGames}
            </Typography>
          </Box>
        ))}
    </Paper>
  );
};

export default LeaderboardTable;
